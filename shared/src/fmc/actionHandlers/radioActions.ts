import type { FMCState } from '../../types/fmc';
import { isValidFrequency, isValidADF } from '../validation';
import type { FmcActionResult } from './actionResult';

export function handleRadioLskAction(action: string, state: FMCState, scratchpad: string): FmcActionResult {
  if (!scratchpad) return { handled: false };

  if (action === 'set_vor1' || action === 'set_vor2') {
    const result = isValidFrequency(scratchpad);
    if (!result.valid) {
      return {
        handled: true,
        failure: { code: 'INVALID_FORMAT' as const, text: 'INVALID FORMAT', source: 'radioActions' },
      };
    }
    return {
      handled: true,
      success: {
        clearScratchpad: true,
        patch: {
          radios: {
            ...state.radios,
            [action === 'set_vor1' ? 'vor1' : 'vor2']: parseFloat(scratchpad).toFixed(2),
          },
        },
      },
    };
  }

  if (action === 'set_adf1') {
    const result = isValidADF(scratchpad);
    if (!result.valid) {
      return {
        handled: true,
        failure: { code: 'OUT_OF_RANGE' as const, text: 'OUT OF RANGE', source: 'radioActions' },
      };
    }
    return {
      handled: true,
      success: { clearScratchpad: true, patch: { radios: { ...state.radios, adf1: scratchpad } } },
    };
  }

  return { handled: false };
}
