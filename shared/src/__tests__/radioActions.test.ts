import { describe, it, expect } from 'vitest';
import { handleRadioLskAction } from '../fmc/actionHandlers/radioActions';
import { buildInitialFMCState } from '../fmc/initialState';

function makeState(overrides: Partial<ReturnType<typeof buildInitialFMCState>> = {}) {
  return { ...buildInitialFMCState(), ...overrides } as ReturnType<typeof buildInitialFMCState>;
}

describe('handleRadioLskAction', () => {
  // ── set_vor1 ──────────────────────────────────────────────
  it('set_vor1 with valid frequency returns patch with vor1 set', () => {
    const state = makeState();
    const result = handleRadioLskAction('set_vor1', state, '110.50');

    expect(result.handled).toBe(true);
    expect(result.clearScratchpad).toBe(true);
    expect(result.patch).toEqual({
      radios: { vor1: '110.50', vor2: '', adf1: '' },
    });
  });

  it('set_vor1 with invalid frequency returns message', () => {
    const state = makeState();
    const result = handleRadioLskAction('set_vor1', state, 'abc');

    expect(result.handled).toBe(true);
    expect(result.patch).toBeUndefined();
    expect(result.message).toMatchObject({
      text: 'INVALID FORMAT',
      priority: 5,
      source: 'validation',
      clearsOnInput: false,
      clearsOnExec: true,
      clearsOnPageChange: true,
    });
  });

  it('set_vor1 with empty scratchpad returns { handled: false }', () => {
    const state = makeState();
    const result = handleRadioLskAction('set_vor1', state, '');

    expect(result.handled).toBe(false);
    expect(result.patch).toBeUndefined();
    expect(result.message).toBeUndefined();
  });

  // ── set_vor2 ──────────────────────────────────────────────
  it('set_vor2 with valid frequency returns patch with vor2 set', () => {
    const state = makeState();
    const result = handleRadioLskAction('set_vor2', state, '117.95');

    expect(result.handled).toBe(true);
    expect(result.clearScratchpad).toBe(true);
    expect(result.patch).toEqual({
      radios: { vor1: '', vor2: '117.95', adf1: '' },
    });
  });

  // ── set_adf1 ──────────────────────────────────────────────
  it('set_adf1 with valid ADF returns patch with adf1 set', () => {
    const state = makeState();
    const result = handleRadioLskAction('set_adf1', state, '350');

    expect(result.handled).toBe(true);
    expect(result.clearScratchpad).toBe(true);
    expect(result.patch).toEqual({
      radios: { vor1: '', vor2: '', adf1: '350' },
    });
  });

  it('set_adf1 with invalid ADF returns message', () => {
    const state = makeState();
    const result = handleRadioLskAction('set_adf1', state, '1800');

    expect(result.handled).toBe(true);
    expect(result.patch).toBeUndefined();
    expect(result.message).toMatchObject({
      text: 'OUT OF RANGE',
      priority: 5,
      source: 'validation',
      clearsOnInput: false,
      clearsOnExec: true,
      clearsOnPageChange: true,
    });
  });

  // ── unknown action ────────────────────────────────────────
  it('unknown action returns { handled: false }', () => {
    const state = makeState();
    const result = handleRadioLskAction('unknown', state, '110.50');

    expect(result.handled).toBe(false);
    expect(result.patch).toBeUndefined();
    expect(result.message).toBeUndefined();
  });
});
