import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import WebSocket from 'ws';
import type { ServerMessage } from '@virtual-cdu/shared';
import { createBridgeServer, type BridgeServer } from '../bridge-server';
import { MockSimConnectAdapter } from '../aircraft-adapters/mock-simconnect';

let bridge: BridgeServer | null = null;
const originalAuthToken = process.env.AUTH_TOKEN;

class MessageCollector {
  private messages: ServerMessage[] = [];
  private waiters: Array<(msg: ServerMessage) => void> = [];

  constructor(ws: WebSocket) {
    ws.on('message', (raw) => {
      const msg = JSON.parse(raw.toString()) as ServerMessage;
      const waiter = this.waiters.shift();
      if (waiter) waiter(msg);
      else this.messages.push(msg);
    });
  }

  next(): Promise<ServerMessage> {
    const msg = this.messages.shift();
    if (msg) return Promise.resolve(msg);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Timed out waiting for message')), 2000);
      this.waiters.push((message) => {
        clearTimeout(timer);
        resolve(message);
      });
    });
  }
}

function waitOpen(ws: WebSocket): Promise<void> {
  if (ws.readyState === WebSocket.OPEN) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timed out waiting for open')), 2000);
    ws.once('open', () => {
      clearTimeout(timer);
      resolve();
    });
    ws.once('error', reject);
  });
}

function waitRejectedUpgrade(ws: WebSocket): Promise<number> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('Timed out waiting for rejected upgrade'));
    }, 2000);

    function cleanup() {
      clearTimeout(timer);
      ws.off('open', handleOpen);
      ws.off('unexpected-response', handleUnexpectedResponse);
      ws.off('error', handleError);
    }

    function handleOpen() {
      cleanup();
      reject(new Error('WebSocket unexpectedly opened'));
    }

    function handleUnexpectedResponse(_request: unknown, response: { statusCode?: number; resume: () => void }) {
      cleanup();
      response.resume();
      resolve(response.statusCode ?? 0);
    }

    function handleError(error: Error) {
      cleanup();
      reject(error);
    }

    ws.once('open', handleOpen);
    ws.once('unexpected-response', handleUnexpectedResponse);
    ws.once('error', handleError);
  });
}

describe('bridge server', () => {
  beforeEach(() => {
    delete process.env.AUTH_TOKEN;
  });

  afterEach(async () => {
    if (bridge) {
      await bridge.stop();
      bridge = null;
    }
    if (originalAuthToken === undefined) delete process.env.AUTH_TOKEN;
    else process.env.AUTH_TOKEN = originalAuthToken;
  });

  it('connects through the mock adapter and broadcasts CONTROL-mode display data', async () => {
    const adapter = new MockSimConnectAdapter();
    bridge = createBridgeServer({ aircraft: adapter });
    const port = await bridge.start();
    const ws = new WebSocket(`ws://127.0.0.1:${port}`);
    const messages = new MessageCollector(ws);
    await waitOpen(ws);

    const initialDisplay = await messages.next();
    expect(initialDisplay.type).toBe('fmc.display');
    const initialStatus = await messages.next();
    expect(initialStatus.type).toBe('sim.disconnected');

    ws.send(JSON.stringify({ type: 'sim.connect' }));
    let connected: ServerMessage | null = null;
    for (let i = 0; i < 5; i++) {
      const msg = await messages.next();
      if (msg.type === 'sim.connected') {
        connected = msg;
        break;
      }
    }

    expect(connected).toMatchObject({
      type: 'sim.connected',
      aircraft: 'Mock SimConnect Adapter',
      aircraftType: 'BOEING_737',
    });

    ws.send(JSON.stringify({ type: 'fmc.input', key: 'RTE' }));
    let display: ServerMessage | null = null;
    for (let i = 0; i < 5; i++) {
      const msg = await messages.next();
      if (msg.type === 'fmc.display' && msg.data.title.includes('RTE')) {
        display = msg;
        break;
      }
    }

    expect(display?.type).toBe('fmc.display');
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(adapter.recordedKeypresses).toContain('RTE');
    ws.close();
  });

  it('automatically reconnects when connection is lost (watchdog)', async () => {
    const adapter = new MockSimConnectAdapter();
    bridge = createBridgeServer({ aircraft: adapter, watchdogInterval: 10 });
    const port = await bridge.start();
    const ws = new WebSocket(`ws://127.0.0.1:${port}`);
    const messages = new MessageCollector(ws);
    await waitOpen(ws);

    // Initial messages
    await messages.next(); // fmc.display
    await messages.next(); // sim.disconnected

    // 1. Connect
    ws.send(JSON.stringify({ type: 'sim.connect' }));
    await messages.next(); // sim.connected

    // 2. Simulate disconnection by the aircraft adapter
    (adapter as any).connectionStatus = 'DISCONNECTED';

    // 3. The watchdog should try to reconnect.
    // In our implementation, it retries every 10 seconds.
    // For the test, we'll wait for the sim.connected message that indicates the watchdog succeeded.
    // Note: MockSimConnectAdapter.connect() always succeeds in this test.

    let reconnected: ServerMessage | null = null;
    // We might get some fmc.display or sim.data messages while polling was active (if it wasn't stopped)
    // But pollInterval stops if !aircraft.isConnected.

    for (let i = 0; i < 20; i++) {
      const msg = await messages.next();
      if (msg.type === 'sim.connected') {
        reconnected = msg;
        break;
      }
    }

    expect(reconnected).toMatchObject({
      type: 'sim.connected',
      aircraft: 'Mock SimConnect Adapter',
    });

    ws.close();
  });

  it('rejects unknown WebSocket message types', async () => {
    bridge = createBridgeServer({ aircraft: new MockSimConnectAdapter() });
    const port = await bridge.start();
    const ws = new WebSocket(`ws://127.0.0.1:${port}`);
    const messages = new MessageCollector(ws);
    await waitOpen(ws);

    await messages.next(); // fmc.display
    await messages.next(); // sim.disconnected
    ws.send(JSON.stringify({ type: 'unknown.command' }));

    await expect(messages.next()).resolves.toMatchObject({
      type: 'error',
      message: 'Unknown or invalid message type',
    });

    ws.close();
  });

  it('rejects clients from disallowed origins', async () => {
    bridge = createBridgeServer({
      aircraft: new MockSimConnectAdapter(),
      allowedOrigins: ['https://trainer.example.test'],
    });
    const port = await bridge.start();
    const ws = new WebSocket(`ws://127.0.0.1:${port}`, {
      headers: { Origin: 'https://evil.example.test' },
    });

    await expect(waitRejectedUpgrade(ws)).resolves.toBe(403);
  });

  it('rejects clients with an invalid AUTH_TOKEN using an HTTP status code', async () => {
    process.env.AUTH_TOKEN = 'expected-token';
    bridge = createBridgeServer({ aircraft: new MockSimConnectAdapter() });
    const port = await bridge.start();
    const ws = new WebSocket(`ws://127.0.0.1:${port}?token=wrong-token`);

    await expect(waitRejectedUpgrade(ws)).resolves.toBe(401);
  });

  it('reports raw and structured adapter capabilities on the health endpoint', async () => {
    const adapter = new MockSimConnectAdapter();
    bridge = createBridgeServer({ aircraft: adapter });
    const port = await bridge.start();

    const response = await fetch(`http://127.0.0.1:${port}/health`);
    const health = await response.json();

    expect(health.capabilities).toEqual(adapter.capabilities);
    expect(health.structuredCapabilities).toMatchObject({
      instruments: ['CDU', 'ND'],
      commands: ['keyPress', 'lskPress'],
      replay: true,
    });
    expect(health.structuredCapabilities.data).toEqual(
      expect.arrayContaining(['display', 'telemetry', 'adapterVersion']),
    );
  });

  it('sets baseline security headers on HTTP responses', async () => {
    bridge = createBridgeServer({ aircraft: new MockSimConnectAdapter() });
    const port = await bridge.start();

    const response = await fetch(`http://127.0.0.1:${port}/health`);

    expect(response.headers.get('x-powered-by')).toBeNull();
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('x-frame-options')).toBe('DENY');
    expect(response.headers.get('content-security-policy')).toContain("default-src 'self'");
  });
});
