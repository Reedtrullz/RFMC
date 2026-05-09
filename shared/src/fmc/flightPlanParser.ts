import type { FlightPlanWaypoint, AltitudeConstraint, SpeedConstraint } from '../types/fmc';

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
export function parseRouteString(routeString: string): FlightPlanWaypoint[] {
  if (!routeString.trim()) return [];

  const tokens = routeString.trim().toUpperCase().split(/\s+/);
  const waypoints: FlightPlanWaypoint[] = [];

  let previousAirway: string | undefined = undefined;
  let discontinuity = false;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    // Handle DCT
    if (token === 'DCT') {
      previousAirway = undefined;
      continue;
    }

    // First token is origin airport (if 4-letter)
    if (i === 0 && token.length === 4 && !/\d/.test(token)) {
      waypoints.push({
        ident: token,
        discontinuity: false,
      });
      continue;
    }

    // Last token is destination airport (if 4-letter)
    if (i === tokens.length - 1 && token.length === 4 && !/\d/.test(token)) {
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

    // Check if it's a procedure (ends with number, not a standard waypoint)
    if (isProcedure(token)) {
      waypoints.push({
        ident: token,
        airway: previousAirway,
        discontinuity: false,
      });
      previousAirway = undefined;
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

  return waypoints;
}

function isAirway(token: string): boolean {
  // Airways: start with letter(s), end with number, total length 2-5
  // Examples: J42, V123, Q14, Y280
  if (token.length < 2 || token.length > 5) return false;
  return /^[A-Z]+\d+$/.test(token) && token.length >= 2;
}

function isProcedure(token: string): boolean {
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

  // Parse speed: /250FL100 or /250
  const speedMatch = constraint.match(/^(\d{2,3})/);
  if (speedMatch) {
    spdConstraint = { speed: parseInt(speedMatch[1]) };
  }

  // Parse altitude: FL100, 10000, 5000
  const altMatch = constraint.match(/FL(\d{2,3})/);
  if (altMatch) {
    altConstraint = { type: 'AT', altitude: parseInt(altMatch[1]) * 100 };
  } else {
    const altNum = constraint.match(/(\d{4,5})/);
    if (altNum) {
      altConstraint = { type: 'AT', altitude: parseInt(altNum[1]) };
    }
  }

  // Parse constraint type
  if (constraint.includes('B') || constraint.includes('ABV')) {
    if (altConstraint) altConstraint.type = 'AT_OR_ABOVE';
  }
  if (constraint.includes('A') || constraint.includes('BLW')) {
    if (altConstraint) altConstraint.type = 'AT_OR_BELOW';
  }

  return { ident, altConstraint, spdConstraint };
}

/**
 * Calculate great circle distance between two lat/lon points (in NM)
 */
export function greatCircleDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 3440.065; // Earth radius in nautical miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
