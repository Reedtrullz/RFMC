import { FlightPhase, FMCState } from '../types/fmc';
import { navDatabase } from './NavDatabaseService';

export class PhaseManager {
  /**
   * Infers the flight phase based on aircraft state.
   */
  public static inferFlightPhase(state: FMCState): FlightPhase {
    const acState = state.aircraftState;
    if (!acState) return 'PREFLIGHT';

    const altitude = acState.altitude || 0;
    const speed = acState.gs || 0;
    const vs = acState.vs || 0;
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

    let airportElevation = 0;
    if (state.flightPlan?.destination) {
      const airport = navDatabase.getAirport(state.flightPlan.destination);
      if (airport && airport.elevationFt !== undefined) {
        airportElevation = airport.elevationFt;
      }
    }

    const haaApproachThreshold = airportElevation + 3000;

    // DESCENT logic
    if (vs < -300 && altitude > haaApproachThreshold) return 'DESCENT';

    // GO_AROUND logic — aircraft was in approach then applies go-around thrust
    const prevPhase = state.flightPhase;
    if (prevPhase === 'APPROACH' && vs > 500 && altitude >= airportElevation + 500 && speed >= 150) {
      return 'GO_AROUND';
    }

    // APPROACH logic
    if (altitude <= haaApproachThreshold && speed < 250) return 'APPROACH';

    // DONE logic
    if (speed < 5 && altitude < 1000 && state.flightPlan.destination) return 'DONE';

    return state.flightPhase || 'PREFLIGHT';
  }
}
