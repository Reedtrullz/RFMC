import { describe, expect, it } from 'vitest';
import type { FMCState } from '../types/fmc';
import { buildNavigationDisplayModel } from '../fmc/navigationDisplay';

import { createBaseState } from './testUtils';

const baseState = createBaseState({
  efisL: {
    mode: 'MAP',
    range: 40,
    centered: false,
    side: 'L',
    overlays: {
      wpt: true, arpt: true, sta: true, fix: true, hold: true,
      data: false, pos: false, terr: false, wxr: false, tfc: true
    },
  },
  efisR: {
    mode: 'MAP',
    range: 40,
    centered: false,
    side: 'R',
    overlays: {
      wpt: true, arpt: true, sta: true, fix: true, hold: true,
      data: false, pos: false, terr: false, wxr: false, tfc: true
    },
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
