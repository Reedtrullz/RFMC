import type { FMCState } from '../../types/fmc';
import { isValidAltitude } from '../validation';
import { PerformanceEngine } from '../PerformanceEngine';

// ─────────────────────────────────────────────────────────
// Performance action handlers for the PERF INIT page
// ─────────────────────────────────────────────────────────

export interface PerformanceActionResult {
  handled: boolean;
  patch?: Partial<FMCState>;
  scratchpadError?: string;
}

/**
 * CRZ ALT (Cruise Altitude)
 * Accepts bare altitude (e.g. "350" = FL350) or "FL350" prefix.
 * Validated by isValidAltitude then parsed: FLxxx → xxx * 100 else bare number.
 */
export function handleSetCrzAlt(
  state: FMCState,
  scratchpad: string
): PerformanceActionResult {
  if (!scratchpad) return { handled: false };

  const result = isValidAltitude(scratchpad);
  if (!result.valid) {
    return { handled: true, scratchpadError: result.error };
  }

  const alt = scratchpad.startsWith('FL')
    ? parseInt(scratchpad.slice(2)) * 100
    : parseInt(scratchpad);

  return {
    handled: true,
    patch: { performance: { ...state.performance, crzAlt: alt } },
  };
}

/**
 * COST INDEX
 * Integer 0–999.
 */
export function handleSetCostIndex(
  state: FMCState,
  scratchpad: string
): PerformanceActionResult {
  if (!scratchpad) return { handled: false };

  const ci = parseInt(scratchpad, 10);
  if (isNaN(ci) || ci < 0 || ci > 999) {
    return { handled: true, scratchpadError: 'OUT OF RANGE' };
  }

  return {
    handled: true,
    patch: { performance: { ...state.performance, costIndex: ci } },
  };
}

/**
 * ZFW (Zero Fuel Weight)
 * Entry is in thousands of lbs (e.g. "120" = 120000 lbs).
 * Also recalculates gross weight and suggested V-speeds if flaps set.
 */
export function handleSetZfw(
  state: FMCState,
  scratchpad: string
): PerformanceActionResult {
  if (!scratchpad) return { handled: false };

  const zfw = parseFloat(scratchpad) * 1000;
  if (isNaN(zfw) || zfw <= 0) {
    return { handled: true, scratchpadError: 'INVALID ENTRY' };
  }

  const grossWeight = zfw + state.performance.fuel;
  const patch: Partial<FMCState> = {
    performance: { ...state.performance, zfw, grossWeight },
  };

  // Recalculate suggested V-speeds when flaps are already selected
  if (state.takeoff.flaps) {
    const speeds = PerformanceEngine.calculateTakeoffSpeeds(grossWeight, state.takeoff.flaps);
    (patch as any).takeoff = {
      ...state.takeoff,
      suggestedV1: speeds.v1,
      suggestedVr: speeds.vr,
      suggestedV2: speeds.v2,
    };
  }

  return { handled: true, patch };
}

/**
 * RESERVES
 * Entry is in thousands of lbs (e.g. "5.0" = 5000 lbs reserve).
 */
export function handleSetReserve(
  state: FMCState,
  scratchpad: string
): PerformanceActionResult {
  if (!scratchpad) return { handled: false };

  const res = parseFloat(scratchpad) * 1000;
  if (isNaN(res) || res < 0) {
    return { handled: true, scratchpadError: 'INVALID ENTRY' };
  }

  return {
    handled: true,
    patch: { performance: { ...state.performance, reserve: res } },
  };
}

/**
 * Router: dispatches a performance-related LSK action string to the
 * appropriate handler function.
 */
export function handlePerformanceAction(
  action: string,
  state: FMCState,
  scratchpad: string
): PerformanceActionResult {
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
