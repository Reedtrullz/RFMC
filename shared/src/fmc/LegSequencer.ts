import { FMCState, AircraftState, FlightPlanWaypoint } from '../types/fmc';
import { distanceNm } from './ndGeometry';

export class LegSequencer {
  /**
   * Evaluates if the current leg should be sequenced to the next one.
   * Returns true if sequencing should occur.
   */
  public static shouldSequence(
    currentLeg: FlightPlanWaypoint,
    nextLeg: FlightPlanWaypoint | undefined,
    acState: AircraftState
  ): { sequence: boolean; reason: string } {
    if (!acState.position) return { sequence: false, reason: 'No position' };

    const { type, fixIdent, heading, altitude: targetAlt } = currentLeg as any; // Cast for demo
    const { lat, lon, altitude: currentAlt, heading: currentHdg } = acState;

    switch (type) {
      case 'TF': // Track to Fix
      case 'DF': // Direct to Fix
      case 'IF': // Initial Fix
        if (currentLeg.lat && currentLeg.lon) {
          const dist = distanceNm(acState.position, { lat: currentLeg.lat, lon: currentLeg.lon });
          if (dist < 0.2) return { sequence: true, reason: `Arrived at ${currentLeg.ident}` };
        }
        break;

      case 'VA': // Heading to Altitude
        if (targetAlt && currentAlt >= targetAlt - 50) {
          return { sequence: true, reason: `Reached altitude ${targetAlt}ft` };
        }
        break;

      case 'CA': // Course to Altitude
        if (targetAlt && currentAlt >= targetAlt - 50) {
          return { sequence: true, reason: `Reached altitude ${targetAlt}ft` };
        }
        break;

      case 'FM': // Heading to Manual
        // Pilot must manually sequence
        break;
    }

    return { sequence: false, reason: 'Conditions not met' };
  }

  /**
   * Checks if the aircraft complied with waypoint restrictions.
   */
  public static checkRestrictions(
    waypoint: FlightPlanWaypoint,
    acState: AircraftState
  ): { ok: boolean; message?: string } {
    const { altitudeConstraint, speedConstraint } = waypoint;
    const { altitude, speed } = acState;

    if (altitudeConstraint && altitude !== undefined) {
      const target = altitudeConstraint.altitude;
      if (altitudeConstraint.type === 'AT' && Math.abs(altitude - target) > 200) {
        return { ok: false, message: `Altitude Deviation: ${Math.round(altitude)}ft (Req ${target}ft)` };
      }
      if (altitudeConstraint.type === 'ABOVE' && altitude < target - 100) {
        return { ok: false, message: `Below Altitude: ${Math.round(altitude)}ft (Req ABOVE ${target}ft)` };
      }
      if (altitudeConstraint.type === 'BELOW' && altitude > target + 100) {
        return { ok: false, message: `Above Altitude: ${Math.round(altitude)}ft (Req BELOW ${target}ft)` };
      }
    }

    if (speedConstraint && speed !== undefined) {
      if (speed > speedConstraint.speed + 10) {
        return { ok: false, message: `Overspeed: ${Math.round(speed)}kt (Req ${speedConstraint.speed}kt)` };
      }
    }

    return { ok: true };
  }
}
