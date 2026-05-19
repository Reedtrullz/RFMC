import { BoeingMCPState } from './autopilotTypes';

/**
 * Handles Boeing 737 MCP mode transitions and interlocking logic.
 */
export function processBoeingMCPAction(
  state: BoeingMCPState,
  action: keyof BoeingMCPState | 'SPD_INTERVENE' | 'ALT_INTERVENE' | 'SPD_MACH_TOGGLE',
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

    case 'cmdA':
      return { cmdA: !state.cmdA, cmdB: false, cwsA: false, cwsB: false };
    case 'cmdB':
      return { cmdB: !state.cmdB, cmdA: false, cwsA: false, cwsB: false };
    case 'cwsA':
      return { cwsA: !state.cwsA, cmdA: false, cmdB: false, cwsB: false };
    case 'cwsB':
      return { cwsB: !state.cwsB, cmdA: false, cmdB: false, cwsA: false };

    case 'SPD_MACH_TOGGLE':
      if (state.mach === null) {
        return { mach: 0.78, speed: null };
      } else {
        return { speed: 250, mach: null };
      }

    default:
      return {};
  }
}

export function calculateAltStarCaptureVs(vsEntry: number, deltaH: number, k = 0.005): number {
  const absDeltaH = Math.abs(deltaH);
  if (absDeltaH <= 20) return 0;
  return Math.round(vsEntry * (1 - Math.exp(-k * absDeltaH)));
}
