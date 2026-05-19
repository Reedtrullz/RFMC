import type { FMCState } from '../../types/fmc';
import type { FmcActionResult } from './actionResult';

export function handleLegWpAction(
  action: string,
  state: FMCState,
  scratchpad: string,
): FmcActionResult & { sideEffect?: string } {
  const match = action.match(/^(edit_wp|delete_wp|insert_wp)_(\d+)$/);
  if (!match) return { handled: false };

  const wpAction = match[1];
  const wpIdx = parseInt(match[2], 10);

  if (wpAction === 'edit_wp' && scratchpad) {
    return { handled: true };
  }

  if (wpAction === 'edit_wp' && !scratchpad) {
    return {
      handled: true,
      success: {
        clearScratchpad: true,
        patch: {
          editWaypointIndex: wpIdx,
          scratchpad: '',
          scratchpadError: null,
        },
      },
    };
  }

  if (wpAction === 'delete_wp' && state.deleteMode) {
    return { handled: true, sideEffect: `delete_waypoint_${wpIdx}` };
  }

  return { handled: false };
}
