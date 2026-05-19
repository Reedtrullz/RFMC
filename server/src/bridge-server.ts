import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import type { ClientMessage, DisplayData, ServerMessage } from '@virtual-cdu/shared';
import { devError, devLog } from '@virtual-cdu/shared';
import { createAircraftAdapter } from './aircraft-adapters';
import { getAdapterHealth, toAdapterCapabilities } from './aircraft-adapters/adapter-health';
import type { IAircraftAdapter } from './aircraft-adapters/IAircraftAdapter';
import { FMCEngine } from './fmc-engine';
import { configureSecurity } from './security';
import { logger, LogEvent } from './logging';
import { metrics } from './metrics';
import { validateClientMessage, WSRateLimiter, WSConnectionRateLimiter } from './websocketValidation';

function parseAllowedOrigins(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function isOriginAllowed(origin: string | undefined, allowedOrigins: string[]): boolean {
  // No origin restriction when no origins configured (dev mode)
  if (allowedOrigins.length === 0) return true;
  // If origins ARE configured, missing Origin header = reject
  if (!origin) return false;
  return allowedOrigins.includes(origin);
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

  // Apply production security hardening
  configureSecurity(app);

  const allowedOrigins = options.allowedOrigins ?? parseAllowedOrigins(process.env.WS_ALLOWED_ORIGINS);
  const maxMessageBytes = options.maxMessageBytes ?? parseInt(process.env.WS_MAX_MESSAGE_BYTES || '65536', 10);
  const connectionRateLimiter = new WSConnectionRateLimiter();

  function getClientIp(req: http.IncomingMessage): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      return (Array.isArray(forwarded) ? forwarded[0] : forwarded).split(',')[0].trim();
    }
    return req.socket.remoteAddress || 'unknown';
  }

  const wss = new WebSocketServer({
    server,
    maxPayload: maxMessageBytes,
    verifyClient: ({ origin, req }, done) => {
      if (!isOriginAllowed(origin, allowedOrigins)) {
        done(false, 403, 'Forbidden origin');
        return;
      }

      const authToken = process.env.AUTH_TOKEN;
      if (authToken) {
        const queryStart = (req.url || '').indexOf('?');
        const query = queryStart >= 0 ? (req.url || '').slice(queryStart + 1) : '';
        const token = new URLSearchParams(query).get('token');
        if (token !== authToken) {
          metrics.authRejected();
          logger.warn(LogEvent.WS_AUTH_REJECTED, { ip: getClientIp(req) });
          done(false, 4001, 'Authentication failed');
          return;
        }
      }

      const ip = getClientIp(req);
      if (!connectionRateLimiter.isAllowed(ip)) {
        metrics.rateLimited();
        logger.warn(LogEvent.WS_RATE_LIMITED, { ip });
        done(false, 429, 'Too many connections');
        return;
      }

      done(true);
    },
  });

  const fmc =
    options.fmc ??
    new FMCEngine({
      onError: (err) => {
        broadcast({ type: 'error', message: 'Engine sync error' });
      },
    });
  const aircraft = options.aircraft ?? createAircraftAdapter();
  let pollTimeout: ReturnType<typeof setTimeout> | null = null;
  let isPollingActive = false;
  let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  function startHeartbeat(): void {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    heartbeatInterval = setInterval(() => {
      if (wss.clients.size > 0) {
        broadcast({ type: 'sim.heartbeat', serverTime: Date.now() });
      }

      wss.clients.forEach((client) => {
        const c = client as WebSocket & { isAlive?: boolean };
        if (c.isAlive === false) {
          metrics.pingTimeout();
          logger.warn(LogEvent.WS_PING_TIMEOUT, {});
          c.terminate();
          return;
        }
        c.isAlive = false;
        c.ping();
      });

      connectionRateLimiter.cleanup();
    }, 5000);
  }

  function stopHeartbeat(): void {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      ...metrics.getMetrics(),
      aircraft: aircraft.isConnected ? aircraft.name : 'none',
      aircraftType: aircraft.aircraftType,
      connectionStatus: aircraft.connectionStatus,
      adapterHealth: getAdapterHealth(aircraft),
    });
  });

  if (options.serveStatic) {
    app.use(express.static('../dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('../dist/index.html'));
    });
  }

  function broadcast(msg: ServerMessage): void {
    const data = JSON.stringify(msg);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(data);
        } catch (err) {
          devError('[WS] Broadcast send error:', err);
        }
      }
    });
  }

  let lastDisplayJSON: string | null = null;
  let lastStateJSON: string | null = null;

  function startPolling(): void {
    isPollingActive = true;
    if (pollTimeout) clearTimeout(pollTimeout);

    async function tick() {
      if (!isPollingActive) return;

      if (!aircraft.isConnected) {
        if (shouldBeConnected && !retryTimeout) {
          retryTimeout = setTimeout(attemptReconnect, options.watchdogInterval || 10000);
        }
        if (isPollingActive) {
          pollTimeout = setTimeout(tick, 100);
        }
        return;
      }
      try {
        const simDisplay = await aircraft.readDisplay();
        const aircraftState = await aircraft.readAircraftState();

        const displayData: DisplayData = {
          title: simDisplay.title,
          pageIndicator: '',
          lines: simDisplay.lines.map((text) => ({ text, leftLabel: '', rightLabel: '', inverse: false })),
          lskActions: {},
        };

        const currentDisplayJSON = JSON.stringify(displayData);
        if (currentDisplayJSON !== lastDisplayJSON) {
          broadcast({ type: 'fmc.display', data: displayData } as ServerMessage);
          lastDisplayJSON = currentDisplayJSON;
        }

        const statePayload = {
          variables: { brightness: simDisplay.brightness },
          aircraftState: aircraftState,
          radios: aircraftState.radios,
        };

        const currentStateJSON = JSON.stringify(statePayload);
        if (currentStateJSON !== lastStateJSON) {
          broadcast({ type: 'sim.data', ...statePayload } as ServerMessage);
          lastStateJSON = currentStateJSON;
        }
      } catch (err) {
        devError('[Poll] Error:', err);
        metrics.simError();
      } finally {
        if (isPollingActive) {
          pollTimeout = setTimeout(tick, 100);
        }
      }
    }

    pollTimeout = setTimeout(tick, 100);
  }

  function stopPolling(): void {
    isPollingActive = false;
    if (pollTimeout) {
      clearTimeout(pollTimeout);
      pollTimeout = null;
    }
  }

  let shouldBeConnected = false;
  let isConnecting = false;
  let retryTimeout: ReturnType<typeof setTimeout> | null = null;

  async function attemptReconnect(): Promise<void> {
    if (retryTimeout) {
      clearTimeout(retryTimeout);
      retryTimeout = null;
    }
    if (!shouldBeConnected || aircraft.isConnected || isConnecting) return;

    isConnecting = true;
    logger.info(LogEvent.SIM_CONNECTED, { message: 'Attempting auto-reconnect' });
    try {
      const connectPromise = aircraft.connect().catch((err) => {
        devError('[SimConnect] Auto-reconnect background error:', err);
        return false;
      });
      const timeoutPromise = new Promise<boolean>((_, reject) =>
        setTimeout(() => reject(new Error('SimConnect connection timed out')), 8000),
      );
      const connected = await Promise.race([connectPromise, timeoutPromise]);
      if (!shouldBeConnected) return;

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
    } catch (err) {
      devError('[SimConnect] Reconnect Error:', err);
      retryTimeout = setTimeout(attemptReconnect, options.watchdogInterval || 10000);
    } finally {
      isConnecting = false;
    }
  }

  wss.on('connection', (ws: WebSocket) => {
    metrics.clientConnected();
    const rateLimiter = new WSRateLimiter();
    const wsClient = ws as WebSocket & { isAlive?: boolean };
    wsClient.isAlive = true;

    wsClient.on('pong', () => {
      wsClient.isAlive = true;
    });

    logger.info(LogEvent.WS_CLIENT_CONNECTED, {
      clients: wss.clients.size,
      adapter: aircraft.name,
    });

    if (wss.clients.size === 1) {
      startHeartbeat();
    }

    ws.send(
      JSON.stringify({
        type: 'fmc.display',
        data: fmc.getDisplayData(),
      } as ServerMessage),
    );

    ws.send(
      JSON.stringify({
        type: aircraft.isConnected ? 'sim.connected' : 'sim.disconnected',
        aircraft: aircraft.name,
        aircraftType: aircraft.aircraftType,
        capabilities: aircraft.capabilities,
        structuredCapabilities: toAdapterCapabilities(aircraft),
        adapterHealth: getAdapterHealth(aircraft),
        connectionStatus: aircraft.connectionStatus,
        lastError: aircraft.lastError,
      } as ServerMessage),
    );

    ws.on('message', (raw) => {
      try {
        if (!rateLimiter.isAllowed()) {
          if (rateLimiter.isAbused()) {
            ws.terminate();
            return;
          }
          ws.send(JSON.stringify({ type: 'error', message: 'Too many messages' } as ServerMessage));
          return;
        }

        const rawText = raw.toString();
        if (Buffer.byteLength(rawText, 'utf8') > maxMessageBytes) {
          ws.send(JSON.stringify({ type: 'error', message: 'Message too large' } as ServerMessage));
          metrics.validationError();
          return;
        }

        const parsed = JSON.parse(rawText);
        const msg = validateClientMessage(parsed);

        if (!msg) {
          ws.send(JSON.stringify({ type: 'error', message: 'Unknown or invalid message type' } as ServerMessage));
          metrics.validationError();
          logger.warn(LogEvent.WS_VALIDATION_ERROR, { payload: rawText.substring(0, 100) });
          return;
        }

        switch (msg.type) {
          case 'fmc.input': {
            const displayData = fmc.processInput(msg.key);
            broadcast({ type: 'fmc.display', data: displayData });
            if (aircraft.isConnected) {
              aircraft.sendKeypress(msg.key).catch((err) => {
                devError('[Aircraft] sendKeypress error:', err);
                metrics.simError();
              });
            }
            break;
          }

          case 'sim.connect': {
            shouldBeConnected = true;
            if (aircraft.isConnected || isConnecting) {
              break;
            }
            isConnecting = true;

            const connectPromise = aircraft.connect().catch((err) => {
              devError('[SimConnect] Connection background error:', err);
              return false;
            });
            const timeoutPromise = new Promise<boolean>((_, reject) =>
              setTimeout(() => reject(new Error('SimConnect connection timed out')), 8000),
            );

            Promise.race([connectPromise, timeoutPromise])
              .then((connected) => {
                isConnecting = false;
                if (!shouldBeConnected) return;
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
                  ws.send(
                    JSON.stringify({
                      type: 'error',
                      message: aircraft.lastError ?? 'Failed to connect to MSFS',
                    } as ServerMessage),
                  );
                  if (!retryTimeout) retryTimeout = setTimeout(attemptReconnect, options.watchdogInterval || 10000);
                }
              })
              .catch((err) => {
                isConnecting = false;
                if (!shouldBeConnected) return;
                devError('[SimConnect] Error:', err);
                metrics.simError();
                ws.send(
                  JSON.stringify({
                    type: 'error',
                    message: 'Failed to connect to MSFS',
                  } as ServerMessage),
                );
                if (!retryTimeout) retryTimeout = setTimeout(attemptReconnect, options.watchdogInterval || 10000);
              });
            break;
          }

          case 'sim.disconnect': {
            shouldBeConnected = false;
            if (retryTimeout) {
              clearTimeout(retryTimeout);
              retryTimeout = null;
            }
            stopPolling();
            aircraft
              .disconnect()
              .then(() => {
                broadcast({ type: 'sim.disconnected', lastError: aircraft.lastError } as ServerMessage);
              })
              .catch((err) => devError('Aircraft disconnect failed', err));
            break;
          }

          case 'mode':
            devLog(`[Bridge] Mode change: ${msg.mode}`);
            broadcast({ type: 'sim.heartbeat', serverTime: Date.now() } as ServerMessage);
            break;
        }
      } catch (err) {
        metrics.validationError();
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' } as ServerMessage));
      }
    });

    ws.on('close', () => {
      metrics.clientDisconnected();
      logger.info(LogEvent.WS_CLIENT_DISCONNECTED, { remaining: wss.clients.size });
      if (wss.clients.size === 0) {
        stopHeartbeat();
      }
    });

    ws.on('error', (err) => {
      logger.error(LogEvent.SIM_ERROR, { error: String(err) });
    });
  });

  return {
    app,
    server,
    wss,
    aircraft,
    fmc,
    broadcast,
    start: () =>
      new Promise((resolve) => {
        server.listen(options.port ?? 0, () => {
          const address = server.address();
          const port = typeof address === 'object' && address ? address.port : (options.port ?? 0);
          logger.info(LogEvent.SERVER_START, { port });
          resolve(port);
        });
      }),
    stop: async () => {
      logger.info(LogEvent.SERVER_STOP, {});
      stopPolling();
      stopHeartbeat();
      fmc.destroy();
      await aircraft.disconnect();
      wss.clients.forEach((client) => client.terminate());
      await new Promise<void>((resolve) => wss.close(() => resolve()));
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    },
  };
}
