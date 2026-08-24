import type { IncomingMessage } from 'http';
import proxyaddr from 'proxy-addr';

/**
 * Production traffic reaches the server through exactly one trusted hop:
 * Caddy on the VPS host forwards to the loopback-published Docker port.
 */
export const trustImmediateProxy = (_address: string, index: number): boolean => index < 1;

export function getClientIp(req: IncomingMessage): string {
  return proxyaddr(req, trustImmediateProxy);
}
