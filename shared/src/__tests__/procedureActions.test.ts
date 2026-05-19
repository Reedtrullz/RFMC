import { describe, it, expect } from 'vitest';
import { getPatch } from '../fmc/actionHandlers/actionResult';
import { handleProcedureAction } from '../fmc/actionHandlers/procedureActions';
import type { FMCState } from '../types/fmc';

function makeState(overrides?: Partial<FMCState>): FMCState {
  return {
    aircraft: 'BOEING_737',
    route: {
      origin: 'KJFK',
      destination: 'KDCA',
      flightNumber: 'AAL123',
      routeString: '',
      companyRoute: '',
      sid: null,
      star: null,
      approach: null,
      coRoute: '',
      runway: '',
    },
    flightPlan: { origin: 'KJFK', destination: 'KDCA', flightNumber: 'AAL123', route: '', waypoints: [] },
    pendingRoute: null,
    pendingFlightPlan: null,
    performance: { crzAlt: 0, costIndex: 0, zfw: 0, fuel: 0, cg: 0, reserve: 0, grossWeight: 0 },
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
    },
    landing: { runway: '', flaps: '', vref: 0, ilsFrequency: '', course: 0 },
    ...overrides,
  } as FMCState;
}

describe('handleSetSid', () => {
  it('returns handled:false when scratchpad is empty', () => {
    const result = handleProcedureAction('set_sid', makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('sets SID on pending route', () => {
    const result = handleProcedureAction('set_sid', makeState(), 'LENDY8');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.pendingRoute?.sid).toBe('LENDY8');
    expect(patch.isModified).toBe(true);
    expect(patch.execLit).toBe(true);
    expect(patch.pendingRoute?.origin).toBe('KJFK');
    expect(result.success?.sideEffect).toBe('expand_active_route');
  });

  it('falls back to active route when pending is null', () => {
    const state = makeState({ pendingRoute: null });
    const result = handleProcedureAction('set_sid', state, 'LENDY8');
    const patch = getPatch(result);
    expect(patch.pendingRoute?.origin).toBe('KJFK');
    expect(patch.pendingRoute?.destination).toBe('KDCA');
    expect(patch.pendingRoute?.sid).toBe('LENDY8');
  });
});

describe('handleSetRwy', () => {
  it('returns handled:false when scratchpad is empty', () => {
    const result = handleProcedureAction('set_rwy', makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('returns failure for too-short runway', () => {
    const result = handleProcedureAction('set_rwy', makeState(), 'R');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('INVALID_ENTRY');
  });

  it('sets runway on pending route', () => {
    const result = handleProcedureAction('set_rwy', makeState(), '31L');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.pendingRoute?.runway).toBe('31L');
    expect(patch.isModified).toBe(true);
    expect(patch.execLit).toBe(true);
  });
});

describe('handleSetStar', () => {
  it('sets STAR on pending route', () => {
    const result = handleProcedureAction('set_star', makeState(), 'BGGLO3');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.pendingRoute?.star).toBe('BGGLO3');
    expect(result.success?.sideEffect).toBe('expand_active_route');
  });

  it('returns handled:false when scratchpad is empty', () => {
    const result = handleProcedureAction('set_star', makeState(), '');
    expect(result.handled).toBe(false);
  });
});

describe('handleSetAppr', () => {
  it('sets approach on pending route', () => {
    const result = handleProcedureAction('set_appr', makeState(), 'ILS19');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.pendingRoute?.approach).toBe('ILS19');
    expect(result.success?.sideEffect).toBe('expand_active_route');
  });

  it('returns handled:false when scratchpad is empty', () => {
    const result = handleProcedureAction('set_appr', makeState(), '');
    expect(result.handled).toBe(false);
  });
});

describe('handleProcedureAction dispatcher', () => {
  it('returns handled:false for unknown actions', () => {
    const result = handleProcedureAction('unknown', makeState(), 'data');
    expect(result.handled).toBe(false);
  });
});
