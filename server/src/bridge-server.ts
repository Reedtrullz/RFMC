import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import type { ClientMessage, DisplayData, ServerMessage } from '@shared';
import { devError, devLog } from '@shared';
import { createAircraftAdapter } from './aircraft-adapters';
import { getAdapterHealth, toAdapterCapabilities } from './aircraft-adapters/adapter-health';
import type { IAircraftAdapter } from './aircraft-adapters/IAircraftAdapter';
import { FMCEngine } from './fmc-engine';

function parseAllowedOrigins(value: string | undefined): string[] {
  if (!value) return [];
  return value.split(',').map(origin => origin.trim()).filter(Boolean);
}

function isOriginAllowed(origin: string | undefined, allowedOrigins: string[]): boolean {
  if (!origin) return true;
  if (allowedOrigins.length === 0) return true;
  return allowedOrigins.includes(origin);
}

function isClientMessage(value: unknown): value is ClientMessage {
  if (!value || typeof value !== 'object') return false;
  const message = value as { type?: unknown; key?: unknown; mode?: unknown };
  switch (message.type) {
    case 'fmc.input':
      return typeof message.key === 'string';
    case 'sim.connect':
    case 'sim.disconnect':
      return true;
    case 'mode':
      return message.mode === 'STANDALONE' || message.mode === 'SYNC' || message.mode === 'CONTROL';
    default:
      return false;
  }
}

export interface BridgeServerOptions {
  port?: number;
  aircraft?: IAircraftAdapter;
  fmc?: FMCEngine;
  serveStatic?: boolean;
  watchdogInterval?: number;
  allowedOrigins?: string[];
  maxMessageBytes?: number;
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
  const allowedOrigins = options.allowedOrigins ?? parseAllowedOrigins(process.env.WS_ALLOWED_ORIGINS);
  const maxMessageBytes = options.maxMessageBytes ?? parseInt(process.env.WS_MAX_MESSAGE_BYTES || '65536', 10);
  const wss = new WebSocketServer({
    server,
    maxPayload: maxMessageBytes,
    verifyClient: ({ origin }, done) => {
      if (isOriginAllowed(origin, allowedOrigins)) {
        done(true);
        return;
      }
      done(false, 403, 'Forbidden origin');
    },
  });
  const fmc = options.fmc ?? new FMCEngine();
  const aircraft = options.aircraft ?? createAircraftAdapter();
  let pollInterval: ReturnType<typeof setInterval> | null = null;
  let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; connect-src 'self' ws: wss: https://www.simbrief.com; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
    );
    next();
  });

  function startHeartbeat(): void {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    heartbeatInterval = setInterval(() => {
      if (wss.clients.size > 0) {
        broadcast({ type: 'sim.heartbeat', serverTime: Date.now() });
      }
    }, 5000);
  }

  function stopHeartbeat(): void {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  if (options.serveStatic) {
    app.use(express.static('../dist'));
  }

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      aircraft: aircraft.isConnected ? aircraft.name : 'none',
      aircraftType: aircraft.aircraftType,
      capabilities: aircraft.capabilities,
      structuredCapabilities: toAdapterCapabilities(aircraft),
      adapterHealth: getAdapterHealth(aircraft),
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

  let lastDisplayJSON: string | null = null;
  let lastStateJSON: string | null = null;

  function startPolling(): void {
    if (pollInterval) clearInterval(pollInterval);
    pollInterval = setInterval(async () => {
      if (!aircraft.isConnected) {
        if (shouldBeConnected && !retryTimeout) {
          retryTimeout = setTimeout(attemptReconnect, options.watchdogInterval || 10000);
        }
        return;
      }
      try {
        const simDisplay = await aircraft.readDisplay();
        const aircraftState = await aircraft.readAircraftState();
        
        const displayData: DisplayData = {
          title: simDisplay.title,
          pageIndicator: '',
          lines: simDisplay.lines.map(text => ({ text, leftLabel: '', rightLabel: '', inverse: false })),
          lskActions: {},
        };

        const currentDisplayJSON = JSON.stringify(displayData);
        if (currentDisplayJSON !== lastDisplayJSON) {
          broadcast({ type: 'fmc.display', data: displayData } as ServerMessage);
          lastDisplayJSON = currentDisplayJSON;
        }

        const statePayload = {
          variables: { brightness: simDisplay.brightness },
          aircraftState: {
            position: aircraftState.position,
            heading: aircraftState.heading,
            altitude: aircraftState.altitude,
            speed: aircraftState.speed,
            verticalSpeed: aircraftState.verticalSpeed,
            radios: aircraftState.radios,
          },
        };

        const currentStateJSON = JSON.stringify(statePayload);
        if (currentStateJSON !== lastStateJSON) {
          broadcast({ type: 'sim.data', ...statePayload } as ServerMessage);
          lastStateJSON = currentStateJSON;
        }
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

  let shouldBeConnected = false;
  let retryTimeout: ReturnType<typeof setTimeout> | null = null;

  async function attemptReconnect(): Promise<void> {
    if (retryTimeout) {
      clearTimeout(retryTimeout);
      retryTimeout = null;
    }
    if (!shouldBeConnected || aircraft.isConnected) return;
    
    devLog('[Watchdog] Attempting auto-reconnect...');
    const connected = await aircraft.connect();
    if (connected) {
      startPolling();
      broadcast({
        type: 'sim.connected',
        aircraft: aircraft.name,
        aircraftType: aircraft.aircraftType,
        capabilities: aircraft.capabilities,
        structuredCapabilities: toAdapterCapabilities(aircraft),
        adapterHealth: getAdapterHealth(aircraft),
        connectionStatus: aircraft.connectionStatus,
        lastError: aircraft.lastError,
      } as ServerMessage);
    } else {
      retryTimeout = setTimeout(attemptReconnect, options.watchdogInterval || 10000);
    }
  }

  wss.on('connection', (ws: WebSocket) => {
    devLog(`[WS] Client connected (total: ${wss.clients.size})`);
    
    if (wss.clients.size === 1) {
      startHeartbeat();
    }

    ws.send(JSON.stringify({
      type: 'fmc.display',
      data: fmc.getDisplayData(),
    } as ServerMessage));

    ws.send(JSON.stringify({
      type: aircraft.isConnected ? 'sim.connected' : 'sim.disconnected',
      aircraft: aircraft.name,
      aircraftType: aircraft.aircraftType,
      capabilities: aircraft.capabilities,
      structuredCapabilities: toAdapterCapabilities(aircraft),
      adapterHealth: getAdapterHealth(aircraft),
      connectionStatus: aircraft.connectionStatus,
      lastError: aircraft.lastError,
    } as ServerMessage));

    ws.on('message', (raw) => {
      try {
        const rawText = raw.toString();
        if (Buffer.byteLength(rawText, 'utf8') > maxMessageBytes) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Message too large',
          } as ServerMessage));
          return;
        }

        const parsed = JSON.parse(rawText) as unknown;
        if (!isClientMessage(parsed)) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Unknown or invalid message type',
          } as ServerMessage));
          return;
        }

        const msg = parsed;

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
            shouldBeConnected = true;
            aircraft.connect().then(connected => {
              if (connected) {
                startPolling();
                broadcast({
                  type: 'sim.connected',
                  aircraft: aircraft.name,
                  aircraftType: aircraft.aircraftType,
                  capabilities: aircraft.capabilities,
                  structuredCapabilities: toAdapterCapabilities(aircraft),
                  adapterHealth: getAdapterHealth(aircraft),
                  connectionStatus: aircraft.connectionStatus,
                  lastError: aircraft.lastError,
                } as ServerMessage);
              } else {
                ws.send(JSON.stringify({
                  type: 'error',
                  message: aircraft.lastError ?? 'Failed to connect to MSFS',
                } as ServerMessage));
                // Start watchdog even if first attempt fails
                if (!retryTimeout) retryTimeout = setTimeout(attemptReconnect, options.watchdogInterval || 10000);
              }
            }).catch(err => {
              devError('[SimConnect] Error:', err);
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Failed to connect to MSFS',
              } as ServerMessage));
              if (!retryTimeout) retryTimeout = setTimeout(attemptReconnect, options.watchdogInterval || 10000);
            });
            break;
          }

          case 'sim.disconnect': {
            devLog('[WS] Client requested disconnect');
            shouldBeConnected = false;
            if (retryTimeout) {
              clearTimeout(retryTimeout);
              retryTimeout = null;
            }
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
      stopHeartbeat();
      await aircraft.disconnect();
      wss.clients.forEach((client) => client.terminate());
      await new Promise<void>((resolve) => wss.close(() => resolve()));
      await new Promise<void>((resolve, reject) => {
        server.close((err) => err ? reject(err) : resolve());
      });
    },
  };
}
