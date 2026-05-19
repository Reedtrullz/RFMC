import { NDRoutePoint } from './ndTypes';

/**
 * Clips a line segment (x1, y1) to (x2, y2) against a circle centered at (cx, cy) with radius r.
 * Returns the clipped coordinates or null if the line is entirely outside.
 */
export function clipLineToCircle(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  cx: number,
  cy: number,
  r: number,
): { x1: number; y1: number; x2: number; y2: number; clipped: boolean } | null {
  const dx = x2 - x1;
  const dy = y2 - y1;

  const a = dx * dx + dy * dy;
  if (a < 0.000001) {
    // Line is a point
    const d2 = (x1 - cx) ** 2 + (y1 - cy) ** 2;
    return d2 <= r * r ? { x1, y1, x2, y2, clipped: false } : null;
  }

  const b = 2 * (dx * (x1 - cx) + dy * (y1 - cy));
  const c = (x1 - cx) ** 2 + (y1 - cy) ** 2 - r * r;

  const discriminant = b * b - 4 * a * c;

  if (discriminant < 0) {
    return null; // No intersection
  }

  const sqrtD = Math.sqrt(discriminant);
  let tMin = (-b - sqrtD) / (2 * a);
  let tMax = (-b + sqrtD) / (2 * a);

  // Intersection range is [tMin, tMax]
  // Segment range is [0, 1]
  const clipMin = Math.max(0, tMin);
  const clipMax = Math.min(1, tMax);

  if (clipMin > clipMax) {
    return null; // Segment is outside the circle
  }

  return {
    x1: x1 + clipMin * dx,
    y1: y1 + clipMin * dy,
    x2: x1 + clipMax * dx,
    y2: y1 + clipMax * dy,
    clipped: clipMin > 0 || clipMax < 1,
  };
}

/**
 * Clips a line segment to the appropriate ND display boundary.
 */
export function clipRouteSegment(
  from: NDRoutePoint,
  to: NDRoutePoint,
  isCentered: boolean,
): { x1: number; y1: number; x2: number; y2: number; clipped: boolean; visible: boolean } {
  const cx = 50;
  const cy = isCentered ? 50 : 84;
  const r = 45;

  // First clip against the circle
  const circleResult = clipLineToCircle(from.x, from.y, to.x, to.y, cx, cy, r);

  if (!circleResult) {
    return { x1: from.x, y1: from.y, x2: to.x, y2: to.y, clipped: false, visible: false };
  }

  return {
    ...circleResult,
    visible: true,
  };
}
