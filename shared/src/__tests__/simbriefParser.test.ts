import { describe, it, expect } from 'vitest';
import { parseSimBrief } from '../fmc/simbriefParser';

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
    const result = parseSimBrief(JSON.stringify(data));
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
    const result = parseSimBrief(JSON.stringify(data));
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
    const result = parseSimBrief(xml);
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

  it('extracts waypoint coordinates from SimBrief XML navlog', () => {
    const xml = `
      <ofp>
        <origin>KJFK</origin>
        <destination>KDCA</destination>
        <navlog>
          <fix>
            <ident>RBV</ident>
            <pos_lat>40.202333</pos_lat>
            <pos_long>-74.494722</pos_long>
          </fix>
          <fix>
            <ident>DIXIE</ident>
            <pos_lat>40.063889</pos_lat>
            <pos_long>-74.155556</pos_long>
          </fix>
        </navlog>
      </ofp>
    `;
    const result = parseSimBrief(xml);
    expect(result.waypoints).toBeDefined();
    expect(result.waypoints).toHaveLength(2);
    expect(result.waypoints![0].ident).toBe('RBV');
    expect(result.waypoints![0].lat).toBe(40.202333);
    expect(result.waypoints![0].lon).toBe(-74.494722);
    expect(result.waypoints![0].coordinateSource).toBe('simbrief');
  });

  it('extracts waypoint coordinates from SimBrief JSON navlog', () => {
    const json = JSON.stringify({
      origin: 'KJFK',
      destination: 'KDCA',
      navlog: {
        fix: [{ ident: 'RBV', pos_lat: '40.202333', pos_long: '-74.494722' }],
      },
    });
    const result = parseSimBrief(json);
    expect(result.waypoints).toBeDefined();
    expect(result.waypoints).toHaveLength(1);
    expect(result.waypoints![0].ident).toBe('RBV');
    expect(result.waypoints![0].lat).toBe(40.202333);
    expect(result.waypoints![0].coordinateSource).toBe('simbrief');
  });
});
