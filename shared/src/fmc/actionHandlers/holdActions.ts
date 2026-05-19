import type { FMCState } from '../../types/fmc';
import { isValidWaypoint } from '../validation';
import type { FmcActionResult } from './actionResult';

export function handleHoldAction(action: string, state: FMCState, scratchpad: string): FmcActionResult {
  switch (action) {
    case 'set_hold_fix':
      return handleSetHoldFix(state, scratchpad);
    case 'set_inbound_crs':
      return handleSetInboundCourse(state, scratchpad);
    case 'set_leg_time':
      return handleSetLegTime(state, scratchpad);
    case 'set_leg_dist':
      return handleSetLegDist(state, scratchpad);
    case 'set_hold_direction':
      return handleSetHoldDirection(state, scratchpad);
    default:
      return { handled: false };
  }
}

function handleSetHoldFix(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };

  const ident = scratchpad.toUpperCase();
  const result = isValidWaypoint(ident);
  if (!result.valid) {
    return {
      handled: true,
      failure: { code: 'INVALID_ENTRY' as const, text: result.error!, source: 'holdActions' },
    };
  }

  const inRoute = state.flightPlan.waypoints.some((w) => w.ident === ident);
  if (!inRoute) {
    return {
      handled: true,
      failure: { code: 'NOT_IN_ROUTE' as const, text: 'NOT IN ROUTE', source: 'holdActions' },
    };
  }

  const base = state.holdPending ?? state.hold;
  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: {
        holdPending: { ...base, fix: ident },
        isModified: true,
        execLit: true,
      },
    },
  };
}

function handleSetInboundCourse(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };

  const crs = parseInt(scratchpad, 10);
  if (isNaN(crs) || crs < 1 || crs > 360) {
    return {
      handled: true,
      failure: { code: 'OUT_OF_RANGE' as const, text: 'OUT OF RANGE', source: 'holdActions' },
    };
  }

  const base = state.holdPending ?? state.hold;
  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: {
        holdPending: { ...base, inboundCourse: crs },
        isModified: true,
        execLit: true,
      },
    },
  };
}

function handleSetLegTime(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };

  const time = parseFloat(scratchpad);
  if (isNaN(time) || time <= 0 || time > 9.9) {
    return {
      handled: true,
      failure: { code: 'OUT_OF_RANGE' as const, text: 'OUT OF RANGE', source: 'holdActions' },
    };
  }

  const base = state.holdPending ?? state.hold;
  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: {
        holdPending: { ...base, legTime: time },
        isModified: true,
        execLit: true,
      },
    },
  };
}

function handleSetLegDist(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };

  const dist = parseFloat(scratchpad);
  if (isNaN(dist) || dist < 0 || dist > 999) {
    return {
      handled: true,
      failure: { code: 'OUT_OF_RANGE' as const, text: 'OUT OF RANGE', source: 'holdActions' },
    };
  }

  const base = state.holdPending ?? state.hold;
  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: {
        holdPending: { ...base, legDist: dist },
        isModified: true,
        execLit: true,
      },
    },
  };
}

function handleSetHoldDirection(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };

  const dir = scratchpad.toUpperCase();
  if (dir !== 'L' && dir !== 'R') {
    return {
      handled: true,
      failure: { code: 'INVALID_ENTRY' as const, text: 'INVALID ENTRY', source: 'holdActions' },
    };
  }

  const base = state.holdPending ?? state.hold;
  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: {
        holdPending: { ...base, direction: dir as 'L' | 'R' },
        isModified: true,
        execLit: true,
      },
    },
  };
}
