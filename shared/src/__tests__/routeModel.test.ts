import { describe, it, expect, beforeEach } from 'vitest';
import type { FlightPlanWaypoint } from '../types/fmc';
import {
  type RouteDiscontinuity,
  type RouteEntry,
  isRouteDiscontinuity,
  insertDiscontinuity,
  clearDiscontinuity,
  hasActiveDiscontinuity,
  resolveDiscontinuity,
  _resetIdCounter,
} from '../fmc/routeModel';

function makeWaypoint(ident: string): FlightPlanWaypoint {
  return {
    ident,
    discontinuity: false,
  };
}

function sampleRoute(): RouteEntry[] {
  return [makeWaypoint('KJFK'), makeWaypoint('RBV'), makeWaypoint('LENDY'), makeWaypoint('KDCA')];
}

describe('RouteDiscontinuity', () => {
  beforeEach(() => {
    _resetIdCounter();
  });

  describe('isRouteDiscontinuity', () => {
    it('returns true for a RouteDiscontinuity entry', () => {
      const disc: RouteDiscontinuity = {
        id: 'DISC-0001',
        sequence: 2,
        isDiscontinuity: true,
        legType: 'DISCONTINUITY',
        source: 'manual',
        cleared: false,
      };
      expect(isRouteDiscontinuity(disc)).toBe(true);
    });

    it('returns false for a FlightPlanWaypoint entry', () => {
      const wp = makeWaypoint('RBV');
      expect(isRouteDiscontinuity(wp)).toBe(false);
    });

    it('returns false for a waypoint that only has discontinuity:true boolean', () => {
      // This is the current boolean pattern — not the new typed one
      const wp: FlightPlanWaypoint = { ident: 'LENDY', discontinuity: true };
      expect(isRouteDiscontinuity(wp)).toBe(false);
    });
  });

  describe('insertDiscontinuity', () => {
    it('inserts a typed discontinuity at the specified position', () => {
      const route = sampleRoute();
      const result = insertDiscontinuity(route, 'airway_gap', 2);

      expect(result).toHaveLength(5);
      // Before position: unchanged
      expect(result[0]).toMatchObject({ ident: 'KJFK' });
      expect(result[1]).toMatchObject({ ident: 'RBV' });
      // At position: discontinuity
      expect(isRouteDiscontinuity(result[2])).toBe(true);
      const disc = result[2] as RouteDiscontinuity;
      expect(disc.source).toBe('airway_gap');
      expect(disc.sequence).toBe(2);
      expect(disc.cleared).toBe(false);
      expect(disc.legType).toBe('DISCONTINUITY');
      // After position: shifted
      expect(result[3]).toMatchObject({ ident: 'LENDY' });
      expect(result[4]).toMatchObject({ ident: 'KDCA' });
    });

    it('creates each discontinuity with a unique id', () => {
      const route = sampleRoute();
      const r1 = insertDiscontinuity(route, 'manual', 0);
      const r2 = insertDiscontinuity(route, 'deleted_leg', 2);

      const d1 = r1[0] as RouteDiscontinuity;
      const d2 = r2[2] as RouteDiscontinuity;
      expect(d1.id).not.toBe(d2.id);
    });

    it('clamps position to array bounds (too large)', () => {
      const route = sampleRoute();
      const result = insertDiscontinuity(route, 'sid_star_mismatch', 999);
      expect(result).toHaveLength(5);
      expect(isRouteDiscontinuity(result[4])).toBe(true); // appended at end
    });

    it('clamps position to array bounds (negative)', () => {
      const route = sampleRoute();
      const result = insertDiscontinuity(route, 'sid_star_mismatch', -1);
      expect(result).toHaveLength(5);
      expect(isRouteDiscontinuity(result[0])).toBe(true); // prepended at start
    });

    it('does not mutate the original route array', () => {
      const route = sampleRoute();
      const originalLength = route.length;
      insertDiscontinuity(route, 'deleted_leg', 1);
      expect(route).toHaveLength(originalLength);
    });

    it('inserts at the start when position is 0', () => {
      const route = sampleRoute();
      const result = insertDiscontinuity(route, 'manual', 0);
      expect(result).toHaveLength(5);
      expect(isRouteDiscontinuity(result[0])).toBe(true);
      expect(result[1]).toMatchObject({ ident: 'KJFK' });
    });

    it('inserts at the end when position equals length', () => {
      const route = sampleRoute();
      const result = insertDiscontinuity(route, 'manual', route.length);
      expect(result).toHaveLength(5);
      expect(isRouteDiscontinuity(result[4])).toBe(true);
    });

    it('handles empty route', () => {
      const result = insertDiscontinuity([], 'manual', 0);
      expect(result).toHaveLength(1);
      expect(isRouteDiscontinuity(result[0])).toBe(true);
    });
  });

  describe('clearDiscontinuity', () => {
    it('marks a discontinuity as cleared by id', () => {
      const route = insertDiscontinuity(sampleRoute(), 'airway_gap', 2);
      const disc = route[2] as RouteDiscontinuity;
      expect(disc.cleared).toBe(false);

      const cleared = clearDiscontinuity(route, disc.id);
      const clearedDisc = cleared[2] as RouteDiscontinuity;
      expect(clearedDisc.cleared).toBe(true);
    });

    it('preserves the discontinuity entry in the array (does not remove)', () => {
      const route = insertDiscontinuity(sampleRoute(), 'deleted_leg', 1);
      const disc = route[1] as RouteDiscontinuity;

      const cleared = clearDiscontinuity(route, disc.id);
      expect(cleared).toHaveLength(route.length);
      expect(isRouteDiscontinuity(cleared[1])).toBe(true);
    });

    it('does not modify waypoints', () => {
      const route = insertDiscontinuity(sampleRoute(), 'manual', 0);
      const disc = route[0] as RouteDiscontinuity;

      const cleared = clearDiscontinuity(route, disc.id);
      // Waypoint at index 1 should be untouched
      expect(cleared[1]).toMatchObject({ ident: 'KJFK', discontinuity: false });
    });

    it('is a no-op when the id does not match any discontinuity', () => {
      const route = insertDiscontinuity(sampleRoute(), 'manual', 0);
      const result = clearDiscontinuity(route, 'nonexistent-id');
      expect(result).toEqual(route);
    });

    it('does not mutate the original array', () => {
      const route = insertDiscontinuity(sampleRoute(), 'airway_gap', 2);
      const disc = route[2] as RouteDiscontinuity;
      const snapshot = [...route];

      clearDiscontinuity(route, disc.id);
      expect(route).toEqual(snapshot);
    });

    it('clears the correct discontinuity when multiple exist', () => {
      const r1 = insertDiscontinuity(sampleRoute(), 'manual', 0);
      const r2 = insertDiscontinuity(r1, 'deleted_leg', 3);
      const disc0 = r2[0] as RouteDiscontinuity;

      const cleared = clearDiscontinuity(r2, disc0.id);
      expect((cleared[0] as RouteDiscontinuity).cleared).toBe(true);
      expect((cleared[3] as RouteDiscontinuity).cleared).toBe(false);
    });
  });

  describe('hasActiveDiscontinuity', () => {
    it('returns true when an uncleared discontinuity exists', () => {
      const route = insertDiscontinuity(sampleRoute(), 'airway_gap', 2);
      expect(hasActiveDiscontinuity(route)).toBe(true);
    });

    it('returns false when no discontinuity exists', () => {
      const route = sampleRoute();
      expect(hasActiveDiscontinuity(route)).toBe(false);
    });

    it('returns false when all discontinuities are cleared', () => {
      const route = insertDiscontinuity(sampleRoute(), 'manual', 0);
      const disc = route[0] as RouteDiscontinuity;
      const cleared = clearDiscontinuity(route, disc.id);
      expect(hasActiveDiscontinuity(cleared)).toBe(false);
    });

    it('returns true when at least one of multiple discontinuities is still active', () => {
      const r1 = insertDiscontinuity(sampleRoute(), 'manual', 0);
      const r2 = insertDiscontinuity(r1, 'deleted_leg', 3);
      const disc0 = r2[0] as RouteDiscontinuity;

      const cleared = clearDiscontinuity(r2, disc0.id);
      // disc at index 3 is still uncleared
      expect(hasActiveDiscontinuity(cleared)).toBe(true);
    });

    it('returns false for an empty route', () => {
      expect(hasActiveDiscontinuity([])).toBe(false);
    });
  });

  describe('resolveDiscontinuity', () => {
    it('replaces a cleared discontinuity with a connecting leg waypoint', () => {
      const route = insertDiscontinuity(sampleRoute(), 'sid_star_mismatch', 2);
      const disc = route[2] as RouteDiscontinuity;
      const cleared = clearDiscontinuity(route, disc.id);

      const connectingLeg: Omit<FlightPlanWaypoint, 'discontinuity'> = {
        ident: 'CONN',
        lat: 40.0,
        lon: -75.0,
        legType: 'TF',
      };

      const resolved = resolveDiscontinuity(cleared, connectingLeg);

      // Length stays 5 — the discontinuity slot is replaced, not removed
      expect(resolved).toHaveLength(5);
      expect(resolved[0]).toMatchObject({ ident: 'KJFK' });
      expect(resolved[1]).toMatchObject({ ident: 'RBV' });
      expect(resolved[2]).toMatchObject({
        ident: 'CONN',
        lat: 40.0,
        lon: -75.0,
        legType: 'TF',
        discontinuity: false,
      });
      expect(resolved[3]).toMatchObject({ ident: 'LENDY' });
      expect(resolved[4]).toMatchObject({ ident: 'KDCA' });
    });

    it('throws when trying to resolve an uncleared discontinuity', () => {
      const route = insertDiscontinuity(sampleRoute(), 'manual', 1);
      const connectingLeg: Omit<FlightPlanWaypoint, 'discontinuity'> = { ident: 'FIX' };

      expect(() => resolveDiscontinuity(route, connectingLeg)).toThrow('No cleared discontinuity found in route');
    });

    it('throws when no discontinuity exists in the route', () => {
      const route = sampleRoute();
      const connectingLeg: Omit<FlightPlanWaypoint, 'discontinuity'> = { ident: 'FIX' };

      expect(() => resolveDiscontinuity(route, connectingLeg)).toThrow('No cleared discontinuity found in route');
    });

    it('replaces the first cleared discontinuity when multiple exist', () => {
      const r1 = insertDiscontinuity(sampleRoute(), 'manual', 0);
      const r2 = insertDiscontinuity(r1, 'deleted_leg', 3);
      const disc0 = r2[0] as RouteDiscontinuity;
      const disc3 = r2[3] as RouteDiscontinuity;

      // Clear both discontinuities
      const cleared1 = clearDiscontinuity(r2, disc0.id);
      const cleared2 = clearDiscontinuity(cleared1, disc3.id);

      const connectingLeg: Omit<FlightPlanWaypoint, 'discontinuity'> = { ident: 'WAYPOINT' };
      const resolved = resolveDiscontinuity(cleared2, connectingLeg);

      // First cleared discontinuity (index 0) should be replaced
      expect(isRouteDiscontinuity(resolved[0])).toBe(false);
      expect(resolved[0]).toMatchObject({ ident: 'WAYPOINT', discontinuity: false });
      // Second discontinuity (index 3 → now index 3 since we replaced at 0) still present
      expect(isRouteDiscontinuity(resolved[3])).toBe(true);
      expect((resolved[3] as RouteDiscontinuity).cleared).toBe(true);
    });

    it('does not mutate the original route array', () => {
      const route = insertDiscontinuity(sampleRoute(), 'manual', 2);
      const disc = route[2] as RouteDiscontinuity;
      const cleared = clearDiscontinuity(route, disc.id);
      const snapshot = [...cleared];

      const connectingLeg: Omit<FlightPlanWaypoint, 'discontinuity'> = { ident: 'FIX' };
      resolveDiscontinuity(cleared, connectingLeg);

      expect(cleared).toEqual(snapshot);
    });

    it('preserves all waypoint fields on the connecting leg', () => {
      const route = insertDiscontinuity(sampleRoute(), 'sid_star_mismatch', 2);
      const disc = route[2] as RouteDiscontinuity;
      const cleared = clearDiscontinuity(route, disc.id);

      const connectingLeg: Omit<FlightPlanWaypoint, 'discontinuity'> = {
        ident: 'CONN',
        lat: 42.0,
        lon: -71.0,
        coordinateSource: 'synthetic',
        altitudeConstraint: { type: 'AT', altitude: 10000 },
        speedConstraint: { type: 'AT', speed: 250 },
        airway: 'J42',
        legType: 'TF',
      };

      const resolved = resolveDiscontinuity(cleared, connectingLeg);
      const wp = resolved[2] as FlightPlanWaypoint;

      expect(wp.ident).toBe('CONN');
      expect(wp.lat).toBe(42.0);
      expect(wp.lon).toBe(-71.0);
      expect(wp.coordinateSource).toBe('synthetic');
      expect(wp.altitudeConstraint).toEqual({ type: 'AT', altitude: 10000 });
      expect(wp.speedConstraint).toEqual({ type: 'AT', speed: 250 });
      expect(wp.airway).toBe('J42');
      expect(wp.legType).toBe('TF');
      expect(wp.discontinuity).toBe(false);
    });

    it('throws for an empty route', () => {
      const connectingLeg: Omit<FlightPlanWaypoint, 'discontinuity'> = { ident: 'FIX' };

      expect(() => resolveDiscontinuity([], connectingLeg)).toThrow('No cleared discontinuity found in route');
    });

    it('completes the full insert → clear → resolve lifecycle', () => {
      // Simulate: SID waypoints → airway gap → STAR waypoints
      const routeWithDisc = insertDiscontinuity(sampleRoute(), 'airway_gap', 2);

      // Active discontinuity present
      expect(hasActiveDiscontinuity(routeWithDisc)).toBe(true);
      const disc = routeWithDisc[2] as RouteDiscontinuity;
      expect(disc.cleared).toBe(false);

      // Clear the discontinuity
      const cleared = clearDiscontinuity(routeWithDisc, disc.id);
      expect(hasActiveDiscontinuity(cleared)).toBe(false);

      // Resolve — fill the gap with a connecting leg
      const connectingLeg: Omit<FlightPlanWaypoint, 'discontinuity'> = {
        ident: 'CONNECT',
        legType: 'TF',
      };
      const resolved = resolveDiscontinuity(cleared, connectingLeg);

      // Length stays 5 — discontinuity slot is replaced, not removed
      expect(resolved).toHaveLength(5);
      expect(resolved[2]).toMatchObject({ ident: 'CONNECT', discontinuity: false });
      expect(hasActiveDiscontinuity(resolved)).toBe(false);
    });
  });
});
