import type { FMCState } from '../../types/fmc';
import { isValidICAO } from '../validation';
import type { FmcActionResult } from './actionResult';

/**
 * Handle set_ref_airport LSK action.
 * Validates scratchpad as a 4-letter ICAO code and sets position.refAirport.
 */
function handleSetRefAirport(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };

  const result = isValidICAO(scratchpad.toUpperCase());
  if (!result.valid) {
    return {
      handled: true,
      failure: { code: 'INVALID_ENTRY' as const, text: result.error || 'NOT IN DATABASE', source: 'positionActions' },
    };
  }

  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: { position: { ...state.position, refAirport: scratchpad.toUpperCase() } },
    },
  };
}

/**
 * Handle set_gate LSK action.
 * Sets position.gate to the scratchpad value (no validation).
 */
function handleSetGate(state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };

  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: { position: { ...state.position, gate: scratchpad.toUpperCase() } },
    },
  };
}

/** Dispatch position-related LSK actions. */
export function handlePositionAction(action: string, state: FMCState, scratchpad: string): FmcActionResult {
  switch (action) {
    case 'set_ref_airport':
      return handleSetRefAirport(state, scratchpad);
    case 'set_gate':
      return handleSetGate(state, scratchpad);
    default:
      return { handled: false };
  }
}
