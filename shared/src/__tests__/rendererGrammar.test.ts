import { describe, it, expect } from 'vitest';
import { validateDisplayGrid } from '../fmc/displayGridValidation';
import { displayDataToGrid } from '../fmc/displayGrid';
import { dispatchLskAction } from '../fmc/actionHandlers/lskDispatcher';
import { buildInitialFMCState } from '../fmc/initialState';
import { getPageRenderer } from '../fmc/pages/index';
import { getAirbusPageRenderer } from '../fmc/pages/airbus/index';
import type { FMCState } from '../types/fmc';

function state(overrides: Partial<FMCState> = {}): FMCState {
  return { ...buildInitialFMCState(), ...overrides };
}

const boeingData: Partial<FMCState> = {
  flightPlan: {
    origin: 'KJFK',
    destination: 'KDCA',
    flightNumber: 'UA123',
    route: '',
    waypoints: [
      { ident: 'KJFK', discontinuity: false },
      { ident: 'RBV', discontinuity: false },
      { ident: 'LENDY', discontinuity: false },
      { ident: 'KDCA', discontinuity: false },
    ],
  },
  performance: { crzAlt: 35000, costIndex: 30, zfw: 120000, fuel: 15000, cg: 25, reserve: 5000, grossWeight: 135000 },
  takeoff: {
    v1: 140,
    vr: 145,
    v2: 150,
    flaps: '5',
    suggestedV1: 140,
    suggestedVr: 145,
    suggestedV2: 150,
    runway: '22L',
    toMode: 'TO',
    assumedTemp: 45,
    trim: 5.0,
    oat: 15,
    windDir: 0,
    windSpeed: 0,
    qnh: 1013,
  },
  ident: { aircraftType: '737-800', engRating: 'CFM56-7B27', navDataVersion: '2501', opProgram: 'U10.8A' },
};

const airbusData: Partial<FMCState> = {
  route: { origin: 'KJFK', destination: 'KDCA', flightNumber: 'UA123' },
  flightPlan: {
    origin: 'KJFK',
    destination: 'KDCA',
    flightNumber: 'UA123',
    route: '',
    waypoints: [
      { ident: 'KJFK', discontinuity: false },
      { ident: 'KDCA', discontinuity: false },
    ],
  },
  performance: { crzAlt: 350, costIndex: 30, zfw: 120000, fuel: 15000, cg: 25, reserve: 5000, grossWeight: 135000 },
  takeoff: {
    v1: 140,
    vr: 145,
    v2: 150,
    flaps: '1',
    suggestedV1: 140,
    suggestedVr: 145,
    suggestedV2: 150,
    runway: '22L',
    toMode: 'TO',
    assumedTemp: 45,
    trim: 5.0,
    oat: 15,
    windDir: 0,
    windSpeed: 0,
    qnh: 1013,
  },
  radios: { vor1: '113.70', vor2: '108.40', adf1: ' 353' },
  ident: { aircraftType: 'A320-214', engRating: 'CFM56-5B4', navDataVersion: '2501', opProgram: 'FMS2' },
};

const rteScratchpadByAction: Record<string, string> = {
  set_origin: 'KJFK',
  set_dest: 'KDCA',
  set_co_route: 'KJFKDCA1',
  set_flt_no: 'UA123',
  set_route: 'KJFK DCT RBV DCT KDCA',
};

describe('Boeing renderer grammar conformance', () => {
  const boeingPages: string[] = ['IDENT', 'POS_INIT', 'RTE', 'DEP_ARR', 'PERF_INIT', 'TAKEOFF_REF', 'LEGS', 'PROGRESS'];

  for (const page of boeingPages) {
    it(`Boeing ${page} produces valid 24x14 grid`, () => {
      const renderer = getPageRenderer(page as any);
      if (!renderer) throw new Error(`No renderer for ${page}`);
      const data = renderer(state(boeingData));
      const grid = displayDataToGrid(data);
      const result = validateDisplayGrid(grid);
      if (!result.valid) {
        throw new Error(
          `Boeing ${page} validation failed:\n${result.issues.map((i) => `  ${i.code}: ${i.message}`).join('\n')}`,
        );
      }
    });
  }

  it('Boeing RTE emits only dispatcher-recognized LSK actions', () => {
    const renderer = getPageRenderer('RTE');
    if (!renderer) throw new Error('No renderer for RTE');

    for (const rteSubPage of [0, 1]) {
      const rendererState = state({
        ...boeingData,
        currentPage: 'RTE',
        rteSubPage,
        route: { origin: 'KJFK', destination: 'KDCA', flightNumber: 'UA123', companyRoute: '', routeString: '' },
      });
      const data = renderer(rendererState);

      for (const [slot, action] of Object.entries(data.lskActions)) {
        if (!action) continue;
        const result = dispatchLskAction({
          state: rendererState,
          action,
          scratchpad: rteScratchpadByAction[action] ?? '',
        });
        expect(result.handled, `RTE ${rteSubPage + 1}/2 ${slot} emitted unhandled action "${action}"`).toBe(true);
      }
    }
  });
});

describe('Airbus renderer grammar conformance', () => {
  const airbusPages: string[] = [
    'INIT_A',
    'INIT_B',
    'F_PLN',
    'PERF_TAKEOFF',
    'PERF_APPR',
    'PROG_A',
    'RAD_NAV',
    'FUEL_PRED',
    'SEC_FPLN',
    'DATA_INDEX',
    'MCDU_MENU',
  ];

  for (const page of airbusPages) {
    it(`Airbus ${page} produces valid 24x14 grid`, () => {
      const renderer = getAirbusPageRenderer(page as any);
      if (!renderer) throw new Error(`No renderer for ${page}`);
      const data = renderer(state(airbusData));
      const grid = displayDataToGrid(data);
      const result = validateDisplayGrid(grid);
      if (!result.valid) {
        throw new Error(
          `Airbus ${page} validation failed:\n${result.issues.map((i) => `  ${i.code}: ${i.message}`).join('\n')}`,
        );
      }
    });
  }
});
