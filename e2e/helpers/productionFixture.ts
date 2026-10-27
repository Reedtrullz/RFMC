import { expect, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs';
import { createServer, request as httpRequest } from 'node:http';
import type { Socket } from 'node:net';
import path from 'node:path';

export type FileDigest = { sha256: string; bytes: number };
export type Manifest = Record<string, FileDigest>;
export type GuardRequest = { path: string; status: number; bytes: number };
export type GuardDenial = { method: string; host?: string; url?: string };
export type CacheEntry = { cache: string; url: string; bytes: number; sha: string };
export type AssetProbe = { path: string; status: number; bytes: number; sha: string } | { path: string; error: string };

export type ProductionGuard = {
  origin: string;
  wsUrl: string;
  requests: GuardRequest[];
  denials: GuardDenial[];
  probeUpgrade: (pathname: string) => Promise<number | string>;
  close: () => Promise<{ serverClosed: boolean; sockets: number }>;
};

const MIME: Record<string, string> = {
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.json': 'application/json',
  '.ttf': 'font/ttf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};

const WS_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const PRECACHE_EXT = /\.(js|css|html|ico|png|svg|woff2|ttf|json)$/;
const PRECACHE_EXCLUDES = [/^sw\.js$/, /^registerSW\.js$/, /^workbox-.*\.js$/];
const SOURCE_FILES = [
  'src/components/instruments/airbus/AirbusPFD.tsx',
  'src/components/instruments/boeing/BoeingPFD.tsx',
  'shared/src/pfd/pfdDisplayModel.ts',
  'shared/src/pfd/boeingPfdModel.ts',
];

export function hashDirectory(root: string): Manifest {
  const manifest: Manifest = {};
  const walk = (dir: string, prefix: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full, relative);
        continue;
      }
      const body = readFileSync(full);
      manifest[relative] = { sha256: createHash('sha256').update(body).digest('hex'), bytes: body.byteLength };
    }
  };
  walk(root, '');
  return manifest;
}

export function sourceHashes(root: string): Record<string, string> {
  return Object.fromEntries(
    SOURCE_FILES.map((file) => [
      file,
      createHash('sha256')
        .update(readFileSync(path.join(root, file)))
        .digest('hex'),
    ]),
  );
}

export function monitorCaseOutput(directory: string, abort: () => Promise<void>) {
  const limitBytes = 64 * 1024 * 1024;
  let peakBytes = 0;
  const failures: string[] = [];
  const size = (target: string): number => {
    try {
      const stat = lstatSync(target);
      if (!stat.isDirectory()) return stat.size;
      return readdirSync(target).reduce((sum, name) => sum + size(path.join(target, name)), 0);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return 0;
      throw error;
    }
  };
  const sample = () => {
    const bytes = size(directory);
    peakBytes = Math.max(peakBytes, bytes);
    if (bytes > limitBytes) throw new Error(`Correctness output exceeds ${limitBytes} bytes: ${bytes}`);
  };
  const timer = setInterval(() => {
    try {
      sample();
    } catch (error) {
      if (failures.length > 0) return;
      failures.push(String(error));
      void abort().catch((failure) => failures.push(`Budget abort: ${String(failure)}`));
    }
  }, 100);
  return {
    stop() {
      clearInterval(timer);
      try {
        sample();
      } catch (error) {
        failures.push(String(error));
      }
      return {
        limitBytes,
        peakBytes,
        failures,
        sampleMs: 100,
        containment: 'Sampled file-byte monitor; not a hard OS disk or process-memory limit',
      };
    },
  };
}

export function requiredAssetPaths(manifest: Manifest): string[] {
  return Object.keys(manifest)
    .filter((file) => PRECACHE_EXT.test(file) && !PRECACHE_EXCLUDES.some((pattern) => pattern.test(file)))
    .map((file) => `/${file}`);
}

export function cachePath(url: string): string {
  const parsed = new URL(url);
  parsed.searchParams.delete('__WB_REVISION__');
  return parsed.pathname;
}

export async function startProductionGuard(distDir: string): Promise<ProductionGuard> {
  const distRoot = path.resolve(distDir);
  if (!existsSync(path.join(distRoot, 'index.html'))) throw new Error(`dist/index.html is missing: ${distRoot}`);
  const requests: GuardRequest[] = [];
  const denials: GuardDenial[] = [];
  const sockets = new Set<Socket>();
  let origin = '';
  let port = 0;

  const track = (socket: Socket) => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
  };

  const server = createServer((req, res) => {
    const raw = req.url ?? '/';
    const absolute = raw.startsWith('http') ? new URL(raw).origin : origin;
    if (absolute !== origin || req.headers.host !== new URL(origin).host) {
      denials.push({ method: req.method ?? 'GET', host: req.headers.host, url: raw });
      res.writeHead(403);
      res.end('denied');
      return;
    }
    const url = new URL(raw, origin);
    if (url.pathname.startsWith('/api/')) {
      requests.push({ path: url.pathname, status: 503, bytes: 0 });
      res.writeHead(503);
      res.end('fixture: no provider');
      return;
    }
    let file: string;
    try {
      file = path.resolve(distRoot, `.${decodeURIComponent(url.pathname)}`);
    } catch {
      res.writeHead(400);
      res.end('bad path');
      return;
    }
    if (url.pathname === '/' || path.extname(file) === '') file = path.join(distRoot, 'index.html');
    if (file !== distRoot && !file.startsWith(distRoot + path.sep)) {
      denials.push({ method: req.method ?? 'GET', host: req.headers.host, url: raw });
      res.writeHead(403);
      res.end('denied');
      return;
    }
    if (!existsSync(file)) {
      requests.push({ path: url.pathname, status: 404, bytes: 0 });
      res.writeHead(404);
      res.end();
      return;
    }
    const body = readFileSync(file);
    requests.push({ path: url.pathname, status: 200, bytes: body.byteLength });
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream',
      'Content-Length': body.byteLength,
      'Cache-Control': 'no-cache',
      'Service-Worker-Allowed': '/',
    });
    res.end(body);
  });

  server.on('connection', track);
  server.on('connect', (req, socket) => {
    track(socket);
    if (req.url !== new URL(origin).host) {
      denials.push({ method: 'CONNECT', host: req.url });
      socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');
      return;
    }
    socket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
  });
  server.on('upgrade', (req, socket) => {
    track(socket);
    const url = new URL(req.url ?? '/', origin);
    if (req.headers.host !== new URL(origin).host || url.pathname !== '/ws') {
      denials.push({ method: 'UPGRADE', host: req.headers.host, url: req.url });
      socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');
      return;
    }
    const key = req.headers['sec-websocket-key'];
    if (typeof key !== 'string') {
      socket.destroy();
      return;
    }
    const accept = createHash('sha1').update(`${key}${WS_GUID}`).digest('base64');
    socket.write(
      `HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`,
    );
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('guard server did not bind a TCP port');
  port = address.port;
  origin = `http://127.0.0.1:${port}`;

  const probeUpgrade = (pathname: string) =>
    new Promise<number | string>((resolve) => {
      const request = httpRequest({
        host: '127.0.0.1',
        port,
        path: pathname,
        headers: {
          Connection: 'Upgrade',
          Upgrade: 'websocket',
          'Sec-WebSocket-Key': 'dGhlIHNhbXBsZSBub25jZQ==',
          'Sec-WebSocket-Version': '13',
        },
      });
      request.on('upgrade', (response, socket) => {
        socket.destroy();
        resolve(response.statusCode ?? 101);
      });
      request.on('response', (response) => {
        response.resume();
        resolve(response.statusCode ?? 0);
      });
      request.on('error', () => resolve('rejected'));
      request.setTimeout(3000, () => {
        request.destroy();
        resolve('timeout');
      });
      request.end();
    });

  const close = async () => {
    for (const socket of sockets) socket.destroy();
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    return { serverClosed: !server.listening, sockets: sockets.size };
  };

  return { origin, wsUrl: `${origin.replace(/^http/, 'ws')}/ws`, requests, denials, probeUpgrade, close };
}

export async function captureCache(page: Page): Promise<CacheEntry[]> {
  return page.evaluate(async () => {
    const digest = async (body: ArrayBuffer) => {
      const hash = await crypto.subtle.digest('SHA-256', body);
      return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
    };
    const entries: { cache: string; url: string; bytes: number; sha: string }[] = [];
    for (const name of await caches.keys()) {
      const cache = await caches.open(name);
      for (const request of await cache.keys()) {
        const response = await cache.match(request);
        if (!response) continue;
        const body = await response.arrayBuffer();
        entries.push({ cache: name, url: request.url, bytes: body.byteLength, sha: await digest(body) });
      }
    }
    return entries;
  });
}

export async function fetchAssetsInPage(page: Page, paths: string[]): Promise<AssetProbe[]> {
  return page.evaluate(async (urls) => {
    const digest = async (body: ArrayBuffer) => {
      const hash = await crypto.subtle.digest('SHA-256', body);
      return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
    };
    const probes: ({ path: string; status: number; bytes: number; sha: string } | { path: string; error: string })[] =
      [];
    for (const target of urls) {
      try {
        const response = await fetch(target);
        const body = await response.arrayBuffer();
        probes.push({ path: target, status: response.status, bytes: body.byteLength, sha: await digest(body) });
      } catch (error) {
        probes.push({ path: target, error: String(error) });
      }
    }
    return probes;
  }, paths);
}

export async function runGuardProbe(guard: ProductionGuard, page: Page) {
  const record = { http: 0, https: '', loopback: '', foreignWs: '', ownOrigin: 0, ownWs: '' as number | string };
  const http = await page.goto('http://guard-denied.invalid/x', { timeout: 10000 });
  record.http = http?.status() ?? 0;
  try {
    const https = await page.goto('https://guard-denied.invalid/x', { timeout: 10000 });
    record.https = `status:${https?.status() ?? 0}`;
  } catch {
    record.https = 'rejected';
  }
  try {
    const loopback = await page.goto('http://127.0.0.1:8080/', { timeout: 10000 });
    record.loopback = `status:${loopback?.status() ?? 0}`;
  } catch {
    record.loopback = 'rejected';
  }
  const wsDenialStart = guard.denials.length;
  const foreignWsUrl = 'ws://ws-source-admission-probe.invalid/ws-source-admission-probe';
  record.foreignWs = await page.evaluate(
    (target) =>
      new Promise<string>((resolve) => {
        const socket = new WebSocket(target);
        let timer: ReturnType<typeof setTimeout>;
        const done = (value: string) => {
          clearTimeout(timer);
          try {
            socket.close();
          } catch {
            // The guard may already have closed the socket.
          }
          resolve(value);
        };
        socket.onopen = () => done('opened');
        socket.onerror = () => done('error');
        timer = setTimeout(() => done('timeout'), 4000);
      }),
    foreignWsUrl,
  );
  const foreignWsDenials = guard.denials.slice(wsDenialStart);
  expect(
    foreignWsDenials.some(
      (denial) =>
        (denial.method === 'CONNECT' && denial.host === 'ws-source-admission-probe.invalid:80') ||
        (denial.method === 'UPGRADE' &&
          denial.host === 'ws-source-admission-probe.invalid' &&
          new URL(denial.url ?? '', foreignWsUrl).pathname === '/ws-source-admission-probe'),
    ),
    'The real foreign WebSocket must produce its own new proxy denial',
  ).toBe(true);
  const own = await page.goto(`${guard.origin}/manifest.json`, { timeout: 10000 });
  record.ownOrigin = own?.status() ?? 0;
  record.ownWs = await guard.probeUpgrade('/ws');
  const foreignPath = await guard.probeUpgrade('/ws-denied');
  const denials = guard.denials.slice();

  expect(record.http).toBe(403);
  expect(record.https === 'rejected' || record.https === 'status:403').toBe(true);
  expect(record.loopback === 'rejected' || record.loopback === 'status:403').toBe(true);
  expect(record.foreignWs).toBe('error');
  expect(record.ownOrigin).toBe(200);
  expect(record.ownWs).toBe(101);
  expect(foreignPath).toBe(403);
  expect(
    denials.some((denial) => denial.method === 'CONNECT' && String(denial.host).includes('guard-denied.invalid')),
  ).toBe(true);
  expect(denials.some((denial) => String(denial.host ?? '').includes('8080'))).toBe(true);
  expect(denials.some((denial) => String(denial.host ?? '').includes('guard-denied.invalid'))).toBe(true);
  return { ...record, foreignWsPath: foreignPath, foreignWsUrl, foreignWsDenials, denials };
}
