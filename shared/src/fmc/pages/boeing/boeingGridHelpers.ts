import type { DisplayColor, DisplaySegment, GridDisplayData, DisplayData } from '@shared';

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

export function boeingPage(
  segments: DisplaySegment[],
  lskActions: Record<string, string | null> = {},
): DisplayData {
  return {
    segments,
    lskActions,
    lines: [],
    title: '', // segments contain the title
  };
}
