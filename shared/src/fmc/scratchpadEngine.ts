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

const MAX_QUEUE_SIZE = 50;
const MAX_HISTORY_SIZE = 200;

export function pushMessage(state: ScratchpadState, message: ScratchpadMessage): ScratchpadState {
  const history = [...state.history, message].slice(-MAX_HISTORY_SIZE);
  const messageQueue = [...state.messageQueue, message]
    .sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.createdAt - b.createdAt;
    })
    .slice(0, MAX_QUEUE_SIZE);
  const currentMessage = messageQueue[0];
  return { ...state, message: currentMessage, messageQueue, history };
}

export function clearMessage(state: ScratchpadState, messageId: string): ScratchpadState {
  const target = state.messageQueue.find((m) => m.id === messageId);
  if (!target) return state;

  const messageQueue = state.messageQueue.filter((m) => m.id !== messageId);
  const history = [...state.history, target];

  const currentMessage =
    state.message?.id === messageId ? (messageQueue.length > 0 ? messageQueue[0] : null) : state.message;

  return { ...state, message: currentMessage, messageQueue, history };
}

export function typeChar(state: ScratchpadState, char: string): ScratchpadState {
  const buffer = state.buffer + char;

  const cleared = state.messageQueue.filter((m) => m.priority > MessagePriority.PERF_UNAVAIL);
  const messageQueue = state.messageQueue.filter((m) => m.priority <= MessagePriority.PERF_UNAVAIL);
  const history = [...state.history, ...cleared];

  const currentMessage =
    state.message && state.message.priority > MessagePriority.PERF_UNAVAIL
      ? messageQueue.length > 0
        ? messageQueue[0]
        : null
      : state.message;

  return { ...state, buffer, message: currentMessage, messageQueue, history };
}

export function deleteChar(state: ScratchpadState): ScratchpadState {
  if (state.buffer.length === 0) return state;
  return { ...state, buffer: state.buffer.slice(0, -1) };
}

export function clearBuffer(state: ScratchpadState): ScratchpadState {
  return { ...state, buffer: '' };
}

export function getActiveDisplay(state: ScratchpadState): string {
  if (state.message) return state.message.text;
  if (state.buffer.length > 0) return state.buffer;
  return '';
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
  return createMessage('PERF/VNAV UNAVAILABLE', MessagePriority.PERF_UNAVAIL, 'performance', false);
}

export function unableNextAltMessage(): ScratchpadMessage {
  return createMessage('UNABLE NEXT ALT', MessagePriority.SAFETY, 'nav', false);
}

export function dragRequiredMessage(): ScratchpadMessage {
  return createMessage('DRAG REQUIRED', MessagePriority.SAFETY, 'nav', false);
}

// -- Additional message factories ------------------------------------

export function vSpeedsDeletedMessage(): ScratchpadMessage {
  return createMessage('V SPEEDS DELETED', MessagePriority.ADVISORY, 'validation', false, true, true);
}

export function invalidFormatMessage(): ScratchpadMessage {
  return createMessage('INVALID FORMAT', MessagePriority.INVALID_ENTRY, 'validation', false, true, true);
}

export function outOfRangeMessage(): ScratchpadMessage {
  return createMessage('OUT OF RANGE', MessagePriority.INVALID_ENTRY, 'validation', false, true, true);
}

export function notInRouteMessage(): ScratchpadMessage {
  return createMessage('NOT IN ROUTE', MessagePriority.DB_ERROR, 'nav', false, true, true);
}

export function notInAlignModeMessage(): ScratchpadMessage {
  return createMessage('NOT IN ALIGN MODE', MessagePriority.DB_ERROR, 'nav', false, true, true);
}

/** Generic factory for ad-hoc scratchpad messages. */
export function scratchpadMessage(
  text: string,
  priority: MessagePriority,
  source: string,
  options: Partial<Omit<ScratchpadMessage, 'id' | 'text' | 'priority' | 'source'>> = {},
): ScratchpadMessage {
  return createMessage(
    text,
    priority,
    source,
    options.clearsOnInput ?? false,
    options.clearsOnExec ?? true,
    options.clearsOnPageChange ?? true,
  );
}

// -- Initial state + adapters ----------------------------------------

export function createInitialScratchpadState(): ScratchpadState {
  return {
    buffer: '',
    message: null,
    messageQueue: [],
    history: [],
  };
}

export function getScratchpadBuffer(state: ScratchpadState): string {
  return state.buffer;
}

export function getScratchpadDisplayText(state: ScratchpadState): string {
  return getActiveDisplay(state);
}

export function clearScratchpadForPageChange(state: ScratchpadState): ScratchpadState {
  const cleared = state.messageQueue.filter((m) => m.clearsOnPageChange);
  const messageQueue = state.messageQueue.filter((m) => !m.clearsOnPageChange);
  const currentMessage =
    state.message && state.message.clearsOnPageChange
      ? messageQueue.length > 0
        ? messageQueue[0]
        : null
      : state.message;
  return { ...state, message: currentMessage, messageQueue, history: [...state.history, ...cleared] };
}

export function clearScratchpadForExec(state: ScratchpadState): ScratchpadState {
  const cleared = state.messageQueue.filter((m) => m.clearsOnExec);
  const messageQueue = state.messageQueue.filter((m) => !m.clearsOnExec);
  const currentMessage =
    state.message && state.message.clearsOnExec ? (messageQueue.length > 0 ? messageQueue[0] : null) : state.message;
  return { ...state, message: currentMessage, messageQueue, history: [...state.history, ...cleared] };
}
