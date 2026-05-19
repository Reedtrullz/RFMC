import { describe, expect, it } from 'vitest';
import { renderInitBGrid } from '../fmc/pages/airbus/initB.grid';
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

describe('renderInitBGrid', () => {
  it('renders title and page indicator', () => {
    const state = createBaseState({ aircraft: 'AIRBUS_A320' });
    const data = renderInitBGrid(state);

    expect(data.segments).toBeDefined();
    expect(data.segments!.some((s) => s.text === 'INIT')).toBe(true);
    expect(data.segments!.some((s) => s.text === 'B')).toBe(true);
    expect(data.segments!.some((s) => s.inverse && s.semantic === 'title')).toBe(true);
  });

  it('renders placeholder values when no performance data', () => {
    const state = createBaseState({ aircraft: 'AIRBUS_A320' });
    const data = renderInitBGrid(state);
    const text = toGridText(data);

    expect(text).toContain('< ZFW');
    expect(text).toContain('< BLOCK');
    expect(text).toContain('< CG');
    expect(text).toContain('---.-');
    expect(text).toContain('--.-');
  });

  it('renders formatted ZFW value in tonnes', () => {
    const state = createBaseState({
      aircraft: 'AIRBUS_A320',
      performance: {
        crzAlt: 0,
        costIndex: 0,
        zfw: 55000,
        fuel: 0,
        cg: 0,
        reserve: 0,
        grossWeight: 0,
      },
    });
    const data = renderInitBGrid(state);
    const text = toGridText(data);

    expect(text).toContain('55.0');
  });

  it('renders formatted BLOCK fuel value in tonnes', () => {
    const state = createBaseState({
      aircraft: 'AIRBUS_A320',
      performance: {
        crzAlt: 0,
        costIndex: 0,
        zfw: 0,
        fuel: 12500,
        cg: 0,
        reserve: 0,
        grossWeight: 0,
      },
    });
    const data = renderInitBGrid(state);
    const text = toGridText(data);

    expect(text).toContain('12.5');
  });

  it('renders formatted CG value as percentage', () => {
    const state = createBaseState({
      aircraft: 'AIRBUS_A320',
      performance: {
        crzAlt: 0,
        costIndex: 0,
        zfw: 0,
        fuel: 0,
        cg: 25.8,
        reserve: 0,
        grossWeight: 0,
      },
    });
    const data = renderInitBGrid(state);
    const text = toGridText(data);

    expect(text).toContain('25.8');
  });

  it('preserves all LSK actions', () => {
    const state = createBaseState({ aircraft: 'AIRBUS_A320' });
    const data = renderInitBGrid(state);

    expect(data.lskActions).toEqual({
      L1: 'set_zfw',
      L2: 'set_block',
      L3: 'set_cg',
      L4: null,
      L5: null,
      L6: null,
      R1: 'init_a',
      R2: null,
      R3: null,
      R4: null,
      R5: null,
      R6: null,
    });
  });

  it('uses grid segment format (airbusPage wrapper)', () => {
    const state = createBaseState({ aircraft: 'AIRBUS_A320' });
    const data = renderInitBGrid(state);

    expect(data.segments).toBeDefined();
    expect(data.segments!.length).toBeGreaterThan(0);
    expect(data.lines).toEqual([]);
  });

  it('renders labels in white and data values in magenta', () => {
    const state = createBaseState({ aircraft: 'AIRBUS_A320' });
    const data = renderInitBGrid(state);

    const zfwLabel = data.segments!.find((s) => s.text === '< ZFW');
    expect(zfwLabel).toBeDefined();
    expect(zfwLabel!.color).toBe('white');
    expect(zfwLabel!.semantic).toBe('label');

    const zfwValue = data.segments!.find((s) => s.text.trimStart().startsWith('---.-'));
    expect(zfwValue).toBeDefined();
    expect(zfwValue!.color).toBe('magenta');
    expect(zfwValue!.semantic).toBe('activeData');
  });

  it('renders complete layout as plain text matching legacy output', () => {
    const state = createBaseState({
      aircraft: 'AIRBUS_A320',
      performance: {
        crzAlt: 0,
        costIndex: 0,
        zfw: 55000,
        fuel: 12500,
        cg: 25.8,
        reserve: 0,
        grossWeight: 0,
      },
    });
    const data = renderInitBGrid(state);
    const text = toGridText(data);

    const lines = text.split('\n');
    expect(lines[0]).toContain('INIT');
    expect(lines[0]).toContain('B');
    expect(lines[1].trim()).toBe('< ZFW');
    expect(lines[2].trim()).toBe('55.0');
    expect(lines[3].trim()).toBe('< BLOCK');
    expect(lines[4].trim()).toBe('12.5');
    expect(lines[5].trim()).toBe('< CG');
    expect(lines[6].trim()).toBe('25.8');
  });
});
