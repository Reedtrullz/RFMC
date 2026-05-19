import type { FMCState } from '../../types/fmc';
import { isValidAltitude } from '../validation';
import { PerformanceEngine } from '../PerformanceEngine';
import type { FmcActionResult } from './actionResult';

export function handleSetCrzAlt(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };

  const result = isValidAltitude(scratchpad);
  if (!result.valid) {
    return {
      handled: true,
      failure: { code: 'OUT_OF_RANGE' as const, text: 'OUT OF RANGE', source: 'performanceActions' },
    };
  }

  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: { performance: { ...state.performance, crzAlt: parseInt(scratchpad) || 0 } },
    },
  };
}

export function handleSetCostIndex(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };

  const ci = parseInt(scratchpad, 10);
  if (isNaN(ci) || ci < 0 || ci > 999) {
    return {
      handled: true,
      failure: { code: 'OUT_OF_RANGE' as const, text: 'OUT OF RANGE', source: 'performanceActions' },
    };
  }

  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: { performance: { ...state.performance, costIndex: ci } },
    },
  };
}

export function handleSetZfw(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };

  const zfwInput = parseFloat(scratchpad);
  if (isNaN(zfwInput) || zfwInput <= 0) {
    return {
      handled: true,
      failure: { code: 'INVALID_ENTRY' as const, text: 'INVALID ENTRY', source: 'performanceActions' },
    };
  }
  // B737-800 physical limits: ZFW range ~85,000-138,500 lbs
  if (zfwInput < 85 || zfwInput > 140) {
    return {
      handled: true,
      failure: { code: 'INVALID_ENTRY' as const, text: 'OUT OF RANGE', source: 'performanceActions' },
    };
  }

  const zfw = zfwInput * 1000;
  const fuel = state.performance.fuel ?? 0;
  const grossWeight = zfw + fuel;

  const patch: any = { performance: { ...state.performance, zfw, grossWeight } };

  if (state.takeoff?.flaps) {
    const speeds = PerformanceEngine.calculateTakeoffSpeeds(grossWeight || 140000, state.takeoff.flaps);
    patch.takeoff = {
      ...state.takeoff,
      suggestedV1: speeds.v1,
      suggestedVr: speeds.vr,
      suggestedV2: speeds.v2,
    };
  }

  return { handled: true, success: { clearScratchpad: true, patch } };
}

export function handleSetReserve(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };

  const reserve = parseFloat(scratchpad);
  if (isNaN(reserve) || reserve < 0) {
    return {
      handled: true,
      failure: { code: 'INVALID_ENTRY' as const, text: 'INVALID ENTRY', source: 'performanceActions' },
    };
  }

  const maxFuelKlbs = (state.performance.fuel ?? 0) / 1000;
  if (maxFuelKlbs > 0 && reserve > maxFuelKlbs) {
    return {
      handled: true,
      failure: { code: 'INVALID_ENTRY' as const, text: 'INVALID ENTRY', source: 'performanceActions' },
    };
  }

  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: { performance: { ...state.performance, reserve: reserve * 1000 } },
    },
  };
}

export function handlePerformanceAction(action: string, state: FMCState, scratchpad: string): FmcActionResult {
  switch (action) {
    case 'set_crz_alt':
      return handleSetCrzAlt(state, scratchpad);
    case 'set_cost_index':
      return handleSetCostIndex(state, scratchpad);
    case 'set_zfw':
      return handleSetZfw(state, scratchpad);
    case 'set_reserve':
      return handleSetReserve(state, scratchpad);
    default:
      return { handled: false };
  }
}
