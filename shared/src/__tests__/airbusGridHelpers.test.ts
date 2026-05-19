import { describe, expect, it } from 'vitest';
import {
  airbusDisplaySegment,
  airbusTitleRow,
  airbusLineLabel,
  airbusDataField,
  airbusSelectableField,
  airbusGrid,
  airbusPage,
} from '../fmc/pages/airbus/airbusGridHelpers';
import { PAGE_LINES, PAGE_WIDTH } from '../fmc/constants';

describe('airbusGridHelpers', () => {
  describe('airbusDisplaySegment', () => {
    it('creates a segment with Airbus default amber color', () => {
      const segment = airbusDisplaySegment(2, 3, 'HELLO');
      expect(segment).toEqual({
        row: 2,
        col: 3,
        text: 'HELLO',
        color: 'amber',
      });
    });

    it('allows overriding the color', () => {
      const segment = airbusDisplaySegment(0, 0, 'LABEL', 'white');
      expect(segment.color).toBe('white');
    });

    it('merges additional options', () => {
      const segment = airbusDisplaySegment(1, 5, 'DATA', 'green', {
        inverse: true,
        blink: true,
        semantic: 'activeData',
      });
      expect(segment).toMatchObject({
        row: 1,
        col: 5,
        text: 'DATA',
        color: 'green',
        inverse: true,
        blink: true,
        semantic: 'activeData',
      });
    });
  });

  describe('airbusTitleRow', () => {
    it('creates an inverse white title segment at column 2', () => {
      const segments = airbusTitleRow('INIT');
      expect(segments).toHaveLength(1);
      expect(segments[0]).toMatchObject({
        row: 0,
        col: 2,
        text: 'INIT',
        color: 'white',
        inverse: true,
        semantic: 'title',
      });
    });

    it('includes page indicator when provided', () => {
      const segments = airbusTitleRow('INIT', 'A');
      expect(segments).toHaveLength(2);
      expect(segments[0].text).toBe('INIT');
      expect(segments[0].inverse).toBe(true);
      expect(segments[1]).toMatchObject({
        row: 0,
        color: 'white',
        inverse: true,
        semantic: 'pageIndicator',
      });
      expect(segments[1].text).toBe('A');
      expect(segments[1].col).toBe(PAGE_WIDTH - 'A'.length - 1);
    });

    it('positions page indicator at correct column', () => {
      const segments = airbusTitleRow('PERF', 'TO');
      expect(segments).toHaveLength(2);
      expect(segments[1].col).toBe(PAGE_WIDTH - 'TO'.length - 1);
      expect(segments[1].text).toBe('TO');
    });
  });

  describe('airbusLineLabel', () => {
    it('creates a left-side label at column 0', () => {
      const segment = airbusLineLabel('< FMGC', 2, 'L');
      expect(segment).toMatchObject({
        row: 2,
        col: 0,
        text: '< FMGC',
        color: 'white',
        semantic: 'label',
      });
    });

    it('creates a right-side label right-aligned', () => {
      const segment = airbusLineLabel('SELECT', 2, 'R');
      expect(segment).toMatchObject({
        row: 2,
        color: 'white',
        semantic: 'label',
      });
      expect(segment.col).toBe(PAGE_WIDTH - 'SELECT'.length);
      expect(segment.text).toBe('SELECT');
    });

    it('clamps right label to column 0 if text exceeds row width', () => {
      const longText = 'X'.repeat(PAGE_WIDTH + 5);
      const segment = airbusLineLabel(longText, 0, 'R');
      expect(segment.col).toBe(0);
    });
  });

  describe('airbusDataField', () => {
    it('creates a data field with default green color', () => {
      const segment = airbusDataField('KJFK', 3, 10);
      expect(segment).toMatchObject({
        row: 3,
        col: 10,
        text: 'KJFK',
        color: 'green',
        semantic: 'activeData',
      });
    });

    it('allows overriding the color', () => {
      const segment = airbusDataField('----', 3, 10, { color: 'amber' });
      expect(segment.color).toBe('amber');
    });

    it('allows overriding the semantic', () => {
      const segment = airbusDataField('1500', 5, 8, {
        semantic: 'warning',
        color: 'amber',
      });
      expect(segment.semantic).toBe('warning');
    });

    it('supports inverse and blink options', () => {
      const segment = airbusDataField('FL390', 4, 3, {
        inverse: true,
        blink: true,
      });
      expect(segment.inverse).toBe(true);
      expect(segment.blink).toBe(true);
    });
  });

  describe('airbusSelectableField', () => {
    it('creates a magenta guidance segment', () => {
      const segment = airbusSelectableField('< FMGC', 1, 0, 'L1', 'f_pln');
      expect(segment).toMatchObject({
        row: 1,
        col: 0,
        text: '< FMGC',
        color: 'magenta',
        semantic: 'guidance',
      });
    });

    it('supports right-aligned selectable fields', () => {
      const segment = airbusSelectableField('SELECT', 1, 14, 'R1', 'select_fmcg');
      expect(segment).toMatchObject({
        row: 1,
        col: 14,
        text: 'SELECT',
        color: 'magenta',
        semantic: 'guidance',
      });
    });
  });

  describe('airbusGrid', () => {
    it('wraps segments with correct Airbus grid dimensions', () => {
      const segments = [airbusDisplaySegment(0, 0, 'TEST')];
      const grid = airbusGrid(segments);

      expect(grid.rows).toBe(PAGE_LINES);
      expect(grid.columns).toBe(PAGE_WIDTH);
      expect(grid.segments).toBe(segments);
      expect(grid.segments).toHaveLength(1);
      expect(grid.scratchpad).toEqual([]);
    });
  });

  describe('airbusPage', () => {
    it('combines segments and lskActions into DisplayData', () => {
      const segments = [
        airbusDisplaySegment(0, 2, 'INIT', 'white', {
          inverse: true,
          semantic: 'title',
        }),
        airbusLineLabel('CO RTE', 1, 'L'),
        airbusDataField('KJFK', 1, 7),
      ];
      const lskActions = { L1: 'set_from_to' };

      const page = airbusPage(segments, lskActions);

      expect(page.segments).toBe(segments);
      expect(page.lskActions).toEqual({ L1: 'set_from_to' });
      expect(page.lines).toEqual([]);
      expect(page.title).toBe('');
    });

    it('defaults to empty lskActions when not provided', () => {
      const page = airbusPage([]);
      expect(page.lskActions).toEqual({});
    });
  });
});
