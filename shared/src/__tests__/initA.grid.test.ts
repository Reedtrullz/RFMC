import { describe, expect, it } from 'vitest';
import { renderInitAGrid } from '../fmc/pages/airbus/initA.grid';
import { createBaseState } from './testUtils';
import { gridToPlainText } from '../fmc/displayGrid';
import type { DisplayData } from '../types/fmc';

function toGridText(data: DisplayData): string {
  if (!data.segments) return '';
  return gridToPlainText({
    rows: 14,
    columns: 24,
    segments: data.segments,
    scratchpad: [],
  });
}

describe('renderInitAGrid', () => {
  it('renders title and page indicator', () => {
    const state = createBaseState({ aircraft: 'AIRBUS_A320' });
    const data = renderInitAGrid(state);

    expect(data.segments).toBeDefined();
    expect(data.segments!.some((s) => s.text === 'INIT')).toBe(true);
    expect(data.segments!.some((s) => s.text === 'A')).toBe(true);
    expect(data.segments!.some((s) => s.inverse && s.semantic === 'title')).toBe(true);
  });

  it('uses grid segment format (airbusPage wrapper)', () => {
    const state = createBaseState({ aircraft: 'AIRBUS_A320' });
    const data = renderInitAGrid(state);

    expect(data.segments).toBeDefined();
    expect(data.segments!.length).toBeGreaterThan(0);
    expect(data.lines).toEqual([]);
  });

  it('renders 14 rows by 24 columns', () => {
    const state = createBaseState({ aircraft: 'AIRBUS_A320' });
    const data = renderInitAGrid(state);
    const text = toGridText(data);

    const lines = text.split('\n');
    expect(lines).toHaveLength(14);
    for (const line of lines) {
      expect(line).toHaveLength(24);
    }
  });

  it('renders placeholder FROM/TO when no route data', () => {
    const state = createBaseState({ aircraft: 'AIRBUS_A320' });
    const data = renderInitAGrid(state);
    const text = toGridText(data);

    expect(text).toContain('[  ]/[  ]');
    expect(text).toContain('FROM/TO');
  });

  it('renders FROM/TO when route data set', () => {
    const state = createBaseState({
      aircraft: 'AIRBUS_A320',
      route: { origin: 'EGLL', destination: 'KJFK', flightNumber: '', companyRoute: '', routeString: '' },
    });
    const data = renderInitAGrid(state);
    const text = toGridText(data);

    expect(text).toContain('EGLL/KJFK');
  });

  it('renders flight number', () => {
    const state = createBaseState({
      aircraft: 'AIRBUS_A320',
      route: { origin: '', destination: '', flightNumber: 'BA1234', companyRoute: '', routeString: '' },
    });
    const data = renderInitAGrid(state);
    const text = toGridText(data);

    expect(text).toContain('BA1234');
  });

  it('renders alternate airport', () => {
    const state = createBaseState({
      aircraft: 'AIRBUS_A320',
      route: { origin: '', destination: '', flightNumber: '', companyRoute: '', routeString: '', alternate: 'LFPG' },
    });
    const data = renderInitAGrid(state);
    const text = toGridText(data);

    expect(text).toContain('LFPG');
  });

  it('renders cost index', () => {
    const state = createBaseState({
      aircraft: 'AIRBUS_A320',
      performance: {
        crzAlt: 0,
        costIndex: 35,
        zfw: 0,
        fuel: 0,
        cg: 0,
        reserve: 0,
        grossWeight: 0,
      },
    });
    const data = renderInitAGrid(state);
    const text = toGridText(data);

    expect(text).toContain('35');
    expect(text).toContain('COST INDEX');
  });

  it('renders cruise FL/TEMP', () => {
    const state = createBaseState({
      aircraft: 'AIRBUS_A320',
      performance: {
        crzAlt: 35000,
        costIndex: 0,
        zfw: 0,
        fuel: 0,
        cg: 0,
        reserve: 0,
        grossWeight: 0,
      },
    });
    const data = renderInitAGrid(state);
    const text = toGridText(data);

    expect(text).toContain('FL350');
    expect(text).toContain('CRZ FL/TEMP');
  });

  it('renders placeholder CRZ FL when no altitude', () => {
    const state = createBaseState({
      aircraft: 'AIRBUS_A320',
      performance: {
        crzAlt: 0,
        costIndex: 0,
        zfw: 0,
        fuel: 0,
        cg: 0,
        reserve: 0,
        grossWeight: 0,
      },
    });
    const data = renderInitAGrid(state);
    const text = toGridText(data);

    expect(text).toContain('-----/--°');
  });

  it('renders IRS align state', () => {
    const state = createBaseState({
      aircraft: 'AIRBUS_A320',
      position: {
        refAirport: '',
        gate: '',
        lat: 0,
        lon: 0,
        irsState: 'ALIGNING',
        irsTimeRemaining: 360,
        irsAlignmentProgress: 50,
      },
    });
    const data = renderInitAGrid(state);
    const text = toGridText(data);

    expect(text).toContain('IN ALIGN');
    expect(text).toContain('MIN');
  });

  it('renders IRS NAV with RELAY', () => {
    const state = createBaseState({
      aircraft: 'AIRBUS_A320',
      position: {
        refAirport: '',
        gate: '',
        lat: 0,
        lon: 0,
        irsState: 'NAV',
        irsTimeRemaining: 0,
        irsAlignmentProgress: 100,
      },
    });
    const data = renderInitAGrid(state);
    const text = toGridText(data);

    expect(text).toContain('IRS RELAY >');
  });

  it('renders IRS INIT prompting when off', () => {
    const state = createBaseState({
      aircraft: 'AIRBUS_A320',
      position: {
        refAirport: '',
        gate: '',
        lat: 0,
        lon: 0,
        irsState: 'OFF',
        irsTimeRemaining: 0,
        irsAlignmentProgress: 0,
      },
    });
    const data = renderInitAGrid(state);
    const text = toGridText(data);

    expect(text).toContain('<IRS INIT');
  });

  it('renders INIT B navigation', () => {
    const state = createBaseState({ aircraft: 'AIRBUS_A320' });
    const data = renderInitAGrid(state);
    const text = toGridText(data);

    expect(text).toContain('INIT B >');
  });

  it('renders TROPO section', () => {
    const state = createBaseState({ aircraft: 'AIRBUS_A320' });
    const data = renderInitAGrid(state);
    const text = toGridText(data);

    expect(text).toContain('TROPO');
    expect(text).toContain('36090');
  });

  it('renders latitude position', () => {
    const state = createBaseState({
      aircraft: 'AIRBUS_A320',
      position: {
        refAirport: '',
        gate: '',
        lat: 51.5,
        lon: 0,
        irsState: 'NAV',
        irsTimeRemaining: 0,
        irsAlignmentProgress: 100,
      },
    });
    const data = renderInitAGrid(state);
    const text = toGridText(data);

    expect(text).toContain('51.5N');
  });

  it('renders longitude position', () => {
    const state = createBaseState({
      aircraft: 'AIRBUS_A320',
      position: {
        refAirport: '',
        gate: '',
        lat: 0,
        lon: -74.0,
        irsState: 'NAV',
        irsTimeRemaining: 0,
        irsAlignmentProgress: 100,
      },
    });
    const data = renderInitAGrid(state);
    const text = toGridText(data);

    expect(text).toContain('74.0W');
  });

  it('renders "TMPY INIT" when route is modified', () => {
    const state = createBaseState({
      aircraft: 'AIRBUS_A320',
      isModified: true,
      pendingRoute: { origin: 'EGLL', destination: 'KJFK', flightNumber: 'BA1234', companyRoute: '', routeString: '' },
    });
    const data = renderInitAGrid(state);
    const text = toGridText(data);

    expect(text).toContain('TMPY INIT');
  });

  it('preserves all LSK actions', () => {
    const state = createBaseState({
      aircraft: 'AIRBUS_A320',
      position: {
        refAirport: '',
        gate: '',
        lat: 0,
        lon: 0,
        irsState: 'OFF',
        irsTimeRemaining: 0,
        irsAlignmentProgress: 0,
      },
    });
    const data = renderInitAGrid(state);

    expect(data.lskActions).toEqual({
      L1: 'data_index',
      L2: 'set_flt_nbr',
      L3: 'set_cost_index',
      L4: 'set_crz_fl',
      L5: null,
      L6: 'align_irs',
      R1: 'set_from_to',
      R2: 'set_altn',
      R3: null,
      R4: null,
      R5: null,
      R6: 'init_b',
    });
  });

  it('uses irs_relay action when IRS is in NAV state', () => {
    const state = createBaseState({
      aircraft: 'AIRBUS_A320',
      position: {
        refAirport: '',
        gate: '',
        lat: 0,
        lon: 0,
        irsState: 'NAV',
        irsTimeRemaining: 0,
        irsAlignmentProgress: 100,
      },
    });
    const data = renderInitAGrid(state);

    expect(data.lskActions.L6).toBe('irs_relay');
  });

  it('renders labels in white and data values in magenta', () => {
    const state = createBaseState({ aircraft: 'AIRBUS_A320' });
    const data = renderInitAGrid(state);

    // Label row elements should be white with 'label' semantic
    const fromToLabel = data.segments!.find((s) => s.text === 'FROM/TO');
    expect(fromToLabel).toBeDefined();
    expect(fromToLabel!.color).toBe('white');
    expect(fromToLabel!.semantic).toBe('label');

    const costIndexLabel = data.segments!.find((s) => s.text === 'COST INDEX');
    expect(costIndexLabel).toBeDefined();
    expect(costIndexLabel!.color).toBe('white');
    expect(costIndexLabel!.semantic).toBe('label');

    // Missing data values should be magenta with 'activeData' semantic
    const magentaData = data.segments!.filter((s) => s.color === 'magenta');
    expect(magentaData.length).toBeGreaterThan(0);
    for (const seg of magentaData) {
      expect(seg.semantic).toBe('activeData');
    }
  });

  it('renders complete layout as plain text matching legacy output', () => {
    const state = createBaseState({
      aircraft: 'AIRBUS_A320',
      route: {
        origin: 'EGLL',
        destination: 'KJFK',
        flightNumber: 'BA1234',
        companyRoute: '',
        routeString: '',
        alternate: 'LFPG',
      },
      performance: {
        crzAlt: 35000,
        costIndex: 35,
        zfw: 0,
        fuel: 0,
        cg: 0,
        reserve: 0,
        grossWeight: 0,
      },
      position: {
        refAirport: '',
        gate: '',
        lat: 51.5,
        lon: -74.0,
        irsState: 'NAV',
        irsTimeRemaining: 0,
        irsAlignmentProgress: 100,
      },
    });
    const data = renderInitAGrid(state);
    const text = toGridText(data);

    const lines = text.split('\n');
    expect(lines).toHaveLength(14);

    // Row 0: Title
    expect(lines[0]).toContain('INIT');
    expect(lines[0]).toContain('A');

    // Row 1: FROM/TO label
    expect(lines[1]).toContain('CO RTE');
    expect(lines[1]).toContain('FROM/TO');

    // Row 2: FROM/TO value
    expect(lines[2]).toContain('EGLL/KJFK');

    // Row 3: ALTN/CO RTE label
    expect(lines[3]).toContain('FLT NBR');
    expect(lines[3]).toContain('ALTN/CO RTE');

    // Row 4: Flight number and alternate
    expect(lines[4]).toContain('BA1234');
    expect(lines[4]).toContain('LFPG');

    // Row 5: COST INDEX label
    expect(lines[5]).toContain('LAT');
    expect(lines[5]).toContain('COST INDEX');

    // Row 6: Cost index and lat
    expect(lines[6]).toContain('35');
    expect(lines[6]).toContain('51.5N');

    // Row 7: CRZ FL/TEMP label
    expect(lines[7]).toContain('LONG');
    expect(lines[7]).toContain('CRZ FL/TEMP');

    // Row 8: CRZ FL and lon
    expect(lines[8]).toContain('FL350');
    expect(lines[8]).toContain('74.0W');

    // Row 9: blank

    // Row 10: TROPO label
    expect(lines[10]).toContain('TROPO');

    // Row 11: TROPO value
    expect(lines[11]).toContain('36090');

    // Row 12: blank (just spaces)

    // Row 13: IRS status and INIT B
    expect(lines[13]).toContain('IRS RELAY >');
    expect(lines[13]).toContain('INIT B >');
  });
});
