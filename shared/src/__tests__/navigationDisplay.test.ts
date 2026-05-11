import { describe, expect, it } from 'vitest';
import type { FMCState } from '../types/fmc';
import { buildNavigationDisplayModel } from '../fmc/navigationDisplay';

const baseState: FMCState = {
  aircraft: 'BOEING_737',
  currentPage: 'IDENT',
  pageHistory: [],
  scratchpad: '',
  scratchpadError: null,
  ident: { aircraftType: '737-800', engRating: '26K', navDataVersion: 'FMC21A1', opProgram: '2247662-03' },
  position: { refAirport: '', gate: '' },
  performance: { crzAlt: 0, costIndex: 0, zfw: 0, fuel: 0, cg: 0, reserve: 0 },
  takeoff: { runway: '', toMode: 'TO', assumedTemp: 0, v1: 0, vr: 0, v2: 0, trim: 0, oat: 0, windDir: 0, windSpeed: 0, qnh: 0 },
  landing: { runway: '', flaps: '', vref: 0, ilsFrequency: '', course: 0 },
  route: { origin: '', destination: '', flightNumber: '', companyRoute: '', routeString: '' },
  flightPlan: { origin: '', destination: '', flightNumber: '', route: '', waypoints: [] },
  isModified: false,
  execLit: false,
  msgLight: false,
  mode: 'STANDBY',
  connectionStatus: 'DISCONNECTED',
  connectionMode: 'STANDALONE',
  connectedAircraft: null,
  connectedAircraftType: null,
  connectedCapabilities: [],
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
  takeoffRefPageIndex: 0,
  deleteMode: false,
  editWaypointIndex: null,
  aircraftState: null,
};

describe('Navigation Display model', () => {
  it('projects route waypoints into display points and segments', () => {
    const model = buildNavigationDisplayModel({
      ...baseState,
      flightPlan: {
        origin: 'KJFK',
        destination: 'KDCA',
        flightNumber: '',
        route: 'KJFK DCT RBV DIXIE KDCA',
        waypoints: [
          { ident: 'RBV', discontinuity: false },
          { ident: 'DIXIE', discontinuity: false },
          { ident: 'KDCA', discontinuity: false },
        ],
      },
    });

    expect(model.routePoints.map(point => point.label)).toEqual(['KJFK', 'RBV', 'DIXIE', 'KDCA']);
    expect(model.routeSegments).toHaveLength(3);
    expect(model.routePoints[1].active).toBe(true);
  });

  it('preserves route discontinuities as dashed ND segments', () => {
    const model = buildNavigationDisplayModel({
      ...baseState,
      flightPlan: {
        origin: 'KJFK',
        destination: 'KDCA',
        flightNumber: '',
        route: '',
        waypoints: [
          { ident: 'RBV', discontinuity: false },
          { ident: 'DISCONTINUITY', discontinuity: true },
          { ident: 'KDCA', discontinuity: false },
        ],
      },
    });

    expect(model.routePoints.some(point => point.discontinuity)).toBe(true);
    expect(model.routeSegments.some(segment => segment.dashed)).toBe(true);
  });

  it('creates hold and fix overlays from FMC state', () => {
    const model = buildNavigationDisplayModel({
      ...baseState,
      flightPlan: {
        origin: 'KJFK',
        destination: 'KDCA',
        flightNumber: '',
        route: '',
        waypoints: [{ ident: 'RBV', discontinuity: false }],
      },
      hold: { fix: 'RBV', inboundCourse: 270, legTime: 1.5, legDist: 0, direction: 'L' },
      fix: { refFix: 'RBV', radial: 180, distance: 20 },
    });

    expect(model.holdOverlay).toMatchObject({ fix: 'RBV', inboundCourse: 270, direction: 'L' });
    expect(model.fixOverlay).toMatchObject({ refFix: 'RBV', radial: 180, distance: 20 });
  });

  it('formats speed and altitude constraints on route points', () => {
    const model = buildNavigationDisplayModel({
      ...baseState,
      flightPlan: {
        origin: 'KJFK',
        destination: 'KDCA',
        flightNumber: '',
        route: '',
        waypoints: [
          {
            ident: 'RBV',
            discontinuity: false,
            speedConstraint: { type: 'AT', speed: 250 },
            altitudeConstraint: { type: 'AT_OR_ABOVE', altitude: 10000 },
          },
          {
            ident: 'DIXIE',
            discontinuity: false,
            altitudeConstraint: { type: 'AT', altitude: 18000 },
          },
        ],
      },
    });

    expect(model.routePoints.find(point => point.label === 'RBV')).toMatchObject({
      speedLabel: '250',
      altitudeLabel: '10000A',
    });
    expect(model.routePoints.find(point => point.label === 'DIXIE')?.altitudeLabel).toBe('FL180');
  });

  it('uses direct-to route state as the active ND target', () => {
    const model = buildNavigationDisplayModel({
      ...baseState,
      route: { ...baseState.route, directTo: 'DIXIE' },
      flightPlan: {
        origin: 'KJFK',
        destination: 'KDCA',
        flightNumber: '',
        route: '',
        waypoints: [
          { ident: 'RBV', discontinuity: false },
          { ident: 'DIXIE', discontinuity: false },
          { ident: 'KDCA', discontinuity: false },
        ],
      },
    });

    expect(model.procedureLabel).toContain('DIR DIXIE');
    expect(model.routePoints.find(point => point.label === 'RBV')?.active).toBe(false);
    expect(model.routePoints.find(point => point.label === 'DIXIE')?.active).toBe(true);
    expect(model.routeSegments.find(segment => segment.to.label === 'DIXIE')?.active).toBe(true);
  });

  it('does not show constraints for discontinuity markers', () => {
    const model = buildNavigationDisplayModel({
      ...baseState,
      flightPlan: {
        origin: 'KJFK',
        destination: 'KDCA',
        flightNumber: '',
        route: '',
        waypoints: [
          {
            ident: 'DISCONTINUITY',
            discontinuity: true,
            speedConstraint: { type: 'AT', speed: 210 },
            altitudeConstraint: { type: 'AT', altitude: 6000 },
          },
        ],
      },
    });

    expect(model.routePoints.find(point => point.discontinuity)).toMatchObject({
      speedLabel: null,
      altitudeLabel: null,
    });
  });

  it('returns a valid empty ND model without route data', () => {
    const model = buildNavigationDisplayModel(baseState);

    expect(model.routePoints).toEqual([]);
    expect(model.routeSegments).toEqual([]);
    expect(model.procedureLabel).toBe('NO PROC');
    expect(model.range).toBe(40);
  });
});
