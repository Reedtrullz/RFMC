import { FlightPhase, FMCState } from '../types/fmc';
import { navDatabase } from './NavDatabaseService';

export class PhaseManager {
  /**
   * Infers the flight phase based on aircraft state and NAV radio data.
   *
   * Uses approach arming + LOC/GS capture when available (MSFS bridge),
   * falls back to altitude + speed thresholds in standalone mode.
   */
  public static inferFlightPhase(state: FMCState): FlightPhase {
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
