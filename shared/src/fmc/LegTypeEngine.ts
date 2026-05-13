import { ArincLegType, ProcedureLeg, NavFix } from '../navdata/navdataTypes';
import { distanceNm } from './ndGeometry';

export type LegType =
  | "IF" // Initial Fix
  | "TF" // Track to Fix
  | "DF" // Direct to Fix
  | "CF" // Course to Fix
  | "CA" // Course to Altitude
  | "VA" // Heading to Altitude
  | "VM" // Heading to Manual Termination
  | "VI" // Heading to Intercept
  | "FA" // Fix to Altitude
  | "HM" // Hold to Manual
  | "HA" // Hold to Altitude
  | "HF" // Hold to Fix
  | "RF"; // Radius to Fix

export interface FmsLeg {
  type: LegType;
  from?: NavFix;
  to?: NavFix;
  courseDeg?: number;
  headingDeg?: number;
  altitudeConstraintFt?: number;
  distanceNm?: number;
  turnDirection?: "L" | "R";
}

export interface AircraftState {
  position: { lat: number; lon: number };
  altitudeFt: number;
  groundSpeedKt: number;
  headingDeg: number;
}

export class LegTypeEngine {
  /**
   * Determines if the aircraft has reached the termination condition for the current leg.
   */
  public static shouldSequenceLeg(leg: FmsLeg, aircraft: AircraftState): boolean {
    switch (leg.type) {
      case "TF":
      case "DF":
      case "CF":
      case "IF":
        if (!leg.to) return false;
        return distanceNm(aircraft.position, { lat: leg.to.lat, lon: leg.to.lon }) < 0.3;
      
      case "CA":
      case "VA":
      case "FA":
      case "HA":
        return aircraft.altitudeFt >= (leg.altitudeConstraintFt || 0);
      
      case "VM":
      case "HM":
        return false; // Requires manual sequencing
      
      case "VI":
        // Heading to intercept logic would go here
        return false; 

      case "RF":
        if (!leg.to) return false;
        return distanceNm(aircraft.position, { lat: leg.to.lat, lon: leg.to.lon }) < 0.3;

      default:
        return false;
    }
  }
}
