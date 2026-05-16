import { describe, it, expect } from 'vitest';
import { handleSetFromTo } from '../fmc/actionHandlers/routeActions';
import { buildInitialFMCState } from '../fmc/initialState';

function makeState(overrides: Partial<ReturnType<typeof buildInitialFMCState>> = {}) {
  return { ...buildInitialFMCState(), ...overrides } as ReturnType<typeof buildInitialFMCState>;
}

describe('handleSetFromTo', () => {
  it('returns proper patch for valid KJFK/KDCA', () => {
    const state = makeState();
    const result = handleSetFromTo(state, 'KJFK/KDCA');

    expect(result.handled).toBe(true);
    expect(result.scratchpadError).toBeUndefined();
    expect(result.sideEffect).toBe('expand_active_route');
    expect(result.patch).toMatchObject({
      isModified: true,
      execLit: true,
      scratchpad: '',
      pendingRoute: { origin: 'KJFK', destination: 'KDCA' },
      pendingFlightPlan: { origin: 'KJFK', destination: 'KDCA' },
    });
  });

  it('returns error when destination is missing (KJFK/)', () => {
    const state = makeState();
    const result = handleSetFromTo(state, 'KJFK/');

    expect(result.handled).toBe(true);
    expect(result.scratchpadError).toBe('INVALID FORMAT');
    expect(result.patch).toBeUndefined();
  });

  it('returns error for invalid ICAO codes (X12/YYYY)', () => {
    const state = makeState();
    const result = handleSetFromTo(state, 'X12/YYYY');

    expect(result.handled).toBe(true);
    expect(result.scratchpadError).toBe('INVALID FORMAT');
    expect(result.patch).toBeUndefined();
  });

  it('returns handled: false for empty scratchpad', () => {
    const state = makeState();
    const result = handleSetFromTo(state, '');

    expect(result.handled).toBe(false);
    expect(result.patch).toBeUndefined();
  });

  it('accepts valid ICAOs with mixed case (kjfk/kdca)', () => {
    const state = makeState();
    const result = handleSetFromTo(state, 'kjfk/kdca');

    expect(result.handled).toBe(true);
    expect(result.scratchpadError).toBeUndefined();
    expect(result.patch).toMatchObject({
      pendingRoute: { origin: 'KJFK', destination: 'KDCA' },
      pendingFlightPlan: { origin: 'KJFK', destination: 'KDCA' },
    });
  });
});
