import { describe, it, expect } from 'vitest';
import {
  MessagePriority,
  ScratchpadMessage,
  ScratchpadState,
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
      expect(msg.text).toBe('PERF VNAV UNAVAILABLE');
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
    const ids = msgs.map(m => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('correctly sorts a mixed priority list', () => {
    const msgs = [
      invalidEntryMessage(),
      unableNextAltMessage(),
      notInDatabaseMessage(),
      insufficientFuelMessage(),
    ];

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
