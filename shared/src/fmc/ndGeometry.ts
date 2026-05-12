/**
 * Spherical geometry utilities for Navigation Display
 */

export interface LatLon {
  lat: number;
  lon: number;
}

/**
 * Calculates the Great Circle distance between two points in Nautical Miles
 */
export function distanceNm(p1: LatLon, p2: LatLon): number {
  const R = 3440.065; // Earth radius in NM
  const dLat = (p2.lat - p1.lat) * Math.PI / 180;
  const dLon = (p2.lon - p1.lon) * Math.PI / 180;
  const lat1 = p1.lat * Math.PI / 180;
  const lat2 = p2.lat * Math.PI / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates the initial bearing from p1 to p2 in degrees [0, 360)
 */
export function bearingDeg(p1: LatLon, p2: LatLon): number {
  const lat1 = p1.lat * Math.PI / 180;
  const lat2 = p2.lat * Math.PI / 180;
  const dLon = (p2.lon - p1.lon) * Math.PI / 180;

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const brng = Math.atan2(y, x);
  return (brng * 180 / Math.PI + 360) % 360;
}

/**
 * Normalizes a heading to [0, 360)
 */
export function normalizeHeading(hdg: number): number {
  return (hdg + 360) % 360;
}

/**
 * Calculates the relative bearing from a source heading to a target bearing
 */
export function relativeBearing(hdg: number, bearing: number): number {
  let diff = bearing - hdg;
  while (diff < -180) diff += 360;
  while (diff > 180) diff -= 360;
  return diff;
}
