import type { RouteModification, RouteModificationState } from './routeModification';
import type { FMCState, HoldEntry } from '../types/fmc';

export function deriveExecLit(modification: RouteModification | null): boolean {
  if (!modification) return false;
  return modification.state === 'MODIFIED';
}

export function deriveIsModified(modification: RouteModification | null): boolean {
  if (!modification) return false;
  return modification.state !== 'NONE' && modification.state !== 'EXECUTED';
}

export function isModificationActive(modification: RouteModification | null): boolean {
  return deriveIsModified(modification) && !deriveExecLit(modification);
}

export function hasPendingChanges(modification: RouteModification | null): boolean {
  if (!modification) return false;
  return modification.pendingChanges.length > 0;
}

export function describeModificationState(state: RouteModificationState): string {
  return state;
}

export function applyPendingRouteChanges(state: FMCState): Partial<FMCState> {
  const updates: Partial<FMCState> = {};

  if (state.pendingRoute) {
    updates.route = { ...state.pendingRoute };
    updates.pendingRoute = null;
  }
  if (state.pendingFlightPlan) {
    updates.flightPlan = { ...state.pendingFlightPlan };
    updates.pendingFlightPlan = null;
  }

  if (state.holdPending?.fix) {
    updates.hold = state.holdPending as HoldEntry;
    updates.holdPending = null;
  }

  updates.isModified = false;
  updates.execLit = false;

  return updates;
}

export function cancelPendingRouteChanges(): Partial<FMCState> {
  return {
    pendingRoute: null,
    pendingFlightPlan: null,
    holdPending: null,
    isModified: false,
    execLit: false,
    editWaypointIndex: null,
    scratchpad: '',
    scratchpadError: null,
  };
}
