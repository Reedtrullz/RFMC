import { describe, it, expect } from 'vitest';
import { parseSimBriefJSON } from '../fmc/simbriefParser';

describe('SimBrief Parser', () => {
  it('parses SimBrief JSON', () => {
    const data = {
      origin: 'KJFK',
      destination: 'KDCA',
      flightNumber: 'AA123',
      route: 'RBV3 DCT DIXIE',
      crzAlt: 35000,
      costIndex: 50,
    };
    const result = parseSimBriefJSON(JSON.stringify(data));
    expect(result.origin).toBe('KJFK');
    expect(result.destination).toBe('KDCA');
    expect(result.flightNumber).toBe('AA123');
    expect(result.route).toBe('RBV3 DCT DIXIE');
    expect(result.performance?.crzAlt).toBe(35000);
    expect(result.performance?.costIndex).toBe(50);
  });

  it('handles missing optional fields', () => {
    const data = {
      origin: 'KLAX',
      destination: 'KSFO',
      route: 'DCT',
    };
    const result = parseSimBriefJSON(JSON.stringify(data));
    expect(result.origin).toBe('KLAX');
    expect(result.destination).toBe('KSFO');
    expect(result.performance?.crzAlt).toBeUndefined();
  });
});
