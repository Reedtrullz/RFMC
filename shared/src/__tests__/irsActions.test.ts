import { describe, it, expect } from 'vitest';
import { getPatch } from '../fmc/actionHandlers/actionResult';
import { handleIrsAction } from '../fmc/actionHandlers/irsActions';
import { buildInitialFMCState } from '../fmc/initialState';
import type { FMCState } from '../types/fmc';

function makeState(overrides: Partial<FMCState> = {}): FMCState {
  return { ...buildInitialFMCState(), ...overrides } as FMCState;
}

describe('handleIrsAction — set_irs_pos', () => {
  it('rejects empty scratchpad', () => {
    const state = makeState({
      position: { ...buildInitialFMCState().position, irsState: 'ALIGNING' },
    });
    const result = handleIrsAction('set_irs_pos', state, '');
    expect(result.handled).toBe(false);
  });

  it('rejects if IRS not in ALIGN mode', () => {
    const state = makeState({
      position: { ...buildInitialFMCState().position, irsState: 'OFF' },
    });
    const result = handleIrsAction('set_irs_pos', state, 'N4715.4W12218.6');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('NOT_IN_ALIGN_MODE');
  });

  it('rejects non-LAT_LONG input', () => {
    const state = makeState({
      position: { ...buildInitialFMCState().position, irsState: 'ALIGNING' },
    });
    const result = handleIrsAction('set_irs_pos', state, 'INVALID');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('INVALID_ENTRY');
  });

  it('accepts a valid lat/long position with ALIGNING state', () => {
    const state = makeState({
      position: { ...buildInitialFMCState().position, irsState: 'ALIGNING' },
      route: { ...buildInitialFMCState().route, origin: 'KSEA' },
    });
    const result = handleIrsAction('set_irs_pos', state, 'N4715.4W12218.6');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.position?.irsAlignmentProgress).toBe(0);
    expect(patch.position?.irsTimeRemaining).toBe(600);
  });

  it('uses 30s alignment time for FAST_ALIGNING', () => {
    const state = makeState({
      position: { ...buildInitialFMCState().position, irsState: 'FAST_ALIGNING' },
      route: { ...buildInitialFMCState().route, origin: 'KSEA' },
    });
    const result = handleIrsAction('set_irs_pos', state, 'N4715.4W12218.6');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.position?.irsTimeRemaining).toBe(30);
  });

  it('undhandled for unrecognised action', () => {
    const result = handleIrsAction('unknown', makeState(), '');
    expect(result.handled).toBe(false);
  });
});
