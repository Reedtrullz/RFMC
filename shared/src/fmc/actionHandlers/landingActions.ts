import type { FMCState } from '../../types/fmc';
import { PerformanceEngine } from '../PerformanceEngine';
import type { FmcActionResult } from './actionResult';

export function handleLandingAction(
  action: string,
  state: FMCState,
  scratchpad: string
): FmcActionResult {
  switch (action) {
    case 'set_qnh':            return handleSetQnh(state, scratchpad);
    case 'set_landing_runway': return handleSetLandingRunway(state, scratchpad);
    case 'set_landing_flaps':  return handleSetLandingFlaps(state, scratchpad);
    case 'set_landing_vref':   return handleSetLandingVref(state, scratchpad);
    case 'set_ils_frequency':  return handleSetIlsFrequency(state, scratchpad);
    case 'set_ils_course':     return handleSetIlsCourse(state, scratchpad);
    case 'set_flaps':          return handleSetFlaps(state, scratchpad);
    default:                   return { handled: false };
  }
}

function handleSetQnh(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };
  const qnh = parseFloat(scratchpad);
  if (isNaN(qnh) || qnh < 900 || qnh > 1100) {
    return {
      handled: true,
      failure: { code: 'INVALID_ENTRY' as const, text: 'INVALID ENTRY', source: 'landingActions.set_qnh' },
    };
  }
  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: {
        takeoff: { ...state.takeoff, qnh: qnh * 100 },
        isModified: true, execLit: true,
      } as any,
    },
  };
}

function handleSetLandingRunway(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };
  if (scratchpad.length < 2) {
    return {
      handled: true,
      failure: { code: 'INVALID_ENTRY' as const, text: 'INVALID ENTRY', source: 'landingActions.set_landing_runway' },
    };
  }
  const runway = scratchpad.toUpperCase();
  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: {
        landing: { ...state.landing, runway },
        route: { ...state.route, runway },
        isModified: true, execLit: true,
      } as any,
    },
  };
}

function handleSetLandingFlaps(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };
  const flaps = scratchpad.toUpperCase();
  if (!['15', '30', '40'].includes(flaps)) {
    return {
      handled: true,
      failure: { code: 'INVALID_ENTRY' as const, text: 'INVALID ENTRY', source: 'landingActions.set_landing_flaps' },
    };
  }
  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: {
        landing: { ...state.landing, flaps },
        isModified: true, execLit: true,
      } as any,
    },
  };
}

function handleSetLandingVref(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };
  const vref = parseInt(scratchpad, 10);
  if (isNaN(vref) || vref < 80 || vref > 200) {
    return {
      handled: true,
      failure: { code: 'INVALID_ENTRY' as const, text: 'INVALID ENTRY', source: 'landingActions.set_landing_vref' },
    };
  }
  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: {
        landing: { ...state.landing, vref },
        isModified: true, execLit: true,
      } as any,
    },
  };
}

function handleSetIlsFrequency(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };
  const frequency = parseFloat(scratchpad);
  if (isNaN(frequency) || frequency < 108.1 || frequency > 111.95) {
    return {
      handled: true,
      failure: { code: 'INVALID_ENTRY' as const, text: 'INVALID ENTRY', source: 'landingActions.set_ils_frequency' },
    };
  }
  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: {
        landing: { ...state.landing, ilsFrequency: frequency.toFixed(2) },
        isModified: true, execLit: true,
      } as any,
    },
  };
}

function handleSetIlsCourse(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };
  const course = parseInt(scratchpad, 10);
  if (isNaN(course) || course < 1 || course > 360) {
    return {
      handled: true,
      failure: { code: 'OUT_OF_RANGE' as const, text: 'OUT OF RANGE', source: 'landingActions.set_ils_course' },
    };
  }
  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: {
        landing: { ...state.landing, course },
        isModified: true, execLit: true,
      } as any,
    },
  };
}

function handleSetFlaps(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };
  const flaps = scratchpad.toUpperCase();
  const takeoff = { ...state.takeoff, flaps };
  const speeds = PerformanceEngine.calculateTakeoffSpeeds(
    state.performance.grossWeight || 140000,
    flaps
  );
  takeoff.suggestedV1 = speeds.v1;
  takeoff.suggestedVr = speeds.vr;
  takeoff.suggestedV2 = speeds.v2;
  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: {
        takeoff,
        isModified: true, execLit: true,
      } as any,
    },
  };
}
