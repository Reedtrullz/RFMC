import type { IncomingMessage } from 'http';
import { describe, expect, it } from 'vitest';
import { getClientIp } from '../client-ip';

function request(remoteAddress: string, forwardedFor?: string): IncomingMessage {
  return {
    headers: forwardedFor ? { 'x-forwarded-for': forwardedFor } : {},
    socket: { remoteAddress },
  } as unknown as IncomingMessage;
}

describe('reverse-proxy client address', () => {
  it('uses the socket address without a forwarded header', () => {
    expect(getClientIp(request('172.17.0.1'))).toBe('172.17.0.1');
  });

  it('uses the address supplied by the single trusted proxy', () => {
    expect(getClientIp(request('172.17.0.1', '203.0.113.8'))).toBe('203.0.113.8');
  });

  it('does not trust a spoofed left-most forwarded address', () => {
    expect(getClientIp(request('172.17.0.1', '198.51.100.99, 203.0.113.8'))).toBe('203.0.113.8');
  });
});
