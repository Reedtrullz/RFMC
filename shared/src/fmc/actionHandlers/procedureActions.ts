import type { FMCState } from '../../types/fmc';
import type { FmcActionResult } from './actionResult';

export function handleProcedureAction(
  action: string,
  state: FMCState,
  scratchpad: string
): FmcActionResult & { sideEffect?: string } {
  switch (action) {
    case 'set_sid':   return handleSetSid(state, scratchpad);
    case 'set_rwy':   return handleSetRwy(state, scratchpad);
    case 'set_star':  return handleSetStar(state, scratchpad);
    case 'set_appr':  return handleSetAppr(state, scratchpad);
    default:          return { handled: false };
  }
}

function handleSetSid(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };
  const route = state.pendingRoute ?? state.route;
  return {
    handled: true,
    success: {
      clearScratchpad: true,
      sideEffect: 'expand_active_route',
      patch: {
        pendingRoute: { ...route, sid: scratchpad.toUpperCase() },
        isModified: true, execLit: true,
      } as any,
    },
  };
}

function handleSetRwy(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };
  if (scratchpad.length < 2) {
    return {
      handled: true,
      failure: { code: 'INVALID_ENTRY' as const, text: 'INVALID ENTRY', source: 'procedureActions.set_rwy' },
    };
  }
  const route = state.pendingRoute ?? state.route;
  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: {
        pendingRoute: { ...route, runway: scratchpad.toUpperCase() },
        isModified: true, execLit: true,
      } as any,
    },
  };
}

function handleSetStar(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };
  const route = state.pendingRoute ?? state.route;
  return {
    handled: true,
    success: {
      clearScratchpad: true,
      sideEffect: 'expand_active_route',
      patch: {
        pendingRoute: { ...route, star: scratchpad.toUpperCase() },
        isModified: true, execLit: true,
      } as any,
    },
  };
}

function handleSetAppr(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };
  const route = state.pendingRoute ?? state.route;
  return {
    handled: true,
    success: {
      clearScratchpad: true,
      sideEffect: 'expand_active_route',
      patch: {
        pendingRoute: { ...route, approach: scratchpad.toUpperCase() },
        isModified: true, execLit: true,
      } as any,
    },
  };
}
