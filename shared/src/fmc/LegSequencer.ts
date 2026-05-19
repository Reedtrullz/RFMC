import { AircraftState, FlightPlanWaypoint } from '../types/fmc';
import { LegTypeEngine, FmsLeg, LegType } from './LegTypeEngine';

export class LegSequencer {
  /**
   * Evaluates if the current leg should be sequenced to the next one.
   * Returns true if sequencing should occur.
   */
  public static shouldSequence(
    currentLeg: FlightPlanWaypoint,
    nextLeg: FlightPlanWaypoint | undefined,
    acState: AircraftState,
  ): { sequence: boolean; reason: string } {
    if (currentLeg.discontinuity) return { sequence: false, reason: 'Discontinuity ahead' };

    // Map FlightPlanWaypoint to FmsLeg for the engine
    const currentFmsLeg: FmsLeg = {
      type: (currentLeg.legType as LegType) || 'TF',
      to: { ident: currentLeg.ident, lat: currentLeg.lat!, lon: currentLeg.lon!, type: 'WAYPOINT' },
      altitudeConstraintFt: currentLeg.altitudeConstraint?.altitude,
    };

    const nextFmsLeg: FmsLeg | undefined = nextLeg
      ? {
          type: (nextLeg.legType as LegType) || 'TF',
          to: { ident: nextLeg.ident, lat: nextLeg.lat!, lon: nextLeg.lon!, type: 'WAYPOINT' },
          altitudeConstraintFt: nextLeg.altitudeConstraint?.altitude,
        }
      : undefined;

    const sequence = LegTypeEngine.shouldSequenceLeg(currentFmsLeg, acState, nextFmsLeg);

    return {
      sequence,
      reason: sequence ? `Leg termination reached for ${currentLeg.ident}` : 'Continuing leg',
    };
  }

  /**
   * Checks if the aircraft complied with waypoint restrictions.
   */
  public static checkRestrictions(
    waypoint: FlightPlanWaypoint,
    acState: AircraftState,
  ): { ok: boolean; message?: string } {
    const { altitudeConstraint, speedConstraint } = waypoint;
    const { altitude, ias: speed } = acState;

    if (altitudeConstraint && altitude !== undefined) {
      const target = altitudeConstraint.altitude;
      if (altitudeConstraint.type === 'AT' && Math.abs(altitude - target) > 200) {
        return { ok: false, message: `Altitude Deviation: ${Math.round(altitude)}ft (Req ${target}ft)` };
      }
      if (altitudeConstraint.type === 'AT_OR_ABOVE' && altitude < target - 100) {
        return { ok: false, message: `Below Altitude: ${Math.round(altitude)}ft (Req ABOVE ${target}ft)` };
      }
      if (altitudeConstraint.type === 'AT_OR_BELOW' && altitude > target + 100) {
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

  public static findLegIndex(waypoints: FlightPlanWaypoint[], ident: string, currentLegIndex: number): number {
    const normalized = ident.toUpperCase();
    for (let i = currentLegIndex; i < waypoints.length; i++) {
      if (!waypoints[i].discontinuity && waypoints[i].ident.toUpperCase() === normalized) {
        return i;
      }
    }
    return -1;
  }
}
