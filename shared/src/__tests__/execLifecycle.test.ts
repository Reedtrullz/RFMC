import { describe, it, expect } from 'vitest';
import type { FMCState, HoldEntry, RouteData, FlightPlan } from '../types/fmc';
import { applyPendingRouteChanges, cancelPendingRouteChanges } from '../fmc/fmcModificationAdapter';

function makeRoute(overrides: Partial<RouteData> = {}): RouteData {
  return {
    origin: 'KJFK',
    destination: 'KDCA',
    flightNumber: 'VA123',
    routeString: 'KJFK DCT RBV J42 LENDY8 KDCA',
    ...overrides,
  };
}

function makeHoldEntry(overrides: Partial<HoldEntry> = {}): HoldEntry {
  return {
    fix: 'RBV',
    inboundCourse: 270,
    legTime: 1,
    legDist: 0,
    direction: 'R',
    ...overrides,
  };
}

function makeFlightPlan(overrides: Partial<FlightPlan> = {}): FlightPlan {
  return {
    origin: 'KJFK',
    destination: 'KDCA',
    flightNumber: 'VA123',
    route: '',
    waypoints: [],
    ...overrides,
  };
}

function makeMinimalState(overrides: Partial<FMCState> = {}): FMCState {
  return {
    route: makeRoute(),
    flightPlan: makeFlightPlan(),
    pendingRoute: null,
    pendingFlightPlan: null,
    hold: {} as HoldEntry,
    holdPending: null,
    isModified: false,
    execLit: false,
    editWaypointIndex: null,
    scratchpad: '',
    scratchpadError: null,
    ...overrides,
  } as unknown as FMCState;
}

describe('applyPendingRouteChanges', () => {
  it('promotes pendingRoute to active route and clears pendingRoute', () => {
    const pending = makeRoute({ origin: 'KORD', destination: 'KLAX' });
    const state = makeMinimalState({ pendingRoute: pending });

    const patch = applyPendingRouteChanges(state);

    expect(patch.route).toEqual(pending);
    expect(patch.pendingRoute).toBeNull();
  });

  it('promotes pendingFlightPlan to active flightPlan and clears pendingFlightPlan', () => {
    const pending = makeFlightPlan({ waypoints: [{ ident: 'RBV', discontinuity: false }] });
    const state = makeMinimalState({ pendingFlightPlan: pending });

    const patch = applyPendingRouteChanges(state);

    expect(patch.flightPlan).toEqual(pending);
    expect(patch.pendingFlightPlan).toBeNull();
  });

  it('promotes holdPending to hold and clears holdPending', () => {
    const pendingHold = makeHoldEntry({ fix: 'LENDY' });
    const state = makeMinimalState({ holdPending: pendingHold });

    const patch = applyPendingRouteChanges(state);

    expect(patch.hold).toEqual(pendingHold);
    expect(patch.holdPending).toBeNull();
  });

  it('clears isModified and execLit', () => {
    const state = makeMinimalState({ isModified: true, execLit: true });

    const patch = applyPendingRouteChanges(state);

    expect(patch.isModified).toBe(false);
    expect(patch.execLit).toBe(false);
  });

  it('returns empty object when no pending changes exist', () => {
    const state = makeMinimalState();

    const patch = applyPendingRouteChanges(state);

    expect(patch.isModified).toBe(false);
    expect(patch.execLit).toBe(false);
    expect(patch.route).toBeUndefined();
    expect(patch.flightPlan).toBeUndefined();
    expect(patch.hold).toBeUndefined();
  });

  it('combines multiple pending changes in a single patch', () => {
    const pendingRoute = makeRoute({ origin: 'KORD' });
    const pendingHold = makeHoldEntry({ fix: 'LENDY' });
    const state = makeMinimalState({
      pendingRoute,
      flightPlan: makeFlightPlan(),
      holdPending: pendingHold,
      isModified: true,
      execLit: true,
    });

    const patch = applyPendingRouteChanges(state);

    expect(patch.route).toEqual(pendingRoute);
    expect(patch.hold).toEqual(pendingHold);
    expect(patch.isModified).toBe(false);
    expect(patch.execLit).toBe(false);
  });
});

describe('cancelPendingRouteChanges', () => {
  it('returns full cleanup patch with all pending fields nulled', () => {
    const patch = cancelPendingRouteChanges();

    expect(patch.pendingRoute).toBeNull();
    expect(patch.pendingFlightPlan).toBeNull();
    expect(patch.holdPending).toBeNull();
    expect(patch.isModified).toBe(false);
    expect(patch.execLit).toBe(false);
    expect(patch.editWaypointIndex).toBeNull();
    expect(patch.scratchpad).toBe('');
    expect(patch.scratchpadError).toBeNull();
  });

  it('includes editWaypointIndex and scratchpad clearing', () => {
    const patch = cancelPendingRouteChanges();

    expect(patch.editWaypointIndex).toBeNull();
    expect(patch.scratchpad).toBe('');
    expect(patch.scratchpadError).toBeNull();
  });
});
