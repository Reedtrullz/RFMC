import { devError } from '../logger';
import { NAV_FIXES } from '../navdata/navdataStore';
import { AIRPORTS, WAYPOINTS } from './airFMCData';
import type { NavFix } from '../navdata/navdataTypes';
import { getAirport, getWaypointsByIdent, getProceduresForAirport, ProcedureRecord } from '../db/navDb';
import type { ProcedureType } from './navdataSchema';

interface GeoPoint {
  lat: number;
  lon: number;
}

// Active session cache to support fast synchronous lookups for UI and calculations
export const NAV_CACHE: {
  airports: Record<string, GeoPoint & { name: string; runways: string[] }>;
  waypoints: Record<string, GeoPoint & { type?: string; country_code?: string }>;
  procedures: Record<string, ProcedureRecord[]>;
} = {
  airports: {},
  waypoints: {},
  procedures: {},
};

// Check if IndexedDB is available (browsers only, avoids crashing Node.js server)
const hasIndexedDB = typeof window !== 'undefined' && typeof indexedDB !== 'undefined';

/**
 * Pre-load a waypoint or airport from IndexedDB into memory.
 */
export async function loadIntoCache(ident: string): Promise<boolean> {
  if (!ident || !hasIndexedDB) return false;
  const upper = ident.toUpperCase();

  if (NAV_CACHE.airports[upper] || NAV_CACHE.waypoints[upper]) {
    return true;
  }

  try {
    const airport = await getAirport(upper);
    if (airport) {
      NAV_CACHE.airports[upper] = {
        name: airport.name,
        lat: airport.lat,
        lon: airport.lon,
        runways: airport.runways,
      };
      return true;
    }

    const waypoints = await getWaypointsByIdent(upper);
    if (waypoints && waypoints.length > 0) {
      const wp = waypoints[0];
      NAV_CACHE.waypoints[upper] = {
        lat: wp.lat,
        lon: wp.lon,
        type: wp.type,
        country_code: wp.country_code,
      };
      return true;
    }
  } catch (error) {
    devError(`Failed to load ${upper} into nav cache:`, error);
  }

  return false;
}

export async function loadProceduresIntoCache(icao: string): Promise<boolean> {
  if (!icao || !hasIndexedDB) return false;
  const upper = icao.toUpperCase();
  if (NAV_CACHE.procedures[upper]) {
    return true;
  }

  try {
    const sids = await getProceduresForAirport(upper, 'SID');
    const stars = await getProceduresForAirport(upper, 'STAR');
    const approaches = await getProceduresForAirport(upper, 'APPROACH');

    const combined = [...sids, ...stars, ...approaches];
    if (combined.length > 0) {
      NAV_CACHE.procedures[upper] = combined;
      return true;
    }
  } catch (error) {
    devError(`Failed to load procedures for ${upper} into nav cache:`, error);
  }

  return false;
}

/**
 * Look up airport coordinates by ICAO code.
 */
export function getAirportCoordinates(icao: string): GeoPoint | null {
  if (!icao) return null;
  const upper = icao.toUpperCase();

  if (NAV_CACHE.airports[upper]) {
    return NAV_CACHE.airports[upper];
  }

  const fix = NAV_FIXES[upper];
  if (fix && fix.type === 'AIRPORT') {
    return { lat: fix.lat, lon: fix.lon };
  }
  const airport = AIRPORTS[upper];
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
  const upper = ident.toUpperCase();

  if (NAV_CACHE.waypoints[upper]) {
    return NAV_CACHE.waypoints[upper];
  }

  const fix = NAV_FIXES[upper];
  if (fix && fix.type !== 'AIRPORT') {
    return { lat: fix.lat, lon: fix.lon };
  }
  const waypoint = WAYPOINTS[upper];
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
  for (const [ident, air] of Object.entries(NAV_CACHE.airports)) {
    airports[ident] = { lat: air.lat, lon: air.lon };
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
  for (const [ident, wp] of Object.entries(NAV_CACHE.waypoints)) {
    waypoints[ident] = { lat: wp.lat, lon: wp.lon };
  }
  return waypoints;
}
