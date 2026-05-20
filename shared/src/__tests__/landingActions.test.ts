import { describe, it, expect } from 'vitest';
import { getPatch } from '../fmc/actionHandlers/actionResult';
import { handleLandingAction } from '../fmc/actionHandlers/landingActions';
import type { FMCState } from '../types/fmc';

function makeState(overrides?: Partial<FMCState>): FMCState {
  return {
    aircraft: 'BOEING_737',
    route: {
      origin: '',
      destination: '',
      flightNumber: '',
      routeString: '',
      companyRoute: '',
      sid: null,
      star: null,
      approach: null,
      coRoute: '',
      runway: '',
    },
    flightPlan: { origin: '', destination: '', flightNumber: '', route: '', waypoints: [] },
    pendingRoute: null,
    pendingFlightPlan: null,
    performance: { crzAlt: 0, costIndex: 0, zfw: 0, fuel: 0, cg: 0, reserve: 0, grossWeight: 140000 },
    takeoff: {
      runway: '',
      toMode: 'TO',
      assumedTemp: 0,
      v1: 0,
      vr: 0,
      v2: 0,
      trim: 0,
      oat: 0,
      windDir: 0,
      windSpeed: 0,
      qnh: 0,
      suggestedV1: 0,
      suggestedVr: 0,
      suggestedV2: 0,
    },
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
    const patch = getPatch(result);
    expect(patch.landing?.qnh).toBe(1013);
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
    const patch = getPatch(result);
    expect(patch.landing?.runway).toBe('19R');
    expect(patch.route?.runway).toBe('19R');
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
    const patch = getPatch(result);
    expect(patch.landing?.flaps).toBe('40');
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
    const patch = getPatch(result);
    expect(patch.landing?.vref).toBe(135);
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
    const patch = getPatch(result);
    expect(patch.landing?.ilsFrequency).toBe('110.90');
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
    const patch = getPatch(result);
    expect(patch.landing?.course).toBe(195);
  });
});

describe('handleSetFlaps (takeoff)', () => {
  it('returns handled:false when scratchpad is empty', () => {
    const result = handleLandingAction('set_flaps', makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('sets takeoff flaps and recalculates V-speeds for Boeing', () => {
    const result = handleLandingAction('set_flaps', makeState({ aircraft: 'BOEING_737' }), '5');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.takeoff?.flaps).toBe('5');
    expect(patch.takeoff?.suggestedV1).toBeGreaterThan(0);
    expect(patch.takeoff?.suggestedVr).toBeGreaterThan(patch.takeoff?.suggestedV1 ?? 0);
    expect(patch.takeoff?.suggestedV2).toBeGreaterThan(patch.takeoff?.suggestedVr ?? 0);
  });

  it('rejects invalid Boeing takeoff flaps', () => {
    const result = handleLandingAction('set_flaps', makeState({ aircraft: 'BOEING_737' }), 'abc');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('INVALID_ENTRY');

    const resultAirbusFlap = handleLandingAction('set_flaps', makeState({ aircraft: 'BOEING_737' }), '1+F');
    expect(resultAirbusFlap.handled).toBe(true);
    expect(resultAirbusFlap.failure?.code).toBe('INVALID_ENTRY');
  });

  it('sets takeoff flaps and validates for Airbus', () => {
    const stateAirbus = makeState({ aircraft: 'AIRBUS_A320' });
    const result1 = handleLandingAction('set_flaps', stateAirbus, '1+F');
    expect(result1.handled).toBe(true);
    expect(getPatch(result1).takeoff?.flaps).toBe('1+F');

    const result2 = handleLandingAction('set_flaps', stateAirbus, '2/UP0.5');
    expect(result2.handled).toBe(true);
    expect(getPatch(result2).takeoff?.flaps).toBe('2/UP0.5');

    const resultInvalid = handleLandingAction('set_flaps', stateAirbus, '15');
    expect(resultInvalid.handled).toBe(true);
    expect(resultInvalid.failure?.code).toBe('INVALID_ENTRY');

    const resultGarbage = handleLandingAction('set_flaps', stateAirbus, 'abc');
    expect(resultGarbage.handled).toBe(true);
    expect(resultGarbage.failure?.code).toBe('INVALID_ENTRY');
  });
});

describe('handleSetLandingTemp', () => {
  it('returns handled:false when scratchpad is empty', () => {
    const result = handleLandingAction('set_landing_temp', makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('rejects invalid temperature bounds', () => {
    const resultLow = handleLandingAction('set_landing_temp', makeState(), '-51');
    expect(resultLow.handled).toBe(true);
    expect(resultLow.failure?.code).toBe('INVALID_ENTRY');

    const resultHigh = handleLandingAction('set_landing_temp', makeState(), '61');
    expect(resultHigh.handled).toBe(true);
    expect(resultHigh.failure?.code).toBe('INVALID_ENTRY');
  });

  it('sets valid landing temperature', () => {
    const result = handleLandingAction('set_landing_temp', makeState(), '25');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.landing?.temp).toBe(25);
  });
});

describe('handleSetLandingWind', () => {
  it('returns handled:false when scratchpad is empty', () => {
    const result = handleLandingAction('set_landing_wind', makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('rejects invalid wind format', () => {
    const result = handleLandingAction('set_landing_wind', makeState(), '240');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('INVALID_ENTRY');
  });

  it('rejects out of bounds wind direction or speed', () => {
    const resultDir = handleLandingAction('set_landing_wind', makeState(), '361/15');
    expect(resultDir.handled).toBe(true);
    expect(resultDir.failure?.code).toBe('INVALID_ENTRY');

    const resultSpd = handleLandingAction('set_landing_wind', makeState(), '240/151');
    expect(resultSpd.handled).toBe(true);
    expect(resultSpd.failure?.code).toBe('INVALID_ENTRY');
  });

  it('sets valid landing wind', () => {
    const result = handleLandingAction('set_landing_wind', makeState(), '240/15');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.landing?.windDir).toBe(240);
    expect(patch.landing?.windSpeed).toBe(15);
  });
});

describe('handleSetMda', () => {
  it('returns handled:false when scratchpad is empty', () => {
    const result = handleLandingAction('set_mda', makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('rejects invalid MDA bounds', () => {
    const resultLow = handleLandingAction('set_mda', makeState(), '-1');
    expect(resultLow.handled).toBe(true);
    expect(resultLow.failure?.code).toBe('INVALID_ENTRY');

    const resultHigh = handleLandingAction('set_mda', makeState(), '20001');
    expect(resultHigh.handled).toBe(true);
    expect(resultHigh.failure?.code).toBe('INVALID_ENTRY');
  });

  it('sets valid landing MDA', () => {
    const result = handleLandingAction('set_mda', makeState(), '250');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.landing?.mda).toBe(250);
  });
});

describe('handleSetDh', () => {
  it('returns handled:false when scratchpad is empty', () => {
    const result = handleLandingAction('set_dh', makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('rejects invalid DH bounds', () => {
    const resultLow = handleLandingAction('set_dh', makeState(), '-1');
    expect(resultLow.handled).toBe(true);
    expect(resultLow.failure?.code).toBe('INVALID_ENTRY');

    const resultHigh = handleLandingAction('set_dh', makeState(), '1001');
    expect(resultHigh.handled).toBe(true);
    expect(resultHigh.failure?.code).toBe('INVALID_ENTRY');
  });

  it('sets valid landing DH', () => {
    const result = handleLandingAction('set_dh', makeState(), '200');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.landing?.dh).toBe(200);
  });
});

describe('handleToggleLdgConf', () => {
  it('toggles config when scratchpad is empty', () => {
    const result = handleLandingAction('toggle_ldg_conf', makeState(), '');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.landing?.ldgConf).toBe('CONF3');
    expect(patch.landing?.flaps).toBe('CONF3');

    const stateConf3 = makeState({
      landing: { runway: '', flaps: 'CONF3', vref: 0, ilsFrequency: '', course: 0, ldgConf: 'CONF3' },
    });
    const resultToggle = handleLandingAction('toggle_ldg_conf', stateConf3, '');
    const patchToggle = resultToggle.success?.patch as any;
    expect(patchToggle.landing.ldgConf).toBe('FULL');
    expect(patchToggle.landing.flaps).toBe('FULL');
  });

  it('updates to FULL when scratchpad is FULL', () => {
    const result = handleLandingAction('toggle_ldg_conf', makeState(), 'FULL');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.landing?.ldgConf).toBe('FULL');
    expect(patch.landing?.flaps).toBe('FULL');
  });

  it('updates to CONF3 when scratchpad is 3 or CONF3', () => {
    const result1 = handleLandingAction('toggle_ldg_conf', makeState(), '3');
    expect(result1.handled).toBe(true);
    expect((result1.success?.patch as any).landing.ldgConf).toBe('CONF3');

    const result2 = handleLandingAction('toggle_ldg_conf', makeState(), 'CONF3');
    expect(result2.handled).toBe(true);
    expect((result2.success?.patch as any).landing.ldgConf).toBe('CONF3');
  });

  it('rejects invalid scratchpad input', () => {
    const result = handleLandingAction('toggle_ldg_conf', makeState(), 'INVALID');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('INVALID_ENTRY');
  });
});

describe('handleLandingAction dispatcher', () => {
  it('returns handled:false for unknown actions', () => {
    const result = handleLandingAction('unknown', makeState(), 'data');
    expect(result.handled).toBe(false);
  });
});
