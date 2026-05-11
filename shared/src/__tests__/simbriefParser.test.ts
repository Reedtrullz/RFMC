import { describe, it, expect } from 'vitest';
import { parseSimBriefJSON, parseSimBriefXML, parseSimBrief } from '../fmc/simbriefParser';

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

  it('parses SimBrief XML', () => {
    const xml = `
      <ofp>
        <origin>KJFK</origin>
        <destination>KDCA</destination>
        <flight_number>AA123</flight_number>
        <route>RBV3 DCT DIXIE</route>
        <initial_altitude>35000</initial_altitude>
        <cost_index>50</cost_index>
        <zfw>60.5</zfw>
        <block_fuel>10.2</block_fuel>
      </ofp>
    `;
    const result = parseSimBriefXML(xml);
    expect(result.origin).toBe('KJFK');
    expect(result.destination).toBe('KDCA');
    expect(result.performance?.zfw).toBe(60500);
    expect(result.performance?.fuel).toBe(10200);
  });

  it('detects format and parses via unified parseSimBrief', () => {
    const xml = '<ofp><origin>KJFK</origin></ofp>';
    const json = '{"origin": "KJFK"}';
    expect(parseSimBrief(xml).origin).toBe('KJFK');
    expect(parseSimBrief(json).origin).toBe('KJFK');
  });
});
