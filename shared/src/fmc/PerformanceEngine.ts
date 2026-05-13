import { FlightPhase, AircraftState } from '../types/fmc';

export class PerformanceEngine {
  /**
   * Calculates fuel flow in lbs/hr based on flight phase and altitude
   */
  public static calculateFuelFlow(phase: FlightPhase, altitude: number): number {
    const baseFlow = 5000; // lbs/hr for a mid-size jet
    
    switch (phase) {
      case 'TAKEOFF':
        return baseFlow * 4;
      case 'CLIMB':
        return baseFlow * 2.5;
      case 'CRUISE':
        // Fuel flow decreases with altitude
        const altFactor = Math.max(0.5, 1 - (altitude / 50000));
        return baseFlow * altFactor;
      case 'APPROACH':
        return baseFlow * 1.5;
      case 'TAXI':
        return baseFlow * 0.2;
      default:
        return baseFlow;
    }
  }

  /**
   * Updates weight and fuel state for a given time step (seconds)
   */
  public static updateFuelState(
    currentFuel: number, 
    flowLbsHr: number, 
    dtSeconds: number
  ): number {
    const fuelBurned = (flowLbsHr / 3600) * dtSeconds;
    return Math.max(0, currentFuel - fuelBurned);
  }
}
