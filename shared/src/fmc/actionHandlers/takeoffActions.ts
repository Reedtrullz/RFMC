import type { FMCState } from '../../types/fmc';
import { isValidSpeed, isValidTemperature, isValidVSpeeds, isValidWind } from '../validation';

export interface TakeoffActionResult {
  handled: boolean;
  patch?: Partial<FMCState>;
  scratchpadError?: string;
  scratchpadMessage?: string;
}

export function handleSelectTo(
  state: FMCState,
  scratchpad: string
): TakeoffActionResult {
  const toMode = scratchpad ? scratchpad.toUpperCase() : 'TO';
  return {
    handled: true,
    patch: { takeoff: { ...state.takeoff, toMode } },
  };
}

export function handleSelectTo1(
  state: FMCState
): TakeoffActionResult {
  return {
    handled: true,
    patch: { takeoff: { ...state.takeoff, toMode: 'TO 1' } },
  };
}

export function handleSelectTo2(
  state: FMCState
): TakeoffActionResult {
  return {
    handled: true,
    patch: { takeoff: { ...state.takeoff, toMode: 'TO 2' } },
  };
}

export function handleSetRunway(
  state: FMCState,
  scratchpad: string
): TakeoffActionResult {
  if (!scratchpad) return { handled: false };

  if (scratchpad.length < 2) {
    return { handled: true, scratchpadError: 'INVALID ENTRY' };
  }

  const runway = scratchpad.toUpperCase();
  const runwayChanged = !!(state.takeoff.runway && state.takeoff.runway !== runway);
  const speedsEntered = state.takeoff.v1 > 0 || state.takeoff.vr > 0 || state.takeoff.v2 > 0;

  if (runwayChanged && speedsEntered) {
    return {
      handled: true,
      patch: {
        takeoff: { ...state.takeoff, runway, v1: 0, vr: 0, v2: 0 },
        msgLight: true,
      },
      scratchpadMessage: 'V SPEEDS DELETED',
    };
  }

  return {
    handled: true,
    patch: { takeoff: { ...state.takeoff, runway } },
  };
}

export function handleSetToMode(
  state: FMCState,
  scratchpad: string
): TakeoffActionResult {
  if (!scratchpad) return { handled: false };

  const mode = scratchpad.toUpperCase();
  if (!['TO', 'TO 1', 'TO 2'].includes(mode)) {
    return { handled: true, scratchpadError: 'INVALID ENTRY' };
  }

  return {
    handled: true,
    patch: { takeoff: { ...state.takeoff, toMode: mode } },
  };
}

function buildV1Patch(state: FMCState, scratchpad: string): TakeoffActionResult {
  if (scratchpad) {
    const v1 = parseInt(scratchpad, 10);
    const result = isValidSpeed(scratchpad);
    if (!result.valid) {
      return { handled: true, scratchpadError: result.error };
    }
    const newTakeoff = { ...state.takeoff, v1 };
    const vsResult = isValidVSpeeds(newTakeoff.v1, newTakeoff.vr, newTakeoff.v2);
    if (!vsResult.valid) {
      return { handled: true, scratchpadError: vsResult.error };
    }
    return { handled: true, patch: { takeoff: newTakeoff } };
  }
  if (state.takeoff.suggestedV1) {
    return {
      handled: true,
      patch: { takeoff: { ...state.takeoff, v1: state.takeoff.suggestedV1 } },
    };
  }
  return { handled: false };
}

export function handleSetV1(
  state: FMCState,
  scratchpad: string
): TakeoffActionResult {
  return buildV1Patch(state, scratchpad);
}

function buildVrPatch(state: FMCState, scratchpad: string): TakeoffActionResult {
  if (scratchpad) {
    const vr = parseInt(scratchpad, 10);
    const result = isValidSpeed(scratchpad);
    if (!result.valid) {
      return { handled: true, scratchpadError: result.error };
    }
    const newTakeoff = { ...state.takeoff, vr };
    const vsResult = isValidVSpeeds(newTakeoff.v1, newTakeoff.vr, newTakeoff.v2);
    if (!vsResult.valid) {
      return { handled: true, scratchpadError: vsResult.error };
    }
    return { handled: true, patch: { takeoff: newTakeoff } };
  }
  if (state.takeoff.suggestedVr) {
    return {
      handled: true,
      patch: { takeoff: { ...state.takeoff, vr: state.takeoff.suggestedVr } },
    };
  }
  return { handled: false };
}

export function handleSetVr(
  state: FMCState,
  scratchpad: string
): TakeoffActionResult {
  return buildVrPatch(state, scratchpad);
}

function buildV2Patch(state: FMCState, scratchpad: string): TakeoffActionResult {
  if (scratchpad) {
    const v2 = parseInt(scratchpad, 10);
    const result = isValidSpeed(scratchpad);
    if (!result.valid) {
      return { handled: true, scratchpadError: result.error };
    }
    const newTakeoff = { ...state.takeoff, v2 };
    const vsResult = isValidVSpeeds(newTakeoff.v1, newTakeoff.vr, newTakeoff.v2);
    if (!vsResult.valid) {
      return { handled: true, scratchpadError: vsResult.error };
    }
    return { handled: true, patch: { takeoff: newTakeoff } };
  }
  if (state.takeoff.suggestedV2) {
    return {
      handled: true,
      patch: { takeoff: { ...state.takeoff, v2: state.takeoff.suggestedV2 } },
    };
  }
  return { handled: false };
}

export function handleSetV2(
  state: FMCState,
  scratchpad: string
): TakeoffActionResult {
  return buildV2Patch(state, scratchpad);
}

export function handleSetTrim(
  state: FMCState,
  scratchpad: string
): TakeoffActionResult {
  if (!scratchpad) return { handled: false };

  const trim = parseFloat(scratchpad);
  if (isNaN(trim)) {
    return { handled: true, scratchpadError: 'INVALID ENTRY' };
  }

  return {
    handled: true,
    patch: { takeoff: { ...state.takeoff, trim } },
  };
}

export function handleSetOat(
  state: FMCState,
  scratchpad: string
): TakeoffActionResult {
  if (!scratchpad) return { handled: false };

  const result = isValidTemperature(scratchpad);
  if (!result.valid) {
    return { handled: true, scratchpadError: result.error };
  }

  return {
    handled: true,
    patch: { takeoff: { ...state.takeoff, oat: parseInt(scratchpad) || 0 } },
  };
}

export function handleSetAssumedTemp(
  state: FMCState,
  scratchpad: string
): TakeoffActionResult {
  if (!scratchpad) return { handled: false };

  const temp = parseInt(scratchpad);
  if (isNaN(temp)) {
    return { handled: true, scratchpadError: 'INVALID ENTRY' };
  }

  return {
    handled: true,
    patch: { takeoff: { ...state.takeoff, assumedTemp: temp } },
  };
}

export function handleTakeoffWind(
  state: FMCState,
  scratchpad: string
): TakeoffActionResult {
  if (!scratchpad) return { handled: false };

  const wRes = isValidWind(scratchpad);
  if (!wRes.valid) {
    return { handled: true, scratchpadError: wRes.error };
  }

  const [wdir, wspd] = scratchpad.split('/');
  return {
    handled: true,
    patch: {
      takeoff: {
        ...state.takeoff,
        windDir: parseInt(wdir) || 0,
        windSpeed: parseInt(wspd) || 0,
      },
    },
  };
}

const selectToIdent: Record<string, (state: FMCState, scratchpad: string) => TakeoffActionResult> = {
  select_to: handleSelectTo,
  select_to1: (_state, _scratchpad) => handleSelectTo1(_state),
  select_to2: (_state, _scratchpad) => handleSelectTo2(_state),
  set_runway: handleSetRunway,
  set_to_mode: handleSetToMode,
  set_v1: handleSetV1,
  set_vr: handleSetVr,
  set_v2: handleSetV2,
  set_trim: handleSetTrim,
  set_oat: handleSetOat,
  set_assumed_temp: handleSetAssumedTemp,
  set_wind: handleTakeoffWind,
};

export function handleTakeoffAction(
  action: string,
  state: FMCState,
  scratchpad: string
): TakeoffActionResult {
  const handler = selectToIdent[action];
  if (!handler) return { handled: false };
  return handler(state, scratchpad) as TakeoffActionResult;
}
