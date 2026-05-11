import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import type { ClientMessage, ServerMessage, DisplayData } from '@shared';
import { devLog, devError } from '@shared';
import { FMCEngine } from './fmc-engine';
import { PMDG737Adapter } from './aircraft-adapters/pmdg-737';
import type { IAircraftAdapter } from './aircraft-adapters/IAircraftAdapter';

const PORT = parseInt(process.env.PORT || '8080', 10);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const fmc = new FMCEngine();
const aircraft: IAircraftAdapter = new PMDG737Adapter();

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../dist'));
}

// Health check
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

// Broadcast to all connected clients
function broadcast(msg: ServerMessage): void {
  const data = JSON.stringify(msg);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Poll aircraft display and broadcast
let pollInterval: ReturnType<typeof setInterval> | null = null;

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
      broadcast({
        type: 'fmc.display',
        data: displayData,
      } as ServerMessage);
      broadcast({
        type: 'sim.data',
        variables: {
          brightness: simDisplay.brightness,
        },
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
  }, 100); // 10Hz
}

function stopPolling(): void {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

wss.on('connection', (ws: WebSocket) => {
  devLog(`[WS] Client connected (total: ${wss.clients.size})`);

  // Send current display state immediately
  const displayData = fmc.getDisplayData();
  ws.send(JSON.stringify({
    type: 'fmc.display',
    data: displayData,
  } as ServerMessage));

  // Send connection status
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

          // Forward to aircraft if connected
          if (aircraft.isConnected) {
            // Map key to aircraft-specific command
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

        case 'mode': {
          devLog('[WS] Mode changed:', msg.mode);
          break;
        }
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

// Cleanup on shutdown
process.on('SIGINT', async () => {
  devLog('\n[Server] Shutting down...');
  stopPolling();
  await aircraft.disconnect();
  wss.close();
  server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  stopPolling();
  await aircraft.disconnect();
  wss.close();
  server.close();
  process.exit(0);
});

server.listen(PORT, () => {
  devLog(`[Server] VirtualCDU bridge running on http://localhost:${PORT}`);
  devLog(`[Server] WebSocket: ws://localhost:${PORT}`);
  devLog(`[Server] Aircraft adapter: ${aircraft.name} (${aircraft.connectionStatus})`);
});
