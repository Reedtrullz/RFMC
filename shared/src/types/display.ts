import type { DisplayColor } from '../fmc/displayColors';
import type { DisplaySemantic } from '../fmc/displaySemantics';

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
