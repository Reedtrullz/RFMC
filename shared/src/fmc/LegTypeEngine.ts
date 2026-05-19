import { ArincLegType, ProcedureLeg, NavFix } from '../navdata/navdataTypes';
import { distanceNm } from './ndGeometry';
import { AircraftState } from '../types/fmc';

export type LegType =
  | 'IF' // Initial Fix
  | 'TF' // Track to Fix
  | 'DF' // Direct to Fix
  | 'CF' // Course to Fix
  | 'CA' // Course to Altitude
  | 'VA' // Heading to Altitude
  | 'VM' // Heading to Manual Termination
  | 'VI' // Heading to Intercept
  | 'FA' // Fix to Altitude
  | 'HM' // Hold to Manual
  | 'HA' // Hold to Altitude
  | 'HF' // Hold to Fix
  | 'RF'; // Radius to Fix

export interface FmsLeg {
  type: LegType;
  from?: NavFix;
  to?: NavFix;
  courseDeg?: number;
  headingDeg?: number;
  altitudeConstraintFt?: number;
  distanceNm?: number;
  turnDirection?: 'L' | 'R';
}

export class LegTypeEngine {
  /**
   * Determines if the aircraft has reached the termination condition for the current leg.
   */
  public static shouldSequenceLeg(leg: FmsLeg, aircraft: AircraftState, nextLeg?: FmsLeg): boolean {
    const aircraftPos = { lat: aircraft.lat, lon: aircraft.lon };

    switch (leg.type) {
      case 'IF': // Initial Fix
        return true; // Sequence immediately to start path

      case 'TF': // Track to Fix
      case 'DF': // Direct to Fix
      case 'CF': // Course to Fix
        if (!leg.to) return false;
        const distToFix = distanceNm(aircraftPos, { lat: leg.to.lat, lon: leg.to.lon });

        // Basic Fly-By logic: Sequence slightly early if we have a next leg to turn towards
        const sequenceThreshold = nextLeg ? 0.5 : 0.2;
        return distToFix < sequenceThreshold;

      case 'CA': // Course to Altitude
      case 'VA': // Heading to Altitude
      case 'FA': // Fix to Altitude
      case 'HA': // Hold to Altitude
        return aircraft.altitude >= (leg.altitudeConstraintFt || 0) - 100;

      case 'VM': // Heading to Manual Termination
      case 'HM': // Hold to Manual
        return false; // Requires pilot manual sequence (e.g. DIR TO)

      case 'VI': // Heading to Intercept
        // Sequence if aircraft is on course to the next leg
        return false;

      case 'RF': // Radius to Fix
        if (!leg.to) return false;
        return distanceNm(aircraftPos, { lat: leg.to.lat, lon: leg.to.lon }) < 0.3;

      default:
        return false;
    }
  }
}
