import { describe, expect, it } from 'vitest';
import type { FlightPlanWaypoint } from '../types/fmc';
import { buildVnavPrediction } from '../fmc/vnavPrediction';
import { createBaseState } from './testUtils';

const constrainedRoute: FlightPlanWaypoint[] = [
  { ident: 'ORIG', lat: 60.0, lon: 10.0, discontinuity: false },
  {
    ident: 'CLB01',
    lat: 60.0,
    lon: 10.8,
    discontinuity: false,
    altitudeConstraint: { type: 'AT_OR_ABOVE', altitude: 8000 },
  },
  {
    ident: 'DESC1',
    lat: 60.0,
    lon: 11.8,
    discontinuity: false,
    altitudeConstraint: { type: 'AT_OR_BELOW', altitude: 3000 },
  },
  { ident: 'DEST', lat: 60.0, lon: 12.2, discontinuity: false },
];

function makeState(overrides: Parameters<typeof createBaseState>[0] = {}) {
  return createBaseState({
    performance: {
      crzAlt: 12000,
      costIndex: 20,
      zfw: 125000,
      fuel: 14000,
      cg: 24,
      reserve: 3000,
      grossWeight: 139000,
    },
    route: {
      origin: 'ORIG',
      destination: 'DEST',
      flightNumber: '',
      routeString: 'CLB01 DESC1',
    },
    flightPlan: {
      origin: 'ORIG',
      destination: 'DEST',
      flightNumber: '',
      route: 'CLB01 DESC1',
      waypoints: constrainedRoute,
    },
    aircraftState: {
      lat: 60.0,
      lon: 10.0,
      altitude: 2000,
      altitudeFt: 2000,
      heading: 90,
      headingDeg: 90,
      track: 90,
      trackDeg: 90,
      ias: 210,
      indicatedAirspeedKt: 210,
      tas: 230,
      gs: 240,
      verticalSpeedFpm: 0,
      vs: 0,
      fuelTotal: 14000,
      gw: 139000,
    },
    ...overrides,
  });
}

describe('buildVnavPrediction', () => {
  it('returns unavailable when performance data is incomplete', () => {
    const prediction = buildVnavPrediction(createBaseState());

    expect(prediction.available).toBe(false);
    expect(prediction.phase).toBe('unavailable');
    expect(prediction.pathMessages).toContain('PERF/VNAV UNAVAILABLE');
  });

  it('predicts a feasible climb constraint', () => {
    const prediction = buildVnavPrediction(makeState());

    expect(prediction.phase).toBe('climb');
    expect(prediction.nextConstraint?.ident).toBe('CLB01');
    expect(prediction.nextConstraint?.feasible).toBe(true);
    expect(prediction.topOfClimbDistanceNm).toBeGreaterThan(0);
    expect(prediction.pathMessages).not.toContain('UNABLE NEXT ALT');
  });

  it('warns when the next climb constraint is not feasible', () => {
    const state = makeState({
      flightPlan: {
        origin: 'ORIG',
        destination: 'DEST',
        flightNumber: '',
        route: 'CLB01 DESC1',
        waypoints: [
          constrainedRoute[0],
          {
            ...constrainedRoute[1],
            lat: 60.0,
            lon: 10.08,
            altitudeConstraint: { type: 'AT_OR_ABOVE', altitude: 12000 },
          },
          constrainedRoute[2],
          constrainedRoute[3],
        ],
      },
      aircraftState: {
        ...makeState().aircraftState!,
        gs: 320,
      },
    });

    const prediction = buildVnavPrediction(state);

    expect(prediction.nextConstraint?.feasible).toBe(false);
    expect(prediction.pathMessages).toContain('UNABLE NEXT ALT');
  });

  it('warns when descent path requires excessive rate', () => {
    const state = makeState({
      flightPlan: {
        origin: 'ORIG',
        destination: 'DEST',
        flightNumber: '',
        route: 'DESC1',
        waypoints: [
          constrainedRoute[0],
          {
            ident: 'DESC1',
            lat: 60.0,
            lon: 10.08,
            discontinuity: false,
            altitudeConstraint: { type: 'AT_OR_BELOW', altitude: 3000 },
          },
          constrainedRoute[3],
        ],
      },
      aircraftState: {
        ...makeState().aircraftState!,
        altitude: 11000,
        altitudeFt: 11000,
        gs: 320,
      },
    });

    const prediction = buildVnavPrediction(state);

    expect(prediction.nextConstraint?.ident).toBe('DESC1');
    expect(prediction.nextConstraint?.feasible).toBe(false);
    expect(prediction.pathMessages).toContain('DRAG REQUIRED');
  });

  it('reports VNAV interruption at discontinuities', () => {
    const state = makeState({
      flightPlan: {
        origin: 'ORIG',
        destination: 'DEST',
        flightNumber: '',
        route: 'CLB01 DISCO DESC1',
        waypoints: [
          constrainedRoute[0],
          constrainedRoute[1],
          { ident: 'ROUTE DISCONTINUITY', discontinuity: true },
          constrainedRoute[2],
          constrainedRoute[3],
        ],
      },
    });

    const prediction = buildVnavPrediction(state);

    expect(prediction.available).toBe(false);
    expect(prediction.pathMessages).toContain('VNAV PATH INTERRUPTED BY DISCONTINUITY');
  });

  it('compresses peak cruise altitude on extremely short routes', () => {
    const baseState = makeState();
    const state = {
      ...baseState,
      aircraftState: {
        ...baseState.aircraftState!,
        altitude: 2000,
        altitudeFt: 2000,
        lat: 60.0,
        lon: 10.0,
      },
      flightPlan: {
        ...baseState.flightPlan,
        waypoints: [
          { ident: 'ORIG', lat: 60.0, lon: 10.0, discontinuity: false },
          { ident: 'DEST', lat: 60.0, lon: 10.4, discontinuity: false },
        ],
      },
    };

    const prediction = buildVnavPrediction(state);
    expect(prediction.targetVnavAltitude).toBeLessThan(12000);
    expect(prediction.cruiseAltitudeFt).toBe(12000);
  });

  it('ensures intermediate waypoint altitude restrictions override peak altitude compression', () => {
    const baseState = makeState();
    const state = {
      ...baseState,
      aircraftState: {
        ...baseState.aircraftState!,
        altitude: 2000,
        altitudeFt: 2000,
        lat: 60.0,
        lon: 10.0,
      },
      flightPlan: {
        ...baseState.flightPlan,
        waypoints: [
          { ident: 'ORIG', lat: 60.0, lon: 10.0, discontinuity: false },
          {
            ident: 'CLB01',
            lat: 60.0,
            lon: 10.2,
            discontinuity: false,
            altitudeConstraint: { type: 'AT_OR_ABOVE' as const, altitude: 8000 },
          },
          { ident: 'DEST', lat: 60.0, lon: 10.4, discontinuity: false },
        ],
      },
    };

    const prediction = buildVnavPrediction(state);
    expect(prediction.targetVnavAltitude).toBeGreaterThanOrEqual(8000);
    expect(prediction.cruiseAltitudeFt).toBe(12000);
  });
});
