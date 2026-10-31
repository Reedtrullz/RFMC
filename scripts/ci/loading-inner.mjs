import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readlinkSync, readdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import net from 'node:net';

// This supervisor imports only builtins as root; setpriv drops all application privileges before Landlock.
assert.equal(process.platform, 'linux');
assert.equal(process.getuid(), 0, 'namespace supervisor must own the private control pipe');
assert.equal(readlinkSync('/proc/self'), String(process.pid), 'private procfs required');
const config = JSON.parse(process.argv[2]);
assert(Number.isInteger(config.uid) && config.uid > 0);
assert.notEqual(readlinkSync('/proc/self/ns/net'), config.hostNetns);
assert.notEqual(readlinkSync('/proc/self/ns/pid'), config.hostPidns);
const sha = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
for (const item of [config.node, config.guard, config.browser, config.inner, config.tools.setpriv]) {
  assert.equal(sha(item.path), item.sha256, 'executable changed inside namespace');
}
for (const [file, expected] of Object.entries(config.frozenFiles)) assert.equal(sha(file), expected, 'source changed');
const environment = config.guardEnvironment;
assert(environment && environment.PERF_NODE === config.node.path);
assert.equal(environment.PERF_BOUNDED_BROWSER, 'owned-loopback-20261031');
environment.RFMC_SUPERVISOR_PID = String(process.pid);
environment.PERF_PASS_ENV += ',RFMC_SUPERVISOR_PID';
let sentinel = null;
const sentinelSockets = new Set();
async function sentinelProbe() {
  return new Promise((resolve, reject) => {
    const socket = net.connect({ host: '127.0.0.1', port: 45002 });
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error('sentinel not live'));
    }, 1000);
    socket.once('data', (body) => {
      clearTimeout(timer);
      socket.destroy();
      resolve(body.toString() === 'owned-forbidden-sentinel');
    });
    socket.once('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}
if (config.purpose === 'guard-controls') {
  sentinel = net.createServer((socket) => {
    sentinelSockets.add(socket);
    socket.once('close', () => sentinelSockets.delete(socket));
    socket.end('owned-forbidden-sentinel');
  });
  await new Promise((resolve, reject) => {
    sentinel.once('error', reject);
    sentinel.listen(45002, '127.0.0.1', resolve);
  });
  assert(await sentinelProbe(), 'forbidden-port sentinel must be live before denial');
}
const selfCheck = config.purpose === 'guard-controls' && environment.RFMC_CANARY === 'c-self-check';
const guardArgs = selfCheck
  ? ['self-check', config.scratch, config.command[1], config.root + '/.git/config', config.home]
  : ['qualify', config.scratch, String(config.guardSeconds), '--', ...config.command];
const argv = [
  '--reuid=' + config.uid,
  '--regid=' + config.gid,
  '--clear-groups',
  '--no-new-privs',
  '--inh-caps=-all',
  '--bounding-set=-all',
  config.guard.path,
  ...guardArgs,
];
const child = spawn(config.tools.setpriv.path, argv, {
  cwd: config.root,
  env: environment,
  detached: true,
  stdio: ['ignore', 'pipe', 'pipe', 'pipe'],
});
let bytes = 0,
  overflow = false,
  expired = false,
  workerGroup = 0,
  closed = false,
  spawnError = null;
const streams = { stdout: [], stderr: [], control: [] };
const killWorker = () => {
  // Keep the C subreaper alive to reap the killed worker and adopted descendants.
  if (workerGroup > 1 && workerGroup !== process.pid && workerGroup !== child.pid) {
    try {
      process.kill(-workerGroup, 'SIGKILL');
    } catch (error) {
      if (error.code !== 'ESRCH') throw error;
    }
  }
};
const killOwnedAfterClose = () => {
  // These groups and this call are in the same fresh PID namespace; no host PID is accepted.
  for (const group of [child.pid, workerGroup])
    if (group > 1 && group !== process.pid) {
      try {
        process.kill(-group, 'SIGKILL');
      } catch (error) {
        if (error.code !== 'ESRCH') throw error;
      }
    }
};
const take = (name) => (data) => {
  const controlBytes = streams.control.reduce((sum, value) => sum + value.length, 0);
  const room = Math.max(0, name === 'control' ? 512 - controlBytes : 384 * 1024 - 512 - (bytes - controlBytes));
  if (data.length > room) overflow = true;
  const part = data.subarray(0, room);
  bytes += part.length;
  if (part.length) streams[name].push(part);
  if (name === 'control') {
    const value = Buffer.concat(streams.control).toString('utf8');
    const match = /^\{"workerGroup":([0-9]+)\}\n$/.exec(value);
    if (match) {
      const group = Number(match[1]);
      assert(group > 1 && group !== process.pid && group !== child.pid, 'invalid private worker group');
      workerGroup = group;
    }
  }
  if (overflow) killWorker();
};
child.stdout.on('data', take('stdout'));
child.stderr.on('data', take('stderr'));
child.stdio[3].on('data', take('control'));
const timer = setTimeout(
  () => {
    expired = true;
    killWorker();
  },
  (config.guardSeconds + 3) * 1000,
);
const result = await new Promise((resolve) => {
  child.once('error', (error) => {
    spawnError = String(error.code || error);
  });
  child.once('close', (code, signal) => {
    closed = true;
    resolve({ code, signal });
  });
});
clearTimeout(timer);
killOwnedAfterClose();

function ownedProcesses() {
  const found = [];
  for (const name of readdirSync('/proc')) {
    if (!/^[0-9]+$/.test(name)) continue;
    try {
      const status = readFileSync('/proc/' + name + '/status', 'utf8');
      const uid = /^Uid:\s+([0-9]+)/m.exec(status);
      assert(uid, 'process identity missing');
      if (Number(uid[1]) === config.uid) found.push(Number(name));
    } catch (error) {
      if (!['ENOENT', 'ESRCH'].includes(error.code)) throw error;
    }
  }
  return found;
}
let leftovers = ownedProcesses();
for (const pid of leftovers) {
  try {
    process.kill(pid, 'SIGKILL');
  } catch (error) {
    if (error.code !== 'ESRCH') throw error;
  }
}
for (let pass = 0; leftovers.length && pass < 10; pass++) {
  await new Promise((resolve) => setTimeout(resolve, 50));
  leftovers = ownedProcesses();
}
let sentinelBeforeAfter = null;
if (sentinel) {
  sentinelBeforeAfter = await sentinelProbe();
  const closing = [...sentinelSockets];
  const closedSockets = closing.map((socket) => new Promise((resolve) => socket.once('close', resolve)));
  const serverClosed = new Promise((resolve) => sentinel.close(resolve));
  for (const socket of closing) socket.destroy();
  await Promise.all([serverClosed, ...closedSockets]);
  assert.equal(sentinelSockets.size, 0, 'owned sentinel sockets remain');
}
const output = {
  producer: 'rfmc-loading-inner-v1',
  ...result,
  spawnError,
  closed,
  overflow,
  expired,
  privateWorkerGroup: workerGroup,
  workerPidDomain: 'namespace',
  leftovers,
  namespace: {
    net: readlinkSync('/proc/self/ns/net'),
    pid: readlinkSync('/proc/self/ns/pid'),
    procSelf: readlinkSync('/proc/self'),
  },
  supervisorUid: process.getuid(),
  supervisorPid: process.pid,
  appUid: config.uid,
  rawOutputBytes: bytes,
  sentinelBeforeAfter,
  ...Object.fromEntries(
    Object.entries(streams).map(([name, parts]) => [name + 'Base64', Buffer.concat(parts).toString('base64')]),
  ),
};
process.stdout.write(JSON.stringify(output) + '\n');
process.exitCode =
  closed && result.code === 0 && !spawnError && !overflow && !expired && workerGroup > 1 && leftovers.length === 0
    ? 0
    : 1;
