import type { FMCState } from '../../types/fmc';
import type { FmcActionResult } from './actionResult';
import { NAV_CACHE } from '../navDatabase';

export function handleProcedureAction(
  action: string,
  state: FMCState,
  scratchpad: string,
): FmcActionResult & { sideEffect?: string } {
  switch (action) {
    case 'set_sid':
      return handleSetSid(state, scratchpad);
    case 'set_rwy':
      return handleSetRwy(state, scratchpad);
    case 'set_star':
      return handleSetStar(state, scratchpad);
    case 'set_appr':
      return handleSetAppr(state, scratchpad);
    default:
      return { handled: false };
  }
}

function handleSetSid(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };
  const route = state.pendingRoute ?? state.route;

  const upper = scratchpad.toUpperCase();
  if (!/^[A-Z0-9]{3,8}$/.test(upper)) {
    return {
      handled: true,
      failure: { code: 'INVALID_ENTRY', text: 'INVALID ENTRY', source: 'procedureActions.set_sid' },
    };
  }

  if (route.origin) {
    const cachedProcedures = NAV_CACHE.procedures[route.origin.toUpperCase()];
    if (cachedProcedures && cachedProcedures.length > 0) {
      const exists = cachedProcedures.some((p) => p.ident === upper && p.type === 'SID');
      if (!exists) {
        return {
          handled: true,
          failure: { code: 'INVALID_ENTRY', text: 'INVALID ENTRY', source: 'procedureActions.set_sid' },
        };
      }
    }
  }

  return {
    handled: true,
    success: {
      clearScratchpad: true,
      sideEffect: 'expand_active_route',
      patch: {
        pendingRoute: { ...route, sid: scratchpad.toUpperCase() },
        isModified: true,
        execLit: true,
      },
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

  if (route.origin) {
    const cachedAirport = NAV_CACHE.airports[route.origin.toUpperCase()];
    if (cachedAirport && cachedAirport.runways) {
      const exists = cachedAirport.runways.some((r) => r.toUpperCase() === scratchpad.toUpperCase());
      if (!exists) {
        return {
          handled: true,
          failure: { code: 'INVALID_ENTRY', text: 'INVALID ENTRY', source: 'procedureActions.set_rwy' },
        };
      }
    }
  }

  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: {
        pendingRoute: { ...route, runway: scratchpad.toUpperCase() },
        isModified: true,
        execLit: true,
      },
    },
  };
}

function handleSetStar(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };
  const route = state.pendingRoute ?? state.route;

  const upper = scratchpad.toUpperCase();
  if (!/^[A-Z0-9]{3,8}$/.test(upper)) {
    return {
      handled: true,
      failure: { code: 'INVALID_ENTRY', text: 'INVALID ENTRY', source: 'procedureActions.set_star' },
    };
  }

  if (route.destination) {
    const cachedProcedures = NAV_CACHE.procedures[route.destination.toUpperCase()];
    if (cachedProcedures && cachedProcedures.length > 0) {
      const exists = cachedProcedures.some((p) => p.ident === upper && p.type === 'STAR');
      if (!exists) {
        return {
          handled: true,
          failure: { code: 'INVALID_ENTRY', text: 'INVALID ENTRY', source: 'procedureActions.set_star' },
        };
      }
    }
  }

  return {
    handled: true,
    success: {
      clearScratchpad: true,
      sideEffect: 'expand_active_route',
      patch: {
        pendingRoute: { ...route, star: scratchpad.toUpperCase() },
        isModified: true,
        execLit: true,
      },
    },
  };
}

function handleSetAppr(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };
  const route = state.pendingRoute ?? state.route;

  const upper = scratchpad.toUpperCase();
  if (!/^[A-Z0-9]{3,8}$/.test(upper)) {
    return {
      handled: true,
      failure: { code: 'INVALID_ENTRY', text: 'INVALID ENTRY', source: 'procedureActions.set_appr' },
    };
  }

  if (route.destination) {
    const cachedProcedures = NAV_CACHE.procedures[route.destination.toUpperCase()];
    if (cachedProcedures && cachedProcedures.length > 0) {
      const exists = cachedProcedures.some((p) => p.ident === upper && p.type === 'APPROACH');
      if (!exists) {
        return {
          handled: true,
          failure: { code: 'INVALID_ENTRY', text: 'INVALID ENTRY', source: 'procedureActions.set_appr' },
        };
      }
    }
  }

  return {
    handled: true,
    success: {
      clearScratchpad: true,
      sideEffect: 'expand_active_route',
      patch: {
        pendingRoute: { ...route, approach: scratchpad.toUpperCase() },
        isModified: true,
        execLit: true,
      },
    },
  };
}
