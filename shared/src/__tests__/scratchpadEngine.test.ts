import { describe, it, expect } from 'vitest';
import {
  MessagePriority,
  ScratchpadMessage,
  ScratchpadState,
  pushMessage,
  clearMessage,
  typeChar,
  deleteChar,
  clearBuffer,
  getActiveDisplay,
  invalidEntryMessage,
  notInDatabaseMessage,
  routeDiscontinuityMessage,
  verifyPositionMessage,
  insufficientFuelMessage,
  perfVnavUnavailableMessage,
  unableNextAltMessage,
  dragRequiredMessage,
} from '../fmc/scratchpadEngine';

describe('MessagePriority', () => {
  it('has correct numeric values (lower = higher priority)', () => {
    expect(MessagePriority.SAFETY).toBe(1);
    expect(MessagePriority.NAV_IMPOSSIBLE).toBe(2);
    expect(MessagePriority.PERF_UNAVAIL).toBe(3);
    expect(MessagePriority.DB_ERROR).toBe(4);
    expect(MessagePriority.INVALID_ENTRY).toBe(5);
    expect(MessagePriority.ADVISORY).toBe(6);
    expect(MessagePriority.INFO).toBe(7);
    expect(MessagePriority.USER_INPUT).toBe(8);
  });

  it('establishes correct priority ordering', () => {
    const priorities = [
      MessagePriority.SAFETY,
      MessagePriority.NAV_IMPOSSIBLE,
      MessagePriority.PERF_UNAVAIL,
      MessagePriority.DB_ERROR,
      MessagePriority.INVALID_ENTRY,
      MessagePriority.ADVISORY,
      MessagePriority.INFO,
      MessagePriority.USER_INPUT,
    ];
    for (let i = 0; i < priorities.length - 1; i++) {
      expect(priorities[i]).toBeLessThan(priorities[i + 1]);
    }
  });

  it('safety band (1-3) is strictly higher priority than errors (4-5)', () => {
    expect(MessagePriority.SAFETY).toBeLessThan(MessagePriority.DB_ERROR);
    expect(MessagePriority.NAV_IMPOSSIBLE).toBeLessThan(MessagePriority.INVALID_ENTRY);
    expect(MessagePriority.PERF_UNAVAIL).toBeLessThan(MessagePriority.DB_ERROR);
  });
});

describe('Message factory functions', () => {
  describe('invalidEntryMessage', () => {
    const msg = invalidEntryMessage();

    it('returns correct text', () => {
      expect(msg.text).toBe('INVALID ENTRY');
    });

    it('has INVALID_ENTRY priority', () => {
      expect(msg.priority).toBe(MessagePriority.INVALID_ENTRY);
    });

    it('has validation source', () => {
      expect(msg.source).toBe('validation');
    });

    it('clears on exec and page change', () => {
      expect(msg.clearsOnExec).toBe(true);
      expect(msg.clearsOnPageChange).toBe(true);
    });
  });

  describe('notInDatabaseMessage', () => {
    const msg = notInDatabaseMessage();

    it('returns correct text', () => {
      expect(msg.text).toBe('NOT IN DATABASE');
    });

    it('has DB_ERROR priority', () => {
      expect(msg.priority).toBe(MessagePriority.DB_ERROR);
    });

    it('has validation source', () => {
      expect(msg.source).toBe('validation');
    });
  });

  describe('routeDiscontinuityMessage', () => {
    const msg = routeDiscontinuityMessage();

    it('returns correct text', () => {
      expect(msg.text).toBe('ROUTE DISCONTINUITY');
    });

    it('has NAV_IMPOSSIBLE priority', () => {
      expect(msg.priority).toBe(MessagePriority.NAV_IMPOSSIBLE);
    });

    it('has route source', () => {
      expect(msg.source).toBe('route');
    });

    it('does not clear on input (safety band)', () => {
      expect(msg.clearsOnInput).toBe(false);
    });
  });

  describe('verifyPositionMessage', () => {
    const msg = verifyPositionMessage();

    it('returns correct text', () => {
      expect(msg.text).toBe('VERIFY POSITION');
    });

    it('has NAV_IMPOSSIBLE priority', () => {
      expect(msg.priority).toBe(MessagePriority.NAV_IMPOSSIBLE);
    });

    it('has nav source', () => {
      expect(msg.source).toBe('nav');
    });

    it('does not clear on input (safety band)', () => {
      expect(msg.clearsOnInput).toBe(false);
    });
  });

  describe('insufficientFuelMessage', () => {
    const msg = insufficientFuelMessage();

    it('returns correct text', () => {
      expect(msg.text).toBe('INSUFFICIENT FUEL');
    });

    it('has PERF_UNAVAIL priority', () => {
      expect(msg.priority).toBe(MessagePriority.PERF_UNAVAIL);
    });

    it('has performance source', () => {
      expect(msg.source).toBe('performance');
    });

    it('does not clear on input (safety band)', () => {
      expect(msg.clearsOnInput).toBe(false);
    });
  });

  describe('perfVnavUnavailableMessage', () => {
    const msg = perfVnavUnavailableMessage();

    it('returns correct text', () => {
      expect(msg.text).toBe('PERF/VNAV UNAVAILABLE');
    });

    it('has PERF_UNAVAIL priority', () => {
      expect(msg.priority).toBe(MessagePriority.PERF_UNAVAIL);
    });

    it('has performance source', () => {
      expect(msg.source).toBe('performance');
    });
  });

  describe('unableNextAltMessage', () => {
    const msg = unableNextAltMessage();

    it('returns correct text', () => {
      expect(msg.text).toBe('UNABLE NEXT ALT');
    });

    it('has SAFETY priority', () => {
      expect(msg.priority).toBe(MessagePriority.SAFETY);
    });

    it('has nav source', () => {
      expect(msg.source).toBe('nav');
    });

    it('does not clear on input (safety band)', () => {
      expect(msg.clearsOnInput).toBe(false);
    });
  });

  describe('dragRequiredMessage', () => {
    const msg = dragRequiredMessage();

    it('returns correct text', () => {
      expect(msg.text).toBe('DRAG REQUIRED');
    });

    it('has SAFETY priority', () => {
      expect(msg.priority).toBe(MessagePriority.SAFETY);
    });

    it('has nav source', () => {
      expect(msg.source).toBe('nav');
    });

    it('does not clear on input (safety band)', () => {
      expect(msg.clearsOnInput).toBe(false);
    });
  });
});

describe('Priority queue ordering', () => {
  it('UNABLE NEXT ALT (SAFETY=1) outranks INSUFFICIENT FUEL (PERF_UNAVAIL=3)', () => {
    const safety = unableNextAltMessage();
    const perf = insufficientFuelMessage();
    expect(safety.priority).toBeLessThan(perf.priority);
  });

  it('INSUFFICIENT FUEL (PERF_UNAVAIL=3) outranks INVALID ENTRY (5)', () => {
    const perf = insufficientFuelMessage();
    const invalid = invalidEntryMessage();
    expect(perf.priority).toBeLessThan(invalid.priority);
  });

  it('INVALID ENTRY (5) outranks USER_INPUT (8)', () => {
    const invalid = invalidEntryMessage();
    const input = invalidEntryMessage();
    input.priority = MessagePriority.USER_INPUT;
    expect(invalid.priority).toBeLessThan(input.priority);
  });

  it('all safety-band messages (priority 1-3) have clearsOnInput=false', () => {
    const safetyMsgs = [
      unableNextAltMessage(),
      dragRequiredMessage(),
      routeDiscontinuityMessage(),
      verifyPositionMessage(),
      insufficientFuelMessage(),
      perfVnavUnavailableMessage(),
    ];
    for (const msg of safetyMsgs) {
      expect(msg.clearsOnInput, `${msg.text} should not clear on input`).toBe(false);
    }
  });

  it('all 8 factory functions produce unique ids', () => {
    const msgs = [
      invalidEntryMessage(),
      notInDatabaseMessage(),
      routeDiscontinuityMessage(),
      verifyPositionMessage(),
      insufficientFuelMessage(),
      perfVnavUnavailableMessage(),
      unableNextAltMessage(),
      dragRequiredMessage(),
    ];
    const ids = msgs.map((m) => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('correctly sorts a mixed priority list', () => {
    const msgs = [invalidEntryMessage(), unableNextAltMessage(), notInDatabaseMessage(), insufficientFuelMessage()];

    const sorted = [...msgs].sort((a, b) => a.priority - b.priority || a.createdAt - b.createdAt);

    expect(sorted[0].priority).toBe(MessagePriority.SAFETY);
    expect(sorted[1].priority).toBe(MessagePriority.PERF_UNAVAIL);
    expect(sorted[2].priority).toBe(MessagePriority.DB_ERROR);
    expect(sorted[3].priority).toBe(MessagePriority.INVALID_ENTRY);
  });
});

describe('ScratchpadState type', () => {
  it('can be constructed with empty state', () => {
    const state: ScratchpadState = {
      buffer: '',
      message: null,
      messageQueue: [],
      history: [],
    };
    expect(state.buffer).toBe('');
    expect(state.message).toBeNull();
    expect(state.messageQueue).toEqual([]);
    expect(state.history).toEqual([]);
  });

  it('can hold a populated message queue', () => {
    const msg = invalidEntryMessage();
    const state: ScratchpadState = {
      buffer: 'TEST',
      message: msg,
      messageQueue: [msg],
      history: [msg],
    };
    expect(state.buffer).toBe('TEST');
    expect(state.message?.text).toBe('INVALID ENTRY');
    expect(state.messageQueue).toHaveLength(1);
    expect(state.history).toHaveLength(1);
  });
});

// ============================================================
// Priority Engine — pushMessage
// ============================================================

function createEmptyState(): ScratchpadState {
  return { buffer: '', message: null, messageQueue: [], history: [] };
}

function makeMsg(id: string, text: string, priority: MessagePriority, createdAt: number): ScratchpadMessage {
  return {
    id,
    text,
    priority,
    source: 'test',
    clearsOnInput: priority > MessagePriority.PERF_UNAVAIL,
    clearsOnExec: true,
    clearsOnPageChange: true,
    createdAt,
  };
}

describe('pushMessage', () => {
  it('inserts message into queue sorted by priority (ascending)', () => {
    const low = makeMsg('low', 'LOW', MessagePriority.INFO, 300);
    const high = makeMsg('high', 'HIGH', MessagePriority.SAFETY, 100);
    const mid = makeMsg('mid', 'MID', MessagePriority.PERF_UNAVAIL, 200);

    let s = pushMessage(createEmptyState(), low);
    s = pushMessage(s, high);
    s = pushMessage(s, mid);

    expect(s.messageQueue[0].id).toBe('high');
    expect(s.messageQueue[1].id).toBe('mid');
    expect(s.messageQueue[2].id).toBe('low');
  });

  it('sets message to the highest priority in queue', () => {
    const msg = makeMsg('m1', 'SOME MSG', MessagePriority.DB_ERROR, 100);
    const result = pushMessage(createEmptyState(), msg);
    expect(result.message?.id).toBe('m1');
  });

  it('promotes higher priority over already-queued messages', () => {
    const low = makeMsg('low', 'LOW', MessagePriority.INFO, 200);
    const high = makeMsg('high', 'HIGH', MessagePriority.SAFETY, 100);

    const r1 = pushMessage(createEmptyState(), low);
    expect(r1.message?.id).toBe('low');

    const r2 = pushMessage(r1, high);
    expect(r2.message?.id).toBe('high');
  });

  it('maintains insertion order for same-priority messages', () => {
    const first = makeMsg('first', 'FIRST', MessagePriority.ADVISORY, 100);
    const second = makeMsg('second', 'SECOND', MessagePriority.ADVISORY, 200);
    const third = makeMsg('third', 'THIRD', MessagePriority.ADVISORY, 300);

    let s = pushMessage(createEmptyState(), first);
    s = pushMessage(s, second);
    s = pushMessage(s, third);

    expect(s.messageQueue[0].id).toBe('first');
    expect(s.messageQueue[1].id).toBe('second');
    expect(s.messageQueue[2].id).toBe('third');
  });

  it('adds message to history', () => {
    const msg = makeMsg('m', 'MSG', MessagePriority.ADVISORY, 100);
    const result = pushMessage(createEmptyState(), msg);
    expect(result.history).toHaveLength(1);
    expect(result.history[0].id).toBe('m');
  });
});

// ============================================================
// Priority Engine — clearMessage
// ============================================================

describe('clearMessage', () => {
  it('removes message from queue', () => {
    const msg = makeMsg('m1', 'MSG', MessagePriority.DB_ERROR, 100);
    const state = pushMessage(createEmptyState(), msg);
    const result = clearMessage(state, 'm1');
    expect(result.messageQueue).toHaveLength(0);
  });

  it('promotes next highest message after clearing current', () => {
    const high = makeMsg('h', 'HIGH', MessagePriority.SAFETY, 100);
    const mid = makeMsg('m', 'MID', MessagePriority.PERF_UNAVAIL, 200);
    const state = pushMessage(pushMessage(createEmptyState(), high), mid);

    expect(state.message?.id).toBe('h');

    const result = clearMessage(state, 'h');
    expect(result.message?.id).toBe('m');
    expect(result.messageQueue).toHaveLength(1);
  });

  it('sets message to null when clearing the only queued message', () => {
    const msg = makeMsg('m1', 'MSG', MessagePriority.ADVISORY, 100);
    const state = pushMessage(createEmptyState(), msg);
    const result = clearMessage(state, 'm1');
    expect(result.message).toBeNull();
  });

  it('does nothing when messageId is not found', () => {
    const msg = makeMsg('m1', 'MSG', MessagePriority.ADVISORY, 100);
    const state = pushMessage(createEmptyState(), msg);
    const result = clearMessage(state, 'nonexistent');
    expect(result.messageQueue).toHaveLength(1);
    expect(result.message?.id).toBe('m1');
  });

  it('keeps lower priority message when clearing a non-current message', () => {
    const high = makeMsg('h', 'HIGH', MessagePriority.SAFETY, 100);
    const low = makeMsg('l', 'LOW', MessagePriority.INFO, 200);
    const state = pushMessage(pushMessage(createEmptyState(), high), low);

    // Clear the lower priority message — current (high) stays
    const result = clearMessage(state, 'l');
    expect(result.message?.id).toBe('h');
    expect(result.messageQueue).toHaveLength(1);
  });
});

// ============================================================
// Priority Engine — typeChar
// ============================================================

describe('typeChar', () => {
  it('appends char to buffer', () => {
    const result = typeChar(createEmptyState(), 'A');
    expect(result.buffer).toBe('A');
  });

  it('preserves safety-band message (priority <= PERF_UNAVAIL) when typing', () => {
    const safetyMsg = makeMsg('s', 'UNABLE NEXT ALT', MessagePriority.SAFETY, 100);
    const state = pushMessage(createEmptyState(), safetyMsg);
    const result = typeChar(state, 'A');

    expect(result.message?.text).toBe('UNABLE NEXT ALT');
    expect(result.buffer).toBe('A');
  });

  it('clears advisory message (priority > PERF_UNAVAIL) when typing', () => {
    const advisoryMsg = makeMsg('a', 'ADVISORY', MessagePriority.ADVISORY, 100);
    const state = pushMessage(createEmptyState(), advisoryMsg);
    const result = typeChar(state, 'A');

    expect(result.message).toBeNull();
    expect(result.buffer).toBe('A');
  });

  it('clears user input message when typing', () => {
    const userMsg = makeMsg('u', 'USER INPUT', MessagePriority.USER_INPUT, 100);
    const state = pushMessage(createEmptyState(), userMsg);
    const result = typeChar(state, 'K');

    expect(result.message).toBeNull();
    expect(result.buffer).toBe('K');
  });

  it('promotes lower-priority safety message after clearing advisory', () => {
    const safetyMsg = makeMsg('s', 'VERIFY POSITION', MessagePriority.NAV_IMPOSSIBLE, 100);
    const advisoryMsg = makeMsg('a', 'ADVISORY', MessagePriority.ADVISORY, 200);
    const state = pushMessage(pushMessage(createEmptyState(), safetyMsg), advisoryMsg);

    expect(state.message?.id).toBe('s'); // safety is highest

    // Type to clear advisory from queue
    const result = typeChar(state, 'A');

    expect(result.message?.id).toBe('s');
    expect(result.messageQueue).toHaveLength(1);
    expect(result.messageQueue[0].id).toBe('s');
  });

  it('handles typing with empty message and empty buffer', () => {
    const result = typeChar(createEmptyState(), 'X');
    expect(result.buffer).toBe('X');
    expect(result.message).toBeNull();
  });
});

// ============================================================
// Priority Engine — deleteChar
// ============================================================

describe('deleteChar', () => {
  it('removes last character from buffer', () => {
    const state: ScratchpadState = { ...createEmptyState(), buffer: 'ABC' };
    const result = deleteChar(state);
    expect(result.buffer).toBe('AB');
  });

  it('does nothing when buffer is empty', () => {
    const result = deleteChar(createEmptyState());
    expect(result.buffer).toBe('');
  });

  it('does not affect message or queue', () => {
    const msg = makeMsg('m', 'MSG', MessagePriority.SAFETY, 100);
    const state = { ...pushMessage(createEmptyState(), msg), buffer: 'HELLO' };
    const result = deleteChar(state);
    expect(result.buffer).toBe('HELL');
    expect(result.message?.id).toBe('m');
    expect(result.messageQueue).toHaveLength(1);
  });
});

// ============================================================
// Priority Engine — clearBuffer
// ============================================================

describe('clearBuffer', () => {
  it('empties an existing buffer', () => {
    const state: ScratchpadState = { ...createEmptyState(), buffer: 'KJFK' };
    const result = clearBuffer(state);
    expect(result.buffer).toBe('');
  });

  it('does nothing when buffer already empty', () => {
    const result = clearBuffer(createEmptyState());
    expect(result.buffer).toBe('');
  });

  it('does not affect messages', () => {
    const msg = makeMsg('m', 'MSG', MessagePriority.SAFETY, 100);
    const state = { ...pushMessage(createEmptyState(), msg), buffer: 'TEST' };
    const result = clearBuffer(state);
    expect(result.buffer).toBe('');
    expect(result.message?.id).toBe('m');
    expect(result.messageQueue).toHaveLength(1);
  });
});

// ============================================================
// Priority Engine — getActiveDisplay
// ============================================================

describe('getActiveDisplay', () => {
  it('returns message text when message exists', () => {
    const msg = makeMsg('m', 'INVALID ENTRY', MessagePriority.INVALID_ENTRY, 100);
    const state: ScratchpadState = { ...createEmptyState(), message: msg, messageQueue: [msg] };
    expect(getActiveDisplay(state)).toBe('INVALID ENTRY');
  });

  it('returns buffer when no message but buffer exists', () => {
    const state: ScratchpadState = { ...createEmptyState(), buffer: 'KJFK' };
    expect(getActiveDisplay(state)).toBe('KJFK');
  });

  it('returns empty string when no message and no buffer', () => {
    expect(getActiveDisplay(createEmptyState())).toBe('');
  });

  it('prioritizes message over buffer when both exist', () => {
    const msg = makeMsg('m', 'DRAG REQUIRED', MessagePriority.SAFETY, 100);
    const state: ScratchpadState = {
      ...createEmptyState(),
      buffer: 'KJFK',
      message: msg,
      messageQueue: [msg],
    };
    expect(getActiveDisplay(state)).toBe('DRAG REQUIRED');
  });
});
