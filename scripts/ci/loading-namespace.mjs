import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { accessSync, constants, lstatSync, readFileSync, readlinkSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

export const NAMESPACE_SCRIPT =
  'set -eu\nscratch=$1; uid=$2; gid=$3; root=$4; home=$5; pw=$6; limit=$7; size=$8; shift 8\nmount --make-rprivate /\nmkdir -p "$scratch"\nmount -t tmpfs -o "size=$size,mode=0700,uid=$uid,gid=$gid,nosuid,nodev" tmpfs "$scratch"\ninstall -d -m 0700 "$scratch/.stage" "$scratch/.stage/root" "$scratch/.stage/pw"\nmount --bind "$root" "$scratch/.stage/root"\nmount --bind "$pw" "$scratch/.stage/pw"\nmount -t tmpfs -o size=1m,mode=0755,nosuid,nodev tmpfs "$home"\nmkdir -p "$root" "$pw"\nmount --bind "$scratch/.stage/root" "$root"\nmount --bind "$scratch/.stage/pw" "$pw"\numount -l "$scratch/.stage/root" "$scratch/.stage/pw"\nif [ -d "$root/.git" ]; then mount -t tmpfs -o size=4k,mode=0555,ro tmpfs "$root/.git"\nelif [ -e "$root/.git" ]; then mount --bind /dev/null "$root/.git"; fi\nwhile read -r mp; do\n  case "$mp" in "$scratch"|"$scratch"/*|/proc|/proc/*|/sys|/sys/*|/dev/pts) continue;; esac\n  mount -o remount,bind,ro "$mp" 2>/dev/null || { printf \'o23-diag remount-failed %.200s\\n\' "$mp" >&2; exit 97; }\ndone <<EOF\n$(awk \'{print $5}\' /proc/self/mountinfo)\nEOF\ninstall -d -o "$uid" -g "$gid" -m 0700 "$scratch/home" "$scratch/tmp" "$scratch/shm" "$scratch/cache" "$scratch/config" "$scratch/run" "$scratch/work"\nmount --bind "$scratch/tmp" /tmp\nif [ -d /var/tmp ]; then mount --bind "$scratch/tmp" /var/tmp; fi\nif [ -d /dev/shm ]; then mount --bind "$scratch/shm" /dev/shm; fi\nip link set lo up\nexec timeout --signal=KILL "$limit" "$@"\n';
export const NAMESPACE_SHA256 = 'da5a9a60e58b30ed87318073176b89bec4553b5ca6984050bdfb7a1fa1bb9d60';
export const NAMESPACE_ORIGIN_SHA256 = 'da5c257d2d86a63acdde3984a968fe0f28b06d20fcbd4242d7d1874a5361aa55';
const OUTPUT_CAP = 1024 * 1024 - 8192;
const sha = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
const requiredTools = [
  'sudo',
  'env',
  'timeout',
  'unshare',
  'bash',
  'setpriv',
  'mount',
  'mkdir',
  'install',
  'umount',
  'awk',
  'ip',
];
const ROOT_PATH = '/usr/sbin:/usr/bin:/sbin:/bin';
const inside = (child, parent) => child.startsWith(parent + path.sep);

export function ownsReadRoot(directory, root, browsers) {
  return directory === browsers || inside(directory, root) || inside(directory, browsers);
}

function pinned(item, executable = true) {
  assert(item && path.isAbsolute(item.path) && /^[a-f0-9]{64}$/.test(item.sha256), 'missing executable pin');
  assert.equal(realpathSync(item.path), item.path, 'noncanonical executable');
  assert(lstatSync(item.path).isFile() && sha(item.path) === item.sha256, 'stale executable');
  accessSync(item.path, executable ? constants.X_OK : constants.R_OK);
  return item.path;
}

export function namespaceArgv(config) {
  assert.equal(process.platform, 'linux', 'native Linux required');
  assert.equal(createHash('sha256').update(NAMESPACE_SCRIPT).digest('hex'), NAMESPACE_SHA256);
  assert(Number.isInteger(config.uid) && config.uid > 0 && Number.isInteger(config.gid) && config.gid >= 0);
  assert.equal(config.uid, process.getuid(), 'caller identity changed');
  assert.equal(config.gid, process.getgid(), 'caller group changed');
  for (const name of ['scratch', 'root', 'home', 'browsers']) {
    assert(path.isAbsolute(config[name]) && realpathSync(config[name]) === config[name], 'noncanonical owned path');
    assert(lstatSync(config[name]).isDirectory(), 'owned directory missing');
  }
  assert(
    !inside(config.root, config.home) || inside(config.root, path.join(config.home, 'work')),
    'unexpected source inside masked home',
  );
  assert(
    !inside(config.scratch, config.root) && !inside(config.root, config.scratch),
    'scratch overlaps immutable source',
  );
  assert(
    ![config.home, '/tmp', '/var/tmp', '/dev/shm'].some(
      (masked) => config.scratch === masked || inside(config.scratch, masked),
    ),
    'scratch must survive the masked mounts',
  );
  assert(
    config.browsers !== config.home && !inside(config.root, config.browsers),
    'browser stage overlaps source or home',
  );
  assert.equal(config.hostNetns, readlinkSync('/proc/self/ns/net'), 'host network identity changed');
  assert.equal(config.hostPidns, readlinkSync('/proc/self/ns/pid'), 'host process identity changed');
  assert.equal(config.nativeTmpfsBytes, 15 * 1024 * 1024, 'native writes must reserve the remaining combined budget');
  assert.equal(config.totalOwnedBytes, 16 * 1024 * 1024);
  assert.equal(config.outputBytes, 1024 * 1024);
  assert.equal(config.innerSeconds, 105);
  assert(['guard-controls', 'measurement'].includes(config.purpose));
  assert(Number.isInteger(config.guardSeconds) && config.guardSeconds > 0 && config.guardSeconds <= 105);
  assert(config.purpose !== 'measurement' || config.guardSeconds === 105);
  assert.equal(config.outerSeconds, 120);
  const tools = Object.fromEntries(requiredTools.map((name) => [name, pinned(config.tools[name])]));
  for (const name of requiredTools) {
    const stat = lstatSync(tools[name]);
    assert(stat.uid === 0 && (stat.mode & 0o022) === 0, 'privileged command must be root-owned and protected');
    const resolved = ROOT_PATH.split(':')
      .map((dir) => path.join(dir, name))
      .find((file) => {
        try {
          accessSync(file, constants.X_OK);
          return true;
        } catch {
          return false;
        }
      });
    assert(
      resolved && realpathSync(resolved) === tools[name],
      'script command resolution differs from the pinned tool',
    );
  }
  for (const file of [config.node, config.guard, config.browser, config.crashpad]) pinned(file);
  pinned(config.inner, false);
  assert(inside(config.inner.path, path.join(config.root, 'scripts', 'ci')), 'foreign namespace supervisor');
  assert.equal(config.command[0], config.node.path, 'only the pinned Node entry is executable');
  assert(
    config.command.length >= 2 &&
      config.command.every((part) => typeof part === 'string' && part.length && !part.includes('\0')),
  );
  const script = config.command[1] === '--experimental-strip-types' ? config.command[2] : config.command[1];
  assert(
    path.isAbsolute(script) && inside(script, path.join(config.root, 'scripts', 'ci')),
    'only the owned scenario entry can run',
  );
  assert(
    !config.command.some((part) => ['-e', '--eval', '-p', '--print', '--import', '--require', '-r'].includes(part)),
    'dynamic code entry forbidden',
  );
  assert(config.frozenFiles && Object.entries(config.frozenFiles).length > 0);
  for (const [file, hash] of Object.entries(config.frozenFiles)) {
    assert(path.isAbsolute(file) && inside(file, config.root) && sha(file) === hash, 'source or fixture drift');
  }
  assert(Object.hasOwn(config.frozenFiles, script), 'scenario entry is not hash-bound');
  assert.equal(config.frozenFiles[config.inner.path], config.inner.sha256, 'supervisor must be source-bound');
  for (const directory of config.readDirs) {
    assert(ownsReadRoot(directory, config.root, config.browsers), 'foreign read root');
    assert.equal(realpathSync(directory), directory);
    assert(
      !directory
        .split(path.sep)
        .some((part) => ['.git', '.ssh', '.gnupg', 'credentials', 'private-records'].includes(part)),
    );
  }
  assert(config.unitEnvironment && Object.keys(config.unitEnvironment).length <= 16);
  for (const [name, value] of Object.entries(config.unitEnvironment)) {
    assert(
      /^RFMC_[A-Z0-9_]+$/.test(name) && typeof value === 'string' && value.length <= 16384 && !value.includes('\0'),
    );
  }
  const environment = {
    PATH: path.dirname(config.node.path) + ':/usr/bin:/bin',
    PERF_NODE: config.node.path,
    PERF_ESBUILD: config.browser.path,
    PERF_BROWSER_CRASHPAD_EXEC: config.crashpad.path,
    PERF_REAL_HOME: config.home,
    PERF_BOUNDED_BROWSER: 'owned-loopback-20261031',
    PERF_BROWSER_PORTS: '45000,45001',
    PERF_HOST_NETNS: config.hostNetns,
    PERF_HOST_PIDNS: config.hostPidns,
    PERF_READ_DIRS: config.readDirs.join('\n'),
    PERF_PASS_ENV: Object.keys(config.unitEnvironment).join(','),
    ...config.unitEnvironment,
  };
  // The root timeout owns namespace teardown; namespace-local PGIDs never authorize host signals.
  return {
    argv: [
      tools.sudo,
      '-n',
      tools.env,
      '-i',
      'PATH=' + ROOT_PATH,
      tools.timeout,
      '--signal=KILL',
      '--kill-after=1s',
      '115s',
      tools.unshare,
      '--net',
      '--mount',
      '--pid',
      '--fork',
      '--kill-child',
      '--mount-proc',
      tools.bash,
      '-c',
      NAMESPACE_SCRIPT,
      'rfmc-owned-namespace',
      config.scratch,
      String(config.uid),
      String(config.gid),
      config.root,
      config.home,
      config.browsers,
      '112',
      '15m',
      tools.env,
      '-i',
      'PATH=' + ROOT_PATH,
      config.node.path,
      config.inner.path,
      JSON.stringify({ ...config, guardEnvironment: environment }),
    ],
    environment: { PATH: ROOT_PATH, LANG: 'C' },
  };
}

export function unwrapInner(text, config) {
  try {
    const inner = JSON.parse(text);
    assert(inner && typeof inner === 'object' && !Array.isArray(inner));
    assert(inner.producer === 'rfmc-loading-inner-v1' && inner.closed === true && inner.code === 0);
    assert(inner.spawnError === null && inner.overflow === false && inner.expired === false);
    assert(inner.supervisorUid === 0 && inner.appUid === config.uid && inner.workerPidDomain === 'namespace');
    assert(Number.isInteger(inner.supervisorPid) && inner.supervisorPid > 1);
    assert(Number.isInteger(inner.privateWorkerGroup) && inner.privateWorkerGroup > 1);
    assert(Array.isArray(inner.leftovers) && inner.leftovers.length === 0);
    assert(
      inner.namespace && /^net:\[[0-9]+\]$/.test(inner.namespace.net) && /^pid:\[[0-9]+\]$/.test(inner.namespace.pid),
    );
    assert(inner.namespace.net !== config.hostNetns && inner.namespace.pid !== config.hostPidns);
    assert(inner.namespace.procSelf === String(inner.supervisorPid));
    const output = {};
    let bytes = 0;
    for (const name of ['stdout', 'stderr', 'control']) {
      const value = inner[name + 'Base64'];
      assert(typeof value === 'string');
      const raw = Buffer.from(value, 'base64');
      assert(raw.toString('base64') === value, 'noncanonical output encoding');
      bytes += raw.length;
      output[name] = raw.toString('utf8');
    }
    assert(Number.isInteger(inner.rawOutputBytes) && bytes === inner.rawOutputBytes && bytes <= 384 * 1024);
    const announced = /^\{"workerGroup":([0-9]+)\}\n$/.exec(output.control);
    assert(announced && Number(announced[1]) === inner.privateWorkerGroup);
    return { ok: true, inner, output };
  } catch (error) {
    return { ok: false, error: String(error.message || error) };
  }
}

export async function runNamespace(config) {
  const { argv, environment } = namespaceArgv(config);
  const started = performance.now();
  return new Promise((resolve) => {
    const child = spawn(argv[0], argv.slice(1), {
      env: environment,
      cwd: config.root,
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const chunks = { stdout: [], stderr: [] };
    let bytes = 0,
      overflow = false,
      expired = false,
      settled = false,
      timer,
      grace;
    const capture = (name) => (data) => {
      const available = Math.max(0, OUTPUT_CAP - bytes);
      if (data.length > available) overflow = true;
      const retained = data.subarray(0, available);
      bytes += retained.length;
      chunks[name].push(retained);
    };
    child.stdout.on('data', capture('stdout'));
    child.stderr.on('data', capture('stderr'));
    const done = (code, signal, error = null, childClosed = true) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      clearTimeout(grace);
      const output = Object.fromEntries(
        Object.entries(chunks).map(([name, list]) => [name, Buffer.concat(list).toString('utf8')]),
      );
      const proof = unwrapInner(output.stdout, config);
      resolve({
        ...output,
        code,
        signal,
        error,
        elapsedMs: performance.now() - started,
        outputBytes: bytes,
        overflow,
        expired,
        proof,
        workerPidDomain: 'namespace',
        hostProcess: child.pid,
        childClosed,
        accepted: Boolean(childClosed && code === 0 && !error && !overflow && !expired && proof.ok),
      });
    };
    timer = setTimeout(
      () => {
        expired = true;
        // Only the directly owned user process receives a signal. Root namespace timeout is already bounded to115s.
        try {
          child.kill('SIGTERM');
        } catch {
          /* terminal state is still required below */
        }
        grace = setTimeout(() => {
          child.stdout.destroy();
          child.stderr.destroy();
          done(null, null, 'outer deadline; cleanup remains unproved', false);
        }, 500);
      },
      (config.outerSeconds - 1) * 1000,
    );
    child.once('error', (error) => done(null, null, String(error.code || error)));
    child.once('close', (code, signal) => done(code, signal));
  });
}
