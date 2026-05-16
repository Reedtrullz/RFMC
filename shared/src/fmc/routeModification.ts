// ============================================================
// EXEC Lifecycle — Route Modification State Machine
// ============================================================

import type { RouteData } from '../types/fmc';

/**
 * State machine for the EXEC lifecycle:
 *   NONE → MODIFIED → EXEC_PENDING → EXECUTED
 *   Any  → NONE (cancelModification)
 */
export type RouteModificationState = 'NONE' | 'MODIFIED' | 'EXEC_PENDING' | 'EXECUTED';

/** A single pending change record. */
export type PendingChange = {
  type: 'origin' | 'destination' | 'waypoint_insert' | 'waypoint_delete' | 
        'procedure_change' | 'altitude_constraint' | 'speed_constraint' | 
        'direct_to' | 'hold';
  field: string;
  oldValue?: unknown;
  newValue?: unknown;
  requiresExec: boolean;
};

/** Full modification record tracking original vs modified route. */
export type RouteModification = {
  id: string;
  state: RouteModificationState;
  modifiedRoute: RouteData;
  originalRoute: RouteData;
  pendingChanges: PendingChange[];
  createdAt: number;
  executedAt?: number;
};

// ---- State Transition Guards ----

export function canQueueChange(state: RouteModificationState): state is 'NONE' | 'MODIFIED' {
  return state === 'NONE' || state === 'MODIFIED';
}

export function canExecuteModification(state: RouteModificationState): state is 'MODIFIED' {
  return state === 'MODIFIED';
}

export function canCancelModification(state: RouteModificationState): state is 'MODIFIED' | 'EXEC_PENDING' {
  return state === 'MODIFIED' || state === 'EXEC_PENDING';
}

// ---- Function Stubs (implemented in Task 8) ----

export function initiateModification(currentRoute: RouteData): RouteModification {
  throw new Error('Not implemented — Task 8');
}

export function queueChange(modification: RouteModification, change: PendingChange): RouteModification {
  throw new Error('Not implemented — Task 8');
}

export function executeModification(modification: RouteModification): RouteModification {
  throw new Error('Not implemented — Task 8');
}

export function cancelModification(modification: RouteModification): RouteModification {
  throw new Error('Not implemented — Task 8');
}

export function getModificationState(modification: RouteModification): RouteModificationState {
  throw new Error('Not implemented — Task 8');
}
