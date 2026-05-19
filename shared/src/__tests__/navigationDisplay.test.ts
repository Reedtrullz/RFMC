import { describe, expect, it } from 'vitest';
import type { FMCState } from '../types/fmc';
import { buildNavigationDisplayModel } from '../fmc/navigationDisplay';

import { createBaseState } from './testUtils';

const baseState = createBaseState({
  efisL: {
    mode: 'MAP',
    range: 160,
    centered: false,
    side: 'L',
    overlays: {
      wpt: true,
      arpt: true,
      sta: true,
      data: false,
      pos: false,
      terr: false,
      wxr: false,
      tfc: true,
      cstr: false,
    },
  },
  efisR: {
    mode: 'MAP',
    range: 160,
    centered: false,
    side: 'R',
    overlays: {
      wpt: true,
      arpt: true,
      sta: true,
      data: false,
      pos: false,
      terr: false,
      wxr: false,
      tfc: true,
      cstr: false,
    },
  },
  aircraftState: {
    lat: 39.5,
    lon: -75.5,
    heading: 0,
    track: 0,
    ias: 0,
    tas: 0,
    vs: 0,
    gs: 0,
    altitude: 0,
    headingDeg: 0,
    trackDeg: 0,
    altitudeFt: 0,
    indicatedAirspeedKt: 0,
    verticalSpeedFpm: 0,
    fuelTotal: 0,
    gw: 0,
  },
});

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

    expect(model.activeRoutePoints.map((point) => point.label)).toEqual(['KJFK', 'RBV', 'DIXIE', 'KDCA']);
    expect(model.activeRouteSegments).toHaveLength(4); // 3 route segments + 1 aircraft-to-active segment
    expect(model.activeRoutePoints[1].active).toBe(true);
  });

  it('does not draw route segments across route discontinuities', () => {
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

    expect(model.activeRoutePoints.some((point) => point.discontinuity)).toBe(true);
    // KJFK -> RBV is drawn, but RBV -> DISCO and DISCO -> KDCA are omitted
    expect(model.activeRouteSegments.some((s) => s.from.label === 'RBV' && s.to.label === 'DISCO')).toBe(false);
    expect(model.activeRouteSegments.some((s) => s.from.label === 'DISCO' && s.to.label === 'KDCA')).toBe(false);
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
    expect(model.fixOverlays[0]).toMatchObject({ refFix: 'RBV', radial: 180, distance: 20 });
  });

  it('creates multiple fix overlays from FIX entries', () => {
    const model = buildNavigationDisplayModel({
      ...baseState,
      flightPlan: {
        origin: 'KJFK',
        destination: 'KDCA',
        flightNumber: '',
        route: '',
        waypoints: [
          { ident: 'RBV', discontinuity: false },
          { ident: 'DIXIE', discontinuity: false },
        ],
      },
      fixEntries: [
        { refFix: 'RBV', radial: 180, distance: 20 },
        { refFix: 'DIXIE', radial: 270, distance: 35 },
      ],
    });

    expect(model.fixOverlays).toHaveLength(2);
    expect(model.fixOverlays[1]).toMatchObject({ refFix: 'DIXIE', radial: 270, distance: 35 });
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

    expect(model.activeRoutePoints.find((point) => point.label === 'RBV')).toMatchObject({
      speedLabel: '250',
      altitudeLabel: '10000A',
    });
    expect(model.activeRoutePoints.find((point) => point.label === 'DIXIE')?.altitudeLabel).toBe('FL180');
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
    expect(model.activeRoutePoints.find((point) => point.label === 'RBV')?.active).toBe(false);
    expect(model.activeRoutePoints.find((point) => point.label === 'DIXIE')?.active).toBe(true);
    expect(model.activeRouteSegments.find((segment) => segment.to.label === 'DIXIE')?.active).toBe(true);
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

    expect(model.activeRoutePoints.find((point) => point.discontinuity)).toMatchObject({
      speedLabel: null,
      altitudeLabel: null,
    });
  });

  it('returns a valid empty ND model without route data', () => {
    const model = buildNavigationDisplayModel(baseState);

    expect(model.activeRoutePoints).toEqual([]);
    expect(model.activeRouteSegments).toEqual([]);
    expect(model.procedureLabel).toBe('NO PROC');
    expect(model.range).toBe(160); // Matches baseState.efisL.range
  });

  it('omits route segments with clipped endpoints', () => {
    const stateWithGeo = {
      ...baseState,
      efisL: { ...baseState.efisL, range: 40 }, // 40nm range so WPT2 at 60nm is clipped
      aircraftState: {
        lat: 0,
        lon: 0,
        ias: 0,
        tas: 0,
        vs: 0,
        gs: 0,
        fuelTotal: 0,
        gw: 0,
        altitude: 0,
        heading: 0,
        track: 0,
        headingDeg: 0,
        trackDeg: 0,
        altitudeFt: 0,
        indicatedAirspeedKt: 0,
        verticalSpeedFpm: 0,
      },
      flightPlan: {
        origin: '',
        destination: '',
        flightNumber: '',
        route: '',
        waypoints: [
          { ident: 'WPT1', lat: 0.1, lon: 0, discontinuity: false }, // ~6nm (visible)
          { ident: 'WPT2', lat: 1.0, lon: 0, discontinuity: false }, // ~60nm (clipped, range is 40)
        ],
      },
    };
    const model = buildNavigationDisplayModel(stateWithGeo);
    expect(model.activeRoutePoints.some((p) => p.label === 'WPT1')).toBe(true);
    expect(model.activeRoutePoints.some((p) => p.label === 'WPT2')).toBe(false);
    expect(model.activeRouteSegments.length).toBe(1); // One segment from aircraft to WPT1
  });

  it('includes relativeBearingDeg on geo-projected points', () => {
    const stateWithGeo = {
      ...baseState,
      aircraftState: {
        lat: 0,
        lon: 0,
        ias: 0,
        tas: 0,
        vs: 0,
        gs: 0,
        fuelTotal: 0,
        gw: 0,
        altitude: 0,
        heading: 90,
        track: 0,
        headingDeg: 90,
        trackDeg: 0,
        altitudeFt: 0,
        indicatedAirspeedKt: 0,
        verticalSpeedFpm: 0,
      },
      flightPlan: {
        origin: '',
        destination: '',
        flightNumber: '',
        route: '',
        waypoints: [{ ident: 'WPT1', lat: 0.1, lon: 0, discontinuity: false }], // North
      },
    };
    const model = buildNavigationDisplayModel(stateWithGeo);
    const p1 = model.activeRoutePoints[0];
    expect(p1.bearingDeg).toBeCloseTo(0, 0);
    expect(p1.relativeBearingDeg).toBe(-90); // North (0) relative to heading 90
  });

  it('uses direct-to target for active waypoint block', () => {
    const model = buildNavigationDisplayModel({
      ...baseState,
      aircraftState: {
        lat: 0,
        lon: 0,
        ias: 200,
        tas: 200,
        vs: 0,
        gs: 200,
        fuelTotal: 0,
        gw: 0,
        altitude: 0,
        heading: 0,
        track: 0,
        headingDeg: 0,
        trackDeg: 0,
        altitudeFt: 0,
        indicatedAirspeedKt: 200,
        verticalSpeedFpm: 0,
      },
      route: { ...baseState.route, directTo: 'DIXIE' },
      flightPlan: {
        origin: '',
        destination: '',
        flightNumber: '',
        route: '',
        waypoints: [
          { ident: 'RBV', lat: 0.1, lon: 0, discontinuity: false },
          { ident: 'DIXIE', lat: 0.2, lon: 0, discontinuity: false },
        ],
      },
    });
    expect(model.anchorZones.waypointBlock?.ident).toBe('DIXIE');
  });

  it('selects destination as active target for origin/destination-only route', () => {
    const model = buildNavigationDisplayModel({
      ...baseState,
      // Aircraft positioned near KJFK so both airports are within 160nm range
      aircraftState: {
        lat: 39.5,
        lon: -75.5,
        ias: 0,
        tas: 0,
        vs: 0,
        gs: 0,
        fuelTotal: 0,
        gw: 0,
        altitude: 0,
        heading: 0,
        track: 0,
        headingDeg: 0,
        trackDeg: 0,
        altitudeFt: 0,
        indicatedAirspeedKt: 0,
        verticalSpeedFpm: 0,
      },
      flightPlan: { ...baseState.flightPlan, origin: 'KJFK', destination: 'KDCA', waypoints: [] },
    });
    expect(model.activeRoutePoints[0].label).toBe('KJFK');
    expect(model.activeRoutePoints[1].label).toBe('KDCA');
    expect(model.activeRoutePoints[1].active).toBe(true);
    expect(model.activeRouteSegments.length).toBeGreaterThan(0);
  });

  it('sets centered correctly for Boeing modes', () => {
    const modelMapUncentered = buildNavigationDisplayModel(
      { ...baseState, aircraft: 'BOEING_737' },
      { ...baseState.efisL, mode: 'MAP', centered: false },
    );
    expect(modelMapUncentered.centered).toBe(false);

    const modelMapCentered = buildNavigationDisplayModel(
      { ...baseState, aircraft: 'BOEING_737' },
      { ...baseState.efisL, mode: 'MAP', centered: true },
    );
    expect(modelMapCentered.centered).toBe(true);

    const modelPln = buildNavigationDisplayModel(
      { ...baseState, aircraft: 'BOEING_737' },
      { ...baseState.efisL, mode: 'PLN', centered: false },
    );
    expect(modelPln.centered).toBe(true);

    const modelApp = buildNavigationDisplayModel(
      { ...baseState, aircraft: 'BOEING_737' },
      { ...baseState.efisL, mode: 'APP', centered: false },
    );
    expect(modelApp.centered).toBe(true);
  });

  it('sets centered correctly for Airbus modes', () => {
    const modelArc = buildNavigationDisplayModel(
      { ...baseState, aircraft: 'AIRBUS_A320' },
      { ...baseState.efisL, mode: 'ARC', centered: true },
    );
    expect(modelArc.centered).toBe(false);

    const modelPlan = buildNavigationDisplayModel(
      { ...baseState, aircraft: 'AIRBUS_A320' },
      { ...baseState.efisL, mode: 'PLAN', centered: false },
    );
    expect(modelPlan.centered).toBe(true);

    const modelRoseNav = buildNavigationDisplayModel(
      { ...baseState, aircraft: 'AIRBUS_A320' },
      { ...baseState.efisL, mode: 'ROSE_NAV', centered: false },
    );
    expect(modelRoseNav.centered).toBe(true);
  });

  it('provides both active and pending routes when modified', () => {
    const model = buildNavigationDisplayModel({
      ...baseState,
      isModified: true,
      flightPlan: {
        origin: 'KJFK',
        destination: 'KDCA',
        flightNumber: '',
        route: '',
        waypoints: [{ ident: 'WPT1', discontinuity: false }],
      },
      route: { ...baseState.route },
      pendingFlightPlan: {
        origin: 'KJFK',
        destination: 'KDCA',
        flightNumber: '',
        route: '',
        waypoints: [
          { ident: 'WPT1', discontinuity: false },
          { ident: 'WPT2', discontinuity: false }, // Added in pending
        ],
      },
      pendingRoute: { ...baseState.route },
    });

    expect(model.activeRoutePoints.length).toBeGreaterThan(0);
    expect(model.pendingRoutePoints.length).toBeGreaterThan(0);

    expect(model.activeRoutePoints.some((p) => p.label === 'WPT2')).toBe(false);
    expect(model.pendingRoutePoints.some((p) => p.label === 'WPT2')).toBe(true);

    // Pending segments should have the modified flag
    expect(model.pendingRouteSegments.every((s) => s.modified)).toBe(true);
  });
});
