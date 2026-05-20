import { describe, expect, it } from 'vitest';
import { renderFuelPredGrid } from '../fmc/pages/airbus/fuelPred.grid';
import { renderSecFplnGrid } from '../fmc/pages/airbus/secFpln.grid';
import { renderDataIndexGrid } from '../fmc/pages/airbus/dataIndex.grid';
import { renderMcduMenuGrid } from '../fmc/pages/airbus/mcduMenu.grid';
import { renderDepArrA320Grid } from '../fmc/pages/airbus/depArr.grid';
import { renderProgGrid } from '../fmc/pages/airbus/prog.grid';
import { renderRadNavGrid } from '../fmc/pages/airbus/radNav.grid';
import type { FMCState, DisplayData } from '../types/fmc';

function createMinimalState(overrides: Partial<FMCState> = {}): FMCState {
  return {
    route: {
      origin: 'KJFK',
      destination: 'KDCA',
      alternate: 'KATL',
      sid: 'JFK6',
      runway: '04L',
      star: 'LENDY8',
      approach: 'ILS04L',
      flightNumber: '1234',
      companyRoute: '',
      routeString: '',
      departureTime: null,
    },
    performance: {
      fuel: 12500,
      zfw: 55000,
      cg: 25.0,
      reserves: 2500,
      costIndex: 35,
      crzAlt: 35000,
      v1: 142,
      vr: 145,
      v2: 155,
    },
    flightPlan: { waypoints: [] },
    pendingRoute: null,
    pendingFlightPlan: null,
    isModified: false,
    title: '',
    pageIndicator: '',
    radios: { vor1: '115.30', vor2: '112.50', adf1: '350.0' },
    navPerformance: {
      anpNm: 0.5,
      anp: 0.5,
      rnpNm: 1.0,
      rnp: 1.0,
      rnpManual: false,
      activeSource: 'GPS',
      phase: 'ENROUTE',
      xteNm: 0.1,
    },
    ident: { aircraftType: 'A320', navDataVersion: 'OCT24', opProgram: 'BP0101', engRating: '26K' },
    takeoff: { flaps: '1+F', trim: 'UP0.0', flexTemp: null, v1: null, vr: null, v2: null },
    position: { lat: 40.64, lon: -73.78, irsState: 'NAV', irsTimeRemaining: 0 },
    ...overrides,
  } as unknown as FMCState;
}

function checkPageStructure(result: DisplayData) {
  expect(result).toBeDefined();
  expect(result).toHaveProperty('segments');
  expect(result).toHaveProperty('lskActions');
  expect(Array.isArray(result.segments)).toBe(true);
  expect(typeof result.lskActions).toBe('object');
}

function checkSegment(result: DisplayData, row: number, col: number, textMatch: string | RegExp, color?: string) {
  const seg = result.segments!.find((s) => s.row === row && s.col === col);
  expect(seg).toBeDefined();
  if (typeof textMatch === 'string') {
    expect(seg!.text).toBe(textMatch);
  } else {
    expect(seg!.text).toMatch(textMatch);
  }
  if (color) {
    expect(seg!.color).toBe(color);
  }
}

describe('Airbus Grid Pages', () => {
  describe('renderFuelPredGrid', () => {
    it('returns valid DisplayData structure', () => {
      const state = createMinimalState();
      const result = renderFuelPredGrid(state);
      checkPageStructure(result);
    });

    it('displays title row', () => {
      const state = createMinimalState();
      const result = renderFuelPredGrid(state);
      checkSegment(result, 0, 2, 'FUEL PRED', 'white');
    });

    it('displays origin/destination', () => {
      const state = createMinimalState();
      const result = renderFuelPredGrid(state);
      checkSegment(result, 1, 1, 'KJFK / KDCA');
    });

    it('displays FOB value', () => {
      const state = createMinimalState();
      const result = renderFuelPredGrid(state);
      checkSegment(result, 2, 18, '12.5 T');
    });

    it('displays EXTRA value in magenta', () => {
      const state = createMinimalState();
      state.performance.fuel = 12500;
      const result = renderFuelPredGrid(state);
      checkSegment(result, 4, 1, ' 7.5', 'magenta');
    });

    it('displays MIN DEST FOB', () => {
      const state = createMinimalState();
      const result = renderFuelPredGrid(state);
      checkSegment(result, 5, 1, 'MIN DEST FOB');
    });

    it('displays ALTN airport', () => {
      const state = createMinimalState();
      const result = renderFuelPredGrid(state);
      checkSegment(result, 8, 1, '   KATL');
    });

    it('handles missing fuel data with fallbacks', () => {
      const state = createMinimalState({ performance: {} as typeof state.performance });
      const result = renderFuelPredGrid(state);
      checkSegment(result, 2, 18, '---.- T');
      checkSegment(result, 4, 1, ' 0.0', 'magenta');
      checkSegment(result, 10, 18, '--.-');
    });

    it('uses shared performance prediction for route-based extra fuel', () => {
      const state = createMinimalState({
        route: {
          ...createMinimalState().route,
          origin: 'EHAM',
          destination: 'EGLL',
          alternate: 'EGKK',
        },
        performance: {
          ...createMinimalState().performance,
          fuel: 12500,
          reserve: 2500,
          zfw: 55000,
          grossWeight: 67500,
          crzAlt: 35000,
          costIndex: 35,
        },
        flightPlan: {
          origin: 'EHAM',
          destination: 'EGLL',
          route: 'LON',
          flightNumber: 'BA123',
          waypoints: [
            { ident: 'EHAM', lat: 52.3086, lon: 4.7639, discontinuity: false },
            { ident: 'LON', lat: 51.487, lon: -0.466, discontinuity: false },
            { ident: 'EGLL', lat: 51.47, lon: -0.4543, discontinuity: false },
          ],
        },
        aircraftState: {
          lat: 52.3086,
          lon: 4.7639,
          altitude: 0,
          altitudeFt: 0,
          heading: 240,
          headingDeg: 240,
          track: 240,
          trackDeg: 240,
          ias: 0,
          indicatedAirspeedKt: 0,
          tas: 0,
          gs: 0,
          verticalSpeedFpm: 0,
          vs: 0,
          fuelTotal: 12500,
          gw: 67500,
        },
      });

      const result = renderFuelPredGrid(state);

      checkSegment(result, 1, 1, 'EHAM / EGLL', 'green');
      checkSegment(result, 4, 1, /^ \d+\.\d$/, 'green');
      checkSegment(result, 6, 1, ' 2.5', 'green');
      checkSegment(result, 10, 18, '2.5', 'green');
    });
  });

  describe('renderSecFplnGrid', () => {
    it('returns valid DisplayData structure', () => {
      const state = createMinimalState();
      const result = renderSecFplnGrid(state);
      checkPageStructure(result);
    });

    it('displays title with page indicator', () => {
      const state = createMinimalState();
      const result = renderSecFplnGrid(state);
      checkSegment(result, 0, 2, 'SEC F-PLN', 'white');
      checkSegment(result, 0, 20, '1/1', 'white');
    });

    it('displays COPY ACTIVE', () => {
      const state = createMinimalState();
      const result = renderSecFplnGrid(state);
      checkSegment(result, 1, 1, 'COPY ACTIVE');
    });

    it('displays FROM/TO with origin and destination', () => {
      const state = createMinimalState();
      const result = renderSecFplnGrid(state);
      checkSegment(result, 4, 1, ' KJFK/KDCA', 'magenta');
    });

    it('binds L1 to copy_active', () => {
      const state = createMinimalState();
      const result = renderSecFplnGrid(state);
      expect(result.lskActions!.L1).toBe('copy_active');
    });

    it('handles missing route data', () => {
      const state = createMinimalState({ route: {} as typeof state.route });
      const result = renderSecFplnGrid(state);
      checkSegment(result, 4, 1, ' ----/----', 'magenta');
    });

    it('uses pendingRoute when isModified', () => {
      const state = createMinimalState({
        isModified: true,
        pendingRoute: { origin: 'KLAX', destination: 'KSFO' } as typeof state.route,
      });
      const result = renderSecFplnGrid(state);
      checkSegment(result, 4, 1, ' KLAX/KSFO', 'magenta');
    });

    it('displays ACTIVATE SEC and ERASE SEC when secondary flight plan is present', () => {
      const state = createMinimalState({
        isModified: true,
        pendingRoute: { origin: 'KLAX', destination: 'KSFO' } as typeof state.route,
      });
      const result = renderSecFplnGrid(state);
      checkSegment(result, 1, 0, '<ACTIVATE SEC', 'white');
      checkSegment(result, 3, 0, '<ERASE SEC', 'white');
      expect(result.lskActions!.L1).toBe('activate_sec');
      expect(result.lskActions!.L2).toBe('erase');
    });
  });

  describe('renderDataIndexGrid', () => {
    it('returns valid DisplayData structure', () => {
      const state = createMinimalState();
      const result = renderDataIndexGrid(state);
      checkPageStructure(result);
    });

    it('displays title with INDEX page indicator', () => {
      const state = createMinimalState();
      const result = renderDataIndexGrid(state);
      checkSegment(result, 0, 2, 'DATA', 'white');
      checkSegment(result, 0, 18, 'INDEX', 'white');
    });

    it('displays all 8 menu items', () => {
      const state = createMinimalState();
      const result = renderDataIndexGrid(state);
      const items = [
        'A/C STATUS',
        'POSITION MONITOR',
        'IRS MONITOR',
        'GPS MONITOR',
        'WAYPOINTS',
        'NAVAIDS',
        'RUNWAYS',
        'ROUTES',
      ];
      items.forEach((item, i) => {
        checkSegment(result, i + 1, 1, item);
      });
    });

    it('binds L1 to ac_status', () => {
      const state = createMinimalState();
      const result = renderDataIndexGrid(state);
      expect(result.lskActions!.L1).toBe('ac_status');
    });
  });

  describe('renderMcduMenuGrid', () => {
    it('returns valid DisplayData structure', () => {
      const state = createMinimalState();
      const result = renderMcduMenuGrid(state);
      checkPageStructure(result);
    });

    it('displays MCDU MENU title', () => {
      const state = createMinimalState();
      const result = renderMcduMenuGrid(state);
      checkSegment(result, 0, 2, 'MCDU MENU', 'white');
    });

    it('displays all four system entries in magenta', () => {
      const state = createMinimalState();
      const result = renderMcduMenuGrid(state);
      checkSegment(result, 1, 0, '< FMGC', 'magenta');
      checkSegment(result, 3, 0, '< ATSU', 'magenta');
      checkSegment(result, 5, 0, '< AIDS', 'magenta');
      checkSegment(result, 7, 0, '< CFDS', 'magenta');
    });

    it('displays SELECT labels in green', () => {
      const state = createMinimalState();
      const result = renderMcduMenuGrid(state);
      checkSegment(result, 2, 1, ' SELECT', 'green');
      checkSegment(result, 4, 1, ' SELECT', 'green');
      checkSegment(result, 6, 1, ' SELECT', 'green');
      checkSegment(result, 8, 1, ' SELECT', 'green');
    });

    it('binds L1 to f_pln and L2 to atsu', () => {
      const state = createMinimalState();
      const result = renderMcduMenuGrid(state);
      expect(result.lskActions!.L1).toBe('f_pln');
      expect(result.lskActions!.L2).toBe('atsu');
    });
  });

  describe('renderDepArrA320Grid', () => {
    it('returns valid DisplayData structure', () => {
      const state = createMinimalState();
      const result = renderDepArrA320Grid(state);
      checkPageStructure(result);
    });

    it('shows DEP/ARR title with origin/destination', () => {
      const state = createMinimalState();
      const result = renderDepArrA320Grid(state);
      checkSegment(result, 0, 2, /DEP\/ARR.*KJFK.*KDCA/, 'white');
    });

    it('shows DEPARTURE section and origin', () => {
      const state = createMinimalState();
      const result = renderDepArrA320Grid(state);
      checkSegment(result, 1, 1, ' DEPARTURE');
      checkSegment(result, 2, 1, ' KJFK', 'green');
    });

    it('shows SID with LSK arrow and value', () => {
      const state = createMinimalState();
      const result = renderDepArrA320Grid(state);
      checkSegment(result, 3, 0, '<', 'white');
      checkSegment(result, 3, 2, 'SID', 'white');
      checkSegment(result, 4, 3, ' JFK6', 'magenta');
    });

    it('shows RWY with LSK arrow and value', () => {
      const state = createMinimalState();
      const result = renderDepArrA320Grid(state);
      checkSegment(result, 5, 2, 'RWY', 'white');
      checkSegment(result, 6, 3, ' 04L', 'magenta');
    });

    it('shows ARRIVAL section and destination', () => {
      const state = createMinimalState();
      const result = renderDepArrA320Grid(state);
      checkSegment(result, 7, 1, ' ARRIVAL');
      checkSegment(result, 8, 1, ' KDCA', 'green');
    });

    it('shows STAR and Approach', () => {
      const state = createMinimalState();
      const result = renderDepArrA320Grid(state);
      checkSegment(result, 9, 2, 'STAR', 'white');
      checkSegment(result, 10, 3, ' LENDY8', 'magenta');
      checkSegment(result, 11, 2, 'APPR', 'white');
      checkSegment(result, 12, 3, ' ILS04L', 'magenta');
    });

    it('handles missing route data with ----/NONE fallbacks', () => {
      const state = createMinimalState({ route: {} as typeof state.route });
      const result = renderDepArrA320Grid(state);
      checkSegment(result, 2, 1, ' ----', 'green');
      checkSegment(result, 4, 3, ' NONE', 'magenta');
      checkSegment(result, 6, 3, ' ----', 'magenta');
      checkSegment(result, 10, 3, ' NONE', 'magenta');
    });

    it('shows TMPY DEP/ARR when isModified', () => {
      const state = createMinimalState({
        isModified: true,
        pendingRoute: { origin: 'KLAX', destination: 'KSFO' } as typeof state.route,
      });
      const result = renderDepArrA320Grid(state);
      checkSegment(result, 0, 2, /TMPY DEP\/ARR/, 'white');
    });

    it('binds correct LSK actions', () => {
      const state = createMinimalState();
      const result = renderDepArrA320Grid(state);
      expect(result.lskActions!.L2).toBe('set_sid');
      expect(result.lskActions!.L3).toBe('set_rwy');
      expect(result.lskActions!.L5).toBe('set_star');
      expect(result.lskActions!.L6).toBe('set_appr');
    });
  });

  describe('renderProgGrid', () => {
    it('returns valid DisplayData structure', () => {
      const state = createMinimalState();
      const result = renderProgGrid(state);
      checkPageStructure(result);
    });

    it('displays PROG title at row 0', () => {
      const state = createMinimalState();
      const result = renderProgGrid(state);
      checkSegment(result, 0, 2, 'PROG', 'white');
    });

    it('displays origin and destination at row 1', () => {
      const state = createMinimalState();
      const result = renderProgGrid(state);
      checkSegment(result, 1, 1, 'KJFK / KDCA');
    });

    it('displays CRZ FL label and FL value', () => {
      const state = createMinimalState();
      const result = renderProgGrid(state);
      checkSegment(result, 2, 0, 'CRZ FL', 'white');
      checkSegment(result, 2, 19, 'FL350', 'white');
    });

    it('displays OPT FL and REC MAX FL labels', () => {
      const state = createMinimalState();
      const result = renderProgGrid(state);
      checkSegment(result, 3, 0, 'OPT FL', 'white');
      checkSegment(result, 4, 0, 'REC MAX FL', 'white');
    });

    it('displays DIST, ETA, EFOB with value placeholders', () => {
      const state = createMinimalState();
      const result = renderProgGrid(state);
      checkSegment(result, 5, 0, 'DIST', 'white');
      checkSegment(result, 5, 17, '---- NM', 'white');
      checkSegment(result, 6, 0, 'ETA', 'white');
      checkSegment(result, 6, 19, '----Z', 'white');
      checkSegment(result, 7, 0, 'EFOB', 'white');
      checkSegment(result, 7, 19, '---.-', 'white');
    });

    it('displays DIST and EFOB from shared LNAV and performance predictions when route data is available', () => {
      const state = createMinimalState({
        flightPlan: {
          origin: 'EHAM',
          destination: 'EGLL',
          flightNumber: 'BA123',
          route: 'LON',
          waypoints: [
            { ident: 'EHAM', lat: 52.3086, lon: 4.7639, discontinuity: false },
            { ident: 'LON', lat: 51.4872, lon: -0.4667, discontinuity: false },
            { ident: 'EGLL', lat: 51.47, lon: -0.4543, discontinuity: false },
          ],
        },
        route: {
          origin: 'EHAM',
          destination: 'EGLL',
          flightNumber: 'BA123',
          routeString: 'LON',
        } as any,
        performance: {
          crzAlt: 35000,
          costIndex: 35,
          zfw: 55000,
          fuel: 12500,
          cg: 25,
          reserve: 2500,
          grossWeight: 67500,
        } as any,
        aircraftState: {
          lat: 52.3086,
          lon: 4.7639,
          altitude: 0,
          altitudeFt: 0,
          heading: 240,
          headingDeg: 240,
          track: 240,
          trackDeg: 240,
          ias: 0,
          indicatedAirspeedKt: 0,
          tas: 0,
          gs: 0,
          verticalSpeedFpm: 0,
          vs: 0,
          fuelTotal: 12500,
          gw: 67500,
        },
      });

      const result = renderProgGrid(state);

      checkSegment(result, 1, 1, 'EHAM / EGLL');
      expect(result.segments!.find((s) => s.row === 5 && s.col === 17)?.text).toMatch(/\d+ NM/);
      expect(result.segments!.find((s) => s.row === 7 && s.col === 19)?.text).toMatch(/\d+\.\d/);
    });

    it('displays WIND label and wind data placeholder', () => {
      const state = createMinimalState();
      const result = renderProgGrid(state);
      checkSegment(result, 8, 0, 'WIND', 'white');
      checkSegment(result, 9, 1, '---°/---');
    });

    it('renders NAV ACCUR section with REQUIRED label', () => {
      const state = createMinimalState();
      const result = renderProgGrid(state);
      checkSegment(result, 10, 0, 'NAV ACCUR', 'white');
      const requiredSeg = result.segments!.find((s) => s.row === 10 && s.text === 'REQUIRED');
      expect(requiredSeg).toBeDefined();
      expect(requiredSeg!.color).toBe('white');
    });

    it('renders ACTUAL label with HIGH accuracy and RNP value', () => {
      const state = createMinimalState();
      const result = renderProgGrid(state);
      checkSegment(result, 11, 0, 'ACTUAL', 'white');
      checkSegment(result, 11, 8, 'HIGH', 'green');
      checkSegment(result, 11, 18, '1.00', 'amber');
    });

    it('shows LOW accuracy when ANP exceeds RNP', () => {
      const state = createMinimalState({
        navPerformance: {
          anpNm: 3.5,
          rnpNm: 1.0,
          anp: 3.5,
          rnp: 1.0,
          rnpManual: false,
          activeSource: 'GPS',
          phase: 'ENROUTE',
          xteNm: 1,
        },
      });
      const result = renderProgGrid(state);
      checkSegment(result, 11, 8, 'LOW', 'green');
    });

    it('uses ---- for missing origin/destination', () => {
      const state = createMinimalState({ route: {} as typeof state.route });
      const result = renderProgGrid(state);
      checkSegment(result, 1, 1, '---- / ----');
    });

    it('has no LSK actions', () => {
      const state = createMinimalState();
      const result = renderProgGrid(state);
      const allActions = Object.values(result.lskActions || {});
      const hasActions = allActions.some((a: any) => a !== null);
      expect(hasActions).toBe(false);
    });
  });

  describe('renderRadNavGrid', () => {
    it('returns valid DisplayData structure', () => {
      const state = createMinimalState();
      const result = renderRadNavGrid(state);
      checkPageStructure(result);
    });

    it('displays RAD NAV title at row 0', () => {
      const state = createMinimalState();
      const result = renderRadNavGrid(state);
      checkSegment(result, 0, 2, 'RAD NAV', 'white');
    });

    it('displays VOR1/FREQ label and selectable frequency', () => {
      const state = createMinimalState();
      const result = renderRadNavGrid(state);
      checkSegment(result, 1, 1, 'VOR1/FREQ', 'white');
      checkSegment(result, 2, 0, '<', 'magenta');
      checkSegment(result, 2, 2, / --- \/ 115.30/, 'magenta');
    });

    it('displays VOR2/FREQ label and selectable frequency', () => {
      const state = createMinimalState();
      const result = renderRadNavGrid(state);
      checkSegment(result, 3, 1, 'VOR2/FREQ', 'white');
      checkSegment(result, 4, 0, '<', 'magenta');
      checkSegment(result, 4, 2, / --- \/ 112.50/, 'magenta');
    });

    it('displays ADF1/FREQ label and selectable frequency', () => {
      const state = createMinimalState();
      const result = renderRadNavGrid(state);
      checkSegment(result, 5, 1, 'ADF1/FREQ', 'white');
      checkSegment(result, 6, 0, '<', 'magenta');
      checkSegment(result, 6, 2, / 350.0/, 'magenta');
    });

    it('binds LSK actions for all three radios', () => {
      const state = createMinimalState();
      const result = renderRadNavGrid(state);
      expect(result.lskActions!.L1).toBe('set_vor1');
      expect(result.lskActions!.L2).toBe('set_vor2');
      expect(result.lskActions!.L3).toBe('set_adf1');
    });

    it('uses guidance semantic on selectable fields', () => {
      const state = createMinimalState();
      const result = renderRadNavGrid(state);
      const prompts = result.segments!.filter((s) => s.text === '<');
      expect(prompts).toHaveLength(3);
      for (const p of prompts) {
        expect(p.semantic).toBe('guidance');
      }
    });
  });
});
