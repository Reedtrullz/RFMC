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
});
