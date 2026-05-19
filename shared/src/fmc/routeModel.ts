import type { FlightPlanWaypoint } from '../types/fmc';

// ============================================================
// Route Discontinuity — typed discontinuity marker
// ============================================================

/**
 * A typed route discontinuity marker for flight plan sequencing.
 * Eventually replaces the boolean `FlightPlanWaypoint.discontinuity` pattern.
 *
 * Coexists with `FlightPlanWaypoint` in the route array as a discriminated union
 * via the `isDiscontinuity` discriminant field.
 */
export type RouteDiscontinuity = {
  id: string;
  sequence: number;
  isDiscontinuity: true;
  legType: 'DISCONTINUITY';
  source: 'sid_star_mismatch' | 'deleted_leg' | 'airway_gap' | 'manual';
  cleared: boolean;
};

/**
 * A route can contain waypoints and/or discontinuity markers.
 */
export type RouteEntry = FlightPlanWaypoint | RouteDiscontinuity;

/**
 * Type guard — narrows a `RouteEntry` to `RouteDiscontinuity`.
 */
export function isRouteDiscontinuity(entry: RouteEntry): entry is RouteDiscontinuity {
  return (entry as RouteDiscontinuity).isDiscontinuity === true;
}

// ============================================================
// ID generation
// ============================================================

let _idCounter = 0;

/**
 * Reset the internal ID counter. Intended for test use only.
 */
export function _resetIdCounter(): void {
  _idCounter = 0;
}

function generateDiscontinuityId(): string {
  _idCounter += 1;
  return `DISC-${String(_idCounter).padStart(4, '0')}`;
}

// ============================================================
// Helper functions
// ============================================================

/**
 * Creates a `RouteDiscontinuity` and inserts it into the route array
 * at the specified `position`. Returns a **new array** (immutable).
 *
 * The discontinuity's `sequence` is set to the insertion position.
 *
 * @param route  Current route entries.
 * @param source Reason the discontinuity was created.
 * @param position  Zero-based index at which to insert.
 * @returns A new route array with the discontinuity inserted.
 */
export function insertDiscontinuity(
  route: RouteEntry[],
  source: RouteDiscontinuity['source'],
  position: number,
): RouteEntry[] {
  const discontinuity: RouteDiscontinuity = {
    id: generateDiscontinuityId(),
    sequence: position,
    isDiscontinuity: true,
    legType: 'DISCONTINUITY',
    source,
    cleared: false,
  };

  const result = [...route];
  const clamped = Math.max(0, Math.min(position, result.length));
  result.splice(clamped, 0, discontinuity);

  return result;
}

/**
 * Marks a `RouteDiscontinuity` as cleared by its `id`.
 * The entry is preserved in the array for history / audit purposes.
 * Returns a **new array** (immutable).
 *
 * @param route           Current route entries.
 * @param discontinuityId The `id` of the discontinuity to clear.
 * @returns A new route array with the targeted discontinuity cleared.
 */
export function clearDiscontinuity(route: RouteEntry[], discontinuityId: string): RouteEntry[] {
  return route.map((entry) => {
    if (isRouteDiscontinuity(entry) && entry.id === discontinuityId) {
      return { ...entry, cleared: true };
    }
    return entry;
  });
}

/**
 * Returns `true` when the route contains at least one **active** (uncleared)
 * discontinuity. Cleared discontinuities are ignored.
 *
 * @param route Route entries to inspect.
 * @returns `true` if any uncleared `RouteDiscontinuity` exists in the route.
 */
export function hasActiveDiscontinuity(route: RouteEntry[]): boolean {
  return route.some((entry) => isRouteDiscontinuity(entry) && !entry.cleared);
}

/**
 * Finds a **cleared** discontinuity marker in the route array and replaces it
 * with the provided `connectingLeg` waypoint.
 *
 * The discontinuity entry is removed from the array and replaced in-place with
 * a proper `FlightPlanWaypoint` (with `discontinuity: false`).
 *
 * Only the **first** cleared discontinuity is resolved — subsequent cleared
 * discontinuities are left untouched.
 *
 * @param route         Current route entries.
 * @param connectingLeg Waypoint data to insert in place of the cleared
 *                      discontinuity. The `discontinuity` field is automatically
 *                      set to `false` on the resulting entry.
 * @returns A new route array with the first cleared discontinuity replaced by
 *          the connecting leg.
 * @throws If the route contains no cleared discontinuity.
 */
export function resolveDiscontinuity(
  route: RouteEntry[],
  connectingLeg: Omit<FlightPlanWaypoint, 'discontinuity'>,
): RouteEntry[] {
  const targetIndex = route.findIndex((entry) => isRouteDiscontinuity(entry) && entry.cleared);

  if (targetIndex === -1) {
    throw new Error('No cleared discontinuity found in route');
  }

  const waypoint: FlightPlanWaypoint = {
    ...connectingLeg,
    discontinuity: false,
  };

  const result = [...route];
  result.splice(targetIndex, 1, waypoint);

  return result;
}
