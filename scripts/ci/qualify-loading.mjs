import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  lstatSync,
  readFileSync,
  realpathSync,
  readlinkSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
  statfsSync,
  readdirSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runNamespace, NAMESPACE_SHA256 } from './loading-namespace.mjs';

assert.equal(process.platform, 'linux');
assert.equal(process.arch, 'x64');
assert(process.getuid() > 0, 'qualify from the hosted nonroot runner');
const root = realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..'));
assert.equal(realpathSync(process.cwd()), root);
const resultDir = path.join(root, '.qa/loading-qualification');
mkdirSync(resultDir, { recursive: true });
assert.equal(lstatSync(resultDir).isSymbolicLink(), false);
const sha = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
const pin = (file) => {
  const name = realpathSync(file);
  return { path: name, sha256: sha(name) };
};
const sourceNames = [
  'loading-isolation.c',
  'loading-namespace.mjs',
  'loading-inner.mjs',
  'loading-canary.mjs',
  'qualify-loading.mjs',
];
const frozenFiles = Object.fromEntries(
  sourceNames.map((name) => {
    const file = path.join(root, 'scripts/ci', name);
    return [file, sha(file)];
  }),
);
for (const name of ['pnpm-lock.yaml', 'package.json']) frozenFiles[path.join(root, name)] = sha(path.join(root, name));
const git = (args) => {
  const result = spawnSync('/usr/bin/git', args, { cwd: root, encoding: 'utf8', timeout: 5000, maxBuffer: 65536 });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
};
const head = git(['rev-parse', 'HEAD']);
assert.match(head, /^[a-f0-9]{40}$/);
assert.equal(git(['diff', '--name-only', 'HEAD']), '', 'tracked source must be clean');
const fs = statfsSync(root);
assert(fs.bavail * fs.bsize >= 30 * 1024 ** 3, '30GiB floor');
const { chromium } = await import('@playwright/test');
const browser = pin(chromium.executablePath());
const browsers = realpathSync(path.resolve(path.dirname(browser.path), '../..'));
const crashpad = pin(path.join(path.dirname(browser.path), 'chrome_crashpad_handler'));
const tools = {};
for (const name of [
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
  'cc',
]) {
  const found = spawnSync('/usr/bin/which', [name], { encoding: 'utf8', timeout: 1000, maxBuffer: 4096 });
  assert.equal(found.status, 0, 'installed tool unavailable: ' + name);
  tools[name] = pin(found.stdout.trim());
}
const parent = realpathSync(process.env.RUNNER_TOOL_CACHE);
assert(parent.startsWith('/opt/'), 'owned tool-cache scratch required');
const owned = mkdtempSync(path.join(parent, 'rfmc-loading-'));
const scratch = path.join(owned, 'native');
mkdirSync(scratch, { mode: 0o700 });
const result = {
  producer: 'rfmc-loading-native-qualification-v1',
  head,
  namespaceScriptSha256: NAMESPACE_SHA256,
  frozenFiles,
  node: pin(process.execPath),
  browser,
  crashpad,
  tools,
  controls: [],
  status: 'FAILED',
  limits: {
    combinedScratchBytes: 16 * 1024 * 1024,
    nativeTmpfsBytes: 15 * 1024 * 1024,
    outputBytes: 1024 * 1024,
    invocationSeconds: 120,
  },
  performanceObservations: 0,
  fullApplicationQA: false,
  cleanup: null,
};
let terminalNamespaceCommands = true;
function ownedHostProcesses() {
  const found = [];
  for (const name of readdirSync('/proc')) {
    if (!/^[0-9]+$/.test(name)) continue;
    try {
      const argv = readFileSync('/proc/' + name + '/cmdline', 'utf8');
      if (argv.includes(owned)) found.push(Number(name));
    } catch (error) {
      if (!['ENOENT', 'ESRCH'].includes(error.code)) throw error;
    }
  }
  return found;
}
try {
  const guardFile = path.join(owned, 'loading-isolation');
  const compiler = spawnSync(
    tools.cc.path,
    [
      '-std=c17',
      '-O2',
      '-Wall',
      '-Wextra',
      '-Werror',
      path.join(root, 'scripts/ci/loading-isolation.c'),
      '-o',
      guardFile,
    ],
    {
      encoding: 'utf8',
      timeout: 20000,
      maxBuffer: 65536,
    },
  );
  result.compiler = {
    code: compiler.status,
    stdout: compiler.stdout,
    stderr: compiler.stderr,
    signal: compiler.signal,
  };
  assert.equal(compiler.status, 0, compiler.stderr);
  const base = {
    root,
    home: realpathSync(os.homedir()),
    browsers,
    scratch,
    uid: process.getuid(),
    gid: process.getgid(),
    hostNetns: readlinkSync('/proc/self/ns/net'),
    hostPidns: readlinkSync('/proc/self/ns/pid'),
    node: result.node,
    guard: pin(guardFile),
    browser,
    crashpad,
    inner: pin(path.join(root, 'scripts/ci/loading-inner.mjs')),
    tools,
    frozenFiles,
    readDirs: [realpathSync(path.join(root, 'scripts/ci')), realpathSync(path.join(root, 'node_modules')), browsers],
    purpose: 'guard-controls',
    nativeTmpfsBytes: 15 * 1024 * 1024,
    totalOwnedBytes: 16 * 1024 * 1024,
    outputBytes: 1024 * 1024,
    innerSeconds: 105,
    outerSeconds: 120,
    command: [process.execPath, path.join(root, 'scripts/ci/loading-canary.mjs')],
  };
  for (const mode of ['c-self-check', 'browser', 'capacity', 'survivor', 'sleep', 'flood']) {
    const configuration = {
      ...base,
      guardSeconds: mode === 'sleep' ? 2 : mode === 'c-self-check' ? 35 : 105,
      unitEnvironment: { RFMC_CANARY: mode, RFMC_CHROMIUM: browser.path },
    };
    const observation = await runNamespace(configuration);
    terminalNamespaceCommands &&= observation.childClosed === true;
    // Keep raw failure bytes finite; the full root envelope is retained for independent control-channel checks.
    const artifact = path.join(resultDir, mode + '.json');
    const bytes = Buffer.byteLength(JSON.stringify(observation));
    assert(bytes <= 1024 * 1024, 'qualification record exceeds bounded output');
    writeFileSync(artifact, JSON.stringify(observation));
    const negative = mode === 'sleep' || mode === 'flood';
    const envelope = JSON.parse(observation.stdout);
    assert.equal(envelope.producer, 'rfmc-loading-inner-v1');
    assert.equal(envelope.closed, true);
    assert.equal(envelope.spawnError, null);
    assert.equal(envelope.sentinelBeforeAfter, true);
    assert.deepEqual(envelope.leftovers, []);
    assert.equal(observation.childClosed, true);
    assert.equal(observation.expired, false);
    assert.equal(envelope.supervisorUid, 0);
    assert.equal(envelope.appUid, base.uid);
    assert.notEqual(envelope.namespace.net, base.hostNetns);
    assert.notEqual(envelope.namespace.pid, base.hostPidns);
    assert.equal(envelope.namespace.procSelf, String(envelope.supervisorPid));
    assert.equal(
      Buffer.from(envelope.controlBase64, 'base64').toString(),
      '{"workerGroup":' + envelope.privateWorkerGroup + '}\n',
    );
    if (negative) {
      assert.equal(observation.accepted, false, 'negative canary was accepted');
      assert.notEqual(envelope.code, 0);
      if (mode === 'flood') assert.equal(envelope.overflow, true);
      if (mode === 'sleep') assert(observation.elapsedMs < 10000);
    } else {
      assert.equal(
        observation.accepted,
        true,
        observation.stderr + '\n' + Buffer.from(envelope.stderrBase64, 'base64'),
      );
      const lines = observation.proof.output.stdout
        .trim()
        .split('\n')
        .map((line) => JSON.parse(line));
      if (mode === 'c-self-check') {
        for (const phase of ['pre', 'inherited', 'post']) {
          const probe = lines.find((line) => line.phase === phase);
          assert(probe && Object.entries(probe).every(([name, value]) => name === 'phase' || value === true));
        }
        assert(lines.some((line) => line.nodePrivateControls === true && line.inheritedControls === true));
        const supervisor = lines.find((line) => line.phase === 'supervisor');
        assert(supervisor && Object.entries(supervisor).every(([name, value]) => name === 'phase' || value === true));
      }
      if (mode === 'browser')
        assert(
          lines.some(
            (line) =>
              line.nativeChromium === true &&
              line.realKeyboard === true &&
              line.browserClosed === true &&
              line.serverClosed === true,
          ),
        );
      if (mode === 'capacity') assert(lines.some((line) => line.kernelTmpfsCapacity === true));
      if (mode === 'survivor')
        assert(lines.some((line) => Number.isInteger(line.detachedOwnedChild) && line.detachedOwnedChild > 1));
    }
    result.controls.push({
      mode,
      status: 'PASS',
      artifact: path.basename(artifact),
      sha256: sha(artifact),
      elapsedMs: observation.elapsedMs,
      expectedRejection: negative,
    });
  }
  for (const [file, expected] of Object.entries(frozenFiles)) assert.equal(sha(file), expected, 'source mutated');
  assert.equal(git(['rev-parse', 'HEAD']), head);
  result.status = 'PASS';
} catch (error) {
  result.error = error instanceof Error ? error.message : String(error);
  process.exitCode = 1;
} finally {
  result.cleanup = {
    terminalNamespaceCommands,
    hostMountsRemaining: null,
    hostProcesses: null,
    ownedScratchRemoved: false,
  };
  try {
    result.cleanup.hostMountsRemaining = readFileSync('/proc/self/mountinfo', 'utf8').includes(owned);
    result.cleanup.hostProcesses = ownedHostProcesses();
    assert(
      terminalNamespaceCommands && !result.cleanup.hostMountsRemaining && result.cleanup.hostProcesses.length === 0,
      'native cleanup unproved; retain owned scratch',
    );
    rmSync(owned, { recursive: true });
    result.cleanup.ownedScratchRemoved = true;
  } catch (error) {
    result.status = 'FAILED';
    result.cleanup.error = error instanceof Error ? error.message : String(error);
    result.cleanup.retainedScratch = owned;
    process.exitCode = 1;
  }
  writeFileSync(path.join(resultDir, 'result.json'), JSON.stringify(result, null, 2) + '\n');
}
process.stdout.write(
  JSON.stringify({
    status: result.status,
    modes: result.controls.map((row) => row.mode),
    error: result.error || null,
    fullApplicationQA: false,
    performanceObservations: 0,
  }) + '\n',
);
