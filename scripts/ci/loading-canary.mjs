import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import { openSync, closeSync, readFileSync, writeFileSync, unlinkSync, statfsSync } from 'node:fs';
import { spawnSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import net from 'node:net';
import http from 'node:http';

const file = fileURLToPath(import.meta.url);
const scratch = path.dirname(process.env.HOME);
const mode = process.env.RFMC_CANARY;
assert.equal(process.platform, 'linux');
assert(process.getuid() > 0);
const denial = (action) => assert.throws(action, (error) => ['EACCES', 'EPERM'].includes(error.code));
function privateControls() {
  const status = readFileSync('/proc/self/status', 'utf8');
  assert.match(status, /^NoNewPrivs:\s+1$/m);
  assert.match(status, /^CapEff:\s+0+$/m);
  const uid = process.getuid();
  assert.match(status, new RegExp('^Uid:\\s+' + [uid, uid, uid, uid].join('\\s+') + '$', 'm'));
  assert.equal(process.env.GITHUB_TOKEN, undefined);
  assert.equal(process.env.AWS_SECRET_ACCESS_KEY, undefined);
  assert.equal(process.env.NODE_OPTIONS, '');
  denial(() => readFileSync(path.join(scratch, 'denied/private-read')));
  denial(() => writeFileSync(path.join(scratch, 'denied/protected-write'), 'bad'));
  assert.throws(
    () => writeFileSync(file, 'bad'),
    (error) => ['EACCES', 'EPERM', 'EROFS'].includes(error.code),
  );
  denial(() => readFileSync('/proc/' + process.env.RFMC_SUPERVISOR_PID + '/environ'));
  denial(() => {
    const fd = openSync('/proc/' + process.env.RFMC_SUPERVISOR_PID + '/fd/1', 'w');
    closeSync(fd);
  });
  const unknown = spawnSync('/usr/bin/false', [], { encoding: 'utf8', timeout: 1000 });
  assert(unknown.error && ['EACCES', 'EPERM'].includes(unknown.error.code));
  const positive = path.join(process.env.TMPDIR, 'canary-positive');
  writeFileSync(positive, 'owned');
  assert.equal(readFileSync(positive, 'utf8'), 'owned');
  unlinkSync(positive);
}
async function connectResult(port, host = '127.0.0.1') {
  return new Promise((resolve, reject) => {
    const socket = net.connect({ host, port });
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error('unbounded socket'));
    }, 1000);
    socket.once('connect', () => {
      clearTimeout(timer);
      socket.destroy();
      resolve('CONNECTED');
    });
    socket.once('error', (error) => {
      clearTimeout(timer);
      resolve(error.code);
    });
  });
}

const inherited = process.argv[2] === 'inherited';
if (inherited) {
  privateControls();
  assert(['EACCES', 'EPERM'].includes(await connectResult(45002)));
  process.stdout.write('{"inherited":true}\n');
} else if (mode === 'c-self-check') {
  // The C entry checks UDP, AF_UNIX, socketpair and io_uring before and after this native Node exec.
  privateControls();
  assert.equal(await connectResult(Number(process.argv[2])), 'CONNECTED');
  assert(['EACCES', 'EPERM'].includes(await connectResult(Number(process.argv[3]))));
  const child = spawnSync(process.execPath, [file, 'inherited'], { encoding: 'utf8', timeout: 2000 });
  assert.equal(child.status, 0, child.stderr);
  assert.deepEqual(JSON.parse(child.stdout), { inherited: true });
  process.stdout.write('{"nodePrivateControls":true,"inheritedControls":true}\n');
} else if (mode === 'browser') {
  privateControls();
  assert(['EACCES', 'EPERM'].includes(await connectResult(45002)));
  assert.equal(await connectResult(45000, '192.0.2.1'), 'ENETUNREACH');
  const sockets = new Set();
  const server = http.createServer((_request, response) => {
    response.setHeader('Content-Type', 'text/html');
    response.end(
      '<!doctype html><title>owned</title><input aria-label="Keys"><script>window.events=[];document.querySelector("input").oninput=e=>events.push(e.target.value)</script>',
    );
  });
  server.on('connection', (socket) => {
    sockets.add(socket);
    socket.once('close', () => sockets.delete(socket));
  });
  const webSocketServer = http.createServer();
  webSocketServer.on('connection', (socket) => {
    sockets.add(socket);
    socket.once('close', () => sockets.delete(socket));
  });
  webSocketServer.on('upgrade', (request, socket) => {
    const accept = createHash('sha1')
      .update(request.headers['sec-websocket-key'] + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
      .digest('base64');
    socket.write(
      'HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' +
        accept +
        '\r\n\r\n',
    );
    socket.write(Buffer.from([0x81, 5, ...Buffer.from('owned')]));
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(45000, '127.0.0.1', resolve);
  });
  let context;
  try {
    await new Promise((resolve, reject) => {
      webSocketServer.once('error', reject);
      webSocketServer.listen(45001, '127.0.0.1', resolve);
    });
    const { chromium } = await import('@playwright/test');
    context = await chromium.launchPersistentContext(path.join(process.env.TMPDIR, 'profile'), {
      executablePath: process.env.RFMC_CHROMIUM,
      headless: true,
      args: ['--disk-cache-size=1048576', '--media-cache-size=1048576', '--disable-dev-shm-usage'],
    });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:45000', { timeout: 15000 });
    await page.getByRole('textbox', { name: 'Keys' }).pressSequentially('QA');
    assert.equal(await page.getByRole('textbox', { name: 'Keys' }).inputValue(), 'QA');
    assert.deepEqual(await page.evaluate(() => window.events), ['Q', 'QA']);
    assert.equal(await page.title(), 'owned');
    assert.equal(
      await page.evaluate(
        () =>
          new Promise((resolve, reject) => {
            const socket = new WebSocket('ws://127.0.0.1:45001');
            const timer = setTimeout(() => {
              socket.close();
              reject(new Error('owned WS timeout'));
            }, 2000);
            socket.onmessage = (event) => {
              clearTimeout(timer);
              socket.close();
              resolve(event.data);
            };
            socket.onerror = () => {
              clearTimeout(timer);
              reject(new Error('owned WS failure'));
            };
          }),
      ),
      'owned',
    );
  } finally {
    if (context) await context.close();
    for (const socket of sockets) socket.destroy();
    await Promise.all(
      [server, webSocketServer].map((ownedServer) => new Promise((resolve) => ownedServer.close(resolve))),
    );
  }
  process.stdout.write(
    '{"nativeChromium":true,"realKeyboard":true,"ownedWebSocket":true,"forbiddenTcpDenied":true,"offNamespaceDenied":true,"browserClosed":true,"serverClosed":true}\n',
  );
} else if (mode === 'capacity') {
  const written = [];
  let bytes = 0;
  try {
    for (let i = 0; i < 20; i++) {
      const target = path.join(process.env.TMPDIR, 'cap-' + i);
      written.push(target);
      try {
        writeFileSync(target, Buffer.alloc(1024 * 1024, 0x61));
        bytes += 1024 * 1024;
      } catch (error) {
        assert.equal(error.code, 'ENOSPC');
        break;
      }
    }
    assert(bytes >= 12 * 1024 * 1024 && bytes < 15 * 1024 * 1024);
    const fs = statfsSync(process.env.TMPDIR);
    assert(fs.bsize * fs.blocks <= 15 * 1024 * 1024);
    assert(fs.bavail * fs.bsize < 1024 * 1024);
  } finally {
    for (const target of written) unlinkSync(target);
  }
  process.stdout.write(JSON.stringify({ kernelTmpfsCapacity: true, completedBytes: bytes }) + '\n');
} else if (mode === 'flood') {
  const chunk = Buffer.alloc(65536, 0x61);
  for (;;) if (!process.stdout.write(chunk)) await once(process.stdout, 'drain');
} else if (mode === 'sleep') {
  setInterval(() => {}, 1000);
} else if (mode === 'survivor') {
  const child = spawn(process.execPath, [file], {
    env: { ...process.env, RFMC_CANARY: 'sleep' },
    detached: true,
    stdio: 'ignore',
  });
  child.unref();
  process.stdout.write(JSON.stringify({ detachedOwnedChild: child.pid }) + '\n');
} else {
  assert.fail('unknown native canary');
}
