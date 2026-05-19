import { describe, it, expect } from 'vitest';
import { parseRouteString } from '../fmc/flightPlanParser';

describe('Flight Plan Parser', () => {
  it('parses simple DCT route', () => {
    const result = parseRouteString('KJFK DCT KDCA');
    expect(result.origin).toBe('KJFK');
    expect(result.destination).toBe('KDCA');
    expect(result.waypoints).toHaveLength(1);
    expect(result.waypoints[0].ident).toBe('KDCA');
  });

  it('parses route with airways', () => {
    const result = parseRouteString('KJFK J42 LENDY DCT KDCA');
    expect(result.origin).toBe('KJFK');
    expect(result.destination).toBe('KDCA');
    expect(result.waypoints.length).toBeGreaterThan(0);
  });

  it('handles empty route', () => {
    const result = parseRouteString('');
    expect(result.origin).toBe('');
    expect(result.destination).toBe('');
    expect(result.waypoints).toHaveLength(0);
  });

  it('parses speed and altitude constraints before procedure detection', () => {
    const result = parseRouteString('KJFK DCT RBV/250FL100 DIXIE KDCA');

    expect(result.waypoints[0]).toMatchObject({
      ident: 'RBV',
      speedConstraint: { type: 'AT', speed: 250 },
      altitudeConstraint: { type: 'AT', altitude: 10000 },
    });
  });

  it('parses at-or-above and at-or-below altitude suffixes', () => {
    const result = parseRouteString('KJFK DCT RBV/250FL100A DIXIE/2105000B KDCA');

    expect(result.waypoints[0].altitudeConstraint).toMatchObject({ type: 'AT_OR_ABOVE', altitude: 10000 });
    expect(result.waypoints[1].altitudeConstraint).toMatchObject({ type: 'AT_OR_BELOW', altitude: 5000 });
  });

  it('unrolls ARINC-Lite procedures into multiple legs', () => {
    const result = parseRouteString('KJFK LENDY1 KJFK');
    // LENDY1 expands to ['LENDY', 'DIXIE', 'JFK']
    // Plus the destination KJFK
    expect(result.waypoints.map((w) => w.ident)).toEqual(['LENDY', 'DIXIE', 'JFK', 'KJFK']);
  });

  it('unrolls KATL SMKEY2 procedure', () => {
    const result = parseRouteString('KATL SMKEY2 KORD');
    // SMKEY2 expands to ['KATL', 'DAWGS', 'MCDON', 'SMKEY']
    expect(result.waypoints.map((w) => w.ident)).toContain('SMKEY');
    expect(result.waypoints.map((w) => w.ident)).toContain('MCDON');
  });

  it('enriches waypoints with coordinates from the local navdb', () => {
    const result = parseRouteString('KJFK DCT RBV DCT KDCA');

    // RBV should be enriched
    const rbv = result.waypoints.find((w) => w.ident === 'RBV');
    expect(rbv).toBeDefined();
    expect(rbv?.lat).toBeCloseTo(40.2023, 2);
    expect(rbv?.lon).toBeCloseTo(-74.4947, 2);
    expect(rbv?.coordinateSource).toBe('navdb');

    // KDCA should be enriched as an airport
    const kdca = result.waypoints.find((w) => w.ident === 'KDCA');
    expect(kdca).toBeDefined();
    expect(kdca?.lat).toBeCloseTo(38.8521, 2);
    expect(kdca?.coordinateSource).toBe('navdb');
  });
});
