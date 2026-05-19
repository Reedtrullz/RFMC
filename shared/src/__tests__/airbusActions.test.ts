import { describe, it, expect } from 'vitest';
import { getPatch } from '../fmc/actionHandlers/actionResult';
import { handleAirbusAction } from '../fmc/actionHandlers/airbusActions';
import { buildInitialFMCState } from '../fmc/initialState';
import type { FMCState } from '../types/fmc';

function makeState(overrides: Partial<FMCState> = {}): FMCState {
  return { ...buildInitialFMCState(), ...overrides } as FMCState;
}

describe('handleAirbusAction — set_crz_fl', () => {
  it('rejects empty scratchpad', () => {
    const result = handleAirbusAction('set_crz_fl', makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('rejects out-of-range altitude', () => {
    const result = handleAirbusAction('set_crz_fl', makeState(), '999');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('OUT_OF_RANGE');
  });

  it('accepts valid flight level (e.g. FL370 -> 370)', () => {
    const result = handleAirbusAction('set_crz_fl', makeState(), '370');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.performance?.crzAlt).toBe(37000);
  });

  it('accepts altitude number (FL180)', () => {
    const result = handleAirbusAction('set_crz_fl', makeState(), '180');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.performance?.crzAlt).toBe(18000);
  });

  it('rejects negative altitude', () => {
    const result = handleAirbusAction('set_crz_fl', makeState(), '-10');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('OUT_OF_RANGE');
  });
});

describe('handleAirbusAction — set_altn', () => {
  it('rejects empty scratchpad', () => {
    const result = handleAirbusAction('set_altn', makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('rejects invalid ICAO', () => {
    const result = handleAirbusAction('set_altn', makeState(), 'XX');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('INVALID_ENTRY');
  });

  it('accepts valid ICAO', () => {
    const result = handleAirbusAction('set_altn', makeState(), 'KSEA');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.route?.alternate).toBe('KSEA');
  });

  it('uppercases ICAO input', () => {
    const result = handleAirbusAction('set_altn', makeState(), 'ksea');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.route?.alternate).toBe('KSEA');
  });

  it('accepts minimal 4-char ICAO', () => {
    const result = handleAirbusAction('set_altn', makeState(), 'EGLL');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.route?.alternate).toBe('EGLL');
  });
});

describe('handleAirbusAction — set_block', () => {
  it('rejects empty scratchpad', () => {
    const result = handleAirbusAction('set_block', makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('rejects non-numeric fuel', () => {
    const result = handleAirbusAction('set_block', makeState(), 'ABC');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('INVALID_ENTRY');
  });

  it('rejects zero fuel', () => {
    const result = handleAirbusAction('set_block', makeState(), '0');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('INVALID_ENTRY');
  });

  it('accepts valid fuel value (multiplied by 1000)', () => {
    const result = handleAirbusAction('set_block', makeState(), '15.5');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.performance?.fuel).toBe(15500);
  });

  it('rejects negative fuel', () => {
    const result = handleAirbusAction('set_block', makeState(), '-5');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('INVALID_ENTRY');
  });
});

describe('handleAirbusAction — set_flt_nbr', () => {
  it('rejects empty scratchpad', () => {
    const result = handleAirbusAction('set_flt_nbr', makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('rejects invalid flight number', () => {
    const result = handleAirbusAction('set_flt_nbr', makeState(), 'XYZ');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('INVALID_ENTRY');
  });

  it('accepts valid flight number', () => {
    const result = handleAirbusAction('set_flt_nbr', makeState(), 'AAL777');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.route?.flightNumber).toBe('AAL777');
    expect(patch.flightPlan?.flightNumber).toBe('AAL777');
  });

  it('uppercases flight number', () => {
    const result = handleAirbusAction('set_flt_nbr', makeState(), 'ABA1234');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.route?.flightNumber).toBe('ABA1234');
  });

  it('rejects too-short flight number', () => {
    const result = handleAirbusAction('set_flt_nbr', makeState(), 'AB');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('INVALID_ENTRY');
  });
});

describe('handleAirbusAction — set_flex', () => {
  it('rejects empty scratchpad', () => {
    const result = handleAirbusAction('set_flex', makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('rejects non-numeric flex temp', () => {
    const result = handleAirbusAction('set_flex', makeState(), 'ABC');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('INVALID_ENTRY');
  });

  it('accepts valid flex temperature', () => {
    const result = handleAirbusAction('set_flex', makeState(), '45');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.takeoff?.flexTemp).toBe(45);
  });

  it('accepts negative flex temperature', () => {
    const result = handleAirbusAction('set_flex', makeState(), '-5');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.takeoff?.flexTemp).toBe(-5);
  });
});

describe('handleAirbusAction — set_cg', () => {
  it('rejects empty scratchpad', () => {
    const result = handleAirbusAction('set_cg', makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('rejects non-numeric CG', () => {
    const result = handleAirbusAction('set_cg', makeState(), 'ABC');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('INVALID_ENTRY');
  });

  it('accepts valid CG value', () => {
    const result = handleAirbusAction('set_cg', makeState(), '25.5');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.performance?.cg).toBe(25.5);
  });

  it('accepts integer CG', () => {
    const result = handleAirbusAction('set_cg', makeState(), '28');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.performance?.cg).toBe(28);
  });

  it('returns unhandled for unrecognised action', () => {
    const result = handleAirbusAction('unknown', makeState(), '');
    expect(result.handled).toBe(false);
  });
});
