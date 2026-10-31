#if !defined(__linux__) || !defined(__x86_64__)
#include <stdio.h>
int main(void) {
    fputs("perf isolation requires native Linux amd64\n", stderr);
    return 125;
}
#else
#define _GNU_SOURCE
#include <arpa/inet.h>
#include <dirent.h>
#include <errno.h>
#include <fcntl.h>
#include <limits.h>
#include <linux/audit.h>
#include <linux/filter.h>
#include <linux/seccomp.h>
#include <signal.h>
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/prctl.h>
#include <sys/resource.h>
#include <sys/socket.h>
#include <sys/stat.h>
#include <sys/syscall.h>
#include <sys/un.h>
#include <sys/wait.h>
#include <poll.h>
#include <time.h>
#include <unistd.h>

/* allow: SIZE_OK — one landlock/seccomp supervisor */

#ifndef __NR_landlock_create_ruleset
#define __NR_landlock_create_ruleset 444
#endif
#ifndef __NR_landlock_add_rule
#define __NR_landlock_add_rule 445
#endif
#ifndef __NR_landlock_restrict_self
#define __NR_landlock_restrict_self 446
#endif
#ifndef __NR_close_range
#define __NR_close_range 436
#endif
#ifndef PR_SET_CHILD_SUBREAPER
#define PR_SET_CHILD_SUBREAPER 36
#endif
#ifndef __NR_io_uring_setup
#define __NR_io_uring_setup 425
#endif
#define PERF_NR_IO_URING_LAST 427 /* io_uring_setup, io_uring_enter, io_uring_register */
/* Highest Landlock ABI whose structures and rights are defined below. ABI 7 only adds audit flags and ABI 8 only the opt-in TSYNC flag to restrict_self (we pass flags 0 from a single-threaded fork child); new rights start at ABI 9, so later ABIs fail closed until reviewed. */
#define PERF_MIN_LANDLOCK_ABI 4
#define PERF_MAX_LANDLOCK_ABI 8

struct path_rule { uint64_t access; int32_t parent_fd; } __attribute__((packed));
struct port_rule { uint64_t access, port; };
/* ABI 1-5 kernels accept the first 16 bytes, ABI 6+ the first 24; later fields are not used. */
struct ruleset_attr {
    uint64_t handled_access_fs, handled_access_net, scoped;
};
static const uint64_t READ_DIR_FILE = (1ULL << 2) | (1ULL << 3);
static const uint64_t READ_DIR_ONLY = (1ULL << 3);
static const uint64_t FILE_READ = (1ULL << 2);
static const uint64_t FILE_READ_EXEC = (1ULL << 0) | (1ULL << 2);
static const uint64_t SCRATCH_WRITE =
    (1ULL << 1) | (1ULL << 2) | (1ULL << 3) | (1ULL << 4) | (1ULL << 5) |
    (1ULL << 7) | (1ULL << 8) | (1ULL << 13) | (1ULL << 14);
static volatile sig_atomic_t timed_out;
static int private_pidns_verified;
/* fd 3 is the parent's private worker-group channel: opened by the supervisor, never inherited by the worker, Node or the app. */
#define PERF_CONTROL_FD 3
/* Keep in step with STREAM_CAP and ACCOUNTING_RESERVE in verify-perf-isolation.mjs: forwarded child bytes leave room for the guard's own lines. */
#define PERF_FORWARD_LIMIT (1048576 - 512)

static void die(const char *where) { perror(where); _exit(125); }
static void need(int ok, const char *where) {
    if (!ok) { fprintf(stderr, "perf isolation: %s\n", where); _exit(125); }
}
static void on_alarm(int signal_number) { (void)signal_number; timed_out = 1; }

static int component_denied(const char *path) {
    const char *marks[] = {"/.git", "/.env", "/.ssh", "/.gnupg", "/private-records", "/credentials", NULL};
    for (int i = 0; marks[i]; i++) if (strstr(path, marks[i])) return 1;
    return 0;
}
static int path_rejected(const char *path) {
    const char *home = getenv("PERF_REAL_HOME");
    if (!path || path[0] != '/' || strstr(path, "/..")) return 1;
    if (!strcmp(path, "/proc") && private_pidns_verified) return 0;
    if (!strcmp(path, "/") || !strcmp(path, "/home") || !strcmp(path, "/root") || !strcmp(path, "/Users")
        || !strcmp(path, "/proc") || !strcmp(path, "/sys") || !strcmp(path, "/dev")) return 1;
    if (home && !strcmp(path, home)) return 1;
    return component_denied(path);
}
static uint64_t fs_handled(int abi) {
    uint64_t mask = (1ULL << 15) - 1;
    if (abi >= 5) mask |= (1ULL << 15);
    return mask;
}
static void add_path(int ruleset, const char *path, uint64_t rights, int directory) {
    need(!path_rejected(path), path);
    int fd = open(path, O_PATH | O_CLOEXEC | O_NOFOLLOW);
    if (fd < 0) die(path);
    struct stat st;
    if (fstat(fd, &st)) die("fstat");
    need(directory ? S_ISDIR(st.st_mode) : (S_ISREG(st.st_mode) || S_ISCHR(st.st_mode)), path);
    if (!S_ISDIR(st.st_mode)) rights &= FILE_READ_EXEC | (1ULL << 1) | (1ULL << 14);
    struct path_rule rule = {rights, fd};
    if (syscall(__NR_landlock_add_rule, ruleset, 1, &rule, 0)) die("landlock path");
    close(fd);
}
static void add_optional(int ruleset, const char *path, uint64_t rights, int directory) {
    struct stat st;
    /* skip absent paths and symlinks such as /lib -> usr/lib; the real target is covered by /usr */
    if (!rights || path_rejected(path) || lstat(path, &st) || S_ISLNK(st.st_mode)) return;
    add_path(ruleset, path, rights, directory);
}
static void add_list(int ruleset, const char *list, uint64_t rights, int directory) {
    if (!list) return;
    char *copy = strdup(list);
    if (!copy) die("list");
    for (char *item = strtok(copy, "\n"); item; item = strtok(NULL, "\n")) {
        if (*item) add_path(ruleset, item, rights, directory);
    }
    free(copy);
}
static void namespace_link(const char *path, char *out, size_t cap) {
    ssize_t length = readlink(path, out, cap - 1);
    need(length > 0 && (size_t)length < cap - 1, "namespace readback");
    out[length] = '\0';
}
static void require_owned_namespaces(void) {
    const char *host_net = getenv("PERF_HOST_NETNS"), *host_pid = getenv("PERF_HOST_PIDNS");
    char current_net[128], current_pid[128], proc_self[128], expected_self[128];
    need(host_net && !strncmp(host_net, "net:[", 5) && host_pid && !strncmp(host_pid, "pid:[", 5), "frozen host namespace identities");
    namespace_link("/proc/self/ns/net", current_net, sizeof(current_net));
    namespace_link("/proc/self/ns/pid", current_pid, sizeof(current_pid));
    namespace_link("/proc/self", proc_self, sizeof(proc_self));
    need(getuid() != 0 && strcmp(host_net, current_net) && strcmp(host_pid, current_pid), "owned network and pid namespaces required");
    need(snprintf(expected_self, sizeof(expected_self), "%ld", (long)getpid()) > 0, "own namespace pid");
    need(!strcmp(proc_self, expected_self), "procfs must belong to owned pid namespace");
    private_pidns_verified = 1;
}
static int make_ruleset(int abi, uint16_t port, const char *scratch) {
    const char *browser = getenv("PERF_BOUNDED_BROWSER");
    int browser_mode = browser && !strcmp(browser, "owned-loopback-20261031");
    if (browser_mode) require_owned_namespaces();
    struct ruleset_attr attr;
    memset(&attr, 0, sizeof(attr));
    attr.handled_access_fs = fs_handled(abi);
    attr.handled_access_net = (1ULL << 0) | (1ULL << 1);
    if (abi >= 6) attr.scoped = (1ULL << 0) | (1ULL << 1);
    size_t size = abi >= 6 ? 24 : 16;
    int fd = (int)syscall(__NR_landlock_create_ruleset, &attr, size, 0);
    if (fd < 0) die("landlock ruleset");
    const char *fixed[] = {"/usr", "/lib", "/lib64", "/etc", NULL};
    for (int i = 0; fixed[i]; i++) add_optional(fd, fixed[i], READ_DIR_FILE, 1);
    add_list(fd, getenv("PERF_READ_DIRS"), READ_DIR_FILE, 1);
    add_list(fd, getenv("PERF_LIST_DIRS"), READ_DIR_ONLY, 1);
    add_list(fd, getenv("PERF_READ_FILES"), FILE_READ, 0);
    char node[PATH_MAX], esbuild[PATH_MAX], linker[PATH_MAX];
    const char *node_env = getenv("PERF_NODE");
    const char *esbuild_env = getenv("PERF_ESBUILD");
    need(node_env && realpath(node_env, node), "node realpath");
    need(esbuild_env && realpath(esbuild_env, esbuild), "esbuild realpath");
    const char *linker_name = access("/lib64/ld-linux-x86-64.so.2", F_OK) == 0
        ? "/lib64/ld-linux-x86-64.so.2" : "/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2";
    need(realpath(linker_name, linker) != NULL, "linker realpath");
    add_path(fd, node, FILE_READ_EXEC, 0);
    add_path(fd, esbuild, FILE_READ_EXEC, 0);
    add_path(fd, linker, FILE_READ_EXEC, 0);
    if (browser_mode) {
        const char *crashpad = getenv("PERF_BROWSER_CRASHPAD_EXEC");
        need(crashpad && crashpad[0] == '/', "pinned browser crashpad executable");
        add_path(fd, crashpad, FILE_READ_EXEC, 0);
        add_path(fd, "/proc", READ_DIR_FILE, 1);
    }
    add_optional(fd, "/dev/null", FILE_READ | (1ULL << 1), 0);
    add_optional(fd, "/dev/urandom", FILE_READ, 0);
    add_optional(fd, "/dev/zero", FILE_READ, 0);
    const char *writes[] = {"home", "tmp", "cache", "output", NULL};
    for (int i = 0; writes[i]; i++) {
        char full[PATH_MAX];
        need(snprintf(full, sizeof(full), "%s/%s", scratch, writes[i]) < (int)sizeof(full), "scratch path");
        add_path(fd, full, SCRATCH_WRITE, 1);
    }
    struct port_rule rule = {(1ULL << 0) | (1ULL << 1), port};
    if (port && syscall(__NR_landlock_add_rule, fd, 2, &rule, 0)) die("landlock tcp");
    if (browser_mode) {
        const char *ports = getenv("PERF_BROWSER_PORTS");
        need(ports && !strcmp(ports, "45000,45001"), "only the two frozen namespace-owned ports are allowed");
        for (uint16_t owned = 45000; owned <= 45001; owned++) {
            struct port_rule local = {(1ULL << 0) | (1ULL << 1), owned};
            if (syscall(__NR_landlock_add_rule, fd, 2, &local, 0)) die("owned browser tcp");
        }
    }
    return fd;
}
static void socket_filter(void) {
    /* Pathname AF_UNIX sockets are denied on every ABI (Landlock only mediates them from ABI 9); socketpair is a separate syscall and stays available.
       io_uring can create sockets and open files outside the socket filter, so it is denied outright. */
    struct sock_filter code[] = {
        BPF_STMT(BPF_LD | BPF_W | BPF_ABS, offsetof(struct seccomp_data, arch)),
        BPF_JUMP(BPF_JMP | BPF_JEQ | BPF_K, AUDIT_ARCH_X86_64, 1, 0),
        BPF_STMT(BPF_RET | BPF_K, SECCOMP_RET_KILL_PROCESS),
        BPF_STMT(BPF_LD | BPF_W | BPF_ABS, offsetof(struct seccomp_data, nr)),
        BPF_JUMP(BPF_JMP | BPF_JSET | BPF_K, 0x40000000, 0, 1),
        BPF_STMT(BPF_RET | BPF_K, SECCOMP_RET_KILL_PROCESS),
        BPF_JUMP(BPF_JMP | BPF_JGE | BPF_K, __NR_io_uring_setup, 0, 2),
        BPF_JUMP(BPF_JMP | BPF_JGT | BPF_K, PERF_NR_IO_URING_LAST, 1, 0),
        BPF_STMT(BPF_RET | BPF_K, SECCOMP_RET_ERRNO | EPERM),
        BPF_JUMP(BPF_JMP | BPF_JEQ | BPF_K, __NR_socket, 1, 0),
        BPF_STMT(BPF_RET | BPF_K, SECCOMP_RET_ALLOW),
        BPF_STMT(BPF_LD | BPF_W | BPF_ABS, offsetof(struct seccomp_data, args[0])),
        BPF_JUMP(BPF_JMP | BPF_JEQ | BPF_K, AF_INET, 1, 0),
        BPF_JUMP(BPF_JMP | BPF_JEQ | BPF_K, AF_INET6, 0, 4),
        BPF_STMT(BPF_LD | BPF_W | BPF_ABS, offsetof(struct seccomp_data, args[1])),
        BPF_STMT(BPF_ALU | BPF_AND | BPF_K, 15),
        BPF_JUMP(BPF_JMP | BPF_JEQ | BPF_K, SOCK_STREAM, 0, 1),
        BPF_STMT(BPF_RET | BPF_K, SECCOMP_RET_ALLOW),
        BPF_STMT(BPF_RET | BPF_K, SECCOMP_RET_ERRNO | EPERM),
    };
    struct sock_fprog prog = {(unsigned short)(sizeof(code) / sizeof(code[0])), code};
    if (prctl(PR_SET_SECCOMP, SECCOMP_MODE_FILTER, &prog)) die("seccomp");
}
static void restrict_self(int ruleset) {
    if (prctl(PR_SET_NO_NEW_PRIVS, 1, 0, 0, 0)) die("no_new_privs");
    if (syscall(__NR_landlock_restrict_self, ruleset, 0)) die("landlock restrict");
    close(ruleset);
    socket_filter();
    struct rlimit core = {0, 0};
    if (setrlimit(RLIMIT_CORE, &core)) die("core");
}
static void denied_open(const char *path, int flags) {
    errno = 0;
    int fd = open(path, flags | O_CLOEXEC, 0600);
    int saved = errno;
    if (fd >= 0) close(fd);
    need(fd < 0 && (saved == EACCES || saved == EPERM), path);
}
static void probe(uint16_t allowed, uint16_t forbidden, const char *phase) {
    denied_open("denied/private-read", O_RDONLY);
    denied_open("denied/protected-write", O_WRONLY | O_CREAT);
    int ok = open("output/positive-write", O_WRONLY | O_CREAT | O_TRUNC | O_CLOEXEC, 0600);
    if (ok < 0) die("positive write");
    if (write(ok, "ok\n", 3) != 3) die("positive write bytes");
    close(ok);
    pid_t child = fork();
    if (child < 0) die("exec probe");
    if (!child) {
        /* false exits 1 if the exec is wrongly allowed; denial is the only path to 42 */
        execl("/usr/bin/false", "false", (char *)NULL);
        _exit(errno == EACCES || errno == EPERM ? 42 : 125);
    }
    int status = 0;
    need(waitpid(child, &status, 0) == child && WIFEXITED(status) && WEXITSTATUS(status) == 42, "unknown exec");
    int fd = socket(AF_INET, SOCK_STREAM, 0);
    if (fd < 0) die("positive tcp socket");
    struct sockaddr_in address = {.sin_family = AF_INET, .sin_port = htons(allowed), .sin_addr.s_addr = htonl(INADDR_LOOPBACK)};
    need(connect(fd, (struct sockaddr *)&address, sizeof(address)) == 0, "positive tcp");
    close(fd);
    fd = socket(AF_INET, SOCK_STREAM, 0);
    if (fd < 0) die("forbidden tcp socket");
    address.sin_port = htons(forbidden);
    errno = 0;
    int rc = connect(fd, (struct sockaddr *)&address, sizeof(address));
    int saved = errno;
    close(fd);
    need(rc < 0 && (saved == EACCES || saved == EPERM), "forbidden tcp");
    for (int i = 0; i < 2; i++) {
        errno = 0;
        fd = socket(AF_INET, SOCK_DGRAM, 0);
        saved = errno;
        if (fd >= 0) close(fd);
        need(fd < 0 && saved == EPERM, "udp denied");
    }
    errno = 0;
    fd = socket(AF_UNIX, SOCK_STREAM, 0);
    saved = errno;
    if (fd >= 0) close(fd);
    need(fd < 0 && saved == EPERM, "unix socket denied");
    int pair[2];
    need(socketpair(AF_UNIX, SOCK_STREAM, 0, pair) == 0, "socketpair positive");
    close(pair[0]); close(pair[1]);
    errno = 0;
    need(syscall(__NR_io_uring_setup, 1, NULL) == -1 && errno == EPERM, "io_uring denied");
    printf("{\"phase\":\"%s\",\"privateReadDenied\":true,\"protectedWriteDenied\":true,\"positiveWrite\":true,\"unknownExecDenied\":true,\"positiveTcp\":true,\"forbiddenTcpDenied\":true,\"udpDenied\":true,\"unixSocketDenied\":true,\"socketpairPositive\":true,\"ioUringDenied\":true}\n", phase);
    fflush(stdout);
}
/* Owned local sentinels, created before the restriction so liveness can be shown before and after the denied observations. */
static int udp_live(int sentinel, uint16_t port) {
    int fd = socket(AF_INET, SOCK_DGRAM | SOCK_CLOEXEC, 0);
    if (fd < 0) return 0;
    struct sockaddr_in to = {.sin_family = AF_INET, .sin_port = htons(port), .sin_addr.s_addr = htonl(INADDR_LOOPBACK)};
    char byte = 'u';
    int sent = sendto(fd, &byte, 1, 0, (struct sockaddr *)&to, sizeof(to)) == 1;
    close(fd);
    struct pollfd wait = {sentinel, POLLIN, 0};
    return sent && poll(&wait, 1, 1000) == 1 && recv(sentinel, &byte, 1, 0) == 1 && byte == 'u';
}
static int unix_live(const char *path) {
    int fd = socket(AF_UNIX, SOCK_STREAM | SOCK_CLOEXEC, 0);
    if (fd < 0) return 0;
    struct sockaddr_un to = {.sun_family = AF_UNIX};
    snprintf(to.sun_path, sizeof(to.sun_path), "%s", path);
    int ok = connect(fd, (struct sockaddr *)&to, sizeof(to)) == 0;
    close(fd);
    return ok;
}
static unsigned long long sampled_bytes(const char *path, int depth) {
    struct stat st;
    if (depth > 6 || lstat(path, &st)) return 0;
    unsigned long long total = (unsigned long long)st.st_size;
    if (!S_ISDIR(st.st_mode)) return total;
    DIR *dir = opendir(path);
    if (!dir) return total;
    struct dirent *entry;
    while ((entry = readdir(dir))) {
        if (!strcmp(entry->d_name, ".") || !strcmp(entry->d_name, "..")) continue;
        char child[PATH_MAX];
        if (snprintf(child, sizeof(child), "%s/%s", path, entry->d_name) >= (int)sizeof(child)) continue;
        total += sampled_bytes(child, depth + 1);
    }
    closedir(dir);
    return total;
}
static void prepare_scratch(const char *scratch) {
    need(!chdir(scratch), "scratch cwd");
    const char *dirs[] = {"home", "tmp", "cache", "output", "denied", NULL};
    for (int i = 0; dirs[i]; i++) if (mkdir(dirs[i], 0700) && errno != EEXIST) die(dirs[i]);
    int fd = open("denied/private-read", O_WRONLY | O_CREAT | O_TRUNC | O_CLOEXEC, 0600);
    if (fd < 0) die("sentinel");
    if (write(fd, "sentinel\n", 9) != 9) die("sentinel bytes");
    close(fd);
}
/* Rebuild the whole environment for every exec; only the frozen RFMC_* inputs pass through. */
static void scrub_env(const char *scratch) {
    char home[PATH_MAX], tmp[PATH_MAX], cache[PATH_MAX];
    need(snprintf(home, sizeof(home), "%s/home", scratch) < (int)sizeof(home), "home");
    need(snprintf(tmp, sizeof(tmp), "%s/tmp", scratch) < (int)sizeof(tmp), "tmp");
    need(snprintf(cache, sizeof(cache), "%s/cache", scratch) < (int)sizeof(cache), "cache");
    const char *path = getenv("PATH");
    char *saved_path = path ? strdup(path) : NULL;
    char *pass_names[32], *pass_values[32];
    int pass_count = 0;
    const char *pass_env = getenv("PERF_PASS_ENV");
    char *pass_copy = pass_env ? strdup(pass_env) : NULL;
    if (pass_copy) {
        for (char *name = strtok(pass_copy, ","); name; name = strtok(NULL, ",")) {
            need(pass_count < 32 && !strncmp(name, "RFMC_", 5) && strspn(name, "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_") == strlen(name), "pass env name");
            const char *value = getenv(name);
            if (!value) continue;
            pass_names[pass_count] = name;
            pass_values[pass_count++] = strdup(value);
        }
    }
    if (clearenv()) die("clearenv");
    if (setenv("HOME", home, 1) || setenv("TMPDIR", tmp, 1) || setenv("XDG_CACHE_HOME", cache, 1)
        || setenv("PATH", saved_path ? saved_path : "/usr/bin:/bin", 1) || setenv("NODE_OPTIONS", "", 1)
        || setenv("LANG", "C", 1) || setenv("CI", "true", 1)
        || setenv("TSX_DISABLE_CACHE", "1", 1)) die("child env");
    for (int i = 0; i < pass_count; i++) {
        if (setenv(pass_names[i], pass_values[i], 1)) die("pass env");
    }
    free(saved_path);
}
static void scrub_and_exec(const char *scratch, char **argv) {
    scrub_env(scratch);
    execv(argv[0], argv);
    die("exec");
}
static void kill_own_children(void) {
    DIR *proc = opendir("/proc");
    if (!proc) return;
    struct dirent *entry;
    while ((entry = readdir(proc))) {
        char *end = NULL;
        long pid = strtol(entry->d_name, &end, 10);
        if (!end || *end || pid <= 1) continue;
        char path[64], line[512];
        snprintf(path, sizeof(path), "/proc/%ld/stat", pid);
        FILE *file = fopen(path, "r");
        if (!file) continue;
        char *got = fgets(line, sizeof(line), file);
        fclose(file);
        char *close_paren = got ? strrchr(line, ')') : NULL;
        long ppid = 0;
        char state;
        if (close_paren && sscanf(close_paren + 1, " %c %ld", &state, &ppid) == 2 && ppid == (long)getpid()) kill((pid_t)pid, SIGKILL);
    }
    closedir(proc);
}
/* Kill the owned group and our reparented children (we are a subreaper), then wait until every child is reaped. */
static void reap_group(pid_t group) {
    need(group > 1, "owned process group");
    for (int i = 0; i < 500; i++) {
        if (kill(-group, SIGKILL) && errno != ESRCH) die("owned group cleanup");
        kill_own_children();
        for (;;) {
            int status = 0;
            pid_t pid = waitpid(-1, &status, WNOHANG);
            if (pid > 0 || (pid < 0 && errno == EINTR)) continue;
            if (pid < 0 && errno == ECHILD) return;
            break;
        }
        usleep(10000);
    }
    fputs("perf isolation: cleanup incomplete\n", stderr);
    _exit(125);
}
static int pump(int fd, int dest, size_t *used) {
    char buf[4096];
    ssize_t n = read(fd, buf, sizeof(buf));
    if (n < 0) return errno == EAGAIN || errno == EINTR ? 0 : -1;
    if (n == 0) return 0;
    *used += (size_t)n;
    if (*used > PERF_FORWARD_LIMIT || write(dest, buf, (size_t)n) != n) return -2;
    return 1;
}
static int wait_bounded(pid_t pid, pid_t group, int timeout_s, int out_fd, int err_fd) {
    fcntl(out_fd, F_SETFL, O_NONBLOCK);
    fcntl(err_fd, F_SETFL, O_NONBLOCK);
    size_t used = 0;
    time_t start = time(NULL);
    int status = 0, done = 0;
    while (!done) {
        if (timed_out || time(NULL) - start >= timeout_s) { reap_group(group); return 124; }
        int out = pump(out_fd, STDOUT_FILENO, &used);
        int err = pump(err_fd, STDERR_FILENO, &used);
        if (out < 0 || err < 0) { reap_group(group); return 125; }
        pid_t got = waitpid(pid, &status, WNOHANG);
        if (got == pid) done = 1;
        else if (got < 0 && errno != EINTR) die("wait");
        if (!done) usleep(20000);
    }
    for (int i = 0; i < 32; i++) {
        int out = pump(out_fd, STDOUT_FILENO, &used);
        int err = pump(err_fd, STDERR_FILENO, &used);
        if (out < 0 || err < 0) { reap_group(group); return 125; }
        if (out == 0 && err == 0) break;
    }
    reap_group(group);
    return WIFEXITED(status) ? WEXITSTATUS(status) : 125;
}
int main(int argc, char **argv) {
    need(argc >= 3, "usage");
    int self_check = !strcmp(argv[1], "self-check");
    int qualify = !strcmp(argv[1], "qualify");
    need(self_check || qualify, "command");
    need(!self_check || argc == 6, "self-check usage: SCRATCH CANARY GIT_CONFIG REAL_HOME");
    if (fcntl(PERF_CONTROL_FD, F_SETFD, FD_CLOEXEC)) die("control descriptor");
    if (syscall(__NR_close_range, PERF_CONTROL_FD + 1, ~0U, 0)) die("close_range");
    int abi = (int)syscall(__NR_landlock_create_ruleset, NULL, 0, 1);
    if (abi < 0) die("landlock abi");
    if (abi < PERF_MIN_LANDLOCK_ABI || abi > PERF_MAX_LANDLOCK_ABI) { fprintf(stderr, "unsupported landlock abi %d\n", abi); return 125; }
    if (prctl(PR_SET_CHILD_SUBREAPER, 1, 0, 0, 0)) die("subreaper");
    need(argv[2][0] == '/', "absolute scratch");
    prepare_scratch(argv[2]);
    int listener = -1;
    uint16_t allowed = 0, forbidden = 0;
    int usock = -1, ulisten = -1;
    uint16_t udp_port = 0;
    char sock_path[PATH_MAX] = "";
    if (self_check) {
        listener = socket(AF_INET, SOCK_STREAM | SOCK_CLOEXEC, 0);
        if (listener < 0) die("listener");
        struct sockaddr_in local = {.sin_family = AF_INET, .sin_addr.s_addr = htonl(INADDR_LOOPBACK)};
        if (bind(listener, (struct sockaddr *)&local, sizeof(local)) || listen(listener, 16)) die("bind");
        socklen_t len = sizeof(local);
        if (getsockname(listener, (struct sockaddr *)&local, &len)) die("port");
        allowed = ntohs(local.sin_port);
        forbidden = allowed == 65535 ? 65534 : (uint16_t)(allowed + 1);
        if (getenv("PERF_BOUNDED_BROWSER") && (forbidden == 45000 || forbidden == 45001)) forbidden = 45003;
        usock = socket(AF_INET, SOCK_DGRAM | SOCK_CLOEXEC, 0);
        struct sockaddr_in ulocal = {.sin_family = AF_INET, .sin_addr.s_addr = htonl(INADDR_LOOPBACK)};
        if (usock < 0 || bind(usock, (struct sockaddr *)&ulocal, sizeof(ulocal))) die("udp sentinel");
        len = sizeof(ulocal);
        if (getsockname(usock, (struct sockaddr *)&ulocal, &len)) die("udp port");
        udp_port = ntohs(ulocal.sin_port);
        need(snprintf(sock_path, sizeof(sock_path), "%s/denied/sentinel.sock", argv[2]) < (int)sizeof(((struct sockaddr_un *)0)->sun_path), "unix sentinel path");
        ulisten = socket(AF_UNIX, SOCK_STREAM | SOCK_CLOEXEC, 0);
        struct sockaddr_un ubind = {.sun_family = AF_UNIX};
        snprintf(ubind.sun_path, sizeof(ubind.sun_path), "%s", sock_path);
        if (ulisten < 0 || bind(ulisten, (struct sockaddr *)&ubind, sizeof(ubind)) || listen(ulisten, 4)) die("unix sentinel");
    }
    int udp_pre = self_check && udp_live(usock, udp_port), unix_pre = self_check && unix_live(sock_path);
    int ruleset = make_ruleset(abi, allowed, argv[2]);
    int out_pipe[2], err_pipe[2];
    if (pipe(out_pipe) || pipe(err_pipe)) die("pipe");
    pid_t worker = fork();
    if (worker < 0) die("worker");
    if (!worker) {
        close(PERF_CONTROL_FD);
        prctl(PR_SET_PDEATHSIG, SIGKILL); /* the outer supervisor may SIGKILL us without running reap_group */
        if (setpgid(0, 0)) die("setpgid");
        if (usock >= 0) close(usock);
        if (ulisten >= 0) close(ulisten);
        dup2(out_pipe[1], STDOUT_FILENO);
        dup2(err_pipe[1], STDERR_FILENO);
        close(out_pipe[0]); close(out_pipe[1]); close(err_pipe[0]); close(err_pipe[1]);
        char node_path[PATH_MAX], esbuild_path[PATH_MAX];
        need(realpath(getenv("PERF_NODE"), node_path) != NULL, "node realpath");
        need(realpath(getenv("PERF_ESBUILD"), esbuild_path) != NULL, "esbuild realpath");
        restrict_self(ruleset);
        if (self_check) {
            pid_t sink = fork();
            if (sink < 0) die("sink");
            if (!sink) {
                for (;;) {
                    int client = accept(listener, NULL, NULL);
                    if (client < 0) { if (errno == EINTR) continue; _exit(0); }
                    close(client);
                }
            }
            close(listener);
            probe(allowed, forbidden, "pre");
            pid_t inherited = fork();
            if (inherited < 0) die("inherited");
            if (!inherited) { probe(allowed, forbidden, "inherited"); _exit(0); }
            int status = 0;
            need(waitpid(inherited, &status, 0) == inherited && WIFEXITED(status) && WEXITSTATUS(status) == 0, "inherited status");
            pid_t tool = fork();
            if (tool < 0) die("esbuild");
            if (!tool) {
                /* esbuild prints a bare version; keep it out of the JSON control stream */
                int null_fd = open("/dev/null", O_WRONLY | O_CLOEXEC);
                if (null_fd < 0 || dup2(null_fd, STDOUT_FILENO) < 0) _exit(125);
                scrub_env(argv[2]); execl(esbuild_path, "esbuild", "--version", (char *)NULL); _exit(125);
            }
            need(waitpid(tool, &status, 0) == tool && WIFEXITED(status) && WEXITSTATUS(status) == 0, "esbuild");
            tool = fork();
            if (tool < 0) die("canary");
            if (!tool) {
                char ports[3][8];
                snprintf(ports[0], sizeof(ports[0]), "%u", allowed);
                snprintf(ports[1], sizeof(ports[1]), "%u", forbidden);
                snprintf(ports[2], sizeof(ports[2]), "%u", udp_port);
                scrub_env(argv[2]);
                execl(node_path, node_path, argv[3], ports[0], ports[1], ports[2], sock_path, argv[4], argv[5], (char *)NULL);
                _exit(125);
            }
            need(waitpid(tool, &status, 0) == tool && WIFEXITED(status) && WEXITSTATUS(status) == 0, "canary");
            probe(allowed, forbidden, "post");
            _exit(0);
        }
        int split = 3;
        while (split < argc && strcmp(argv[split], "--")) split++;
        need(split + 1 < argc, "qualify command");
        need(!strcmp(argv[split + 1], node_path), "qualify must exec the pinned node");
        scrub_and_exec(argv[2], &argv[split + 1]);
    }
    setpgid(worker, worker);
    char announce[48];
    int announce_len = snprintf(announce, sizeof(announce), "{\"workerGroup\":%d}\n", (int)worker); /* lets the outer supervisor kill this separate group */
    need(write(PERF_CONTROL_FD, announce, (size_t)announce_len) == announce_len, "announce worker group");
    close(PERF_CONTROL_FD);
    close(ruleset); close(out_pipe[1]); close(err_pipe[1]);
    if (listener >= 0) close(listener);
    int timeout_s = 30;
    if (qualify) {
        char *end = NULL;
        long parsed = strtol(argv[3], &end, 10);
        need(end && !*end && parsed > 0 && parsed <= 120, "timeout");
        timeout_s = (int)parsed;
    }
    signal(SIGALRM, on_alarm);
    alarm((unsigned)timeout_s);
    int status = wait_bounded(worker, worker, timeout_s, out_pipe[0], err_pipe[0]);
    if (self_check) {
        struct pollfd wait = {usock, POLLIN, 0};
        int untouched = poll(&wait, 1, 0) == 0;
        int udp_post = udp_live(usock, udp_port), unix_post = unix_live(sock_path);
        printf("{\"phase\":\"supervisor\",\"udpLivePre\":%s,\"udpLivePost\":%s,\"udpSentinelUntouched\":%s,\"unixSentinelLivePre\":%s,\"unixSentinelLivePost\":%s}\n",
            udp_pre ? "true" : "false", udp_post ? "true" : "false", untouched ? "true" : "false", unix_pre ? "true" : "false", unix_post ? "true" : "false");
        fflush(stdout);
        unlink(sock_path);
    }
    struct rusage usage;
    getrusage(RUSAGE_CHILDREN, &usage);
    unsigned long long bytes = sampled_bytes(argv[2], 0);
    fprintf(stderr, "{\"accounting\":\"sampled\",\"scratchBytes\":%llu,\"maxRssKb\":%ld,\"hardCgroup\":false}\n", bytes, usage.ru_maxrss);
    if (bytes > 16777216) return 125;
    return status;
}
#endif
