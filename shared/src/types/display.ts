import type { DisplayColor } from '../fmc/displayColors';
import type { DisplaySemantic, DisplaySegment } from './fmc';
export type { DisplaySemantic, DisplaySegment };

export type DisplayTextSize = 'small' | 'normal';

export interface CellData {
  row: number;
  col: number;
  char: string;
  color?: DisplayColor;
  inverse?: boolean;
  blink?: boolean;
  size?: DisplayTextSize;
  semantic?: DisplaySemantic;
}

export interface GridDisplayData {
  rows: number;
  columns: number;
  segments: DisplaySegment[];
  scratchpad: DisplaySegment[];
}
