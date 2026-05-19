import { describe, expect, it } from 'vitest';
import { renderPerfTakeoffGrid } from '../fmc/pages/airbus/perfTakeoff.grid';
import { renderPerfApprGrid } from '../fmc/pages/airbus/perfAppr.grid';
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

describe('renderPerfTakeoffGrid', () => {
  it('renders title and page indicator', () => {
    const state = createBaseState({ aircraft: 'AIRBUS_A320' });
    const data = renderPerfTakeoffGrid(state);

    expect(data.segments).toBeDefined();
    expect(data.segments!.some((s) => s.text === 'PERF')).toBe(true);
    expect(data.segments!.some((s) => s.text === 'TO')).toBe(true);
    expect(data.segments!.some((s) => s.inverse && s.semantic === 'title')).toBe(true);
  });

  it('renders placeholder V-speeds when no takeoff data set', () => {
    const state = createBaseState({ aircraft: 'AIRBUS_A320' });
    const data = renderPerfTakeoffGrid(state);
    const text = toGridText(data);

    expect(text).toContain('V1');
    expect(text).toContain('VR');
    expect(text).toContain('V2');
    expect(text).toContain('[  ]');
  });

  it('renders V-speeds with values when set', () => {
    const state = createBaseState({
      aircraft: 'AIRBUS_A320',
      takeoff: {
        runway: '28R',
        toMode: 'TO',
        assumedTemp: 0,
        v1: 120,
        vr: 125,
        v2: 130,
        trim: 5.0,
        oat: 25,
        windDir: 270,
        windSpeed: 10,
        qnh: 1013,
      },
    });
    const data = renderPerfTakeoffGrid(state);
    const text = toGridText(data);
    const lines = text.split('\n');

    expect(lines[1]).toContain('120');
    expect(lines[2]).toContain('125');
    expect(lines[3]).toContain('130');
  });

  it('renders V-speeds in green when set', () => {
    const state = createBaseState({
      aircraft: 'AIRBUS_A320',
      takeoff: {
        runway: '',
        toMode: 'TO',
        assumedTemp: 0,
        v1: 120,
        vr: 125,
        v2: 130,
        trim: 0,
        oat: 0,
        windDir: 0,
        windSpeed: 0,
        qnh: 0,
      },
    });
    const data = renderPerfTakeoffGrid(state);

    const v1Seg = data.segments!.find((s) => s.text.trim() === '120');
    expect(v1Seg).toBeDefined();
    expect(v1Seg!.color).toBe('green');
  });

  it('renders V-speeds in white when unset', () => {
    const state = createBaseState({ aircraft: 'AIRBUS_A320' });
    const data = renderPerfTakeoffGrid(state);

    const v1Seg = data.segments!.find((s) => s.text.includes('[  ]'));
    expect(v1Seg).toBeDefined();
    expect(v1Seg!.color).toBe('white');
  });

  it('renders TRANS ALT and THR RED/ACC static data', () => {
    const state = createBaseState({ aircraft: 'AIRBUS_A320' });
    const data = renderPerfTakeoffGrid(state);
    const text = toGridText(data);

    expect(text).toContain('TRANS ALT');
    expect(text).toContain('5000');
    expect(text).toContain('THR RED/ACC');
    expect(text).toContain('1500/3000');
  });

  it('renders FLAPS/THS with default value', () => {
    const state = createBaseState({ aircraft: 'AIRBUS_A320' });
    const data = renderPerfTakeoffGrid(state);
    const text = toGridText(data);

    expect(text).toContain('FLAPS/THS');
    expect(text).toContain('1/UP0.0');
  });

  it('renders FLAPS/THS with custom flaps value', () => {
    const state = createBaseState({
      aircraft: 'AIRBUS_A320',
      takeoff: {
        runway: '',
        toMode: 'TO',
        assumedTemp: 0,
        v1: 0,
        vr: 0,
        v2: 0,
        trim: 0,
        oat: 0,
        windDir: 0,
        windSpeed: 0,
        qnh: 0,
        flaps: '2',
      },
    });
    const data = renderPerfTakeoffGrid(state);
    const text = toGridText(data);

    expect(text).toContain('2/UP0.0');
  });

  it('renders FLEX TO TEMP placeholder when not set', () => {
    const state = createBaseState({ aircraft: 'AIRBUS_A320' });
    const data = renderPerfTakeoffGrid(state);
    const text = toGridText(data);

    expect(text).toContain('FLEX TO TEMP');
    expect(text).toContain('---');
  });

  it('renders FLEX TO TEMP with value when set', () => {
    const state = createBaseState({
      aircraft: 'AIRBUS_A320',
      takeoff: {
        runway: '',
        toMode: 'TO',
        assumedTemp: 0,
        v1: 0,
        vr: 0,
        v2: 0,
        trim: 0,
        oat: 0,
        windDir: 0,
        windSpeed: 0,
        qnh: 0,
        flexTemp: 55,
      },
    });
    const data = renderPerfTakeoffGrid(state);
    const text = toGridText(data);

    expect(text).toContain('55°');
  });

  it('renders FLEX TO TEMP value in magenta', () => {
    const state = createBaseState({
      aircraft: 'AIRBUS_A320',
      takeoff: {
        runway: '',
        toMode: 'TO',
        assumedTemp: 0,
        v1: 0,
        vr: 0,
        v2: 0,
        trim: 0,
        oat: 0,
        windDir: 0,
        windSpeed: 0,
        qnh: 0,
        flexTemp: 55,
      },
    });
    const data = renderPerfTakeoffGrid(state);

    const flexSeg = data.segments!.find((s) => s.text.includes('55°'));
    expect(flexSeg).toBeDefined();
    expect(flexSeg!.color).toBe('magenta');
    expect(flexSeg!.semantic).toBe('guidance');
  });

  it('renders ENG OUT ACC and NEXT PHASE', () => {
    const state = createBaseState({ aircraft: 'AIRBUS_A320' });
    const data = renderPerfTakeoffGrid(state);
    const text = toGridText(data);

    expect(text).toContain('ENG OUT ACC');
    expect(text).toContain('1500');
    expect(text).toContain('NEXT PHASE>');
  });

  it('preserves all LSK actions', () => {
    const state = createBaseState({ aircraft: 'AIRBUS_A320' });
    const data = renderPerfTakeoffGrid(state);

    expect(data.lskActions).toEqual({
      L1: 'set_v1',
      L2: 'set_vr',
      L3: 'set_v2',
      L4: null,
      L5: 'set_flaps',
      L6: 'set_flex',
      R1: null,
      R2: null,
      R3: null,
      R4: null,
      R5: null,
      R6: 'perf_appr',
    });
  });

  it('uses grid segment format (airbusPage wrapper)', () => {
    const state = createBaseState({ aircraft: 'AIRBUS_A320' });
    const data = renderPerfTakeoffGrid(state);

    expect(data.segments).toBeDefined();
    expect(data.segments!.length).toBeGreaterThan(0);
    expect(data.lines).toEqual([]);
  });

  it('renders complete layout as plain text', () => {
    const state = createBaseState({
      aircraft: 'AIRBUS_A320',
      takeoff: {
        runway: '',
        toMode: 'TO',
        assumedTemp: 0,
        v1: 120,
        vr: 125,
        v2: 130,
        trim: 0,
        oat: 0,
        windDir: 0,
        windSpeed: 0,
        qnh: 0,
        flaps: '2',
        flexTemp: 55,
      },
    });
    const data = renderPerfTakeoffGrid(state);
    const text = toGridText(data);
    const lines = text.split('\n');

    expect(lines[0]).toContain('PERF');
    expect(lines[0]).toContain('TO');
    expect(lines[1]).toContain('V1');
    expect(lines[2]).toContain('VR');
    expect(lines[3]).toContain('V2');
    expect(lines[4]).toContain('TRANS ALT');
    expect(lines[5]).toContain('5000');
    expect(lines[6]).toContain('THR RED/ACC');
    expect(lines[7]).toContain('1500/3000');
    expect(lines[8]).toContain('FLAPS/THS');
    expect(lines[9]).toContain('2/UP0.0');
    expect(lines[10]).toContain('FLEX TO TEMP');
    expect(lines[11]).toContain('55°');
    expect(lines[12]).toContain('ENG OUT ACC');
    expect(lines[13]).toContain('1500');
    expect(lines[13]).toContain('NEXT PHASE>');
  });
});

describe('renderPerfApprGrid', () => {
  it('renders title and page indicator', () => {
    const state = createBaseState({ aircraft: 'AIRBUS_A320' });
    const data = renderPerfApprGrid(state);

    expect(data.segments).toBeDefined();
    expect(data.segments!.some((s) => s.text === 'PERF')).toBe(true);
    expect(data.segments!.some((s) => s.text === 'APPR')).toBe(true);
    expect(data.segments!.some((s) => s.inverse && s.semantic === 'title')).toBe(true);
  });

  it('renders all approach fields', () => {
    const state = createBaseState({ aircraft: 'AIRBUS_A320' });
    const data = renderPerfApprGrid(state);
    const text = toGridText(data);

    expect(text).toContain('QNH');
    expect(text).toContain('1013');
    expect(text).toContain('TEMP');
    expect(text).toContain('15°C');
    expect(text).toContain('WIND');
    expect(text).toContain('---/---');
    expect(text).toContain('MDA');
    expect(text).toContain('----');
    expect(text).toContain('DH');
    expect(text).toContain('LDG CONF');
    expect(text).toContain('FULL');
  });

  it('shows selectable markers for approach fields', () => {
    const state = createBaseState({ aircraft: 'AIRBUS_A320' });
    const data = renderPerfApprGrid(state);
    const text = toGridText(data);

    expect(text).toContain('< QNH');
    expect(text).toContain('< WIND');
    expect(text).toContain('< TEMP');
    expect(text).toContain('< MDA');
    expect(text).toContain('< DH');
    expect(text).toContain('< LDG CONF');
  });

  it('renders LDG CONF in green', () => {
    const state = createBaseState({ aircraft: 'AIRBUS_A320' });
    const data = renderPerfApprGrid(state);

    const confSeg = data.segments!.find((s) => s.text === ' FULL');
    expect(confSeg).toBeDefined();
    expect(confSeg!.color).toBe('green');
    expect(confSeg!.semantic).toBe('activeData');
  });

  it('renders data values in magenta', () => {
    const state = createBaseState({ aircraft: 'AIRBUS_A320' });
    const data = renderPerfApprGrid(state);

    const qnhVal = data.segments!.find((s) => s.text.trim() === '1013');
    expect(qnhVal).toBeDefined();
    expect(qnhVal!.color).toBe('magenta');

    const tempVal = data.segments!.find((s) => s.text.trim() === '15°C');
    expect(tempVal).toBeDefined();
    expect(tempVal!.color).toBe('magenta');
  });

  it('preserves all LSK actions', () => {
    const state = createBaseState({ aircraft: 'AIRBUS_A320' });
    const data = renderPerfApprGrid(state);

    expect(data.lskActions).toEqual({
      L1: 'set_qnh',
      L2: 'set_landing_temp',
      L3: 'set_landing_wind',
      L4: 'set_mda',
      L5: 'set_dh',
      L6: 'toggle_ldg_conf',
      R1: null,
      R2: null,
      R3: null,
      R4: null,
      R5: null,
      R6: 'perf_to',
    });
  });

  it('uses grid segment format (airbusPage wrapper)', () => {
    const state = createBaseState({ aircraft: 'AIRBUS_A320' });
    const data = renderPerfApprGrid(state);

    expect(data.segments).toBeDefined();
    expect(data.segments!.length).toBeGreaterThan(0);
    expect(data.lines).toEqual([]);
  });

  it('renders complete layout as plain text', () => {
    const state = createBaseState({ aircraft: 'AIRBUS_A320' });
    const data = renderPerfApprGrid(state);
    const text = toGridText(data);
    const lines = text.split('\n');

    expect(lines[0]).toContain('PERF');
    expect(lines[0]).toContain('APPR');
    expect(lines[1]).toContain('< QNH');
    expect(lines[2]).toContain('1013');
    expect(lines[3]).toContain('< TEMP');
    expect(lines[4]).toContain('15°C');
    expect(lines[5]).toContain('< WIND');
    expect(lines[6]).toContain('---/---');
    expect(lines[7]).toContain('< MDA');
    expect(lines[8]).toContain('----');
    expect(lines[9]).toContain('< DH');
    expect(lines[10]).toContain('----');
    expect(lines[11]).toContain('< LDG CONF');
    expect(lines[12]).toContain('FULL');
  });
});
