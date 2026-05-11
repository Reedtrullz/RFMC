import { devLog } from '@shared';
import { createBridgeServer } from './bridge-server';

const PORT = parseInt(process.env.PORT || '8080', 10);

const bridge = createBridgeServer({
  port: PORT,
  serveStatic: process.env.NODE_ENV === 'production',
});

async function shutdown(): Promise<void> {
  devLog('\n[Server] Shutting down...');
  await bridge.stop();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());

bridge.start().then((port) => {
  devLog(`[Server] VirtualCDU bridge running on http://localhost:${port}`);
  devLog(`[Server] WebSocket: ws://localhost:${port}`);
  devLog(`[Server] Aircraft adapter: ${bridge.aircraft.name} (${bridge.aircraft.connectionStatus})`);
});
