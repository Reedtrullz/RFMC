import { describe, expect, it } from 'vitest';
import { distanceNm, bearingDeg, relativeBearing } from '../fmc/ndGeometry';

describe('ndGeometry', () => {
  it('distanceNm between same point returns 0', () => {
    const p1 = { lat: 52.3, lon: 4.7 };
    expect(distanceNm(p1, p1)).toBeCloseTo(0, 5);
  });

  it('distanceNm between two known airport coordinates is approximately correct', () => {
    const eham = { lat: 52.3081, lon: 4.7642 };
    const egll = { lat: 51.47, lon: -0.4543 };
    const dist = distanceNm(eham, egll);
    expect(dist).toBeGreaterThan(180);
    expect(dist).toBeLessThan(200);
  });

  it('bearingDeg north returns ~0', () => {
    const p1 = { lat: 52, lon: 4 };
    const p2 = { lat: 53, lon: 4 };
    expect(bearingDeg(p1, p2)).toBeCloseTo(0, 0);
  });

  it('bearingDeg east returns ~90', () => {
    const p1 = { lat: 52, lon: 4 };
    const p2 = { lat: 52, lon: 5 };
    expect(bearingDeg(p1, p2)).toBeCloseTo(90, 0);
  });

  it('bearingDeg south returns ~180', () => {
    const p1 = { lat: 53, lon: 4 };
    const p2 = { lat: 52, lon: 4 };
    expect(bearingDeg(p1, p2)).toBeCloseTo(180, 0);
  });

  it('bearingDeg west returns ~270', () => {
    const p1 = { lat: 52, lon: 5 };
    const p2 = { lat: 52, lon: 4 };
    expect(bearingDeg(p1, p2)).toBeCloseTo(270, 0);
  });

  it('relativeBearing handles 350 → 010 correctly', () => {
    expect(relativeBearing(350, 10)).toBe(20);
  });

  it('relativeBearing handles 010 → 350 correctly', () => {
    expect(relativeBearing(10, 350)).toBe(-20);
  });
});
