// ============================================================
// Scratchpad Engine — Type Definitions & Function Signatures
// ============================================================
//
// Priority: lower number = higher priority
//   SAFETY=1 (highest) through USER_INPUT=8 (lowest)
// ============================================================

export enum MessagePriority {
  SAFETY = 1,
  NAV_IMPOSSIBLE = 2,
  PERF_UNAVAIL = 3,
  DB_ERROR = 4,
  INVALID_ENTRY = 5,
  ADVISORY = 6,
  INFO = 7,
  USER_INPUT = 8,
}

export interface ScratchpadMessage {
  id: string;
  text: string;
  priority: MessagePriority;
  source: string;
  clearsOnInput: boolean;
  clearsOnExec: boolean;
  clearsOnPageChange: boolean;
  createdAt: number;
}

export interface ScratchpadState {
  buffer: string;
  message: ScratchpadMessage | null;
  messageQueue: ScratchpadMessage[];
  history: ScratchpadMessage[];
}

// ============================================================
// State Machine Function Signatures
// ============================================================

export function pushMessage(state: ScratchpadState, message: ScratchpadMessage): ScratchpadState {
  throw new Error('Not implemented');
}

export function clearMessage(state: ScratchpadState, messageId: string): ScratchpadState {
  throw new Error('Not implemented');
}

export function typeChar(state: ScratchpadState, char: string): ScratchpadState {
  throw new Error('Not implemented');
}

export function deleteChar(state: ScratchpadState): ScratchpadState {
  throw new Error('Not implemented');
}

export function clearBuffer(state: ScratchpadState): ScratchpadState {
  throw new Error('Not implemented');
}

export function getActiveDisplay(state: ScratchpadState): string {
  throw new Error('Not implemented');
}

// ============================================================
// Message Factory Functions
// ============================================================

let _nextId = 0;

function nextId(): string {
  _nextId += 1;
  return `msg_${Date.now()}_${_nextId}`;
}

function createMessage(
  text: string,
  priority: MessagePriority,
  source: string,
  clearsOnInput: boolean = false,
  clearsOnExec: boolean = true,
  clearsOnPageChange: boolean = true,
): ScratchpadMessage {
  return {
    id: nextId(),
    text,
    priority,
    source,
    clearsOnInput,
    clearsOnExec,
    clearsOnPageChange,
    createdAt: Date.now(),
  };
}

export function invalidEntryMessage(): ScratchpadMessage {
  return createMessage('INVALID ENTRY', MessagePriority.INVALID_ENTRY, 'validation');
}

export function notInDatabaseMessage(): ScratchpadMessage {
  return createMessage('NOT IN DATABASE', MessagePriority.DB_ERROR, 'validation');
}

export function routeDiscontinuityMessage(): ScratchpadMessage {
  return createMessage('ROUTE DISCONTINUITY', MessagePriority.NAV_IMPOSSIBLE, 'route', false);
}

export function verifyPositionMessage(): ScratchpadMessage {
  return createMessage('VERIFY POSITION', MessagePriority.NAV_IMPOSSIBLE, 'nav', false);
}

export function insufficientFuelMessage(): ScratchpadMessage {
  return createMessage('INSUFFICIENT FUEL', MessagePriority.PERF_UNAVAIL, 'performance', false);
}

export function perfVnavUnavailableMessage(): ScratchpadMessage {
  return createMessage('PERF VNAV UNAVAILABLE', MessagePriority.PERF_UNAVAIL, 'performance', false);
}

export function unableNextAltMessage(): ScratchpadMessage {
  return createMessage('UNABLE NEXT ALT', MessagePriority.SAFETY, 'nav', false);
}

export function dragRequiredMessage(): ScratchpadMessage {
  return createMessage('DRAG REQUIRED', MessagePriority.SAFETY, 'nav', false);
}
