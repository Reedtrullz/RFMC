import { describe, expect, it } from 'vitest';
import { renderInitA, renderPerfTakeoff } from '../fmc/pages/airbus';
import type { FMCState } from '../types/fmc';

const baseState: FMCState = {
  aircraft: 'AIRBUS_A320',
  currentPage: 'INIT_A',
  pageHistory: [],
  scratchpad: '',
  scratchpadError: null,
  ident: { aircraftType: 'A320neo', engRating: 'LEAP', navDataVersion: 'AIRAC', opProgram: 'FMGS' },
  position: { refAirport: '', gate: '' },
  performance: { crzAlt: 35000, costIndex: 50, zfw: 60000, fuel: 8000, cg: 25, reserve: 0 },
  takeoff: { runway: '', toMode: 'TO', assumedTemp: 0, v1: 130, vr: 135, v2: 140, trim: 0, oat: 0, windDir: 0, windSpeed: 0, qnh: 0, flaps: 'CONF2', flexTemp: 55 },
  route: { origin: 'KJFK', destination: 'KDCA', flightNumber: 'AF123', companyRoute: '', routeString: '' },
  flightPlan: { origin: 'KJFK', destination: 'KDCA', flightNumber: 'AF123', route: '', waypoints: [] },
  isModified: false,
  execLit: false,
  msgLight: false,
  mode: 'STANDBY',
  connectionStatus: 'DISCONNECTED',
  connectionMode: 'STANDALONE',
  connectedAircraft: null,
  connectedAircraftType: null,
  connectedCapabilities: null,
  lastError: null,
  simVariables: {},
  failureMessage: null,
  externalDisplayData: null,
  hold: { fix: '', inboundCourse: 0, legTime: 1.0, legDist: 0, direction: 'R' },
  holdPending: null,
  fix: { refFix: '', radial: 0, distance: 0 },
  legsPageIndex: 0,
  legsPageCount: 1,
  depArrSubPage: 'DEP',
  rteSubPage: 0,
  deleteMode: false,
  editWaypointIndex: null,
  aircraftState: null,
};

describe('Airbus page semantics', () => {
  it('tags INIT A title, labels, and modifiable fields', () => {
    const data = renderInitA(baseState);
    expect(data.lines[0]).toMatchObject({ semantic: 'title', inverse: true });
    expect(data.lines.find(l => l.text.includes('FROM/TO'))?.semantic).toBe('label');
    expect(data.lines.find(l => l.text.includes('KJFK/KDCA'))?.semantic).toBe('guidance');
  });

  it('tags active and guidance fields on PERF TAKEOFF', () => {
    const data = renderPerfTakeoff(baseState);
    expect(data.lines.find(l => l.text.includes('5000'))?.semantic).toBe('activeData');
    expect(data.lines.find(l => l.text.includes('CONF2'))?.semantic).toBe('guidance');
  });
});
