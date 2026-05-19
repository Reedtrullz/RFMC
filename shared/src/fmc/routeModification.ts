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
  type:
    | 'origin'
    | 'destination'
    | 'waypoint_insert'
    | 'waypoint_delete'
    | 'procedure_change'
    | 'altitude_constraint'
    | 'speed_constraint'
    | 'direct_to'
    | 'hold';
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

// ---- EXEC Lifecycle State Machine Implementation ----

/**
 * Generate a unique ID for a modification record.
 * Uses crypto.randomUUID when available, falls back to timestamp+random.
 */
function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Apply an array of pending changes to a RouteData object,
 * returning a new RouteData with the changes applied.
 * Each change's `field` is used as a key on RouteData, and `newValue`
 * is assigned to that key.
 */
function applyPendingChanges(route: RouteData, changes: PendingChange[]): RouteData {
  const updated: Record<string, unknown> = { ...route };
  for (const change of changes) {
    updated[change.field] = change.newValue;
  }
  return updated as unknown as RouteData;
}

/**
 * initiateModification
 *
 * Creates a new RouteModification record for the given route.
 * Both `originalRoute` and `modifiedRoute` start as copies of the input.
 * State is 'NONE' with an empty `pendingChanges` array.
 *
 * @param currentRoute - The current active route data
 * @returns A new RouteModification in state 'NONE'
 */
export function initiateModification(currentRoute: RouteData): RouteModification {
  return {
    id: generateId(),
    state: 'NONE',
    modifiedRoute: { ...currentRoute },
    originalRoute: { ...currentRoute },
    pendingChanges: [],
    createdAt: Date.now(),
    executedAt: undefined,
  };
}

/**
 * queueChange
 *
 * Appends a PendingChange to the modification's pendingChanges list
 * and transitions the state to 'MODIFIED'. Validates that the current
 * state allows queuing via `canQueueChange`.
 *
 * @param modification - Current RouteModification
 * @param change - The change to queue
 * @returns A new RouteModification with the change appended
 * @throws If state is not 'NONE' or 'MODIFIED'
 */
export function queueChange(modification: RouteModification, change: PendingChange): RouteModification {
  if (!canQueueChange(modification.state)) {
    throw new Error(
      `Cannot queue change: modification is in state '${modification.state}', expected 'NONE' or 'MODIFIED'`,
    );
  }

  return {
    ...modification,
    state: 'MODIFIED',
    pendingChanges: [...modification.pendingChanges, change],
  };
}

/**
 * executeModification
 *
 * Applies all pending changes to the modifiedRoute, transitions state
 * to 'EXECUTED', records the execution timestamp, and clears pending changes.
 * Validates via `canExecuteModification`.
 *
 * @param modification - Current RouteModification (must be in 'MODIFIED' state)
 * @returns A new RouteModification with changes applied and state 'EXECUTED'
 * @throws If state is not 'MODIFIED'
 */
export function executeModification(modification: RouteModification): RouteModification {
  if (!canExecuteModification(modification.state)) {
    throw new Error(
      `Cannot execute modification: modification is in state '${modification.state}', expected 'MODIFIED'`,
    );
  }

  return {
    ...modification,
    state: 'EXECUTED',
    modifiedRoute: applyPendingChanges(modification.modifiedRoute, modification.pendingChanges),
    pendingChanges: [],
    executedAt: Date.now(),
  };
}

/**
 * cancelModification
 *
 * Reverts the modifiedRoute to a copy of the originalRoute, resets
 * state to 'NONE', and clears pending changes. Validates via
 * `canCancelModification`.
 *
 * @param modification - Current RouteModification (must be 'MODIFIED' or 'EXEC_PENDING')
 * @returns A new RouteModification reverted to state 'NONE'
 * @throws If state is not 'MODIFIED' or 'EXEC_PENDING'
 */
export function cancelModification(modification: RouteModification): RouteModification {
  if (!canCancelModification(modification.state)) {
    throw new Error(
      `Cannot cancel modification: modification is in state '${modification.state}', expected 'MODIFIED' or 'EXEC_PENDING'`,
    );
  }

  return {
    ...modification,
    state: 'NONE',
    modifiedRoute: { ...modification.originalRoute },
    pendingChanges: [],
  };
}

/**
 * getModificationState
 *
 * Returns the current state of the modification.
 *
 * @param modification - The RouteModification to inspect
 * @returns The current RouteModificationState
 */
export function getModificationState(modification: RouteModification): RouteModificationState {
  return modification.state;
}
