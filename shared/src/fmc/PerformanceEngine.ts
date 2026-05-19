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
        const altFactor = Math.max(0.5, 1 - altitude / 50000);
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
  public static updateFuelState(currentFuel: number, flowLbsHr: number, dtSeconds: number): number {
    const fuelBurned = (flowLbsHr / 3600) * dtSeconds;
    return Math.max(0, currentFuel - fuelBurned);
  }
  /**
   * Calculates suggested V-Speeds based on weight and flaps.
   * This is a simplified training-model approximation.
   */
  public static calculateTakeoffSpeeds(weightLbs: number, flaps: string): { v1: number; vr: number; v2: number } {
    // Basic 737-800 approximations
    const baseWeight = 140000; // lbs
    const flapSetting = parseInt(flaps) || 5;

    // Base speeds at 140,000 lbs Flaps 5
    let v1 = 142;
    let vr = 143;
    let v2 = 150;

    // Adjust for weight (roughly 1.5kt per 5000lbs)
    const weightDelta = (weightLbs - baseWeight) / 5000;
    v1 += weightDelta * 1.5;
    vr += weightDelta * 1.5;
    v2 += weightDelta * 1.5;

    // Adjust for flaps
    if (flapSetting === 1) {
      v1 += 5;
      vr += 5;
      v2 += 5;
    }
    if (flapSetting === 15) {
      v1 -= 5;
      vr -= 5;
      v2 -= 5;
    }

    return {
      v1: Math.round(v1),
      vr: Math.round(vr),
      v2: Math.round(v2),
    };
  }
}
