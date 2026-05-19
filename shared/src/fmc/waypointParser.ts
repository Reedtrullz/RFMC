import type { FlightPlanWaypoint } from '../types/fmc';
import { projectLatLon, type LatLon } from './ndGeometry';

export type WaypointInputType =
  | 'DATABASE_IDENT'
  | 'LAT_LONG'
  | 'PLACE_BEARING_DISTANCE'
  | 'PLACE_BEARING_PLACE_BEARING'
  | 'ALONG_TRACK'
  | 'AIRWAY_CROSSING'
  | 'CONDITIONAL';

export interface ParsedWaypoint {
  type: WaypointInputType;
  ident: string;
  lat: number;
  lon: number;
  displayIdent: string;
}

/**
 * Regex patterns for different waypoint entry formats
 */
const PATTERNS = {
  // N4715.4W00803.4 or N47W008 or 4715N00803W
  LAT_LONG: /^([NS])(\d{2,4}(\.\d)?)([EW])(\d{3,5}(\.\d)?)$|^(\d{2,4}(\.\d)?)([NS])(\d{3,5}(\.\d)?)([EW])$/,
  // SEA330/10 or VAMPS270/25
  PBD: /^([A-Z0-9]{1,5})(\d{3})\/(\d{1,3}(\.\d)?)$/,
  // VAMPS/25 or ELN/-30
  ALONG_TRACK: /^([A-Z0-9]{1,5})\/(-?\d{1,3}(\.\d)?)$/,
  // LAX/150/VPL/330
  PBPB: /^([A-Z0-9]{1,5})\/(\d{3})\/([A-Z0-9]{1,5})\/(\d{3})$/,
};

/**
 * Parses a pilot-entered waypoint string into a coordinate-backed waypoint
 */
export function parseWaypointInput(
  input: string,
  getWaypointCoords: (ident: string) => LatLon | null,
): ParsedWaypoint | null {
  const upperInput = input.toUpperCase().replace(/\s/g, '');

  // 1. Lat/Long Format
  const latLongMatch = upperInput.match(PATTERNS.LAT_LONG);
  if (latLongMatch) {
    return parseLatLong(latLongMatch);
  }

  // 2. Place-Bearing-Distance (PBD)
  const pbdMatch = upperInput.match(PATTERNS.PBD);
  if (pbdMatch) {
    const [_, place, brng, dist] = pbdMatch;
    const refCoords = getWaypointCoords(place);
    if (refCoords) {
      const coords = projectLatLon(refCoords, parseFloat(brng), parseFloat(dist));
      return {
        type: 'PLACE_BEARING_DISTANCE',
        ident: `${place.substring(0, 3)}01`, // Simplified naming e.g. SEA01
        displayIdent: `${place.substring(0, 3)}01`,
        ...coords,
      };
    }
  }

  // 3. Along-Track Waypoint
  const alongTrackMatch = upperInput.match(PATTERNS.ALONG_TRACK);
  if (alongTrackMatch) {
    const [_, place, dist] = alongTrackMatch;
    // Note: This usually requires knowing the route track at that point.
    // For a simple trainer, we might just project it along a default heading or require route context.
    // In a real FMC, it's relative to the flight plan leg.
    // We'll return the place but mark it for further processing if we have route context.
  }

  return null;
}

function parseLatLong(match: RegExpMatchArray): ParsedWaypoint | null {
  let lat = 0;
  let lon = 0;
  let ident = '';

  if (match[1]) {
    // Format: N4715.4W00803.4
    const latDir = match[1];
    const latVal = match[2];
    const lonDir = match[4];
    const lonVal = match[5];

    lat = parseCoordPart(latVal, latDir);
    lon = parseCoordPart(lonVal, lonDir);
    ident = `WPT01`; // Placeholder ident
  } else if (match[7]) {
    // Format: 4715N00803W
    const latVal = match[7];
    const latDir = match[9];
    const lonVal = match[10];
    const lonDir = match[11];

    lat = parseCoordPart(latVal, latDir);
    lon = parseCoordPart(lonVal, lonDir);
    ident = `WPT01`;
  }

  return {
    type: 'LAT_LONG',
    ident,
    displayIdent: ident,
    lat,
    lon,
  };
}

function parseCoordPart(val: string, dir: string): number {
  let degrees = 0;
  let minutes = 0;

  if (val.includes('.')) {
    const parts = val.split('.');
    const degMin = parts[0];
    const decimal = parseFloat(`0.${parts[1]}`);

    if (degMin.length <= 3) {
      // Degrees only with decimal
      degrees = parseInt(degMin);
      minutes = decimal * 60;
    } else {
      // Degrees and minutes with decimal
      minutes = parseInt(degMin.substring(degMin.length - 2)) + decimal;
      degrees = parseInt(degMin.substring(0, degMin.length - 2));
    }
  } else {
    if (val.length <= 3) {
      degrees = parseInt(val);
    } else {
      minutes = parseInt(val.substring(val.length - 2));
      degrees = parseInt(val.substring(0, val.length - 2));
    }
  }

  let result = degrees + minutes / 60;
  if (dir === 'S' || dir === 'W') result = -result;
  return result;
}
