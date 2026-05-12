import { describe, expect, it } from 'vitest';
import { distanceNm, bearingDeg, relativeBearing } from '../fmc/ndGeometry';

describe('ND Geometry', () => {
  it('calculates distance correctly', () => {
    const p1 = { lat: 52.3, lon: 4.7 }; // EHAM
    const p2 = { lat: 51.5, lon: -0.4 }; // EGLL
    const dist = distanceNm(p1, p2);
    expect(dist).toBeGreaterThan(190);
    expect(dist).toBeLessThan(210);
  });

  it('calculates bearing correctly', () => {
    const p1 = { lat: 52, lon: 4 };
    const p2 = { lat: 53, lon: 4 }; // North
    expect(bearingDeg(p1, p2)).toBeCloseTo(0, 0);

    const p3 = { lat: 52, lon: 5 }; // East
    expect(bearingDeg(p1, p3)).toBeGreaterThan(80);
    expect(bearingDeg(p1, p3)).toBeLessThan(100);
  });

  it('calculates relative bearing correctly', () => {
    expect(relativeBearing(0, 90)).toBe(90);
    expect(relativeBearing(0, 270)).toBe(-90);
    expect(relativeBearing(350, 10)).toBe(20);
    expect(relativeBearing(10, 350)).toBe(-20);
  });
});
