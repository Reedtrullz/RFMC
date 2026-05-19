import { describe, expect, it } from 'vitest';
import { buildLnavState } from '../fmc/lnavState';
import { createBaseState } from './testUtils';
import type { FlightPlanWaypoint } from '../types/fmc';

const routeWaypoints: FlightPlanWaypoint[] = [
  { ident: 'ENGM', lat: 60.1939, lon: 11.1004, discontinuity: false },
  { ident: 'BAMAD', lat: 60.35, lon: 9.75, discontinuity: false },
  { ident: 'BGO', lat: 60.2893, lon: 5.2181, discontinuity: false },
  { ident: 'ENBR', lat: 60.2934, lon: 5.2181, discontinuity: false },
];

function stateWithRoute(overrides: Partial<ReturnType<typeof createBaseState>> = {}) {
  return createBaseState({
    aircraftState: {
      lat: 60.18,
      lon: 11.08,
      altitude: 4000,
      altitudeFt: 4000,
      heading: 270,
      headingDeg: 270,
      track: 270,
      trackDeg: 270,
      ias: 220,
      indicatedAirspeedKt: 220,
      tas: 230,
      gs: 250,
      groundSpeedKt: 250,
      vs: 0,
      verticalSpeedFpm: 0,
      fuelTotal: 8200,
      gw: 64000,
    },
    route: { origin: 'ENGM', destination: 'ENBR', flightNumber: '', routeString: 'BAMAD BGO' },
    flightPlan: {
      origin: 'ENGM',
      destination: 'ENBR',
      flightNumber: '',
      route: 'BAMAD BGO',
      waypoints: routeWaypoints,
    },
    ...overrides,
  });
}

describe('buildLnavState', () => {
  it('selects the first route waypoint as active and computes bearing/distance', () => {
    const lnav = buildLnavState(stateWithRoute());

    expect(lnav.activeLegIndex).toBe(0);
    expect(lnav.activeWaypoint?.ident).toBe('ENGM');
    expect(lnav.nextWaypoint?.ident).toBe('BAMAD');
    expect(lnav.destination?.ident).toBe('ENBR');
    expect(lnav.bearingToActiveDeg).not.toBeNull();
    expect(lnav.distanceToActiveNm).toBeGreaterThanOrEqual(0);
    expect(lnav.distanceToDestinationNm).toBeGreaterThan(lnav.distanceToActiveNm ?? 0);
  });

  it('uses direct-to as the active leg target', () => {
    const lnav = buildLnavState(
      stateWithRoute({
        route: { origin: 'ENGM', destination: 'ENBR', flightNumber: '', routeString: 'BAMAD BGO', directTo: 'BGO' },
      }),
    );

    expect(lnav.directToActive).toBe(true);
    expect(lnav.activeLegIndex).toBe(2);
    expect(lnav.activeWaypoint?.ident).toBe('BGO');
    expect(lnav.nextWaypoint?.ident).toBe('ENBR');
  });

  it('stops normal sequencing at a discontinuity', () => {
    const lnav = buildLnavState(
      stateWithRoute({
        flightPlan: {
          origin: 'ENGM',
          destination: 'ENBR',
          flightNumber: '',
          route: 'BAMAD BGO',
          waypoints: [
            routeWaypoints[0],
            { ident: 'ROUTE DISCONTINUITY', discontinuity: true },
            routeWaypoints[2],
            routeWaypoints[3],
          ],
        },
      }),
    );

    expect(lnav.activeWaypoint?.ident).toBe('ENGM');
    expect(lnav.nextWaypoint).toBeNull();
    expect(lnav.stoppedAtDiscontinuity).toBe(true);
    expect(lnav.sequenceBlockedReason).toBe('ROUTE DISCONTINUITY');
  });

  it('can direct-to a waypoint beyond a discontinuity', () => {
    const lnav = buildLnavState(
      stateWithRoute({
        route: { origin: 'ENGM', destination: 'ENBR', flightNumber: '', routeString: 'BAMAD BGO', directTo: 'BGO' },
        flightPlan: {
          origin: 'ENGM',
          destination: 'ENBR',
          flightNumber: '',
          route: 'BAMAD BGO',
          waypoints: [
            routeWaypoints[0],
            { ident: 'ROUTE DISCONTINUITY', discontinuity: true },
            routeWaypoints[2],
            routeWaypoints[3],
          ],
        },
      }),
    );

    expect(lnav.directToActive).toBe(true);
    expect(lnav.activeWaypoint?.ident).toBe('BGO');
    expect(lnav.stoppedAtDiscontinuity).toBe(false);
  });

  it('marks an empty or discontinuity-first route as blocked', () => {
    const empty = buildLnavState(
      stateWithRoute({
        flightPlan: { origin: 'ENGM', destination: 'ENBR', flightNumber: '', route: '', waypoints: [] },
      }),
    );
    expect(empty.activeWaypoint).toBeNull();
    expect(empty.routeComplete).toBe(true);

    const blocked = buildLnavState(
      stateWithRoute({
        flightPlan: {
          origin: 'ENGM',
          destination: 'ENBR',
          flightNumber: '',
          route: '',
          waypoints: [{ ident: 'ROUTE DISCONTINUITY', discontinuity: true }, routeWaypoints[2]],
        },
      }),
    );
    expect(blocked.activeWaypoint).toBeNull();
    expect(blocked.stoppedAtDiscontinuity).toBe(true);
  });
});
