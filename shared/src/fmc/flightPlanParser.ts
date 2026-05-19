import type { FlightPlanWaypoint, AltitudeConstraint, SpeedConstraint } from '../types/fmc';
import { PROCEDURE_LEGS } from './airFMCData';
import { getAirportCoordinates, getWaypointCoordinates } from './navDatabase';

/**
 * Parse an ICAO route string into an array of waypoints.
 * Example: "KJFK DCT RBV J42 LENDY8 KDCA"
 *
 * Token types:
 * - 4-letter ICAO: airport (first and last tokens)
 * - 5-letter: waypoint / fix
 * - Letter+Number (no DCT): airway (e.g., J42, V123)
 * - Ends with number, 5+ chars: procedure (SID/STAR)
 * - DCT: direct
 */
export function parseRouteString(routeString: string): {
  origin: string;
  destination: string;
  waypoints: FlightPlanWaypoint[];
} {
  if (!routeString.trim()) {
    return { origin: '', destination: '', waypoints: [] };
  }

  const tokens = routeString.trim().toUpperCase().split(/\s+/);
  const waypoints: FlightPlanWaypoint[] = [];
  let origin = '';
  let destination = '';

  let previousAirway: string | undefined = undefined;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    // Handle DCT
    if (token === 'DCT') {
      previousAirway = undefined;
      continue;
    }

    // First token is origin airport (if 4-letter)
    if (i === 0 && token.length === 4 && !/\d/.test(token)) {
      origin = token;
      continue;
    }

    // Last token is destination airport (if 4-letter)
    if (i === tokens.length - 1 && token.length === 4 && !/\d/.test(token)) {
      destination = token;
      waypoints.push({
        ident: token,
        discontinuity: false,
      });
      continue;
    }

    // Check if it's an airway (letter + number, but not 5-letter waypoint)
    if (isAirway(token)) {
      previousAirway = token;
      continue;
    }

    // Constraint-bearing fixes like RBV/250FL100 must be parsed before
    // procedure detection, because their constraint text often ends in digits.
    if (token.includes('/')) {
      const { ident, altConstraint, spdConstraint } = parseConstraint(token);
      waypoints.push({
        ident,
        airway: previousAirway,
        altitudeConstraint: altConstraint,
        speedConstraint: spdConstraint,
        discontinuity: false,
      });
      previousAirway = undefined;
      continue;
    }

    // Check if it's a procedure (ends with number, not a standard waypoint)
    if (isProcedure(token)) {
      const legs = PROCEDURE_LEGS[token];
      if (legs) {
        legs.forEach((leg) => {
          waypoints.push({
            ident: leg,
            airway: previousAirway,
            discontinuity: false,
          });
          previousAirway = undefined;
        });
      } else {
        waypoints.push({
          ident: token,
          airway: previousAirway,
          discontinuity: false,
        });
        previousAirway = undefined;
      }
      continue;
    }

    // Otherwise it's a waypoint/fix
    const { ident, altConstraint, spdConstraint } = parseConstraint(token);

    waypoints.push({
      ident,
      airway: previousAirway,
      altitudeConstraint: altConstraint,
      speedConstraint: spdConstraint,
      discontinuity: false,
    });
    previousAirway = undefined;
  }

  enrichRouteCoordinates(waypoints, origin, destination);

  return { origin, destination, waypoints };
}

export function enrichRouteCoordinates(waypoints: FlightPlanWaypoint[], origin?: string, destination?: string): void {
  waypoints.forEach((wp) => {
    if (wp.lat !== undefined && wp.lon !== undefined) {
      if (!wp.coordinateSource) wp.coordinateSource = 'unknown';
      return;
    }

    let coords = null;
    if (wp.ident === origin || wp.ident === destination || (wp.ident.length === 4 && !/\d/.test(wp.ident))) {
      coords = getAirportCoordinates(wp.ident);
    }

    if (!coords) {
      coords = getWaypointCoordinates(wp.ident);
    }

    if (coords) {
      wp.lat = coords.lat;
      wp.lon = coords.lon;
      wp.coordinateSource = 'navdb';
    } else if (!wp.discontinuity) {
      wp.coordinateSource = 'UNRESOLVED';
    }
  });
}

function isAirway(token: string): boolean {
  // Airways: start with letter(s), end with number, total length 2-5
  // Examples: J42, V123, Q14, Y280
  if (token.length < 2 || token.length > 5) return false;
  return /^[A-Z]+\d+$/.test(token) && token.length >= 2;
}

export function isProcedure(token: string): boolean {
  // Procedures: longer strings ending with number, not a 5-letter fix
  // Examples: LENDY8, RBV3, FRDMM2
  if (token.length < 3) return false;
  if (/^[A-Z]{5}$/.test(token)) return false; // standard 5-letter waypoint
  if (/^[A-Z]{4}$/.test(token)) return false; // airport
  return /\d$/.test(token);
}

interface ParsedConstraint {
  ident: string;
  altConstraint?: AltitudeConstraint;
  spdConstraint?: SpeedConstraint;
}

function parseConstraint(token: string): ParsedConstraint {
  // Constraints are after slash: WPT/250FL100AT
  const slashIdx = token.indexOf('/');
  if (slashIdx === -1) return { ident: token };

  const ident = token.substring(0, slashIdx);
  const constraint = token.substring(slashIdx + 1);

  let altConstraint: AltitudeConstraint | undefined;
  let spdConstraint: SpeedConstraint | undefined;

  let altitudePart = constraint;

  // Parse speed: /250FL100, /25010000, or /250.
  const speedMatch = constraint.match(/^(\d{2,3})(?=FL|\d{4,5}|$)/);
  if (speedMatch) {
    spdConstraint = { type: 'AT', speed: parseInt(speedMatch[1]) };
    altitudePart = constraint.slice(speedMatch[1].length);
  }

  // Parse altitude: FL100, 10000, 5000
  const altMatch = altitudePart.match(/FL(\d{2,3})/);
  if (altMatch) {
    altConstraint = { type: 'AT', altitude: parseInt(altMatch[1]) * 100 };
  } else {
    const altNum = altitudePart.match(/(\d{4,5})/);
    if (altNum) {
      altConstraint = { type: 'AT', altitude: parseInt(altNum[1]) };
    }
  }

  // Parse constraint type: A/ABV means at-or-above, B/BLW means at-or-below.
  if (/(ABV|A$)/.test(constraint)) {
    if (altConstraint) altConstraint.type = 'AT_OR_ABOVE';
  } else if (/(BLW|B$)/.test(constraint)) {
    if (altConstraint) altConstraint.type = 'AT_OR_BELOW';
  }

  return { ident, altConstraint, spdConstraint };
}

/**
 * Calculate great circle distance between two lat/lon points (in NM)
 */
export function greatCircleDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3440.065; // Earth radius in nautical miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
