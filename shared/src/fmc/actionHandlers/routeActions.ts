import type { FMCState } from '../../types/fmc';
import { isValidICAO, isValidFlightNumber, isValidWaypoint } from '../validation';
import { parseRouteString } from '../flightPlanParser';
import type { FmcActionResult } from './actionResult';

// ── Dispatcher ──────────────────────────────────────────────────────────────

export function handleRouteAction(
  action: string,
  state: FMCState,
  scratchpad: string,
): FmcActionResult & { sideEffect?: string } {
  switch (action) {
    case 'set_origin':
      return handleSetOrigin(state, scratchpad);
    case 'set_dest':
      return handleSetDest(state, scratchpad);
    case 'set_flt_no':
      return handleSetFltNo(state, scratchpad);
    case 'set_route':
      return handleSetRoute(state, scratchpad);
    case 'set_direct_to':
      return handleSetDirectTo(state, scratchpad);
    default:
      return { handled: false };
  }
}

// ── Existing ────────────────────────────────────────────────────────────────

export function handleSetFromTo(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };

  const parts = scratchpad.split('/');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return {
      handled: true,
      failure: { code: 'INVALID_FORMAT' as const, text: 'INVALID FORMAT', source: 'routeActions' },
    };
  }

  const from = parts[0].toUpperCase();
  const to = parts[1].toUpperCase();

  const fromResult = isValidICAO(from);
  const toResult = isValidICAO(to);
  if (!fromResult.valid || !toResult.valid) {
    return {
      handled: true,
      failure: { code: 'INVALID_FORMAT' as const, text: 'INVALID FORMAT', source: 'routeActions' },
    };
  }

  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: {
        isModified: true,
        execLit: true,
        scratchpad: '',
        scratchpadError: null,
        pendingRoute: {
          origin: from,
          destination: to,
          flightNumber: (state.pendingRoute ?? state.route)?.flightNumber ?? null,
        },
        pendingFlightPlan: {
          origin: from,
          destination: to,
          flightNumber: (state.pendingFlightPlan ?? state.flightPlan)?.flightNumber ?? '',
          route: '',
          waypoints: [],
        },
      },
      sideEffect: 'expand_active_route',
    },
  };
}

// ── Individual handlers ─────────────────────────────────────────────────────

function handleSetOrigin(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };
  const result = isValidICAO(scratchpad.toUpperCase());
  if (!result.valid)
    return {
      handled: true,
      failure: {
        code: 'INVALID_FORMAT' as const,
        text: result.error || 'INVALID ENTRY',
        source: 'routeActions.set_origin',
      },
    };
  const route = state.pendingRoute ?? state.route;
  const fp = state.pendingFlightPlan ?? state.flightPlan;
  return {
    handled: true,
    success: {
      clearScratchpad: true,
      sideEffect: 'expand_active_route',
      patch: {
        pendingRoute: { ...route, origin: scratchpad.toUpperCase() },
        pendingFlightPlan: { ...fp, origin: scratchpad.toUpperCase() },
        isModified: true,
        execLit: true,
      },
    },
  };
}

function handleSetDest(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };
  const result = isValidICAO(scratchpad.toUpperCase());
  if (!result.valid)
    return {
      handled: true,
      failure: {
        code: 'INVALID_FORMAT' as const,
        text: result.error || 'INVALID ENTRY',
        source: 'routeActions.set_dest',
      },
    };
  const route = state.pendingRoute ?? state.route;
  const fp = state.pendingFlightPlan ?? state.flightPlan;
  return {
    handled: true,
    success: {
      clearScratchpad: true,
      sideEffect: 'expand_active_route',
      patch: {
        pendingRoute: { ...route, destination: scratchpad.toUpperCase() },
        pendingFlightPlan: { ...fp, destination: scratchpad.toUpperCase() },
        isModified: true,
        execLit: true,
      },
    },
  };
}

function handleSetFltNo(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };
  const result = isValidFlightNumber(scratchpad);
  if (!result.valid)
    return {
      handled: true,
      failure: {
        code: 'INVALID_FORMAT' as const,
        text: result.error || 'INVALID ENTRY',
        source: 'routeActions.set_flt_no',
      },
    };
  const route = state.pendingRoute ?? state.route;
  const fp = state.pendingFlightPlan ?? state.flightPlan;
  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: {
        pendingRoute: { ...route, flightNumber: scratchpad.toUpperCase() },
        pendingFlightPlan: { ...fp, flightNumber: scratchpad.toUpperCase() },
        isModified: true,
        execLit: true,
      },
    },
  };
}

function handleSetRoute(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };
  const routeStr = scratchpad.toUpperCase();
  const parsed = parseRouteString(routeStr);
  const route = state.pendingRoute ?? state.route;
  const fp = state.pendingFlightPlan ?? state.flightPlan;
  const waypoints =
    parsed.waypoints.length > 0
      ? parsed.waypoints
      : [
          { ident: parsed.origin, discontinuity: false },
          { ident: parsed.destination, discontinuity: false },
        ].filter((w) => w.ident);
  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: {
        pendingRoute: { ...route, routeString: routeStr },
        pendingFlightPlan: { ...fp, waypoints, route: routeStr },
        legsPageCount: Math.max(1, Math.ceil(waypoints.length / 5)),
        isModified: true,
        execLit: true,
      },
    },
  };
}

function handleSetDirectTo(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };
  const result = isValidWaypoint(scratchpad.toUpperCase());
  if (!result.valid)
    return {
      handled: true,
      failure: {
        code: 'NOT_IN_DATABASE' as const,
        text: result.error || 'NOT IN DATABASE',
        source: 'routeActions.set_direct_to',
      },
    };
  const route = state.pendingRoute ?? state.route;
  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: {
        pendingRoute: { ...route, directTo: scratchpad.toUpperCase() },
        isModified: true,
        execLit: true,
      },
    },
  };
}
