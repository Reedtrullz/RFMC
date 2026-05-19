import { ClientMessage, CDUKey } from '@virtual-cdu/shared';

/**
 * Strict validation for WebSocket messages
 */
export function validateClientMessage(data: unknown): ClientMessage | null {
  if (!data || typeof data !== 'object') return null;

  const msg = data as Record<string, unknown>;
  if (typeof msg.type !== 'string') return null;

  switch (msg.type) {
    case 'fmc.input':
      if (typeof msg.key !== 'string') return null;
      if (!isValidCDUKey(msg.key)) return null;
      return { type: 'fmc.input', key: msg.key as CDUKey };

    case 'sim.connect':
      return { type: 'sim.connect' };

    case 'sim.disconnect':
      return { type: 'sim.disconnect' };

    case 'mode':
      if (msg.mode !== 'STANDALONE' && msg.mode !== 'SYNC' && msg.mode !== 'CONTROL') return null;
      return { type: 'mode', mode: msg.mode };

    default:
      return null;
  }
}

/**
 * Validates that a string is a valid CDUKey
 */
function isValidCDUKey(key: string): boolean {
  // Simple check against a known set or pattern
  // This can be expanded as needed
  const validKeys =
    /^[A-Z0-9]$|^L[1-6]$|^R[1-6]$|^DOT$|^PLUS_MINUS$|^SLASH$|^SPACE$|^CLR$|^DEL$|^EXEC$|^NEXT_PAGE$|^PREV_PAGE$|^INIT_REF$|^RTE$|^CLB$|^CRZ$|^DES$|^DIR_INTC$|^LEGS$|^DEP_ARR$|^HOLD$|^PERF$|^PROG$|^N1_LIMIT$|^FIX$|^MENU$/;
  return validKeys.test(key);
}

/**
 * Basic rate limiting for WebSocket clients
 */
export class WSRateLimiter {
  private messages: number[] = [];
  private totalMessagesInWindow: number[] = [];
  private readonly windowMs = 1000;
  private readonly maxMessages = 10;
  private readonly abuseThreshold = 30;

  isAllowed(): boolean {
    const now = Date.now();
    this.messages = this.messages.filter((t) => now - t < this.windowMs);
    this.totalMessagesInWindow = this.totalMessagesInWindow.filter((t) => now - t < this.windowMs);
    this.totalMessagesInWindow.push(now);
    if (this.messages.length >= this.maxMessages) return false;
    this.messages.push(now);
    return true;
  }

  isAbused(): boolean {
    const now = Date.now();
    this.totalMessagesInWindow = this.totalMessagesInWindow.filter((t) => now - t < this.windowMs);
    return this.totalMessagesInWindow.length > this.abuseThreshold;
  }
}

/**
 * Server-wide IP-based connection rate limiter
 */
export class WSConnectionRateLimiter {
  private connections = new Map<string, { count: number; windowStart: number }>();
  private readonly windowMs: number;
  private readonly maxConnectionsPerWindow: number;

  constructor(windowMs = 60000, maxConnectionsPerWindow = 20) {
    this.windowMs = windowMs;
    this.maxConnectionsPerWindow = maxConnectionsPerWindow;
  }

  isAllowed(ip: string): boolean {
    const now = Date.now();
    const entry = this.connections.get(ip);

    if (!entry || now - entry.windowStart > this.windowMs) {
      this.connections.set(ip, { count: 1, windowStart: now });
      return true;
    }

    if (entry.count >= this.maxConnectionsPerWindow) {
      return false;
    }

    entry.count++;
    return true;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [ip, entry] of this.connections) {
      if (now - entry.windowStart > this.windowMs) {
        this.connections.delete(ip);
      }
    }
  }
}
