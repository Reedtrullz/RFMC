import type { FMCState, FlightPlan, AcarsMessage } from '../../types/fmc';
import type { FmcActionResult } from './actionResult';

/**
 * ATSU uplink — creates a sample flight plan and makes it available for load.
 * In a full implementation this would come from actual ACARS data.
 */
function handleAtsuUplink(state: FMCState): FmcActionResult {
  const uplink: FlightPlan = {
    origin: 'KJFK',
    destination: 'KLAX',
    flightNumber: 'AAL777',
    route: 'PARCH3 ROBER J121 Sieg J121 Jfk',
    waypoints: [
      { ident: 'PARCH', lat: 39.43, lon: -74.56, discontinuity: false },
      { ident: 'ROBER', lat: 39.87, lon: -74.12, discontinuity: false },
    ],
  };

  return {
    handled: true,
    success: {
      clearScratchpad: true,
      sideEffect: 'atsu_uplink_received',
      patch: {
        atsu: { ...state.atsu, pendingUplink: uplink },
        scratchpadMessages: [
          ...state.scratchpadMessages,
          {
            id: `uplink_${Date.now()}`,
            text: 'RTE UPLINK',
            severity: 'IMPORTANT' as const,
            timestamp: Date.now(),
          },
        ],
      },
    },
  };
}

/** Navigate to ATSU page. */
function handleAtsuPage(): FmcActionResult {
  return {
    handled: true,
    success: { targetPage: 'ATSU' },
  };
}

/** Navigate to ATSU_MSGS page. */
function handleAtsuMsgsPage(): FmcActionResult {
  return {
    handled: true,
    success: { targetPage: 'ATSU_MSGS' },
  };
}

/** Load the pending uplink route into the pending flight plan. */
function handleAtsuLoadRoute(state: FMCState): FmcActionResult {
  const uplink = state.atsu.pendingUplink;
  if (!uplink) {
    return {
      handled: true,
      failure: { code: 'INVALID_ENTRY' as const, text: 'NO UPLINK', source: 'atsuActions' },
    };
  }

  return {
    handled: true,
    success: {
      clearScratchpad: true,
      sideEffect: 'expand_active_route',
      patch: {
        pendingFlightPlan: { ...uplink },
        pendingRoute: { ...state.route, origin: uplink.origin, destination: uplink.destination },
        isModified: true,
        execLit: true,
        scratchpad: '',
        scratchpadError: null,
        atsu: { ...state.atsu, pendingUplink: null },
      },
    },
  };
}

/** View a specific ATSU message detail. */
function handleViewMessage(state: FMCState, msgId: string): FmcActionResult {
  const msgs: AcarsMessage[] = state.atsu.messages.map((m) => (m.id === msgId ? { ...m, read: true } : m));

  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: {
        page: 'ATSU_MSG_DETAIL',
        selectedMessageId: msgId,
        atsu: { ...state.atsu, messages: msgs },
      },
    },
  };
}

/** Dispatch ATSU-related LSK actions. */
export function handleAtsuAction(action: string, state: FMCState, _scratchpad: string): FmcActionResult {
  switch (action) {
    case 'atsu_uplink':
      return handleAtsuUplink(state);
    case 'atsu':
      return handleAtsuPage();
    case 'atsu_msgs':
      return handleAtsuMsgsPage();
    case 'atsu_load_route':
      return handleAtsuLoadRoute(state);
    default:
      // view_msg_* actions
      if (action.startsWith('view_msg_')) {
        const msgId = action.replace('view_msg_', '');
        return handleViewMessage(state, msgId);
      }
      return { handled: false };
  }
}
