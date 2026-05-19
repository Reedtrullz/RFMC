import { FMCState } from '../types/fmc';
import { AutoflightTruthState, LateralMode, VerticalMode, ThrustMode } from './autopilotTypes';
import { buildVnavPrediction } from '../fmc/vnavPrediction';

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
        const hasUnresolved = state.flightPlan.waypoints.some(
          (wp) =>
            !wp.discontinuity && (wp.lat === undefined || wp.lon === undefined || wp.coordinateSource === 'UNRESOLVED'),
        );
        if (hasUnresolved) {
          return { ok: false, message: 'NAV DATA OUT' };
        }
        return { ok: true };

      case 'VOR_LOC':
      case 'LOC':
        // Check if NAV frequency is tuned to a localizer/VOR
        return { ok: true };

      case 'HDG_SEL':
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
    fmcState: FMCState,
  ): { nextState: AutoflightTruthState; alert?: string } {
    const nextState = { ...currentState };
    let alert: string | undefined;

    // Lateral Logic
    if (request.lateralActive && request.lateralActive !== currentState.lateralActive) {
      const guard = this.canEngageLateral(request.lateralActive, fmcState);
      if (guard.ok) {
        // Intercept logic for arming
        if (
          (request.lateralActive === 'LOC' ||
            request.lateralActive === 'VOR_LOC' ||
            request.lateralActive === 'LNAV') &&
          !this.isLateralCaptured(request.lateralActive, fmcState)
        ) {
          nextState.lateralArmed = request.lateralActive;
        } else {
          nextState.lateralActive = request.lateralActive;
          nextState.lateralArmed = 'OFF';
          nextState.lastModeChangeTimestamps.lateral = Date.now();
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
          nextState.lastModeChangeTimestamps.vertical = Date.now();
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

    if (request.thrustActive && request.thrustActive !== currentState.thrustActive) {
      nextState.thrustActive = request.thrustActive;
      nextState.lastModeChangeTimestamps.thrust = Date.now();
    }

    return { nextState, alert };
  }

  /**
   * Periodic tick to handle mode captures (Armed -> Active)
   */
  public static tick(currentState: AutoflightTruthState, fmcState: FMCState): Partial<AutoflightTruthState> | null {
    const updates: Partial<AutoflightTruthState> = {};
    let changed = false;

    // 1. Lateral Capture
    if (currentState.lateralArmed && currentState.lateralArmed !== 'OFF') {
      if (this.isLateralCaptured(currentState.lateralArmed, fmcState)) {
        updates.lateralActive = currentState.lateralArmed;
        updates.lateralArmed = 'OFF';
        updates.lastModeChangeTimestamps = {
          ...currentState.lastModeChangeTimestamps,
          lateral: Date.now(),
        };
        changed = true;
      }
    }

    // 2. Vertical Capture
    if (currentState.verticalArmed && currentState.verticalArmed !== 'OFF') {
      if (this.isVerticalCaptured(currentState.verticalArmed, fmcState)) {
        updates.verticalActive = currentState.verticalArmed;
        updates.verticalArmed = 'OFF';
        updates.lastModeChangeTimestamps = {
          ...currentState.lastModeChangeTimestamps,
          vertical: Date.now(),
        };
        changed = true;
      }
    }

    if (!changed && currentState.verticalActive === 'VNAV_PTH') {
      const vnav = buildVnavPrediction(fmcState);
      if (!vnav.available || (vnav.pathDeviationFt !== null && Math.abs(vnav.pathDeviationFt) > 250)) {
        updates.verticalActive = 'OFF';
        updates.verticalArmed = 'VNAV_PTH';
        updates.lastModeChangeTimestamps = {
          ...currentState.lastModeChangeTimestamps,
          vertical: Date.now(),
        };
        changed = true;
      }
    }

    return changed ? updates : null;
  }

  public static calculateAltStarCaptureVs(vsEntry: number, deltaH: number, k = 0.005): number {
    const absDeltaH = Math.abs(deltaH);
    if (absDeltaH <= 20) return 0;
    return Math.round(vsEntry * (1 - Math.exp(-k * absDeltaH)));
  }

  private static isLateralCaptured(mode: LateralMode, state: FMCState): boolean {
    if (!state.aircraftState) return false;

    switch (mode) {
      case 'LNAV':
      case 'NAV':
        // Real XTE-based capture
        return Math.abs(state.navPerformance.xteNm) < 0.5;

      case 'LOC':
      case 'VOR_LOC':
        // Mock LOC capture
        return true;

      default:
        return false;
    }
  }

  private static isVerticalCaptured(mode: VerticalMode, state: FMCState): boolean {
    if (!state.aircraftState) return false;

    switch (mode) {
      case 'G_S':
        return true; // Simplified capture
      case 'VNAV_PTH': {
        const vnav = buildVnavPrediction(state);
        if (!vnav.available || vnav.pathDeviationFt === null) {
          return false;
        }
        return Math.abs(vnav.pathDeviationFt) < 150;
      }
      default:
        return false;
    }
  }
}
