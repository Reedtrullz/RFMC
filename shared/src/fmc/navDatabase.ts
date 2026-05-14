import { NAV_FIXES } from '../navdata/navdataStore';
import { AIRPORTS, WAYPOINTS } from './airFMCData';
import type { NavFix } from '../navdata/navdataTypes';

interface GeoPoint {
  lat: number;
  lon: number;
}

/**
 * Look up airport coordinates by ICAO code.
 */
export function getAirportCoordinates(icao: string): GeoPoint | null {
  if (!icao) return null;
  const fix = NAV_FIXES[icao.toUpperCase()];
  if (fix && fix.type === 'AIRPORT') {
    return { lat: fix.lat, lon: fix.lon };
  }
  const airport = AIRPORTS[icao.toUpperCase()];
  if (airport) {
    return { lat: airport.lat, lon: airport.lon };
  }
  return null;
}

/**
 * Look up waypoint coordinates by identifier.
 */
export function getWaypointCoordinates(ident: string): GeoPoint | null {
  if (!ident) return null;
  const fix = NAV_FIXES[ident.toUpperCase()];
  if (fix && fix.type !== 'AIRPORT') {
    return { lat: fix.lat, lon: fix.lon };
  }
  const waypoint = WAYPOINTS[ident.toUpperCase()];
  if (waypoint) {
    return { lat: waypoint.lat, lon: waypoint.lon };
  }
  return null;
}

/**
 * Get all airports in the database.
 */
export function getAllAirports(): Record<string, GeoPoint> {
  const airports: Record<string, GeoPoint> = {};
  for (const [ident, fix] of Object.entries(NAV_FIXES)) {
    if (fix.type === 'AIRPORT') {
      airports[ident] = { lat: fix.lat, lon: fix.lon };
    }
  }
  return airports;
}

/**
 * Get all waypoints in the database.
 */
export function getAllWaypoints(): Record<string, GeoPoint> {
  const waypoints: Record<string, GeoPoint> = {};
  for (const [ident, fix] of Object.entries(NAV_FIXES)) {
    if (fix.type !== 'AIRPORT') {
      waypoints[ident] = { lat: fix.lat, lon: fix.lon };
    }
  }
  return waypoints;
}
