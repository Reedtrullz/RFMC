import type { FMCState } from '../../types/fmc';
import type { FmcActionResult } from './actionResult';

export function handleSpecialLskAction(
  action: string,
  state: FMCState,
  _scratchpad: string,
): FmcActionResult & { sideEffect?: string; returnEarly?: boolean } {
  switch (action) {
    case 'des_now':
      return {
        handled: true,
        success: {
          clearScratchpad: true,
          patch: {
            scratchpad: 'DES NOW ARMED',
            scratchpadError: null,
            msgLight: true,
          },
        },
      };

    case 'step_plan':
      return {
        handled: true,
        sideEffect: 'step_plan',
        returnEarly: true,
      };

    case 'align_irs': {
      const supportedAircraft = ['BOEING_737', 'AIRBUS_A320'];
      if (!supportedAircraft.includes(state.aircraft)) {
        return { handled: false };
      }
      const alignDuration = state.demoMode ? 1 : 600;
      return {
        handled: true,
        success: {
          clearScratchpad: true,
          patch: {
            position: {
              ...state.position,
              irsState: 'ALIGNING' as const,
              irsAlignmentProgress: 0,
              irsTimeRemaining: alignDuration,
            },
          },
        },
      };
    }

    case 'erase':
      return {
        handled: true,
        success: {
          clearScratchpad: true,
          patch: {
            pendingRoute: null,
            pendingFlightPlan: null,
            holdPending: null,
            isModified: false,
            execLit: false,
            editWaypointIndex: null,
          },
        },
      };

    case 'copy_active':
      return {
        handled: true,
        success: {
          clearScratchpad: true,
          patch: {
            isModified: true,
            execLit: true,
            scratchpad: 'COPIED TO SEC',
            scratchpadError: null,
            msgLight: true,
            pendingFlightPlan: state.flightPlan,
            pendingRoute: state.route,
          },
        },
      };

    case 'activate_sec':
      return {
        handled: true,
        success: {
          clearScratchpad: true,
          patch: {
            flightPlan: state.pendingFlightPlan || state.flightPlan,
            route: state.pendingRoute || state.route,
            pendingRoute: null,
            pendingFlightPlan: null,
            holdPending: null,
            isModified: false,
            execLit: false,
            scratchpad: 'SEC PLAN ACTIVE',
            scratchpadError: null,
            msgLight: true,
          },
        },
      };

    default:
      return { handled: false };
  }
}
