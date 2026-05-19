import type { DisplayColor } from '../../displayColors';
import type { DisplaySegment, GridDisplayData } from '../../../types/display';
import type { FMCState, DisplayData, DisplayLine } from '../../../types/fmc';
import { inferBoeingSemantic } from '../../pageLineSemantics';

export function seg(
  row: number,
  col: number,
  text: string,
  color: DisplayColor = 'green',
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

export function boeingTitle(title: string, page = '1/1'): DisplaySegment[] {
  return [
    seg(0, 0, ' '.repeat(24), 'cyan', {
      inverse: true,
      semantic: 'titleBackground',
    }),
    seg(0, 2, title, 'black', {
      inverse: true,
      semantic: 'title',
    }),
    seg(0, 20, page, 'black', {
      inverse: true,
      semantic: 'pageIndicator',
    }),
  ];
}

export function boeingGrid(segments: DisplaySegment[]): GridDisplayData {
  return {
    rows: 14,
    columns: 24,
    segments,
    scratchpad: [],
  };
}

export function compileGridLines(segments: DisplaySegment[]): DisplayLine[] {
  const lines: DisplayLine[] = Array.from({ length: 14 }, () => ({
    text: ' '.repeat(24),
    leftLabel: '',
    rightLabel: '',
    inverse: false,
  }));

  for (const segVal of segments) {
    if (segVal.row < 0 || segVal.row >= 14) continue;
    const line = lines[segVal.row];
    const text = segVal.text;
    const col = segVal.col;

    const chars = line.text.split('');
    for (let i = 0; i < text.length; i++) {
      const pos = col + i;
      if (pos >= 0 && pos < 24) {
        chars[pos] = text[i];
      }
    }
    line.text = chars.join('');

    if (segVal.color && !line.color) line.color = segVal.color;
    if (segVal.inverse) line.inverse = true;
    if (segVal.semantic && !line.semantic) line.semantic = segVal.semantic;
  }

  for (const line of lines) {
    if (!line.semantic && line.color) {
      line.semantic = inferBoeingSemantic(line.color, line.inverse);
    }
  }

  return lines;
}

export function boeingPage(segments: DisplaySegment[], lskActions: Record<string, string | null> = {}): DisplayData {
  return {
    segments,
    lskActions,
    lines: compileGridLines(segments),
    title: '', // segments contain the title
  };
}
