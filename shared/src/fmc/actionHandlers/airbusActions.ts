import type { FMCState } from '../../types/fmc';
import { isValidAltitude, isValidICAO, isValidFlightNumber } from '../validation';
import type { FmcActionResult } from './actionResult';

export function handleAirbusAction(action: string, state: FMCState, scratchpad: string): FmcActionResult {
  switch (action) {
    case 'set_crz_fl':
      return handleSetCrzFl(state, scratchpad);
    case 'set_altn':
      return handleSetAltn(state, scratchpad);
    case 'set_block':
      return handleSetBlock(state, scratchpad);
    case 'set_flt_nbr':
      return handleSetFltNbr(state, scratchpad);
    case 'set_flex':
      return handleSetFlex(state, scratchpad);
    case 'set_cg':
      return handleSetCg(state, scratchpad);
    default:
      return { handled: false };
  }
}

function handleSetCrzFl(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };

  const result = isValidAltitude(scratchpad);
  if (!result.valid) {
    return {
      handled: true,
      failure: { code: 'OUT_OF_RANGE' as const, text: result.error!, source: 'airbusActions' },
    };
  }

  const crzAlt = parseInt(scratchpad) * 100 || parseInt(scratchpad) || 0;
  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: { performance: { ...state.performance, crzAlt } },
    },
  };
}

function handleSetAltn(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };

  const result = isValidICAO(scratchpad.toUpperCase());
  if (!result.valid) {
    return {
      handled: true,
      failure: { code: 'INVALID_ENTRY' as const, text: result.error!, source: 'airbusActions' },
    };
  }

  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: { route: { ...state.route, alternate: scratchpad.toUpperCase() } },
    },
  };
}

function handleSetBlock(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };

  const fuel = parseFloat(scratchpad);
  if (isNaN(fuel) || fuel <= 0) {
    return {
      handled: true,
      failure: { code: 'INVALID_ENTRY' as const, text: 'INVALID ENTRY', source: 'airbusActions' },
    };
  }

  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: { performance: { ...state.performance, fuel: fuel * 1000 } },
    },
  };
}

function handleSetFltNbr(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };

  const result = isValidFlightNumber(scratchpad);
  if (!result.valid) {
    return {
      handled: true,
      failure: { code: 'INVALID_ENTRY' as const, text: result.error!, source: 'airbusActions' },
    };
  }

  const flt = scratchpad.toUpperCase();
  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: {
        route: { ...state.route, flightNumber: flt },
        flightPlan: { ...state.flightPlan, flightNumber: flt },
      },
    },
  };
}

function handleSetFlex(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };

  const temp = parseInt(scratchpad, 10);
  if (isNaN(temp)) {
    return {
      handled: true,
      failure: { code: 'INVALID_ENTRY' as const, text: 'INVALID ENTRY', source: 'airbusActions' },
    };
  }

  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: { takeoff: { ...state.takeoff, flexTemp: temp } },
    },
  };
}

function handleSetCg(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };

  const cg = parseFloat(scratchpad);
  if (isNaN(cg)) {
    return {
      handled: true,
      failure: { code: 'INVALID_ENTRY' as const, text: 'INVALID ENTRY', source: 'airbusActions' },
    };
  }

  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: { performance: { ...state.performance, cg } },
    },
  };
}
