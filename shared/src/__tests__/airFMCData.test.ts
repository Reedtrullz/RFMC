import { describe, it, expect } from 'vitest';
import { getAirport, getWaypoint, getAirway, AIRPORTS } from '../fmc/airFMCData';

describe('Navigation Database', () => {
  it('has at least 100 airports', () => {
    const count = Object.keys(AIRPORTS).length;
    expect(count).toBeGreaterThanOrEqual(100);
  });

  it('getAirport returns correct data', () => {
    const airport = getAirport('KJFK');
    expect(airport).toBeDefined();
    expect(airport?.name).toContain('Kennedy');
    expect(airport?.lat).toBeCloseTo(40.64, 1);
  });

  it('getAirport is case-insensitive', () => {
    expect(getAirport('kjfk')).toBeDefined();
    expect(getAirport('Kjfk')).toBeDefined();
  });

  it('getWaypoint returns correct data', () => {
    const wp = getWaypoint('RBV');
    expect(wp).toBeDefined();
    expect(wp?.lat).toBeCloseTo(40.37, 1);
  });

  it('getAirway returns correct data', () => {
    const airway = getAirway('J42');
    expect(airway).toBeDefined();
    expect(airway?.length).toBeGreaterThan(0);
  });

  it('covers US states', () => {
    expect(getAirport('KATL')).toBeDefined();
    expect(getAirport('KDFW')).toBeDefined();
    expect(getAirport('KLAX')).toBeDefined();
    expect(getAirport('KORD')).toBeDefined();
    expect(getAirport('KSEA')).toBeDefined();
    expect(getAirport('PANC')).toBeDefined();
    expect(getAirport('PHNL')).toBeDefined();
  });

  it('includes international airports', () => {
    expect(getAirport('EGLL')).toBeDefined();
    expect(getAirport('LFPG')).toBeDefined();
    expect(getAirport('EDDF')).toBeDefined();
  });
});
