/**
 * Structured logging for production
 */
export enum LogEvent {
  WS_CLIENT_CONNECTED = 'ws_client_connected',
  WS_CLIENT_DISCONNECTED = 'ws_client_disconnected',
  WS_VALIDATION_ERROR = 'ws_validation_error',
  WS_AUTH_REJECTED = 'ws_auth_rejected',
  WS_RATE_LIMITED = 'ws_rate_limited',
  WS_PING_TIMEOUT = 'ws_ping_timeout',
  SIM_CONNECTED = 'sim_connected',
  SIM_DISCONNECTED = 'sim_disconnected',
  SIM_ERROR = 'sim_error',
  SERVER_START = 'server_start',
  SERVER_STOP = 'server_stop',
}

interface LogContext {
  level: 'info' | 'warn' | 'error';
  event: LogEvent;
  message?: string;
  [key: string]: unknown;
}

export function log(context: LogContext) {
  const output = {
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || 'unknown',
    commit: process.env.COMMIT_SHA || 'unknown',
    ...context,
  };

  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify(output));
  } else {
    // Human readable in dev
    const { level, event, message, timestamp, ...rest } = output;
    const color = level === 'error' ? '\x1b[31m' : level === 'warn' ? '\x1b[33m' : '\x1b[32m';
    console.log(
      `${timestamp} [${color}${level.toUpperCase()}\x1b[0m] ${event}: ${message || ''}`,
      Object.keys(rest).length ? rest : '',
    );
  }
}

export const logger = {
  info: (event: LogEvent, context: Omit<LogContext, 'level' | 'event'>) => log({ level: 'info', event, ...context }),
  warn: (event: LogEvent, context: Omit<LogContext, 'level' | 'event'>) => log({ level: 'warn', event, ...context }),
  error: (event: LogEvent, context: Omit<LogContext, 'level' | 'event'>) => log({ level: 'error', event, ...context }),
};
