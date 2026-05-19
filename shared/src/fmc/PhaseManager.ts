import { FlightPhase, FMCState } from '../types/fmc';
import { navDatabase } from './NavDatabaseService';

export class PhaseManager {
  // ── Hysteresis state ───────────────────────────────────────────────────────
  // Prevents rapid phase oscillation near threshold boundaries.
  // A candidate phase must remain stable for HYSTERESIS_MS before transition.
  // Safety-critical phases (GO_AROUND) bypass hysteresis entirely.

  private static _candidatePhase: FlightPhase | null = null;
  private static _candidateTimestamp = 0;
  private static readonly HYSTERESIS_MS = 5000;
  /** Phases that bypass hysteresis (safety-critical or terminal). */
  private static readonly IMMEDIATE_PHASES: ReadonlySet<FlightPhase> = new Set(['GO_AROUND', 'PREFLIGHT', 'DONE']);

  /** Reset hysteresis tracking. Intended for test use only. */
  public static _resetHysteresis(): void {
    PhaseManager._candidatePhase = null;
    PhaseManager._candidateTimestamp = 0;
  }

  /**
   * Infers the flight phase based on aircraft state and NAV radio data.
   *
   * Uses approach arming + LOC/GS capture when available (MSFS bridge),
   * falls back to altitude + speed thresholds in standalone mode.
   *
   * Applies 5-second hysteresis to prevent rapid oscillation near thresholds.
   * Safety-critical phases (GO_AROUND, PREFLIGHT, DONE) transition immediately.
   */
  public static inferFlightPhase(state: FMCState): FlightPhase {
    const rawPhase = PhaseManager.computeRawPhase(state);
    const currentPhase = state.flightPhase || 'PREFLIGHT';

    // Safety-critical / terminal phases bypass hysteresis, as does transitioning out of PREFLIGHT
    if (PhaseManager.IMMEDIATE_PHASES.has(rawPhase) || currentPhase === 'PREFLIGHT') {
      PhaseManager._candidatePhase = null;
      return rawPhase;
    }

    // Same as current phase — no transition, clear candidate
    if (rawPhase === currentPhase) {
      PhaseManager._candidatePhase = null;
      return rawPhase;
    }

    // New candidate differs from previous candidate — restart timer
    const now = Date.now();
    if (rawPhase !== PhaseManager._candidatePhase) {
      PhaseManager._candidatePhase = rawPhase;
      PhaseManager._candidateTimestamp = now;
      return currentPhase;
    }

    // Same candidate — check if stable long enough
    if (now - PhaseManager._candidateTimestamp >= PhaseManager.HYSTERESIS_MS) {
      PhaseManager._candidatePhase = null;
      return rawPhase;
    }

    return currentPhase;
  }

  /**
   * Pure phase computation without hysteresis.
   * Extracted so tests can verify raw logic independently.
   */
  private static computeRawPhase(state: FMCState): FlightPhase {
    const acState = state.aircraftState;
    if (!acState) return 'PREFLIGHT';

    const altitude = acState.altitude || 0;
    const speed = acState.gs || 0;
    const vs = acState.vs || 0;
    const crzAlt = state.performance.crzAlt || 30000;
    const approachArmed = acState.approachArmed ?? false;
    const hasLoc = acState.hasLoc ?? false;
    const hasGs = acState.hasGs ?? false;

    // PREFLIGHT — no significant motion
    if (speed < 5 && altitude < 1000) return 'PREFLIGHT';

    // TAXI — moving on ground
    if (speed >= 5 && speed < 60 && altitude < 1000) return 'TAXI';

    // TAKEOFF — accelerating on runway / initial climb
    if (speed >= 60 && altitude < 1500) return 'TAKEOFF';

    // CLIMB — established climb toward cruise
    if (altitude >= 1500 && altitude < crzAlt - 1000 && vs > 300) return 'CLIMB';

    // CRUISE — at or near cruise altitude
    if (Math.abs(altitude - crzAlt) < 1000) return 'CRUISE';

    let airportElevation = 0;
    if (state.flightPlan?.destination) {
      const airport = navDatabase.getAirport(state.flightPlan.destination);
      if (airport && airport.elevationFt !== undefined) {
        airportElevation = airport.elevationFt;
      }
    }

    const haaApproachThreshold = airportElevation + 3000;

    // DESCENT — descending from cruise toward approach altitude
    if (vs < -300 && altitude > haaApproachThreshold) return 'DESCENT';

    // GO_AROUND — was in approach, now applying go-around thrust
    const prevPhase = state.flightPhase;
    if (prevPhase === 'APPROACH' && vs > 500 && altitude >= airportElevation + 500 && speed >= 150) {
      return 'GO_AROUND';
    }

    // APPROACH — several possible triggers:
    //   1. Approach mode is armed AND LOC or GS is captured
    //   2. Pilot has armed approach mode AND altitude is within threshold
    //   3. No radio data available — fall back to altitude + speed
    const withinApproachAltitude = altitude <= haaApproachThreshold && speed < 250;
    const locCaptured = hasLoc && acState.locDeviation !== undefined && Math.abs(acState.locDeviation) < 1.0;
    const gsCaptured = hasGs && acState.gsDeviation !== undefined && Math.abs(acState.gsDeviation) < 1.0;

    if (withinApproachAltitude) {
      // Radio data present: require approach arming or LOC/GS capture
      if (hasLoc || hasGs) {
        if (approachArmed || locCaptured || gsCaptured) {
          return 'APPROACH';
        }
        // LOC available but not captured yet — stay in DESCENT
        return state.flightPhase || 'PREFLIGHT';
      }
      // No radio data: fall back to altitude + speed threshold
      return 'APPROACH';
    }

    // DONE — at gate
    if (speed < 5 && altitude < 1000 && state.flightPlan.destination) return 'DONE';

    return state.flightPhase || 'PREFLIGHT';
  }
}
