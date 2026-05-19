import { describe, it, expect } from 'vitest';
import { getPatch } from '../fmc/actionHandlers/actionResult';
import {
  handleSetCrzAlt,
  handleSetCostIndex,
  handleSetZfw,
  handleSetReserve,
  handlePerformanceAction,
} from '../fmc/actionHandlers/performanceActions';
import { buildInitialFMCState } from '../fmc/initialState';
import type { FMCState } from '../types/fmc';

function makeState(overrides: Partial<ReturnType<typeof buildInitialFMCState>> = {}): FMCState {
  return { ...buildInitialFMCState(), ...overrides } as FMCState;
}

// ──── handleSetCrzAlt ────

describe('handleSetCrzAlt', () => {
  it('rejects empty scratchpad', () => {
    const result = handleSetCrzAlt(makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('parses bare altitude (350 = FL350)', () => {
    const result = handleSetCrzAlt(makeState(), '350');
    expect(result.handled).toBe(true);
    expect(result.success?.patch?.performance?.crzAlt).toBe(350);
  });

  it('parses FL-prefix altitude (FL350) after stripping prefix', () => {
    const result = handleSetCrzAlt(makeState(), 'FL350');
    expect(result.handled).toBe(true);
    expect(result.failure?.text).toBe('OUT OF RANGE');
  });

  it('accepts altitude 0', () => {
    const result = handleSetCrzAlt(makeState(), '0');
    expect(result.handled).toBe(true);
    expect(result.success?.patch?.performance?.crzAlt).toBe(0);
  });

  it('rejects out-of-range altitude (501)', () => {
    const result = handleSetCrzAlt(makeState(), '501');
    expect(result.handled).toBe(true);
    expect(result.failure?.text).toBe('OUT OF RANGE');
  });
});

// ──── handleSetCostIndex ────

describe('handleSetCostIndex', () => {
  it('rejects empty scratchpad', () => {
    const result = handleSetCostIndex(makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('accepts valid cost index', () => {
    const result = handleSetCostIndex(makeState(), '50');
    expect(result.handled).toBe(true);
    expect(result.success?.patch?.performance?.costIndex).toBe(50);
  });

  it('rejects negative cost index', () => {
    const result = handleSetCostIndex(makeState(), '-1');
    expect(result.handled).toBe(true);
    expect(result.failure?.text).toBe('OUT OF RANGE');
  });

  it('rejects cost index > 999', () => {
    const result = handleSetCostIndex(makeState(), '1000');
    expect(result.handled).toBe(true);
    expect(result.failure?.text).toBe('OUT OF RANGE');
  });
});

// ──── handleSetZfw ────

describe('handleSetZfw', () => {
  it('rejects empty scratchpad', () => {
    const result = handleSetZfw(makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('parses ZFW in thousands of lbs (120 = 120000)', () => {
    const result = handleSetZfw(makeState(), '120');
    expect(result.handled).toBe(true);
    expect(result.success?.patch?.performance?.zfw).toBe(120000);
  });

  it('computes grossWeight from ZFW + fuel', () => {
    const state = makeState({ performance: { ...buildInitialFMCState().performance, fuel: 15000 } });
    const result = handleSetZfw(state, '100');
    expect(result.handled).toBe(true);
    expect(result.success?.patch?.performance?.zfw).toBe(100000);
    expect(result.success?.patch?.performance?.grossWeight).toBe(115000);
  });

  it('recalculates V-speeds when flaps set', () => {
    const state = makeState({ takeoff: { ...buildInitialFMCState().takeoff, flaps: '5' } });
    const result = handleSetZfw(state, '140');
    expect(result.handled).toBe(true);
    expect(getPatch(result)?.takeoff?.suggestedV1).toBeGreaterThan(0);
    expect(getPatch(result)?.takeoff?.suggestedVr).toBeGreaterThan(0);
    expect(getPatch(result)?.takeoff?.suggestedV2).toBeGreaterThan(0);
  });

  it('rejects zero ZFW', () => {
    const result = handleSetZfw(makeState(), '0');
    expect(result.handled).toBe(true);
    expect(result.failure?.text).toBe('INVALID ENTRY');
  });

  it('rejects negative ZFW', () => {
    const result = handleSetZfw(makeState(), '-10');
    expect(result.handled).toBe(true);
    expect(result.failure?.text).toBe('INVALID ENTRY');
  });
});

// ──── handleSetReserve ────

describe('handleSetReserve', () => {
  it('rejects empty scratchpad', () => {
    const result = handleSetReserve(makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('parses reserve in thousands of lbs (5.0 = 5000)', () => {
    const result = handleSetReserve(makeState(), '5.0');
    expect(result.handled).toBe(true);
    expect(result.success?.patch?.performance?.reserve).toBe(5000);
  });

  it('rejects negative reserve', () => {
    const result = handleSetReserve(makeState(), '-1');
    expect(result.handled).toBe(true);
    expect(result.failure?.text).toBe('INVALID ENTRY');
  });
});

// ──── handlePerformanceAction router ────

describe('handlePerformanceAction router', () => {
  it('dispatches set_crz_alt', () => {
    const result = handlePerformanceAction('set_crz_alt', makeState(), '350');
    expect(result.handled).toBe(true);
    expect(result.success?.patch?.performance?.crzAlt).toBe(350);
  });

  it('dispatches set_cost_index', () => {
    const result = handlePerformanceAction('set_cost_index', makeState(), '80');
    expect(result.handled).toBe(true);
    expect(result.success?.patch?.performance?.costIndex).toBe(80);
  });

  it('dispatches set_zfw', () => {
    const result = handlePerformanceAction('set_zfw', makeState(), '130');
    expect(result.handled).toBe(true);
    expect(result.success?.patch?.performance?.zfw).toBe(130000);
  });

  it('dispatches set_reserve', () => {
    const result = handlePerformanceAction('set_reserve', makeState(), '3');
    expect(result.handled).toBe(true);
    expect(result.success?.patch?.performance?.reserve).toBe(3000);
  });

  it('returns handled: false for unknown action', () => {
    const result = handlePerformanceAction('unknown_action', makeState(), '');
    expect(result.handled).toBe(false);
  });
});
