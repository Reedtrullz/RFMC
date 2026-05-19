import { PAGE_LINES, PAGE_WIDTH } from './constants';
import type { GridDisplayData } from '../types/display';

export type DisplayGridIssueCode =
  | 'INVALID_ROW_COUNT'
  | 'INVALID_COLUMN_COUNT'
  | 'SEGMENT_ROW_OUT_OF_BOUNDS'
  | 'SEGMENT_COL_OUT_OF_BOUNDS'
  | 'SEGMENT_TEXT_OVERFLOW'
  | 'SEGMENT_CELL_OVERLAP'
  | 'INVALID_SEGMENT_TEXT';

export interface DisplayGridValidationIssue {
  code: DisplayGridIssueCode;
  message: string;
  row?: number;
  col?: number;
  segmentIndex?: number;
}

export interface DisplayGridValidationResult {
  valid: boolean;
  issues: DisplayGridValidationIssue[];
}

export function validateDisplayGrid(grid: GridDisplayData): DisplayGridValidationResult {
  const issues: DisplayGridValidationIssue[] = [];

  if (grid.rows !== PAGE_LINES) {
    issues.push({
      code: 'INVALID_ROW_COUNT',
      message: `Expected ${PAGE_LINES} rows, got ${grid.rows}`,
    });
  }

  if (grid.columns !== PAGE_WIDTH) {
    issues.push({
      code: 'INVALID_COLUMN_COUNT',
      message: `Expected ${PAGE_WIDTH} columns, got ${grid.columns}`,
    });
  }

  const occupied: Map<string, number> = new Map();

  for (let i = 0; i < grid.segments.length; i++) {
    const seg = grid.segments[i];

    if (typeof seg.text !== 'string') {
      issues.push({
        code: 'INVALID_SEGMENT_TEXT',
        message: `Segment ${i}: text is not a string (got ${typeof seg.text})`,
        segmentIndex: i,
      });
      continue;
    }

    if (seg.text.length === 0) continue;

    if (seg.row < 0 || seg.row >= PAGE_LINES) {
      issues.push({
        code: 'SEGMENT_ROW_OUT_OF_BOUNDS',
        message: `Segment ${i}: row ${seg.row} out of bounds [0, ${PAGE_LINES - 1}]`,
        row: seg.row,
        segmentIndex: i,
      });
    }

    if (seg.col < 0 || seg.col >= PAGE_WIDTH) {
      issues.push({
        code: 'SEGMENT_COL_OUT_OF_BOUNDS',
        message: `Segment ${i}: col ${seg.col} out of bounds [0, ${PAGE_WIDTH - 1}]`,
        col: seg.col,
        segmentIndex: i,
      });
    }

    if (seg.col + seg.text.length > PAGE_WIDTH) {
      issues.push({
        code: 'SEGMENT_TEXT_OVERFLOW',
        message: `Segment ${i}: text overflows at col ${seg.col} + length ${seg.text.length} (max ${PAGE_WIDTH})`,
        row: seg.row,
        col: seg.col,
        segmentIndex: i,
      });
    }

    for (let ci = 0; ci < seg.text.length; ci++) {
      const c = seg.col + ci;
      if (c < 0 || c >= PAGE_WIDTH) continue;
      if (seg.row < 0 || seg.row >= PAGE_LINES) continue;
      if (seg.text[ci] === ' ') continue;

      const key = `${seg.row}:${c}`;
      const existing = occupied.get(key);
      if (existing !== undefined) {
        issues.push({
          code: 'SEGMENT_CELL_OVERLAP',
          message: `Cell (${seg.row},${c}) occupied by segment ${existing} and segment ${i} with non-space character '${seg.text[ci]}'`,
          row: seg.row,
          col: c,
          segmentIndex: i,
        });
      } else {
        occupied.set(key, i);
      }
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

export function assertValidDisplayGrid(grid: GridDisplayData): void {
  const result = validateDisplayGrid(grid);
  if (!result.valid) {
    const details = result.issues.map((i) => `  ${i.code}: ${i.message}`).join('\n');
    throw new Error(`Display grid validation failed:\n${details}`);
  }
}
