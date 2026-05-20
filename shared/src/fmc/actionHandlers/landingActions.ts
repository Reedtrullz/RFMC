import type { FMCState } from '../../types/fmc';
import { PerformanceEngine } from '../PerformanceEngine';
import { NAV_CACHE } from '../navDatabase';
import type { FmcActionResult } from './actionResult';

export function handleLandingAction(action: string, state: FMCState, scratchpad: string): FmcActionResult {
  switch (action) {
    case 'set_qnh':
      return handleSetQnh(state, scratchpad);
    case 'set_landing_runway':
      return handleSetLandingRunway(state, scratchpad);
    case 'set_landing_flaps':
      return handleSetLandingFlaps(state, scratchpad);
    case 'set_landing_vref':
      return handleSetLandingVref(state, scratchpad);
    case 'set_ils_frequency':
      return handleSetIlsFrequency(state, scratchpad);
    case 'set_ils_course':
      return handleSetIlsCourse(state, scratchpad);
    case 'set_flaps':
      return handleSetFlaps(state, scratchpad);
    case 'set_landing_temp':
      return handleSetLandingTemp(state, scratchpad);
    case 'set_landing_wind':
      return handleSetLandingWind(state, scratchpad);
    case 'set_mda':
      return handleSetMda(state, scratchpad);
    case 'set_dh':
      return handleSetDh(state, scratchpad);
    case 'toggle_ldg_conf':
      return handleToggleLdgConf(state, scratchpad);
    default:
      return { handled: false };
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
        landing: { ...state.landing, qnh },
        isModified: true,
        execLit: true,
      },
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
  const route = state.pendingRoute ?? state.route;

  if (route.destination) {
    const cachedAirport = NAV_CACHE.airports[route.destination.toUpperCase()];
    if (cachedAirport && cachedAirport.runways) {
      const exists = cachedAirport.runways.some((r) => r.toUpperCase() === runway);
      if (!exists) {
        return {
          handled: true,
          failure: {
            code: 'INVALID_ENTRY' as const,
            text: 'INVALID ENTRY',
            source: 'landingActions.set_landing_runway',
          },
        };
      }
    }
  }

  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: {
        landing: { ...state.landing, runway },
        route: { ...state.route, runway },
        isModified: true,
        execLit: true,
      },
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
        isModified: true,
        execLit: true,
      },
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
        isModified: true,
        execLit: true,
      },
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
        isModified: true,
        execLit: true,
      },
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
        isModified: true,
        execLit: true,
      },
    },
  };
}

function handleSetFlaps(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };
  const flaps = scratchpad.toUpperCase();

  // High fidelity validation based on aircraft type
  if (state.aircraft === 'AIRBUS_A320') {
    // Airbus allows: 1, 2, 3, 1+F (optionally with pitch trim after a slash like 1/UP0.2)
    const match = flaps.match(/^([123]|1\+F)(\/[A-Z0-9.\-+]+)?$/);
    if (!match) {
      return {
        handled: true,
        failure: { code: 'INVALID_ENTRY' as const, text: 'INVALID ENTRY', source: 'landingActions.set_flaps' },
      };
    }
  } else {
    // Boeing 737: 1, 5, 10, 15, 25
    if (!['1', '5', '10', '15', '25'].includes(flaps)) {
      return {
        handled: true,
        failure: { code: 'INVALID_ENTRY' as const, text: 'INVALID ENTRY', source: 'landingActions.set_flaps' },
      };
    }
  }

  const takeoff = { ...state.takeoff, flaps };
  const speeds = PerformanceEngine.calculateTakeoffSpeeds(state.performance.grossWeight || 140000, flaps);
  takeoff.suggestedV1 = speeds.v1;
  takeoff.suggestedVr = speeds.vr;
  takeoff.suggestedV2 = speeds.v2;
  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: {
        takeoff,
        isModified: true,
        execLit: true,
      },
    },
  };
}

function handleSetLandingTemp(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };
  const temp = parseInt(scratchpad, 10);
  if (isNaN(temp) || temp < -50 || temp > 60) {
    return {
      handled: true,
      failure: { code: 'INVALID_ENTRY' as const, text: 'INVALID ENTRY', source: 'landingActions.set_landing_temp' },
    };
  }
  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: {
        landing: { ...state.landing, temp },
        isModified: true,
        execLit: true,
      },
    },
  };
}

function handleSetLandingWind(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };
  const match = scratchpad.match(/^(\d{1,3})\/(\d{1,3})$/);
  if (!match) {
    return {
      handled: true,
      failure: { code: 'INVALID_ENTRY' as const, text: 'INVALID ENTRY', source: 'landingActions.set_landing_wind' },
    };
  }
  const windDir = parseInt(match[1], 10);
  const windSpeed = parseInt(match[2], 10);
  if (isNaN(windDir) || windDir < 0 || windDir > 360 || isNaN(windSpeed) || windSpeed < 0 || windSpeed > 150) {
    return {
      handled: true,
      failure: { code: 'INVALID_ENTRY' as const, text: 'INVALID ENTRY', source: 'landingActions.set_landing_wind' },
    };
  }
  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: {
        landing: { ...state.landing, windDir, windSpeed },
        isModified: true,
        execLit: true,
      },
    },
  };
}

function handleSetMda(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };
  const mda = parseInt(scratchpad, 10);
  if (isNaN(mda) || mda < 0 || mda > 20000) {
    return {
      handled: true,
      failure: { code: 'INVALID_ENTRY' as const, text: 'INVALID ENTRY', source: 'landingActions.set_mda' },
    };
  }
  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: {
        landing: { ...state.landing, mda },
        isModified: true,
        execLit: true,
      },
    },
  };
}

function handleSetDh(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };
  const dh = parseInt(scratchpad, 10);
  if (isNaN(dh) || dh < 0 || dh > 1000) {
    return {
      handled: true,
      failure: { code: 'INVALID_ENTRY' as const, text: 'INVALID ENTRY', source: 'landingActions.set_dh' },
    };
  }
  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: {
        landing: { ...state.landing, dh },
        isModified: true,
        execLit: true,
      },
    },
  };
}

function handleToggleLdgConf(state: FMCState, scratchpad: string): FmcActionResult {
  let nextVal: 'FULL' | 'CONF3';
  if (!scratchpad) {
    const current = state.landing.ldgConf || 'FULL';
    nextVal = current === 'FULL' ? 'CONF3' : 'FULL';
  } else {
    const val = scratchpad.toUpperCase();
    if (val === 'FULL') {
      nextVal = 'FULL';
    } else if (val === '3' || val === 'CONF3') {
      nextVal = 'CONF3';
    } else {
      return {
        handled: true,
        failure: { code: 'INVALID_ENTRY' as const, text: 'INVALID ENTRY', source: 'landingActions.toggle_ldg_conf' },
      };
    }
  }
  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: {
        landing: { ...state.landing, ldgConf: nextVal, flaps: nextVal },
        isModified: true,
        execLit: true,
      },
    },
  };
}
