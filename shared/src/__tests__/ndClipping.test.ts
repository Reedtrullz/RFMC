import { describe, it, expect } from 'vitest';
import { clipLineToCircle, clipRouteSegment } from '../fmc/ndClipping';
import type { NDRoutePoint } from '../fmc/ndTypes';

// Helper: create a minimal NDRoutePoint for clipping tests
function pt(x: number, y: number, visible = true, clipped = false): NDRoutePoint {
  return {
    id: `pt-${x}-${y}`,
    label: 'TEST',
    x,
    y,
    active: false,
    discontinuity: false,
    airport: false,
    visible,
    clipped,
    altitudeLabel: null,
    speedLabel: null,
  };
}

describe('clipLineToCircle', () => {
  // Circle at (50, 84) with r=45 — standard ND expanded-center geometry
  const CX = 50,
    CY = 84,
    R = 45;

  it('returns full segment for a line fully inside the circle', () => {
    // A short segment near the center, both points clearly inside
    const result = clipLineToCircle(50, 80, 55, 75, CX, CY, R);
    expect(result).not.toBeNull();
    expect(result!.clipped).toBe(false);
    expect(result!.x1).toBeCloseTo(50);
    expect(result!.y1).toBeCloseTo(80);
    expect(result!.x2).toBeCloseTo(55);
    expect(result!.y2).toBeCloseTo(75);
  });

  it('returns null for a line fully outside the circle', () => {
    // A horizontal line far above the ND center, never touching the circle
    const result = clipLineToCircle(10, 20, 90, 20, CX, CY, R);
    // Distance from (50,84) to y=20 is 64, greater than r=45, so no intersection
    expect(result).toBeNull();
  });

  it('clips a line that crosses from inside to outside', () => {
    // From center (50,84) straight up to (50, 20) — clearly exits the circle
    const result = clipLineToCircle(50, 84, 50, 20, CX, CY, R);
    expect(result).not.toBeNull();
    expect(result!.clipped).toBe(true);
    // Start should be at center (inside circle)
    expect(result!.x1).toBeCloseTo(50, 1);
    expect(result!.y1).toBeCloseTo(84, 1);
    // End should be clipped to the circle boundary (r=45 north of center → y = 84-45 = 39)
    expect(result!.x2).toBeCloseTo(50, 1);
    expect(result!.y2).toBeCloseTo(39, 0);
  });

  it('clips a line that crosses from outside to inside', () => {
    // From far outside (50, 0) to center (50, 84)
    const result = clipLineToCircle(50, 0, 50, 84, CX, CY, R);
    expect(result).not.toBeNull();
    expect(result!.clipped).toBe(true);
    // Start clipped to circle entry
    expect(result!.x1).toBeCloseTo(50, 1);
    expect(result!.y1).toBeCloseTo(39, 0); // 84 - 45
    // End at center
    expect(result!.x2).toBeCloseTo(50, 1);
    expect(result!.y2).toBeCloseTo(84, 1);
  });

  it('clips both ends for a line that passes through the circle', () => {
    // A vertical line from well above to well below, passing through the circle
    const result = clipLineToCircle(50, 0, 50, 150, CX, CY, R);
    expect(result).not.toBeNull();
    expect(result!.clipped).toBe(true);
    // Should enter at y = 84-45 = 39 and exit at y = 84+45 = 129
    expect(result!.y1).toBeCloseTo(39, 0);
    expect(result!.y2).toBeCloseTo(129, 0);
  });

  it('returns null for a zero-length point outside the circle', () => {
    // Point at (10, 10) — distance to (50,84) is ~84, outside r=45
    const result = clipLineToCircle(10, 10, 10, 10, CX, CY, R);
    expect(result).toBeNull();
  });

  it('returns the point for a zero-length point inside the circle', () => {
    // Point at center (50, 84)
    const result = clipLineToCircle(50, 84, 50, 84, CX, CY, R);
    expect(result).not.toBeNull();
    expect(result!.x1).toBeCloseTo(50);
    expect(result!.y1).toBeCloseTo(84);
  });

  it('handles diagonal clipping correctly', () => {
    // A diagonal from (50, 84) going northeast to (120, 14) — exits circle
    const result = clipLineToCircle(50, 84, 120, 14, CX, CY, R);
    expect(result).not.toBeNull();
    expect(result!.clipped).toBe(true);
    // The clipped end should be on the circle boundary
    const dx = result!.x2 - CX;
    const dy = result!.y2 - CY;
    const distFromCenter = Math.sqrt(dx * dx + dy * dy);
    expect(distFromCenter).toBeCloseTo(R, 0);
  });
});

describe('clipRouteSegment', () => {
  it('returns visible=true for a segment with both endpoints inside the ND', () => {
    const from = pt(50, 80);
    const to = pt(55, 70);
    const result = clipRouteSegment(from, to, false);
    expect(result.visible).toBe(true);
  });

  it('returns visible=false when the segment is entirely outside the ND boundary', () => {
    // Both points far above the ND circle (cy=84, r=45 → top edge at y=39)
    const from = pt(10, 10);
    const to = pt(90, 10);
    const result = clipRouteSegment(from, to, false);
    expect(result.visible).toBe(false);
  });

  it('returns clipped=true when a segment crosses the ND boundary', () => {
    // From inside to outside
    const from = pt(50, 84); // center
    const to = pt(50, 10); // way above the ND
    const result = clipRouteSegment(from, to, false);
    expect(result.visible).toBe(true);
    expect(result.clipped).toBe(true);
    // The clipped end should be near the top edge of the circle (y=39)
    expect(result.y2).toBeCloseTo(39, 0);
  });

  it('uses centered=true geometry (cy=50, r=45)', () => {
    // In centered mode, circle is at (50,50). A point at (50,50) is center.
    const from = pt(50, 50); // center
    const to = pt(50, -10); // below SVG viewport, outside circle
    const result = clipRouteSegment(from, to, true);
    expect(result.visible).toBe(true);
    expect(result.clipped).toBe(true);
    // Clipped end near top of centered circle: 50-45=5
    expect(result.y2).toBeCloseTo(5, 0);
  });

  it('passes through original coordinates for fully inside segment', () => {
    const from = pt(48, 82);
    const to = pt(52, 78);
    const result = clipRouteSegment(from, to, false);
    expect(result.x1).toBeCloseTo(48);
    expect(result.y1).toBeCloseTo(82);
    expect(result.x2).toBeCloseTo(52);
    expect(result.y2).toBeCloseTo(78);
  });
});
