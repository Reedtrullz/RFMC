import type { DisplayColor } from './displayColors';
import type { DisplaySemantic } from './displaySemantics';
import type { DisplayData, DisplayLine } from '../types/fmc';
import { PAGE_LINES, PAGE_WIDTH } from './constants';

export type DisplayTextSize = 'small' | 'normal';

export interface DisplaySegment {
  row: number;
  col: number;
  text: string;
  size?: DisplayTextSize;
  color?: DisplayColor;
  inverse?: boolean;
  blink?: boolean;
  semantic?: DisplaySemantic;
}

export interface GridDisplayData {
  rows: 14;
  columns: 24;
  segments: DisplaySegment[];
  scratchpad: DisplaySegment[];
}

export function clampDisplayText(text: string, width = PAGE_WIDTH): string {
  return text.padEnd(width, ' ').slice(0, width);
}

export function composeLegacyDisplayLine(line: DisplayLine): string {
  let text = clampDisplayText(line.leftLabel ? `${line.leftLabel}${line.text}` : line.text);

  if (line.rightLabel) {
    const right = line.rightLabel.slice(0, PAGE_WIDTH);
    text = `${text.slice(0, PAGE_WIDTH - right.length)}${right}`;
  }

  return clampDisplayText(text);
}

export function displayLineToSegments(line: DisplayLine, row: number): DisplaySegment[] {
  const text = composeLegacyDisplayLine(line);
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
    text: clampDisplayText(text),
    size: 'normal',
    ...options,
  };
}
