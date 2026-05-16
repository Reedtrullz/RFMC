import { describe, it, expect } from 'vitest';
import { handleLandingAction } from '../fmc/actionHandlers/landingActions';
import type { FMCState } from '../types/fmc';

function makeState(overrides?: Partial<FMCState>): FMCState {
  return {
    aircraft: 'BOEING_737',
    route: { origin: '', destination: '', flightNumber: '', routeString: '', companyRoute: '', sid: null, star: null, approach: null, coRoute: '', runway: '' },
    flightPlan: { origin: '', destination: '', flightNumber: '', route: '', waypoints: [] },
    pendingRoute: null,
    pendingFlightPlan: null,
    performance: { crzAlt: 0, costIndex: 0, zfw: 0, fuel: 0, cg: 0, reserve: 0, grossWeight: 140000 },
    takeoff: { runway: '', toMode: 'TO', assumedTemp: 0, v1: 0, vr: 0, v2: 0, trim: 0, oat: 0, windDir: 0, windSpeed: 0, qnh: 0, suggestedV1: 0, suggestedVr: 0, suggestedV2: 0 },
    landing: { runway: '', flaps: '', vref: 0, ilsFrequency: '', course: 0 },
    ...overrides,
  } as FMCState;
}

describe('handleSetQnh', () => {
  it('returns handled:false when scratchpad is empty', () => {
    const result = handleLandingAction('set_qnh', makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('returns failure for out-of-range QNH', () => {
    const result = handleLandingAction('set_qnh', makeState(), '800');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('INVALID_ENTRY');
  });

  it('sets valid QNH on takeoff state', () => {
    const result = handleLandingAction('set_qnh', makeState(), '1013');
    expect(result.handled).toBe(true);
    const patch = result.success?.patch as any;
    expect(patch.takeoff.qnh).toBe(101300);
    expect(patch.isModified).toBe(true);
    expect(patch.execLit).toBe(true);
    expect(result.success?.clearScratchpad).toBe(true);
  });

  it('rejects non-numeric QNH', () => {
    const result = handleLandingAction('set_qnh', makeState(), 'abc');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('INVALID_ENTRY');
  });
});

describe('handleSetLandingRunway', () => {
  it('returns handled:false when scratchpad is empty', () => {
    const result = handleLandingAction('set_landing_runway', makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('rejects too-short runway identifier', () => {
    const result = handleLandingAction('set_landing_runway', makeState(), 'R');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('INVALID_ENTRY');
  });

  it('sets landing runway and updates route', () => {
    const state = makeState();
    const result = handleLandingAction('set_landing_runway', state, '19R');
    expect(result.handled).toBe(true);
    const patch = result.success?.patch as any;
    expect(patch.landing.runway).toBe('19R');
    expect(patch.route.runway).toBe('19R');
    expect(patch.isModified).toBe(true);
  });
});

describe('handleSetLandingFlaps', () => {
  it('returns handled:false when scratchpad is empty', () => {
    const result = handleLandingAction('set_landing_flaps', makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('rejects invalid flaps setting', () => {
    const result = handleLandingAction('set_landing_flaps', makeState(), '50');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('INVALID_ENTRY');
  });

  it('sets valid landing flaps', () => {
    const result = handleLandingAction('set_landing_flaps', makeState(), '40');
    expect(result.handled).toBe(true);
    const patch = result.success?.patch as any;
    expect(patch.landing.flaps).toBe('40');
  });
});

describe('handleSetLandingVref', () => {
  it('returns handled:false when scratchpad is empty', () => {
    const result = handleLandingAction('set_landing_vref', makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('rejects out-of-range Vref', () => {
    const result = handleLandingAction('set_landing_vref', makeState(), '50');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('INVALID_ENTRY');
  });

  it('rejects too-large Vref', () => {
    const result = handleLandingAction('set_landing_vref', makeState(), '250');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('INVALID_ENTRY');
  });

  it('sets valid Vref', () => {
    const result = handleLandingAction('set_landing_vref', makeState(), '135');
    expect(result.handled).toBe(true);
    const patch = result.success?.patch as any;
    expect(patch.landing.vref).toBe(135);
  });
});

describe('handleSetIlsFrequency', () => {
  it('rejects invalid frequency', () => {
    const result = handleLandingAction('set_ils_frequency', makeState(), '120.0');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('INVALID_ENTRY');
  });

  it('sets valid ILS frequency', () => {
    const result = handleLandingAction('set_ils_frequency', makeState(), '110.90');
    expect(result.handled).toBe(true);
    const patch = result.success?.patch as any;
    expect(patch.landing.ilsFrequency).toBe('110.90');
  });
});

describe('handleSetIlsCourse', () => {
  it('rejects out-of-range course', () => {
    const result = handleLandingAction('set_ils_course', makeState(), '361');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('OUT_OF_RANGE');
  });

  it('sets valid ILS course', () => {
    const result = handleLandingAction('set_ils_course', makeState(), '195');
    expect(result.handled).toBe(true);
    const patch = result.success?.patch as any;
    expect(patch.landing.course).toBe(195);
  });
});

describe('handleSetFlaps (takeoff)', () => {
  it('returns handled:false when scratchpad is empty', () => {
    const result = handleLandingAction('set_flaps', makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('sets takeoff flaps and recalculates V-speeds', () => {
    const result = handleLandingAction('set_flaps', makeState(), '5');
    expect(result.handled).toBe(true);
    const patch = result.success?.patch as any;
    expect(patch.takeoff.flaps).toBe('5');
    expect(patch.takeoff.suggestedV1).toBeGreaterThan(0);
    expect(patch.takeoff.suggestedVr).toBeGreaterThan(patch.takeoff.suggestedV1);
    expect(patch.takeoff.suggestedV2).toBeGreaterThan(patch.takeoff.suggestedVr);
  });
});

describe('handleLandingAction dispatcher', () => {
  it('returns handled:false for unknown actions', () => {
    const result = handleLandingAction('unknown', makeState(), 'data');
    expect(result.handled).toBe(false);
  });
});
