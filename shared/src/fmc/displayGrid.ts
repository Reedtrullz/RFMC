import { devWarn } from '../logger';
import type { DisplayColor } from './displayColors';
import type { DisplaySemantic } from './displaySemantics';
import type { DisplayData, DisplayLine } from '../types/fmc';
import { PAGE_LINES, PAGE_WIDTH } from './constants';
import type { DisplaySegment, GridDisplayData, DisplayTextSize, CellData } from '../types/display';

export type { DisplaySegment, GridDisplayData, DisplayTextSize, CellData };

export function buildCells(grid: GridDisplayData): CellData[] {
  const cells: CellData[] = [];

  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.columns; c++) {
      cells.push({ row: r, col: c, char: ' ' });
    }
  }

  for (const segment of grid.segments) {
    if (process.env.NODE_ENV !== 'production') {
      if (
        segment.row < 0 ||
        segment.row >= grid.rows ||
        segment.col < 0 ||
        segment.col + segment.text.length > grid.columns
      ) {
        devWarn(
          `Display segment out of bounds: row ${segment.row}, col ${segment.col}, length ${segment.text.length} (Grid: ${grid.rows}x${grid.columns})`,
          segment,
        );
      }
    }
    for (let i = 0; i < segment.text.length; i++) {
      const col = segment.col + i;
      if (col >= 0 && col < grid.columns && segment.row >= 0 && segment.row < grid.rows) {
        const index = segment.row * grid.columns + col;
        if (cells[index]) {
          cells[index] = {
            row: segment.row,
            col,
            char: segment.text[i],
            color: segment.color,
            inverse: segment.inverse,
            blink: segment.blink,
            size: segment.size,
            semantic: segment.semantic,
          };
        }
      }
    }
  }

  return cells;
}

export function seg(
  row: number,
  col: number,
  text: string,
  color: DisplayColor = 'white',
  options: Partial<DisplaySegment> = {},
): DisplaySegment {
  return {
    row,
    col,
    text,
    color,
    ...options,
  };
}

export function title(row: number, titleText: string, page: string): DisplaySegment[] {
  return [
    seg(row, 0, ' '.repeat(PAGE_WIDTH), 'cyan', { inverse: true, semantic: 'title' }),
    seg(row, 2, titleText, 'black', { inverse: true, semantic: 'title' }),
    seg(row, PAGE_WIDTH - page.length - 1, page, 'black', { inverse: true, semantic: 'title' }),
  ];
}

export function displayLineToSegments(line: DisplayLine, row: number): DisplaySegment[] {
  let text = line.leftLabel ? `${line.leftLabel}${line.text}` : line.text;
  text = text.padEnd(PAGE_WIDTH, ' ').slice(0, PAGE_WIDTH);

  if (line.rightLabel) {
    const right = line.rightLabel.slice(0, PAGE_WIDTH);
    text = `${text.slice(0, PAGE_WIDTH - right.length)}${right}`;
  }
  text = text.padEnd(PAGE_WIDTH, ' ').slice(0, PAGE_WIDTH);

  const segment: DisplaySegment = {
    row,
    col: 0,
    text,
    size: line.small ? 'small' : 'normal',
    color: line.color,
    inverse: line.inverse,
    blink: line.blinking,
    semantic: line.semantic,
  };

  return [segment];
}

export function displayDataToGrid(displayData: DisplayData): GridDisplayData {
  if (displayData.segments) {
    return {
      rows: PAGE_LINES,
      columns: PAGE_WIDTH,
      segments: displayData.segments,
      scratchpad: [],
    };
  }

  const segments = Array.from({ length: PAGE_LINES }).flatMap((_, row) => {
    const line = displayData.lines[row] ?? { text: '' };
    return displayLineToSegments(line, row);
  });

  return {
    rows: PAGE_LINES,
    columns: PAGE_WIDTH,
    segments,
    scratchpad: [],
  };
}

export function scratchpadToGridSegment(
  text: string,
  options: {
    color?: DisplayColor;
    inverse?: boolean;
    blink?: boolean;
    semantic?: DisplaySemantic;
  } = {},
): DisplaySegment {
  return {
    row: 0,
    col: 0,
    text: text.padEnd(PAGE_WIDTH, ' ').slice(0, PAGE_WIDTH),
    size: 'normal',
    ...options,
  };
}

export function gridToPlainText(grid: GridDisplayData): string {
  const charGrid: string[][] = Array.from({ length: grid.rows }, () => Array.from({ length: grid.columns }, () => ' '));

  for (const segment of grid.segments) {
    for (let i = 0; i < segment.text.length; i++) {
      const col = segment.col + i;
      if (segment.row >= 0 && segment.row < grid.rows && col >= 0 && col < grid.columns) {
        charGrid[segment.row][col] = segment.text[i];
      }
    }
  }

  return charGrid.map((row) => row.join('')).join('\n');
}
