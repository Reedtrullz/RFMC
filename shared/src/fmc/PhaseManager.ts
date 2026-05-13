import { FlightPhase, FMCState } from '../types/fmc';

export class PhaseManager {
  /**
   * Infers the flight phase based on aircraft state.
   */
  public static inferFlightPhase(state: FMCState): FlightPhase {
    const acState = state.aircraftState;
    if (!acState) return 'PREFLIGHT';

    const altitude = acState.altitude || 0;
    const speed = acState.speed || 0;
    const vs = acState.verticalSpeed || 0;
    const crzAlt = state.performance.crzAlt || 30000;

    // PREFLIGHT logic
    // (Assuming we don't have engine state in aircraftState yet, we use a simple speed check)
    if (speed < 5 && altitude < 1000) return 'PREFLIGHT';

    // TAXI logic
    if (speed >= 5 && speed < 60 && altitude < 1000) return 'TAXI';

    // TAKEOFF logic
    if (speed >= 60 && altitude < 1500) return 'TAKEOFF';

    // CLIMB logic
    if (altitude >= 1500 && altitude < crzAlt - 1000 && vs > 300) return 'CLIMB';

    // CRUISE logic
    if (Math.abs(altitude - crzAlt) < 1000) return 'CRUISE';

    // DESCENT logic
    if (vs < -300 && altitude > 3000) return 'DESCENT';

    // APPROACH logic
    if (altitude <= 3000 && speed < 250) return 'APPROACH';

    // DONE logic
    if (speed < 5 && altitude < 1000 && state.flightPlan.destination) return 'DONE';

    return state.flightPhase || 'PREFLIGHT';
  }
}
