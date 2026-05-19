import type { FMCState } from '../../types/fmc';
import { isValidWind, isValidTemperature } from '../validation';
import type { FmcActionResult } from './actionResult';

/**
 * Handle set_wind LSK action (takeoff wind direction/speed).
 * Parses "DDD/SS" format from scratchpad.
 */
function handleSetTakeoffWind(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };

  const wRes = isValidWind(scratchpad);
  if (!wRes.valid) {
    return {
      handled: true,
      failure: { code: 'INVALID_FORMAT' as const, text: 'INVALID FORMAT', source: 'windActions' },
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

/**
 * Handle CLB/CRZ/DES wind LSK actions.
 * Sets performance.{clb,crz,des}WindDir/WindSpeed.
 */
function handlePhaseWind(action: string, state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };

  const wRes = isValidWind(scratchpad);
  if (!wRes.valid) {
    return {
      handled: true,
      failure: { code: 'INVALID_FORMAT' as const, text: 'INVALID FORMAT', source: 'windActions' },
    };
  }

  const [wdir, wspd] = scratchpad.split('/');
  const windDir = parseInt(wdir) || 0;
  const windSpeed = parseInt(wspd) || 0;

  let perfPatch: Partial<FMCState['performance']>;
  if (action === 'set_clb_wind') {
    perfPatch = { clbWindDir: windDir, clbWindSpeed: windSpeed };
  } else if (action === 'set_crz_wind') {
    perfPatch = { crzWindDir: windDir, crzWindSpeed: windSpeed };
  } else {
    perfPatch = { desWindDir: windDir, desWindSpeed: windSpeed };
  }

  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: { performance: { ...state.performance, ...perfPatch } },
    },
  };
}

/**
 * Handle set_isa_dev LSK action.
 * Validates temperature and sets performance.isaDev.
 */
function handleSetIsaDev(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };

  const isaRes = isValidTemperature(scratchpad);
  if (!isaRes.valid) {
    return {
      handled: true,
      failure: { code: 'OUT_OF_RANGE' as const, text: 'OUT OF RANGE', source: 'windActions' },
    };
  }

  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: { performance: { ...state.performance, isaDev: parseInt(scratchpad) || 0 } },
    },
  };
}

/** Dispatch wind-related LSK actions. */
export function handleWindAction(action: string, state: FMCState, scratchpad: string): FmcActionResult {
  switch (action) {
    case 'set_wind':
      return handleSetTakeoffWind(state, scratchpad);
    case 'set_clb_wind':
    case 'set_crz_wind':
    case 'set_des_wind':
      return handlePhaseWind(action, state, scratchpad);
    case 'set_isa_dev':
      return handleSetIsaDev(state, scratchpad);
    default:
      return { handled: false };
  }
}
