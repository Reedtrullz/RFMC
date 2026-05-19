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

process.on('SIGINT', () => {
  shutdown().catch((err) => {
    logger.error(LogEvent.SIM_ERROR, { error: String(err), message: 'Error during shutdown' });
    process.exit(1);
  });
});
process.on('SIGTERM', () => {
  shutdown().catch((err) => {
    logger.error(LogEvent.SIM_ERROR, { error: String(err), message: 'Error during shutdown' });
    process.exit(1);
  });
});
process.on('SIGHUP', () => {
  shutdown().catch((err) => {
    logger.error(LogEvent.SIM_ERROR, { error: String(err), message: 'Error during shutdown' });
    process.exit(1);
  });
});

process.on('unhandledRejection', (reason) => {
  logger.error(LogEvent.SIM_ERROR, {
    error: String(reason),
    message: 'Unhandled promise rejection',
  });
});

process.on('uncaughtException', (err) => {
  logger.error(LogEvent.SIM_ERROR, {
    error: String(err),
    message: 'Uncaught exception',
  });
  process.exit(1);
});

bridge
  .start()
  .then((port) => {
    logger.info(LogEvent.SERVER_START, {
      port,
      adapter: bridge.aircraft.name,
      status: bridge.aircraft.connectionStatus,
    });
  })
  .catch((err) => {
    logger.error(LogEvent.SIM_ERROR, { error: String(err), message: 'Failed to start server' });
    process.exit(1);
  });
