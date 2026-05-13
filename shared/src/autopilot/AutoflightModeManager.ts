import { FMCState } from '../types/fmc';
import { AutoflightTruthState, LateralMode, VerticalMode, ThrustMode } from './autopilotTypes';

export type ModeGuardResult = {
  ok: boolean;
  message?: string;
};

export class AutoflightModeManager {
  /**
   * Evaluates if a lateral mode can be engaged.
   */
  public static canEngageLateral(mode: LateralMode, state: FMCState): ModeGuardResult {
    const isAirbus = state.aircraft === 'AIRBUS_A320';
    
    switch (mode) {
      case 'LNAV':
      case 'NAV':
        if (!state.flightPlan.waypoints.length) {
          return { ok: false, message: isAirbus ? 'F-PLN NOT READY' : 'NO ACTIVE ROUTE' };
        }
        if (state.position.irsState !== 'NAV') {
          return { ok: false, message: 'IRS NOT ALIGNED' };
        }
        return { ok: true };

      case 'VOR_LOC':
      case 'LOC':
        // Check if NAV frequency is tuned to a localizer/VOR
        return { ok: true };

      case 'HDG_SEL':
      case 'HDG':
        return { ok: true };

      default:
        return { ok: true };
    }
  }

  /**
   * Evaluates if a vertical mode can be engaged.
   */
  public static canEngageVertical(mode: VerticalMode, state: FMCState): ModeGuardResult {
    switch (mode) {
      case 'VNAV_PTH':
      case 'CLB':
      case 'DES':
        if (!state.performance.crzAlt) {
          return { ok: false, message: 'PERF/VNAV UNAVAILABLE' };
        }
        return { ok: true };

      case 'ALT_HOLD':
      case 'VS':
        return { ok: true };

      default:
        return { ok: true };
    }
  }

  /**
   * Synchronizes the truth state based on requests and guards.
   */
  public static processModeRequest(
    request: Partial<AutoflightTruthState>,
    currentState: AutoflightTruthState,
    fmcState: FMCState
  ): { nextState: AutoflightTruthState; alert?: string } {
    const nextState = { ...currentState };
    let alert: string | undefined;

    if (request.lateralActive && request.lateralActive !== currentState.lateralActive) {
      const guard = this.canEngageLateral(request.lateralActive, fmcState);
      if (guard.ok) {
        nextState.lateralActive = request.lateralActive;
      } else {
        alert = guard.message;
      }
    }

    if (request.verticalActive && request.verticalActive !== currentState.verticalActive) {
      const guard = this.canEngageVertical(request.verticalActive, fmcState);
      if (guard.ok) {
        nextState.verticalActive = request.verticalActive;
      } else {
        alert = guard.message;
      }
    }

    // Add more logic for armed modes, thrust modes, and AP status transitions

    return { nextState, alert };
  }
}
