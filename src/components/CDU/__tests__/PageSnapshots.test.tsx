import { describe, it, expect } from 'vitest';
import { getPageRenderer, getAirbusPageRenderer, gridToPlainText, displayDataToGrid } from '@shared';
import type { FMCState } from '@shared';

const mockState: FMCState = {
  aircraft: 'BOEING_737',
  page: 'IDENT',
  currentPage: 'IDENT',
  scratchpad: '',
  scratchpadError: null,
  scratchpadMessages: [],
  alerts: [],
  ident: { aircraftType: '737-800', engRating: '26K', navDataVersion: 'FMC21A1', opProgram: '2247662-03' },
  position: {
    refAirport: '',
    gate: '',
    lat: 0,
    lon: 0,
    irsState: 'OFF',
    irsAlignmentProgress: 0,
    irsTimeRemaining: 600,
  },
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
  navPerformance: {
    anp: 2.0,
    rnp: 2.0,
    anpNm: 2.0,
    rnpNm: 2.0,
    rnpManual: false,
    activeSource: 'IRS',
    phase: 'ENROUTE',
  },
  legsPageIndex: 0,
  legsPageCount: 1,
  rteSubPage: 0,
  takeoffRefPageIndex: 0,
  posPageIndex: 0,
  radios: { vor1: '113.90', vor2: '115.70', adf1: '342' },
  efisL: { mode: 'MAP', range: 40, overlays: {}, centered: false, side: 'L' },
  efisR: { mode: 'MAP', range: 40, overlays: {}, centered: false, side: 'R' },
  autopilot: {
    truth: {
      lateralActive: 'OFF',
      verticalActive: 'OFF',
      thrustActive: 'OFF',
      autopilotStatus: 'OFF',
      lastModeChangeTimestamps: { thrust: 0, lateral: 0, vertical: 0 },
    },
  },
  fix: { refFix: '', radial: 0, distance: 0 },
  fixEntries: [],
  hold: { fix: '', inboundCourse: 0, legTime: 1.0, legDist: 0, direction: 'R' },
  holdPending: null,
  isModified: false,
  execLit: false,
} as any;

describe('Page Snapshots', () => {
  const boeingPages = ['IDENT', 'POS_INIT', 'RTE', 'LEGS', 'PROGRESS', 'MENU', 'FIX', 'HOLD'];
  const airbusPages = ['INIT_A', 'INIT_B', 'F_PLN', 'PROG_A', 'PERF_TAKEOFF', 'RAD_NAV', 'MCDU_MENU'];

  boeingPages.forEach((page) => {
    it(`Boeing ${page} matches snapshot`, () => {
      const renderer = getPageRenderer(page as any);
      if (!renderer) throw new Error(`No renderer for ${page}`);
      const data = renderer({ ...mockState, aircraft: 'BOEING_737', currentPage: page as any });
      const grid = displayDataToGrid(data);
      const text = gridToPlainText(grid);

      expect(text.split('\n')).toHaveLength(14);
      text.split('\n').forEach((line: string) => expect(line).toHaveLength(24));

      expect(text).toMatchSnapshot();
    });
  });

  airbusPages.forEach((page) => {
    it(`Airbus ${page} matches snapshot`, () => {
      const renderer = getAirbusPageRenderer(page as any);
      if (!renderer) throw new Error(`No renderer for ${page}`);
      const data = renderer({ ...mockState, aircraft: 'AIRBUS_A320', currentPage: page as any });
      const grid = displayDataToGrid(data);
      const text = gridToPlainText(grid);

      expect(text.split('\n')).toHaveLength(14);
      text.split('\n').forEach((line: string) => expect(line).toHaveLength(24));

      expect(text).toMatchSnapshot();
    });
  });
});
