import { describe, it, expect } from 'vitest';
import { getPatch } from '../fmc/actionHandlers/actionResult';
import { handleHoldAction } from '../fmc/actionHandlers/holdActions';
import { buildInitialFMCState } from '../fmc/initialState';
import type { FMCState } from '../types/fmc';

function makeState(overrides: Partial<FMCState> = {}): FMCState {
  return { ...buildInitialFMCState(), ...overrides } as FMCState;
}

describe('handleHoldAction — set_hold_fix', () => {
  it('rejects empty scratchpad', () => {
    const result = handleHoldAction('set_hold_fix', makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('rejects invalid waypoint', () => {
    const result = handleHoldAction('set_hold_fix', makeState(), '*');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('INVALID_ENTRY');
  });

  it('rejects waypoint not in route', () => {
    const state = makeState({
      flightPlan: {
        origin: 'KJFK',
        destination: 'KDCA',
        flightNumber: '',
        route: '',
        waypoints: [{ ident: 'RBV', lat: 0, lon: 0, discontinuity: false }],
      },
    });
    const result = handleHoldAction('set_hold_fix', state, 'SEA');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('NOT_IN_ROUTE');
  });

  it('accepts waypoint in route', () => {
    const state = makeState({
      flightPlan: {
        origin: 'KJFK',
        destination: 'KDCA',
        flightNumber: '',
        route: '',
        waypoints: [{ ident: 'RBV', lat: 0, lon: 0, discontinuity: false }],
      },
    });
    const result = handleHoldAction('set_hold_fix', state, 'RBV');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.holdPending?.fix).toBe('RBV');
    expect(patch.isModified).toBe(true);
    expect(patch.execLit).toBe(true);
  });

  it('builds holdPending from existing hold if no pending', () => {
    const state = makeState({
      hold: { fix: '', inboundCourse: 90, legTime: 1.5, legDist: 0, direction: 'R' },
      holdPending: null,
      flightPlan: {
        origin: '',
        destination: '',
        flightNumber: '',
        route: '',
        waypoints: [{ ident: 'OLM', lat: 0, lon: 0, discontinuity: false }],
      },
    });
    const result = handleHoldAction('set_hold_fix', state, 'OLM');
    const patch = getPatch(result);
    expect(patch.holdPending?.inboundCourse).toBe(90);
    expect(patch.holdPending?.legTime).toBe(1.5);
  });
});

describe('handleHoldAction — set_inbound_crs', () => {
  it('rejects empty scratchpad', () => {
    const result = handleHoldAction('set_inbound_crs', makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('rejects out-of-range course', () => {
    const result = handleHoldAction('set_inbound_crs', makeState(), '400');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('OUT_OF_RANGE');
  });

  it('rejects course 0', () => {
    const result = handleHoldAction('set_inbound_crs', makeState(), '0');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('OUT_OF_RANGE');
  });

  it('accepts valid course', () => {
    const result = handleHoldAction('set_inbound_crs', makeState(), '180');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.holdPending?.inboundCourse).toBe(180);
  });

  it('rejects non-numeric value', () => {
    const result = handleHoldAction('set_inbound_crs', makeState(), 'ABC');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('OUT_OF_RANGE');
  });
});

describe('handleHoldAction — set_leg_time', () => {
  it('rejects empty scratchpad', () => {
    const result = handleHoldAction('set_leg_time', makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('rejects time <= 0', () => {
    const result = handleHoldAction('set_leg_time', makeState(), '0');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('OUT_OF_RANGE');
  });

  it('rejects time > 9.9', () => {
    const result = handleHoldAction('set_leg_time', makeState(), '12');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('OUT_OF_RANGE');
  });

  it('accepts valid leg time', () => {
    const result = handleHoldAction('set_leg_time', makeState(), '1.5');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.holdPending?.legTime).toBe(1.5);
  });
});

describe('handleHoldAction — set_leg_dist', () => {
  it('rejects empty scratchpad', () => {
    const result = handleHoldAction('set_leg_dist', makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('rejects out-of-range distance', () => {
    const result = handleHoldAction('set_leg_dist', makeState(), '1500');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('OUT_OF_RANGE');
  });

  it('accepts valid leg distance', () => {
    const result = handleHoldAction('set_leg_dist', makeState(), '25');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.holdPending?.legDist).toBe(25);
  });

  it('rejects negative distance', () => {
    const result = handleHoldAction('set_leg_dist', makeState(), '-5');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('OUT_OF_RANGE');
  });
});

describe('handleHoldAction — set_hold_direction', () => {
  it('rejects empty scratchpad', () => {
    const result = handleHoldAction('set_hold_direction', makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('rejects invalid direction', () => {
    const result = handleHoldAction('set_hold_direction', makeState(), 'X');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('INVALID_ENTRY');
  });

  it('accepts L direction', () => {
    const result = handleHoldAction('set_hold_direction', makeState(), 'L');
    expect(result.handled).toBe(true);
    expect(getPatch(result).holdPending?.direction).toBe('L');
  });

  it('accepts R direction', () => {
    const result = handleHoldAction('set_hold_direction', makeState(), 'R');
    expect(result.handled).toBe(true);
    expect(getPatch(result).holdPending?.direction).toBe('R');
  });

  it('is case-insensitive', () => {
    const result = handleHoldAction('set_hold_direction', makeState(), 'l');
    expect(result.handled).toBe(true);
    expect(getPatch(result).holdPending?.direction).toBe('L');
  });
});
