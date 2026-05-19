import { describe, it, expect } from 'vitest';
import { getPatch } from '../fmc/actionHandlers/actionResult';
import { handlePositionAction } from '../fmc/actionHandlers/positionActions';
import { buildInitialFMCState } from '../fmc/initialState';

function makeState(overrides: Partial<ReturnType<typeof buildInitialFMCState>> = {}) {
  return { ...buildInitialFMCState(), ...overrides } as ReturnType<typeof buildInitialFMCState>;
}

describe('handlePositionAction', () => {
  it('returns handled:false for unknown action', () => {
    const result = handlePositionAction('unknown', makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('set_ref_airport validates and sets refAirport for valid ICAO', () => {
    const result = handlePositionAction('set_ref_airport', makeState(), 'KJFK');
    expect(result.handled).toBe(true);
    expect(result.success?.clearScratchpad).toBe(true);
    const patch = getPatch(result);
    expect(patch.position?.refAirport).toBe('KJFK');
  });

  it('set_ref_airport fails for invalid ICAO', () => {
    const result = handlePositionAction('set_ref_airport', makeState(), 'XYZ');
    expect(result.handled).toBe(true);
    expect(result.failure).toBeDefined();
    expect(result.failure?.code).toBe('INVALID_ENTRY');
  });

  it('set_ref_airport returns handled:false for empty scratchpad', () => {
    const result = handlePositionAction('set_ref_airport', makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('set_gate sets gate without validation', () => {
    const result = handlePositionAction('set_gate', makeState(), 'A12');
    expect(result.handled).toBe(true);
    expect(result.success?.clearScratchpad).toBe(true);
    const patch = getPatch(result);
    expect(patch.position?.gate).toBe('A12');
  });
});
