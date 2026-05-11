import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import type { ClientMessage, DisplayData, ServerMessage } from '@shared';
import { devError, devLog } from '@shared';
import { createAircraftAdapter } from './aircraft-adapters';
import type { IAircraftAdapter } from './aircraft-adapters/IAircraftAdapter';
import { FMCEngine } from './fmc-engine';

export interface BridgeServerOptions {
  port?: number;
  aircraft?: IAircraftAdapter;
  fmc?: FMCEngine;
  serveStatic?: boolean;
}

export interface BridgeServer {
  app: express.Express;
  server: http.Server;
  wss: WebSocketServer;
  aircraft: IAircraftAdapter;
  fmc: FMCEngine;
  start: () => Promise<number>;
  stop: () => Promise<void>;
  broadcast: (msg: ServerMessage) => void;
}

export function createBridgeServer(options: BridgeServerOptions = {}): BridgeServer {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });
  const fmc = options.fmc ?? new FMCEngine();
  const aircraft = options.aircraft ?? createAircraftAdapter();
  let pollInterval: ReturnType<typeof setInterval> | null = null;

  if (options.serveStatic) {
    app.use(express.static('../dist'));
  }

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      aircraft: aircraft.isConnected ? aircraft.name : 'none',
      aircraftType: aircraft.aircraftType,
      capabilities: aircraft.capabilities,
      connectionStatus: aircraft.connectionStatus,
      lastError: aircraft.lastError,
      clients: wss.clients.size,
    });
  });

  function broadcast(msg: ServerMessage): void {
    const data = JSON.stringify(msg);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  function startPolling(): void {
    if (pollInterval) clearInterval(pollInterval);
    pollInterval = setInterval(async () => {
      if (!aircraft.isConnected) return;
      try {
        const simDisplay = await aircraft.readDisplay();
        const aircraftState = await aircraft.readAircraftState();
        const displayData: DisplayData = {
          title: simDisplay.title,
          pageIndicator: '',
          lines: simDisplay.lines.map(text => ({ text, leftLabel: '', rightLabel: '', inverse: false })),
          lskActions: {},
        };
        broadcast({ type: 'fmc.display', data: displayData } as ServerMessage);
        broadcast({
          type: 'sim.data',
          variables: { brightness: simDisplay.brightness },
          aircraftState: {
            position: aircraftState.position,
            heading: aircraftState.heading,
            altitude: aircraftState.altitude,
            speed: aircraftState.speed,
            verticalSpeed: aircraftState.verticalSpeed,
          },
        });
      } catch (err) {
        devError('[Poll] Error:', err);
      }
    }, 100);
  }

  function stopPolling(): void {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }

  wss.on('connection', (ws: WebSocket) => {
    devLog(`[WS] Client connected (total: ${wss.clients.size})`);

    ws.send(JSON.stringify({
      type: 'fmc.display',
      data: fmc.getDisplayData(),
    } as ServerMessage));

    ws.send(JSON.stringify({
      type: aircraft.isConnected ? 'sim.connected' : 'sim.disconnected',
      aircraft: aircraft.name,
      aircraftType: aircraft.aircraftType,
      capabilities: aircraft.capabilities,
      connectionStatus: aircraft.connectionStatus,
      lastError: aircraft.lastError,
    } as ServerMessage));

    ws.on('message', (raw) => {
      try {
        const msg: ClientMessage = JSON.parse(raw.toString());

        switch (msg.type) {
          case 'fmc.input': {
            const displayData = fmc.processInput(msg.key);
            broadcast({ type: 'fmc.display', data: displayData });
            if (aircraft.isConnected) {
              aircraft.sendKeypress(msg.key).catch(err =>
                devError('[Aircraft] sendKeypress error:', err)
              );
            }
            break;
          }

          case 'sim.connect': {
            devLog('[WS] Client requested sim connection');
            aircraft.connect().then(connected => {
              if (connected) {
                startPolling();
                broadcast({
                  type: 'sim.connected',
                  aircraft: aircraft.name,
                  aircraftType: aircraft.aircraftType,
                  capabilities: aircraft.capabilities,
                  connectionStatus: aircraft.connectionStatus,
                  lastError: aircraft.lastError,
                } as ServerMessage);
              } else {
                ws.send(JSON.stringify({
                  type: 'error',
                  message: aircraft.lastError ?? 'Failed to connect to MSFS',
                } as ServerMessage));
              }
            }).catch(err => {
              devError('[SimConnect] Error:', err);
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Failed to connect to MSFS',
              } as ServerMessage));
            });
            break;
          }

          case 'sim.disconnect': {
            devLog('[WS] Client requested disconnect');
            stopPolling();
            aircraft.disconnect().then(() => {
              broadcast({ type: 'sim.disconnected', lastError: aircraft.lastError } as ServerMessage);
            });
            break;
          }

          case 'mode':
            devLog('[WS] Mode changed:', msg.mode);
            break;
        }
      } catch (err) {
        devError('[WS] Invalid message:', err);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format',
        } as ServerMessage));
      }
    });

    ws.on('close', () => {
      devLog(`[WS] Client disconnected (remaining: ${wss.clients.size - 1})`);
    });

    ws.on('error', (err) => {
      devError('[WS] Client error:', err);
    });
  });

  return {
    app,
    server,
    wss,
    aircraft,
    fmc,
    broadcast,
    start: () => new Promise((resolve) => {
      server.listen(options.port ?? 0, () => {
        const address = server.address();
        const port = typeof address === 'object' && address ? address.port : options.port ?? 0;
        resolve(port);
      });
    }),
    stop: async () => {
      stopPolling();
      await aircraft.disconnect();
      wss.clients.forEach((client) => client.terminate());
      await new Promise<void>((resolve) => wss.close(() => resolve()));
      await new Promise<void>((resolve, reject) => {
        server.close((err) => err ? reject(err) : resolve());
      });
    },
  };
}
