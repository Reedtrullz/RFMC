/**
 * Navigation Database Mock / Utilities
 * Provides geographic coordinates for common airports and waypoints
 * used in training scenarios and default routes.
 */

interface GeoPoint {
  lat: number;
  lon: number;
}

const AIRPORT_DB: Record<string, GeoPoint> = {
  'KJFK': { lat: 40.6397, lon: -73.7789 },
  'KDCA': { lat: 38.8521, lon: -77.0377 },
  'KLAX': { lat: 33.9425, lon: -118.4081 },
  'KSFO': { lat: 37.6189, lon: -122.3750 },
  'EHAM': { lat: 52.3081, lon: 4.7642 },
  'EGLL': { lat: 51.4700, lon: -0.4543 },
  'LFPG': { lat: 49.0097, lon: 2.5479 },
  'EDDF': { lat: 50.0333, lon: 8.5705 },
};

const WAYPOINT_DB: Record<string, GeoPoint> = {
  'RBV': { lat: 40.2023, lon: -74.4947 }, // Robbinsville VOR
  'DIXIE': { lat: 40.0638, lon: -74.1555 }, // Intersection
  'WHITE': { lat: 39.8406, lon: -74.2372 },
  'GVE': { lat: 37.7943, lon: -78.1528 }, // Gordonsville VOR
  'OAL': { lat: 38.0033, lon: -117.7692 }, // Coaldale VOR
  'MOD': { lat: 37.6292, lon: -120.9575 }, // Modesto VOR
  'SFO': { lat: 37.6189, lon: -122.3750 }, // San Francisco VOR
  'EHRD': { lat: 51.9569, lon: 4.4372 }, // Rotterdam (used as wpt sometimes)
  'SPL': { lat: 52.3015, lon: 4.7642 }, // Schiphol VOR
};

/**
 * Look up airport coordinates by ICAO code.
 */
export function getAirportCoordinates(icao: string): GeoPoint | null {
  if (!icao) return null;
  return AIRPORT_DB[icao.toUpperCase()] || null;
}

/**
 * Look up waypoint coordinates by identifier.
 */
export function getWaypointCoordinates(ident: string): GeoPoint | null {
  if (!ident) return null;
  return WAYPOINT_DB[ident.toUpperCase()] || null;
}
