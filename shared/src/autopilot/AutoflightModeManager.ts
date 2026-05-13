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

    // Lateral Logic
    if (request.lateralActive && request.lateralActive !== currentState.lateralActive) {
      const guard = this.canEngageLateral(request.lateralActive, fmcState);
      if (guard.ok) {
        // Intercept logic for arming
        if ((request.lateralActive === 'LOC' || request.lateralActive === 'VOR_LOC' || request.lateralActive === 'LNAV') && 
            !this.isLateralCaptured(request.lateralActive, fmcState)) {
          nextState.lateralArmed = request.lateralActive;
        } else {
          nextState.lateralActive = request.lateralActive;
          nextState.lateralArmed = 'OFF';
        }
      } else {
        alert = guard.message;
      }
    }

    // Vertical Logic
    if (request.verticalActive && request.verticalActive !== currentState.verticalActive) {
      const guard = this.canEngageVertical(request.verticalActive, fmcState);
      if (guard.ok) {
        if (request.verticalActive === 'G_S' && !this.isVerticalCaptured('G_S', fmcState)) {
          nextState.verticalArmed = 'G_S';
        } else {
          nextState.verticalActive = request.verticalActive;
          nextState.verticalArmed = 'OFF';
        }
      } else {
        alert = guard.message;
      }
    }

    // Autopilot Status Logic
    if (request.autopilotStatus && request.autopilotStatus !== currentState.autopilotStatus) {
      const isAirbus = fmcState.aircraft === 'AIRBUS_A320';
      if (isAirbus) {
        // Dual AP allowed in approach
        if (request.autopilotStatus === 'AP1' || request.autopilotStatus === 'AP2') {
           nextState.autopilotStatus = request.autopilotStatus;
        } else {
           nextState.autopilotStatus = 'OFF';
        }
      } else {
        // Boeing logic
        nextState.autopilotStatus = request.autopilotStatus;
      }
    }

    if (request.thrustActive) {
      nextState.thrustActive = request.thrustActive;
    }

    return { nextState, alert };
  }

  private static isLateralCaptured(mode: LateralMode, state: FMCState): boolean {
    // Mock capture logic: captured if within 5nm of route or 1 dot of LOC
    return false; // Default to arming for demonstration
  }

  private static isVerticalCaptured(mode: VerticalMode, state: FMCState): boolean {
    return false;
  }
}
