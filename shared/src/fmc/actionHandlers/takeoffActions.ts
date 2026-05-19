import type { FMCState } from '../../types/fmc';
import { isValidTemperature, isValidWind } from '../validation';
import type { FmcActionResult } from './actionResult';

const VALID_TO_MODES = ['TO', 'TO 1', 'TO 2'];

export function handleSelectTo(state: FMCState, scratchpad: string): FmcActionResult {
  const mode = scratchpad || 'TO';
  return {
    handled: true,
    success: { clearScratchpad: true, patch: { takeoff: { ...state.takeoff, toMode: mode } } },
  };
}

export function handleSelectTo1(state: FMCState): FmcActionResult {
  return {
    handled: true,
    success: { clearScratchpad: true, patch: { takeoff: { ...state.takeoff, toMode: 'TO 1' } } },
  };
}

export function handleSelectTo2(state: FMCState): FmcActionResult {
  return {
    handled: true,
    success: { clearScratchpad: true, patch: { takeoff: { ...state.takeoff, toMode: 'TO 2' } } },
  };
}

export function handleSetRunway(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };

  if (scratchpad.length < 2) {
    return {
      handled: true,
      failure: { code: 'INVALID_ENTRY' as const, text: 'INVALID ENTRY', source: 'takeoffActions' },
    };
  }

  const runway = scratchpad.toUpperCase();
  const prevRunway = state.takeoff.runway;

  if (prevRunway && prevRunway !== runway && (state.takeoff.v1 || state.takeoff.vr || state.takeoff.v2)) {
    return {
      handled: true,
      success: {
        clearScratchpad: true,
        scratchpadMessage: 'V SPEEDS DELETED',
        patch: {
          takeoff: { ...state.takeoff, runway, v1: 0, vr: 0, v2: 0 },
          msgLight: true,
          isModified: true,
          execLit: true,
        },
      },
    };
  }

  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: { takeoff: { ...state.takeoff, runway }, isModified: true, execLit: true },
    },
  };
}

export function handleSetToMode(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };

  if (!VALID_TO_MODES.includes(scratchpad.toUpperCase())) {
    return {
      handled: true,
      failure: { code: 'INVALID_ENTRY' as const, text: 'INVALID ENTRY', source: 'takeoffActions' },
    };
  }

  return {
    handled: true,
    success: { clearScratchpad: true, patch: { takeoff: { ...state.takeoff, toMode: scratchpad.toUpperCase() } } },
  };
}

export function handleSetV1(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) {
    if (state.takeoff.suggestedV1) {
      return {
        handled: true,
        success: {
          clearScratchpad: true,
          patch: { takeoff: { ...state.takeoff, v1: state.takeoff.suggestedV1 }, isModified: true, execLit: true },
        },
      };
    }
    return { handled: false };
  }

  const v1 = parseInt(scratchpad, 10);
  if (isNaN(v1) || v1 < 0 || v1 > 400) {
    return {
      handled: true,
      failure: { code: 'OUT_OF_RANGE' as const, text: 'OUT OF RANGE', source: 'takeoffActions' },
    };
  }

  if (state.takeoff.vr && v1 >= state.takeoff.vr) {
    return {
      handled: true,
      failure: { code: 'V_SPEEDS_DELETED' as const, text: 'V1 MUST BE < VR', source: 'takeoffActions' },
    };
  }

  return {
    handled: true,
    success: { clearScratchpad: true, patch: { takeoff: { ...state.takeoff, v1 }, isModified: true, execLit: true } },
  };
}

export function handleSetVr(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) {
    if (state.takeoff.suggestedVr) {
      return {
        handled: true,
        success: {
          clearScratchpad: true,
          patch: { takeoff: { ...state.takeoff, vr: state.takeoff.suggestedVr }, isModified: true, execLit: true },
        },
      };
    }
    return { handled: false };
  }

  const vr = parseInt(scratchpad, 10);
  if (isNaN(vr) || vr < 0 || vr > 400) {
    return {
      handled: true,
      failure: { code: 'OUT_OF_RANGE' as const, text: 'OUT OF RANGE', source: 'takeoffActions' },
    };
  }

  if (state.takeoff.v1 && vr <= state.takeoff.v1) {
    return {
      handled: true,
      failure: { code: 'V_SPEEDS_DELETED' as const, text: 'V1 MUST BE < VR', source: 'takeoffActions' },
    };
  }

  if (state.takeoff.v2 && vr >= state.takeoff.v2) {
    return {
      handled: true,
      failure: { code: 'V_SPEEDS_DELETED' as const, text: 'VR MUST BE < V2', source: 'takeoffActions' },
    };
  }

  return {
    handled: true,
    success: { clearScratchpad: true, patch: { takeoff: { ...state.takeoff, vr }, isModified: true, execLit: true } },
  };
}

export function handleSetV2(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) {
    if (state.takeoff.suggestedV2) {
      return {
        handled: true,
        success: {
          clearScratchpad: true,
          patch: { takeoff: { ...state.takeoff, v2: state.takeoff.suggestedV2 }, isModified: true, execLit: true },
        },
      };
    }
    return { handled: false };
  }

  const v2 = parseInt(scratchpad, 10);
  if (isNaN(v2) || v2 < 0 || v2 > 400) {
    return {
      handled: true,
      failure: { code: 'OUT_OF_RANGE' as const, text: 'OUT OF RANGE', source: 'takeoffActions' },
    };
  }

  if (state.takeoff.vr && v2 <= state.takeoff.vr) {
    return {
      handled: true,
      failure: { code: 'V_SPEEDS_DELETED' as const, text: 'VR MUST BE < V2', source: 'takeoffActions' },
    };
  }

  return {
    handled: true,
    success: { clearScratchpad: true, patch: { takeoff: { ...state.takeoff, v2 }, isModified: true, execLit: true } },
  };
}

export function handleSetTrim(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };

  const trim = parseFloat(scratchpad);
  if (isNaN(trim)) {
    return {
      handled: true,
      failure: { code: 'INVALID_ENTRY' as const, text: 'INVALID ENTRY', source: 'takeoffActions' },
    };
  }

  if (trim < 0 || trim > 17) {
    return {
      handled: true,
      failure: { code: 'OUT_OF_RANGE' as const, text: 'OUT OF RANGE', source: 'takeoffActions' },
    };
  }

  return {
    handled: true,
    success: { clearScratchpad: true, patch: { takeoff: { ...state.takeoff, trim } } },
  };
}

export function handleSetOat(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };

  const result = isValidTemperature(scratchpad);
  if (!result.valid) {
    return {
      handled: true,
      failure: { code: 'OUT_OF_RANGE' as const, text: 'OUT OF RANGE', source: 'takeoffActions' },
    };
  }

  const oat = parseInt(scratchpad, 10) || 0;
  return {
    handled: true,
    success: { clearScratchpad: true, patch: { takeoff: { ...state.takeoff, oat } } },
  };
}

export function handleSetAssumedTemp(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };

  const temp = parseInt(scratchpad, 10);
  if (isNaN(temp)) {
    return {
      handled: true,
      failure: { code: 'INVALID_ENTRY' as const, text: 'INVALID ENTRY', source: 'takeoffActions' },
    };
  }

  return {
    handled: true,
    success: { clearScratchpad: true, patch: { takeoff: { ...state.takeoff, assumedTemp: temp } } },
  };
}

export function handleTakeoffWind(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };

  const wRes = isValidWind(scratchpad);
  if (!wRes.valid) {
    return {
      handled: true,
      failure: { code: 'INVALID_FORMAT' as const, text: 'INVALID FORMAT', source: 'takeoffActions' },
    };
  }

  const [wdir, wspd] = scratchpad.split('/');
  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: {
        takeoff: {
          ...state.takeoff,
          windDir: parseInt(wdir) || 0,
          windSpeed: parseInt(wspd) || 0,
        },
      },
    },
  };
}

export function handleTakeoffAction(action: string, state: FMCState, scratchpad: string): FmcActionResult {
  switch (action) {
    case 'select_to':
      return handleSelectTo(state, scratchpad);
    case 'select_clb':
      return { handled: true, success: { patch: { takeoff: { ...state.takeoff, toMode: 'CLB' } } } };
    case 'select_crz':
      return { handled: true, success: { patch: { takeoff: { ...state.takeoff, toMode: 'CRZ' } } } };
    case 'select_con':
      return { handled: true, success: { patch: { takeoff: { ...state.takeoff, toMode: 'CON' } } } };
    case 'select_to_1':
      return handleSelectTo1(state);
    case 'select_to_2':
      return handleSelectTo2(state);
    case 'set_runway':
      return handleSetRunway(state, scratchpad);
    case 'set_to_mode':
      return handleSetToMode(state, scratchpad);
    case 'set_v1':
      return handleSetV1(state, scratchpad);
    case 'set_vr':
      return handleSetVr(state, scratchpad);
    case 'set_v2':
      return handleSetV2(state, scratchpad);
    case 'set_trim':
      return handleSetTrim(state, scratchpad);
    case 'set_oat':
      return handleSetOat(state, scratchpad);
    case 'set_assumed_temp':
      return handleSetAssumedTemp(state, scratchpad);
    case 'set_wind':
      return handleTakeoffWind(state, scratchpad);
    default:
      return { handled: false };
  }
}
