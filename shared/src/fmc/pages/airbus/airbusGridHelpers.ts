import type { DisplayColor } from '../../displayColors';
import { AIRBUS_DEFAULT_COLOR } from '../../displayColors';
import type { DisplaySegment, GridDisplayData } from '../../../types/display';
import type { DisplayData, LSKId } from '../../../types/fmc';
import { PAGE_LINES, PAGE_WIDTH } from '../../constants';

/**
 * Create a DisplaySegment with Airbus-appropriate defaults.
 * Airbus default text color is amber (vs Boeing's green).
 * This is the Airbus equivalent of the `seg()` helper in displayGrid.ts.
 *
 * @param row - Row position (0-indexed)
 * @param col - Column position (0-indexed)
 * @param text - Segment text content
 * @param color - Text color (defaults to AIRBUS_DEFAULT_COLOR = 'amber')
 * @param options - Additional DisplaySegment properties (inverse, blink, semantic, size)
 */
export function airbusDisplaySegment(
  row: number,
  col: number,
  text: string,
  color: DisplayColor = AIRBUS_DEFAULT_COLOR,
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

/**
 * Create an Airbus-style title row.
 * Airbus titles are white inverse text, typically starting at column 2.
 * Unlike Boeing, Airbus does not fill the entire row with a background color.
 *
 * @param title - The title text
 * @param pageIndicator - Optional page indicator (e.g., 'A', 'B', '1/2')
 */
export function airbusTitleRow(title: string, pageIndicator?: string): DisplaySegment[] {
  const segments: DisplaySegment[] = [
    airbusDisplaySegment(0, 2, title, 'white', {
      inverse: true,
      semantic: 'title',
    }),
  ];

  if (pageIndicator) {
    const pageCol = PAGE_WIDTH - pageIndicator.length - 1;
    segments.push(
      airbusDisplaySegment(0, pageCol, pageIndicator, 'white', {
        inverse: true,
        semantic: 'pageIndicator',
      }),
    );
  }

  return segments;
}

/**
 * Create a left or right label segment for an Airbus MCDU row.
 * Left labels are positioned at column 0; right labels are right-aligned.
 *
 * @param label - Label text
 * @param row - Row number
 * @param side - 'L' for left side (col 0) or 'R' for right side (right-aligned)
 */
export function airbusLineLabel(label: string, row: number, side: 'L' | 'R'): DisplaySegment {
  if (side === 'L') {
    return airbusDisplaySegment(row, 0, label, 'white', { semantic: 'label' });
  }
  const col = Math.max(0, PAGE_WIDTH - label.length);
  return airbusDisplaySegment(row, col, label, 'white', { semantic: 'label' });
}

/**
 * Create a data field segment with proper Airbus formatting.
 * Active data is displayed in green; placeholder/missing data defaults to amber.
 *
 * @param value - The data value text
 * @param row - Row number
 * @param col - Column position
 * @param options - Optional overrides (color, semantic, inverse, blink)
 */
export function airbusDataField(
  value: string,
  row: number,
  col: number,
  options: {
    color?: DisplayColor;
    semantic?: string;
    inverse?: boolean;
    blink?: boolean;
  } = {},
): DisplaySegment {
  return airbusDisplaySegment(row, col, value, options.color ?? 'green', {
    semantic: (options.semantic as DisplaySegment['semantic']) ?? 'activeData',
    inverse: options.inverse,
    blink: options.blink,
  });
}

/**
 * Create a selectable field segment for an Airbus MCDU row.
 * Selectable fields are displayed in magenta (guidance color) and
 * indicate an interactive element that responds to LSK presses.
 *
 * The LSK action binding must be provided separately via airbusPage()'s
 * lskActions parameter — this function handles only the visual properties.
 *
 * @param text - The display text
 * @param row - Row number
 * @param col - Column position
 * @param _lskId - LSK identifier (e.g., 'L1', 'R2') — used for metadata association
 * @param _fieldId - Action identifier for this field — used for metadata association
 */
export function airbusSelectableField(
  text: string,
  row: number,
  col: number,
  _lskId: LSKId,
  _fieldId: string,
): DisplaySegment {
  return airbusDisplaySegment(row, col, text, 'magenta', {
    semantic: 'guidance',
  });
}

/**
 * Convert Airbus DisplaySegment[] to GridDisplayData.
 * Airbus uses the same grid dimensions as Boeing: 14 rows x 24 columns.
 */
export function airbusGrid(segments: DisplaySegment[]): GridDisplayData {
  return {
    rows: PAGE_LINES,
    columns: PAGE_WIDTH,
    segments,
    scratchpad: [],
  };
}

/**
 * Create a full Airbus page DisplayData from segments and LSK actions.
 * This is the Airbus equivalent of boeingPage() from the Boeing grid helpers.
 *
 * @param segments - Grid segments composing the page display
 * @param lskActions - Mapping of LSK identifiers to action handler keys
 */
export function airbusPage(segments: DisplaySegment[], lskActions: Record<string, string | null> = {}): DisplayData {
  return {
    segments,
    lskActions,
    lines: [],
    title: '',
  };
}
