import { describe, expect, it } from 'vitest';
import {
  clampDisplayText,
  composeLegacyDisplayLine,
  displayDataToGrid,
  displayLineToSegments,
  scratchpadToGridSegment,
} from '../fmc/displayGrid';
import type { DisplayData } from '../types/fmc';

describe('displayGrid', () => {
  it('clamps display text to the fixed 24-column CDU width', () => {
    expect(clampDisplayText('ABC')).toBe('ABC                     ');
    expect(clampDisplayText('123456789012345678901234567')).toBe('123456789012345678901234');
  });

  it('converts line metadata into character-grid segments', () => {
    const [segment] = displayLineToSegments({
      text: 'IDENT',
      color: 'cyan',
      inverse: true,
      small: true,
      blinking: true,
      semantic: 'title',
    }, 3);

    expect(segment).toMatchObject({
      row: 3,
      col: 0,
      text: 'IDENT                   ',
      color: 'cyan',
      inverse: true,
      size: 'small',
      blink: true,
      semantic: 'title',
    });
  });

  it('preserves legacy left and right labels in fixed-width rows', () => {
    expect(composeLegacyDisplayLine({ text: ' V1', rightLabel: '130 KT' })).toBe(' V1               130 KT');
    expect(composeLegacyDisplayLine({ text: ' ERASE', leftLabel: '<' })).toBe('< ERASE                 ');
    expect(composeLegacyDisplayLine({ text: ' KJFK/KDCA', leftLabel: ' ----' })).toContain('KJFK/KDCA');
  });

  it('pads missing rows when converting legacy DisplayData', () => {
    const displayData: DisplayData = {
      title: 'IDENT',
      lines: [{ text: 'IDENT', semantic: 'title' }],
      lskActions: {},
    };

    const grid = displayDataToGrid(displayData);

    expect(grid.rows).toBe(14);
    expect(grid.columns).toBe(24);
    expect(grid.segments).toHaveLength(14);
    expect(grid.segments[0].text).toBe('IDENT                   ');
    expect(grid.segments[13].text).toBe('                        ');
  });

  it('represents scratchpad text as a fixed-width segment', () => {
    expect(scratchpadToGridSegment('CLR', { color: 'red', blink: true })).toMatchObject({
      row: 0,
      col: 0,
      text: 'CLR                     ',
      color: 'red',
      blink: true,
    });
  });
});
