import { afterEach, describe, expect, it } from 'vitest';
import WebSocket from 'ws';
import type { ServerMessage } from '@shared';
import { createBridgeServer, type BridgeServer } from '../bridge-server';
import { MockSimConnectAdapter } from '../aircraft-adapters/mock-simconnect';

let bridge: BridgeServer | null = null;

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

describe('bridge server', () => {
  afterEach(async () => {
    if (bridge) {
      await bridge.stop();
      bridge = null;
    }
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
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(adapter.recordedKeypresses).toContain('RTE');
    ws.close();
  });
});
