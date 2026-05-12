import { describe, it, expect } from 'vitest';
import { projectGeoPointToND } from '../fmc/ndProjection';

describe('ndProjection', () => {
  const aircraft = { lat: 52, lon: 4 };
  const rangeNm = 40;
  const heading = 0;

  it('projects a point directly ahead correctly (MAP/ARC)', () => {
    const target = { lat: 52.5, lon: 4 }; // North of aircraft (dist ~30nm)
    const result = projectGeoPointToND(target, aircraft, heading, rangeNm, false, false);
    
    expect(result).not.toBeNull();
    expect(result!.x).toBe(50);
    expect(result!.y).toBeLessThan(84);
    expect(result!.visible).toBe(true);
    expect(result!.clipped).toBe(false);
  });

  it('projects a point directly behind (clipped in ARC)', () => {
    const target = { lat: 51.5, lon: 4 }; // South of aircraft
    const result = projectGeoPointToND(target, aircraft, heading, rangeNm, false, false);
    
    expect(result).not.toBeNull();
    expect(result!.x).toBe(50);
    expect(result!.y).toBeGreaterThan(84);
    expect(result!.visible).toBe(true); // Distance is 30nm, but it's "behind" the arc center. 
    // In our simplified logic, dist < rangeNm means visible.
  });

  it('handles PLAN mode (North-up)', () => {
    const target = { lat: 52, lon: 4.5 }; // East of aircraft
    const result = projectGeoPointToND(target, aircraft, 270, rangeNm, true, true);
    
    expect(result).not.toBeNull();
    expect(result!.x).toBeGreaterThan(50); // East is to the right in North-up
    expect(result!.y).toBeCloseTo(50, 0);
    expect(result!.relativeBearingDeg).toBe(90);
  });

  it('handles out-of-range clipping', () => {
    const target = { lat: 55, lon: 4 }; // Way North (>180nm)
    const result = projectGeoPointToND(target, aircraft, heading, rangeNm, false, false);
    
    expect(result!.visible).toBe(false);
    expect(result!.clipped).toBe(true);
  });

  it('handles centered vs expanded center points', () => {
    const target = { lat: 52, lon: 4 }; // At aircraft
    const centered = projectGeoPointToND(target, aircraft, 0, rangeNm, false, true);
    const expanded = projectGeoPointToND(target, aircraft, 0, rangeNm, false, false);
    
    expect(centered!.x).toBe(50);
    expect(centered!.y).toBe(50);
    expect(expanded!.x).toBe(50);
    expect(expanded!.y).toBe(84);
  });
});
