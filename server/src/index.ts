import { devLog } from '@shared';
import { createBridgeServer } from './bridge-server';
import { logger, LogEvent } from './logging';

console.log('Starting VirtualCDU Server...');
const PORT = parseInt(process.env.PORT || '8080', 10);

const bridge = createBridgeServer({
  port: PORT,
  serveStatic: process.env.NODE_ENV === 'production',
});

async function shutdown(): Promise<void> {
  logger.info(LogEvent.SERVER_STOP, { message: 'Shutting down...' });
  await bridge.stop();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());

bridge.start().then((port) => {
  logger.info(LogEvent.SERVER_START, { 
    port,
    adapter: bridge.aircraft.name,
    status: bridge.aircraft.connectionStatus
  });
}).catch(err => {
  logger.error(LogEvent.SIM_ERROR, { error: String(err), message: 'Failed to start server' });
  process.exit(1);
});
