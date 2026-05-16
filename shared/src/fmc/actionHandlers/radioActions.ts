import type { FMCState } from '../../types/fmc';
import { isValidFrequency, isValidADF } from '../validation';
import { invalidFormatMessage, outOfRangeMessage } from '../scratchpadEngine';
import type { ScratchpadMessage } from '../scratchpadEngine';
import { fmcPushMessage } from '../fmcScratchpadAdapter';

export type RadioActionResult = {
  handled: boolean;
  patch?: Partial<FMCState>;
  message?: ScratchpadMessage;
  clearScratchpad?: boolean;
};

export function handleRadioLskAction(
  action: string,
  state: FMCState,
  scratchpad: string
): RadioActionResult {
  if (!scratchpad) return { handled: false };

  if (action === 'set_vor1' || action === 'set_vor2') {
    const result = isValidFrequency(scratchpad);
    if (!result.valid) {
      return { handled: true, message: invalidFormatMessage() };
    }
    return {
      handled: true,
      clearScratchpad: true,
      patch: {
        radios: {
          ...state.radios,
          [action === 'set_vor1' ? 'vor1' : 'vor2']: parseFloat(scratchpad).toFixed(2),
        },
      },
    };
  }

  if (action === 'set_adf1') {
    const result = isValidADF(scratchpad);
    if (!result.valid) {
      return { handled: true, message: outOfRangeMessage() };
    }
    return {
      handled: true,
      clearScratchpad: true,
      patch: { radios: { ...state.radios, adf1: scratchpad } },
    };
  }

  return { handled: false };
}
