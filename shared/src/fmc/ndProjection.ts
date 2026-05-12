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

/**
 * Projects a geographic point (lat, lon) into ND SVG coordinates [0, 100]
 * based on the aircraft position, heading, range, and display mode.
 */
export function projectGeoPointToND(
  target: LatLon,
  aircraft: LatLon,
  heading: number,
  rangeNm: number,
  isPlan: boolean,
  isCentered: boolean,
  centerPoint?: LatLon // For PLAN mode, the map center might be a specific waypoint
): ProjectedNDPoint | null {
  const reference = isPlan && centerPoint ? centerPoint : aircraft;
  const dist = distanceNm(reference, target);
  const brg = bearingDeg(reference, target);
  
  // 1. Calculate Relative Bearing
  // PLAN mode is always North-up (0).
  // MAP/ARC/ROSE modes are Heading-up or Track-up.
  const relBrg = isPlan ? brg : relativeBearing(heading, brg);
  
  // 2. Define ND Center and Scaling
  // Center is usually (50, 50) if centered, or (50, 84) if expanded/ARC.
  const cy = isCentered ? 50 : 84;
  const cx = 50;
  
  // Max visual distance in SVG units (radius of the ND area)
  // In our SVG: 
  //   Expanded (ARC/MAP): radius is 68 (from y=84 to y=16)
  //   Centered (ROSE/PLAN): radius is 34 (from y=50 to y=16)
  const maxVisualDist = isCentered ? 34 : 68;
  
  // 3. Scaling
  const visualDist = (dist / rangeNm) * maxVisualDist;
  
  // 4. Out-of-range / Clipping
  const clipped = dist > rangeNm;
  const visible = !clipped;
  
  // 5. Convert polar to Cartesian (SVG space: y is down, 0 deg is up)
  const angleRad = (relBrg - 90) * Math.PI / 180;
  const x = cx + visualDist * Math.cos(angleRad);
  const y = cy + visualDist * Math.sin(angleRad);
  
  return { 
    x: Math.round(x * 10) / 10, 
    y: Math.round(y * 10) / 10,
    distanceNm: Math.round(dist * 10) / 10,
    bearingDeg: Math.round(brg),
    relativeBearingDeg: Math.round(relBrg),
    visible,
    clipped
  };
}
