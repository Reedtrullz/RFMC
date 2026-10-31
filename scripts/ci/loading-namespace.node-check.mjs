// This explicit Node suite must stay outside Vitest's jsdom file discovery.
import test from 'node:test';
import assert from 'node:assert/strict';
import { ownsReadRoot, unwrapInner } from './loading-namespace.mjs';

const project = '/home/runner/work/RFMC/RFMC';
const sdk = '/home/runner/.cache/ms-playwright/chromium-1223';
for (const [name, directory, allowed] of [
  ['exact pinned SDK directory', sdk, true],
  ['pinned SDK child', sdk + '/chrome-linux64', true],
  ['owned scripts', project + '/scripts/ci', true],
  ['owned packages', project + '/node_modules', true],
  ['whole project root', project, false],
  ['SDK parent', '/home/runner/.cache/ms-playwright', false],
  ['SDK prefix shadow', sdk + '-shadow', false],
  ['private home root', '/home/runner', false],
  ['private credentials', '/home/runner/.ssh', false],
  ['unrelated sibling', '/home/runner/work/Other/Other', false],
]) {
  test('read roots: ' + name, () => {
    assert.equal(ownsReadRoot(directory, project, sdk), allowed);
  });
}

const config = { uid: 1001, hostNetns: 'net:[10]', hostPidns: 'pid:[11]' };
function envelope() {
  const stdout = '{"metric":12}\n',
    stderr = '',
    control = '{"workerGroup":4}\n';
  return {
    producer: 'rfmc-loading-inner-v1',
    closed: true,
    code: 0,
    spawnError: null,
    overflow: false,
    expired: false,
    supervisorUid: 0,
    supervisorPid: 2,
    appUid: 1001,
    workerPidDomain: 'namespace',
    privateWorkerGroup: 4,
    leftovers: [],
    namespace: { net: 'net:[20]', pid: 'pid:[21]', procSelf: '2' },
    stdoutBase64: Buffer.from(stdout).toString('base64'),
    stderrBase64: Buffer.from(stderr).toString('base64'),
    controlBase64: Buffer.from(control).toString('base64'),
    rawOutputBytes: Buffer.byteLength(stdout + stderr + control),
  };
}
test('decodes a complete supervisor record without treating application output as control', () => {
  const result = unwrapInner(JSON.stringify(envelope()), config);
  assert.equal(result.ok, true);
  assert.equal(result.output.stdout, '{"metric":12}\n');
  assert.equal(result.output.control, '{"workerGroup":4}\n');
});
for (const [name, change] of [
  [
    'not closed',
    (d) => {
      d.closed = false;
    },
  ],
  [
    'unsuccessful child',
    (d) => {
      d.code = 1;
    },
  ],
  [
    'missing explicit overflow result',
    (d) => {
      delete d.overflow;
    },
  ],
  [
    'wrong app identity',
    (d) => {
      d.appUid = 0;
    },
  ],
  [
    'host process domain',
    (d) => {
      d.workerPidDomain = 'host';
    },
  ],
  [
    'remaining process',
    (d) => {
      d.leftovers = [9];
    },
  ],
  [
    'host network namespace',
    (d) => {
      d.namespace.net = config.hostNetns;
    },
  ],
  [
    'host PID namespace',
    (d) => {
      d.namespace.pid = config.hostPidns;
    },
  ],
  [
    'wrong procfs view',
    (d) => {
      d.namespace.procSelf = '12345';
    },
  ],
  [
    'missing namespace record',
    (d) => {
      delete d.namespace;
    },
  ],
  [
    'tampered private channel',
    (d) => {
      d.privateWorkerGroup = 5;
    },
  ],
  [
    'malformed base64',
    (d) => {
      d.stdoutBase64 += '!';
    },
  ],
  [
    'wrong byte count',
    (d) => {
      d.rawOutputBytes++;
    },
  ],
]) {
  test('rejects ' + name, () => {
    const data = envelope();
    change(data);
    assert.equal(unwrapInner(JSON.stringify(data), config).ok, false);
  });
}
test('rejects malformed or misleading success output without throwing', () => {
  for (const text of ['PASS', 'null', '{}', '[]', '{"producer":"rfmc-loading-inner-v1"}']) {
    assert.equal(unwrapInner(text, config).ok, false);
  }
});
