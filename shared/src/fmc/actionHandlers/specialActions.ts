import type { FMCState } from '../../types/fmc';

export interface SpecialActionResult {
  handled: boolean;
  patch?: Partial<FMCState>;
  targetPage?: string;
  sideEffect?: 'step_plan' | 'print_message' | null;
  returnEarly?: boolean;
}

export function handleSpecialLskAction(
  action: string,
  state: FMCState,
  _scratchpad: string
): SpecialActionResult {
  switch (action) {
    case 'des_now':
      return {
        handled: true,
        patch: { scratchpad: 'DES NOW ARMED', scratchpadError: null, msgLight: true },
      };

    case 'step_plan':
      return { handled: true, sideEffect: 'step_plan', returnEarly: true };

    case 'align_irs':
      if (state.aircraft === 'AIRBUS_A320' || state.aircraft === 'BOEING_737') {
        return {
          handled: true,
          patch: {
            position: {
              ...state.position,
              irsState: 'ALIGNING',
              irsAlignmentProgress: 0,
              irsTimeRemaining: state.demoMode ? 1 : 420,
            },
          },
        };
      }
      return { handled: false };

    case 'erase':
      return {
        handled: true,
        patch: {
          pendingRoute: null,
          pendingFlightPlan: null,
          holdPending: null,
          isModified: false,
          execLit: false,
          editWaypointIndex: null,
          scratchpad: '',
          scratchpadError: null,
        },
      };

    case 'copy_active':
      return {
        handled: true,
        patch: {
          pendingFlightPlan: { ...state.flightPlan },
          pendingRoute: { ...state.route },
          isModified: true,
          execLit: true,
          scratchpad: 'COPIED TO SEC',
          msgLight: true,
        },
      };

    case 'print_msg':
      return {
        handled: true,
        patch: { scratchpad: 'PRINTING...', msgLight: true },
        sideEffect: 'print_message',
      };

    default:
      if (action.startsWith('view_msg_')) {
        const msgId = action.replace('view_msg_', '');
        const newMessages = state.atsu.messages.map(m =>
          m.id === msgId ? { ...m, read: true } : m
        );
        return {
          handled: true,
          patch: {
            selectedMessageId: msgId,
            currentPage: 'ATSU_MSG_DETAIL',
            atsu: { ...state.atsu, messages: newMessages },
          },
        };
      }
      return { handled: false };
  }
}
