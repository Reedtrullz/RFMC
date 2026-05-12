import { LatLon, distanceNm, bearingDeg, relativeBearing } from './ndGeometry';

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
  isCentered: boolean
): { x: number; y: number } | null {
  const dist = distanceNm(aircraft, target);
  const brg = bearingDeg(aircraft, target);
  
  // If in PLAN mode, the "heading" is usually fixed North (0)
  // and the center is the selected waypoint.
  // For now, we assume simple track-up projection for MAP/ARC.
  
  const relBrg = isPlan ? brg : relativeBearing(heading, brg);
  
  // Scaling: 0 to rangeNm maps to the radius of the ND area.
  // In our SVG:
  // Center is usually 50, 50 (if centered) or 50, 84 (if arc).
  // The outer ring is at y=16 (distance 68 from 84, or distance 34 from 50).
  
  const cy = isCentered ? 50 : 84;
  const cx = 50;
  const maxVisualDist = isCentered ? 34 : 68;
  
  const visualDist = (dist / rangeNm) * maxVisualDist;
  
  // Convert polar to Cartesian (SVG space: y is down, 0 deg is up)
  const angleRad = (relBrg - 90) * Math.PI / 180;
  const x = cx + visualDist * Math.cos(angleRad);
  const y = cy + visualDist * Math.sin(angleRad);
  
  return { 
    x: Math.round(x * 10) / 10, 
    y: Math.round(y * 10) / 10 
  };
}
