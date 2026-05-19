import { describe, it, expect } from 'vitest';
import { getPatch } from '../fmc/actionHandlers/actionResult';
import { handleSetFromTo, handleRouteAction } from '../fmc/actionHandlers/routeActions';
import { buildInitialFMCState } from '../fmc/initialState';

function makeState(overrides: Partial<ReturnType<typeof buildInitialFMCState>> = {}) {
  return { ...buildInitialFMCState(), ...overrides } as ReturnType<typeof buildInitialFMCState>;
}

describe('handleSetFromTo', () => {
  it('returns proper patch for valid KJFK/KDCA', () => {
    const state = makeState();
    const result = handleSetFromTo(state, 'KJFK/KDCA');

    expect(result.handled).toBe(true);
    expect(result.failure).toBeUndefined();
    expect(result.success?.sideEffect).toBe('expand_active_route');
    expect(result.success?.patch).toMatchObject({
      isModified: true,
      execLit: true,
      scratchpad: '',
      pendingRoute: { origin: 'KJFK', destination: 'KDCA' },
      pendingFlightPlan: { origin: 'KJFK', destination: 'KDCA' },
    });
  });

  it('returns failure when destination is missing (KJFK/)', () => {
    const state = makeState();
    const result = handleSetFromTo(state, 'KJFK/');

    expect(result.handled).toBe(true);
    expect(result.failure).toMatchObject({
      code: 'INVALID_FORMAT',
      text: 'INVALID FORMAT',
      source: 'routeActions',
    });
    expect(result.success).toBeUndefined();
  });

  it('returns failure for invalid ICAO codes (X12/YYYY)', () => {
    const state = makeState();
    const result = handleSetFromTo(state, 'X12/YYYY');

    expect(result.handled).toBe(true);
    expect(result.failure).toMatchObject({
      code: 'INVALID_FORMAT',
      text: 'INVALID FORMAT',
      source: 'routeActions',
    });
    expect(result.success).toBeUndefined();
  });

  it('returns handled: false for empty scratchpad', () => {
    const state = makeState();
    const result = handleSetFromTo(state, '');

    expect(result.handled).toBe(false);
    expect(result.success).toBeUndefined();
  });

  it('accepts valid ICAOs with mixed case (kjfk/kdca)', () => {
    const state = makeState();
    const result = handleSetFromTo(state, 'kjfk/kdca');

    expect(result.handled).toBe(true);
    expect(result.failure).toBeUndefined();
    expect(result.success?.patch).toMatchObject({
      pendingRoute: { origin: 'KJFK', destination: 'KDCA' },
      pendingFlightPlan: { origin: 'KJFK', destination: 'KDCA' },
    });
  });
});

describe('handleRouteAction dispatcher', () => {
  it('returns handled:false for unknown action', () => {
    const result = handleRouteAction('unknown', makeState(), 'data');
    expect(result.handled).toBe(false);
  });
});

describe('handleSetOrigin (via dispatcher)', () => {
  it('returns handled:false when scratchpad is empty', () => {
    const result = handleRouteAction('set_origin', makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('returns failure for invalid ICAO', () => {
    const result = handleRouteAction('set_origin', makeState(), 'XYZ');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('INVALID_FORMAT');
  });

  it('sets origin on pending route and flight plan', () => {
    const result = handleRouteAction('set_origin', makeState(), 'KJFK');
    expect(result.handled).toBe(true);
    expect(result.success?.clearScratchpad).toBe(true);
    const patch = getPatch(result);
    expect(patch.pendingRoute?.origin).toBe('KJFK');
    expect(patch.pendingFlightPlan?.origin).toBe('KJFK');
    expect(patch.isModified).toBe(true);
    expect(patch.execLit).toBe(true);
    expect(result.success?.sideEffect).toBe('expand_active_route');
  });

  it('preserves existing pending route fields when setting origin', () => {
    const state = {
      ...makeState(),
      pendingRoute: { ...makeState().route, destination: 'KDCA', flightNumber: 'AAL123' },
    };
    const result = handleRouteAction('set_origin', state, 'KJFK');
    const patch = getPatch(result);
    expect(patch.pendingRoute?.origin).toBe('KJFK');
    expect(patch.pendingRoute?.destination).toBe('KDCA');
    expect(patch.pendingRoute?.flightNumber).toBe('AAL123');
  });
});

describe('handleSetDest (via dispatcher)', () => {
  it('sets destination on pending route', () => {
    const result = handleRouteAction('set_dest', makeState(), 'KDCA');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.pendingRoute?.destination).toBe('KDCA');
    expect(patch.pendingFlightPlan?.destination).toBe('KDCA');
    expect(result.success?.sideEffect).toBe('expand_active_route');
  });
});

describe('handleSetFltNo (via dispatcher)', () => {
  it('returns failure for invalid flight number', () => {
    const result = handleRouteAction('set_flt_no', makeState(), '12');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('INVALID_FORMAT');
  });

  it('sets flight number on pending route and plan', () => {
    const result = handleRouteAction('set_flt_no', makeState(), 'AAL123');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.pendingRoute?.flightNumber).toBe('AAL123');
    expect(patch.pendingFlightPlan?.flightNumber).toBe('AAL123');
  });
});

describe('handleSetRoute (via dispatcher)', () => {
  it('returns handled:false when scratchpad is empty', () => {
    const result = handleRouteAction('set_route', makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('parses route and updates pending data', () => {
    const result = handleRouteAction('set_route', makeState(), 'KJFK DCT RBV DCT KDCA');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.pendingRoute?.routeString).toBe('KJFK DCT RBV DCT KDCA');
    expect(patch.legsPageCount).toBeGreaterThanOrEqual(1);
    expect(patch.isModified).toBe(true);
    expect(patch.execLit).toBe(true);
  });

  it('computes legsPageCount from waypoint count', () => {
    const result = handleRouteAction('set_route', makeState(), 'KJFK DCT RBV DCT KDCA');
    const patch = getPatch(result);
    expect(patch.legsPageCount).toBeGreaterThanOrEqual(1);
  });
});

describe('handleSetDirectTo (via dispatcher)', () => {
  it('returns failure for invalid waypoint', () => {
    const result = handleRouteAction('set_direct_to', makeState(), '*');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('NOT_IN_DATABASE');
  });

  it('sets direct to waypoint on pending route', () => {
    const result = handleRouteAction('set_direct_to', makeState(), 'RBV');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.pendingRoute?.directTo).toBe('RBV');
    expect(patch.isModified).toBe(true);
    expect(patch.execLit).toBe(true);
  });
});
