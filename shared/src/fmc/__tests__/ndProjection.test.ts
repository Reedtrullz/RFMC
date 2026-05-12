import { describe, expect, it } from 'vitest';
import { projectGeoPointToND } from '../ndProjection';

describe('ND Projection', () => {
  const aircraft = { lat: 50, lon: 0 };
  const heading = 0;
  const rangeNm = 40;

  it('projects a point directly ahead correctly', () => {
    // 20nm ahead
    const target = { lat: 50 + (20 / 60), lon: 0 }; 
    const projected = projectGeoPointToND(target, aircraft, heading, rangeNm, false, false);
    
    expect(projected).not.toBeNull();
    if (projected) {
      expect(projected.x).toBe(50);
      expect(projected.y).toBeLessThan(84);
      expect(projected.y).toBeGreaterThan(16);
    }
  });

  it('projects a point at the edge of the range correctly', () => {
    const target = { lat: 50 + (40 / 60), lon: 0 };
    const projected = projectGeoPointToND(target, aircraft, heading, rangeNm, false, false);
    
    expect(projected).not.toBeNull();
    if (projected) {
      expect(projected.x).toBe(50);
      expect(projected.y).toBeCloseTo(16, 0); // 84 - 68
    }
  });

  it('handles centered mode correctly', () => {
    const target = { lat: 50 + (20 / 60), lon: 0 };
    const projected = projectGeoPointToND(target, aircraft, heading, rangeNm, false, true);
    
    expect(projected).not.toBeNull();
    if (projected) {
      expect(projected.x).toBe(50);
      expect(projected.y).toBeLessThan(50);
      expect(projected.y).toBeGreaterThan(16);
    }
  });
});
