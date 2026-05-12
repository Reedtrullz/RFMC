import { BoeingMCPState } from './autopilotTypes';

/**
 * Handles Boeing 737 MCP mode transitions and interlocking logic.
 */
export function processBoeingMCPAction(
  state: BoeingMCPState,
  action: keyof BoeingMCPState | 'SPD_INTERVENE' | 'ALT_INTERVENE'
): Partial<BoeingMCPState> {
  switch (action) {
    case 'lnav':
      if (!state.lnav) {
        return { lnav: true, hdgSel: false, vorLoc: false };
      }
      return { lnav: false };

    case 'hdgSel':
      if (!state.hdgSel) {
        return { hdgSel: true, lnav: false, vorLoc: false };
      }
      return { hdgSel: false };

    case 'vnav':
      if (!state.vnav) {
        return { vnav: true, lvlChg: false, altHold: false, vs: false };
      }
      return { vnav: false };

    case 'lvlChg':
      if (!state.lvlChg) {
        return { lvlChg: true, vnav: false, altHold: false, vs: false };
      }
      return { lvlChg: false };

    case 'altHold':
      if (!state.altHold) {
        return { altHold: true, vnav: false, lvlChg: false, vs: false };
      }
      return { altHold: false };

    case 'vs':
      if (!state.vs) {
        return { vs: true, vnav: false, lvlChg: false, altHold: false, verticalSpeed: 0 };
      }
      return { vs: false };

    case 'app':
      if (!state.app) {
        return { app: true, vorLoc: false, lnav: false, hdgSel: false };
      }
      return { app: false };

    default:
      return {};
  }
}
