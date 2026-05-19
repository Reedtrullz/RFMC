import { LatLon, distanceNm, bearingDeg, relativeBearing } from './ndGeometry';

export interface ProjectedNDPoint {
  x: number;
  y: number;
  distanceNm: number;
  bearingDeg: number;
  relativeBearingDeg: number;
  visible: boolean;
  clipped: boolean;
}

export interface NDProjectionContext {
  style: 'airbus' | 'boeing';
  mode: string;
  rangeNm: number;
  heading: number;
  isCentered: boolean;
  aircraftPosition: LatLon;
  planCenter?: LatLon;
}

/**
 * Projects a geographic point (lat, lon) into ND SVG coordinates [0, 100]
 * based on the aircraft position, heading, range, and display mode.
 */
export function projectGeoPointToND(target: LatLon, context: NDProjectionContext): ProjectedNDPoint | null {
  const { aircraftPosition, heading, rangeNm, mode, isCentered, planCenter } = context;
  const isPlan = mode === 'PLAN' || mode === 'PLN';

  const reference = isPlan && planCenter ? planCenter : aircraftPosition;
  if (
    !reference ||
    reference.lat === undefined ||
    reference.lon === undefined ||
    isNaN(reference.lat) ||
    isNaN(reference.lon) ||
    !target ||
    target.lat === undefined ||
    target.lon === undefined ||
    isNaN(target.lat) ||
    isNaN(target.lon)
  ) {
    return null;
  }
  const dist = distanceNm(reference, target);
  const brg = bearingDeg(reference, target);

  // 1. Calculate Relative Bearing
  // PLAN mode is always North-up (0).
  const relBrg = isPlan ? brg : relativeBearing(heading, brg);

  // 2. Define ND Center and Scaling
  const cy = isCentered ? 50 : 84;
  const cx = 50;

  // Max visual distance in SVG units (radius of the ND area)
  const maxVisualDist = isCentered ? 34 : 68;

  // 3. Scaling
  const visualDist = (dist / rangeNm) * maxVisualDist;

  // 4. Out-of-range / Clipping
  const clipped = dist > rangeNm;
  const visible = !clipped;

  // 5. Convert polar to Cartesian (SVG space: y is down, 0 deg is up)
  const angleRad = ((relBrg - 90) * Math.PI) / 180;
  const x = cx + visualDist * Math.cos(angleRad);
  const y = cy + visualDist * Math.sin(angleRad);

  return {
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10,
    distanceNm: Math.round(dist * 10) / 10,
    bearingDeg: Math.round(brg),
    relativeBearingDeg: Math.round(relBrg),
    visible,
    clipped,
  };
}
