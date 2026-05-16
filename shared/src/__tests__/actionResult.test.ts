import { describe, it, expect, vi, beforeEach } from 'vitest';
import { applyFmcActionResult, failScratchpad } from '../fmc/fmcScratchpadAdapter';
import type { FmcActionResult } from '../fmc/actionHandlers/actionResult';

function mockZustand() {
  const set = vi.fn();
  const get = vi.fn(() => ({
    scratchpadState: { buffer: '', message: null, messageQueue: [], history: [] },
    scratchpad: '',
    scratchpadError: null,
  }));
  return { set, get };
}

describe('applyFmcActionResult', () => {
  let set: any;
  let get: any;

  beforeEach(() => {
    const m = mockZustand();
    set = m.set;
    get = m.get;
  });

  it('failure returns shouldReturn: true', () => {
    const result: FmcActionResult = {
      handled: true,
      failure: { code: 'INVALID_FORMAT', text: 'INVALID FORMAT', source: 'test' },
    };
    const out = applyFmcActionResult(set, get, result);
    expect(out.shouldReturn).toBe(true);
    expect(set).toHaveBeenCalledWith({ scratchpadError: 'INVALID FORMAT' });
  });

  it('success with patch applies it', () => {
    const result: FmcActionResult = {
      handled: true,
      success: { patch: { scratchpad: 'DES NOW ARMED', scratchpadError: null } as any },
    };
    const out = applyFmcActionResult(set, get, result);
    expect(out.shouldReturn).toBe(false);
    expect(set).toHaveBeenCalledWith({ scratchpad: 'DES NOW ARMED', scratchpadError: null });
  });

  it('success with clearScratchpad clears scratchpad', () => {
    const result: FmcActionResult = {
      handled: true,
      success: { clearScratchpad: true },
    };
    const out = applyFmcActionResult(set, get, result);
    expect(out.shouldReturn).toBe(false);
    expect(set).toHaveBeenCalledWith({ scratchpad: '', scratchpadError: null });
  });

  it('unhandled result returns shouldReturn: false', () => {
    const result: FmcActionResult = { handled: false };
    const out = applyFmcActionResult(set, get, result);
    expect(out.shouldReturn).toBe(false);
    expect(set).not.toHaveBeenCalled();
  });
});

describe('failScratchpad', () => {
  it('pushes message and sets scratchpadError', () => {
    const m = mockZustand();
    failScratchpad(m.set as any, m.get as any, 'SOME ERROR');
    expect(m.set).toHaveBeenCalledWith({ scratchpadError: 'SOME ERROR' });
  });
});
