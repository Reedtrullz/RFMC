import type { FMCState } from '../../types/fmc';
import { parseWaypointInput } from '../waypointParser';
import { distanceNm } from '../ndGeometry';
import { getWaypoint, getAirport } from '../airFMCData';
import type { FmcActionResult } from './actionResult';

export function handleIrsAction(action: string, state: FMCState, scratchpad: string): FmcActionResult {
  switch (action) {
    case 'set_irs_pos':
      return handleSetIrsPos(state, scratchpad);
    default:
      return { handled: false };
  }
}

function handleSetIrsPos(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };

  if (state.position.irsState !== 'ALIGNING' && state.position.irsState !== 'FAST_ALIGNING') {
    return {
      handled: true,
      failure: { code: 'NOT_IN_ALIGN_MODE' as const, text: 'NOT IN ALIGN MODE', source: 'irsActions' },
    };
  }

  const parsed = parseWaypointInput(scratchpad, (id) => getWaypoint(id));
  if (!parsed || parsed.type !== 'LAT_LONG') {
    return {
      handled: true,
      failure: { code: 'INVALID_ENTRY' as const, text: 'INVALID ENTRY', source: 'irsActions' },
    };
  }

  if (state.route.origin) {
    const origin = getAirport(state.route.origin);
    if (origin) {
      const dist = distanceNm({ lat: parsed.lat, lon: parsed.lon }, { lat: origin.lat, lon: origin.lon });
      if (dist > 50) {
        return {
          handled: true,
          failure: { code: 'VERIFY_POSITION' as const, text: 'VERIFY POSITION', source: 'irsActions' },
        };
      }
    }
  }

  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: {
        position: {
          ...state.position,
          lat: parsed.lat,
          lon: parsed.lon,
          irsAlignmentProgress: 0,
          irsTimeRemaining: state.position.irsState === 'FAST_ALIGNING' ? 30 : 600,
        },
      },
    },
  };
}
