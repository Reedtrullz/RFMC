import type { FMCState } from '../../types/fmc';

export type LegActionResult = {
  handled: boolean;
  patch?: Partial<FMCState>;
};

/**
 * Detects LEGS waypoint editing actions (edit_wp_N, delete_wp_N, insert_wp_N)
 * and returns the appropriate state patch.
 *
 * Side effects that mutate arrays (deleteWaypoint, insertWaypoint) must
 * remain in the Zustand store because they modify the flight plan waypoints.
 */
export function handleLegWpAction(
  action: string,
  state: FMCState,
  scratchpad: string
): LegActionResult {
  const wpMatch = action.match(/^(edit_wp|delete_wp|insert_wp)_(\d+)$/);
  if (!wpMatch) return { handled: false };

  const wpAction = wpMatch[1];
  const wpIndex = parseInt(wpMatch[2], 10);

  if (wpAction === 'delete_wp' && state.deleteMode) {
    // Side effect: deleteWaypoint(wpIndex) — must stay in store
    return { handled: true };
  }

  if (wpAction === 'edit_wp') {
    if (scratchpad) {
      // Side effect: insertWaypoint(wpIndex, scratchpad) — must stay in store
      return { handled: true };
    }
    return {
      handled: true,
      patch: { editWaypointIndex: wpIndex, scratchpad: '', scratchpadError: null },
    };
  }

  return { handled: false };
}
