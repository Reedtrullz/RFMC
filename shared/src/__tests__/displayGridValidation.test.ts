import { describe, it, expect } from 'vitest';
import { validateDisplayGrid, assertValidDisplayGrid } from '../fmc/displayGridValidation';
import type { GridDisplayData, DisplaySegment } from '../types/display';
import { PAGE_LINES, PAGE_WIDTH } from '../fmc/constants';

function grid(segments: DisplaySegment[]): GridDisplayData {
  return { rows: PAGE_LINES, columns: PAGE_WIDTH, segments, scratchpad: [] };
}

function seg(row: number, col: number, text: string): DisplaySegment {
  return { row, col, text, color: 'white' };
}

describe('validateDisplayGrid', () => {
  it('valid 14x24 empty grid passes', () => {
    const result = validateDisplayGrid(grid([]));
    expect(result.valid).toBe(true);
  });

  it('valid 14x24 grid with one segment passes', () => {
    const result = validateDisplayGrid(grid([seg(0, 0, 'IDENT')]));
    expect(result.valid).toBe(true);
  });

  it('invalid row count fails', () => {
    const badGrid: GridDisplayData = { rows: 10, columns: 24, segments: [], scratchpad: [] };
    const result = validateDisplayGrid(badGrid);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'INVALID_ROW_COUNT')).toBe(true);
  });

  it('invalid column count fails', () => {
    const badGrid: GridDisplayData = { rows: 14, columns: 20, segments: [], scratchpad: [] };
    const result = validateDisplayGrid(badGrid);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'INVALID_COLUMN_COUNT')).toBe(true);
  });

  it('row -1 fails', () => {
    const result = validateDisplayGrid(grid([seg(-1, 0, 'X')]));
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'SEGMENT_ROW_OUT_OF_BOUNDS')).toBe(true);
  });

  it('row 14 fails', () => {
    const result = validateDisplayGrid(grid([seg(14, 0, 'X')]));
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'SEGMENT_ROW_OUT_OF_BOUNDS')).toBe(true);
  });

  it('col -1 fails', () => {
    const result = validateDisplayGrid(grid([seg(0, -1, 'X')]));
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'SEGMENT_COL_OUT_OF_BOUNDS')).toBe(true);
  });

  it('col 24 fails', () => {
    const result = validateDisplayGrid(grid([seg(0, 24, 'X')]));
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'SEGMENT_COL_OUT_OF_BOUNDS')).toBe(true);
  });

  it('segment overflow fails', () => {
    const result = validateDisplayGrid(grid([seg(0, 20, 'HELLO')]));
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'SEGMENT_TEXT_OVERFLOW')).toBe(true);
  });

  it('overlapping non-space chars fail', () => {
    const result = validateDisplayGrid(grid([seg(0, 0, 'ABC'), seg(0, 1, 'XYZ')]));
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'SEGMENT_CELL_OVERLAP')).toBe(true);
  });

  it('non-overlapping segments pass', () => {
    const result = validateDisplayGrid(grid([seg(0, 0, 'AAA'), seg(0, 3, 'BBB')]));
    expect(result.valid).toBe(true);
  });

  it('exact edge fit at col 23 with one char passes', () => {
    const result = validateDisplayGrid(grid([seg(0, 23, 'X')]));
    expect(result.valid).toBe(true);
  });

  it('exact edge fit at col 0 with 24 chars passes', () => {
    const result = validateDisplayGrid(grid([seg(0, 0, 'X'.repeat(24))]));
    expect(result.valid).toBe(true);
  });

  it('col 0 with 25 chars fails', () => {
    const result = validateDisplayGrid(grid([seg(0, 0, 'X'.repeat(25))]));
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'SEGMENT_TEXT_OVERFLOW')).toBe(true);
  });

  it('invalid segment text fails', () => {
    const badSeg: any = { row: 0, col: 0, text: null, color: 'white' };
    const result = validateDisplayGrid(grid([badSeg]));
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'INVALID_SEGMENT_TEXT')).toBe(true);
  });

  it('empty text segment passes', () => {
    const result = validateDisplayGrid(grid([seg(0, 0, '')]));
    expect(result.valid).toBe(true);
  });
});

describe('assertValidDisplayGrid', () => {
  it('throws on invalid grid', () => {
    const badGrid: GridDisplayData = { rows: 10, columns: 20, segments: [], scratchpad: [] };
    expect(() => assertValidDisplayGrid(badGrid)).toThrow('Display grid validation failed');
  });

  it('does not throw on valid grid', () => {
    expect(() => assertValidDisplayGrid(grid([seg(0, 0, 'OK')]))).not.toThrow();
  });
});
