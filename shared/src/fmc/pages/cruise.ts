import type { FMCState, DisplayData, DisplayLine } from '../../types/fmc';
import { PAGE_LINES, PAGE_WIDTH } from '../constants';

function fmt(text: string, left: string = '', right: string = '', color?: DisplayLine["color"]): DisplayLine {
  return { text: text.padEnd(PAGE_WIDTH, ' '), leftLabel: left, rightLabel: right, inverse: false, color };
}
function inverse(text: string, left: string = '', right: string = '', color?: DisplayLine["color"]): DisplayLine {
  return { ...fmt(text, left, right), inverse: true, color };
}
function blank() { return fmt('', '', ''); }

export function renderCrzPage(state: FMCState): DisplayData {
  const { performance } = state;
  const crzAlt = performance.crzAlt ? `FL${String(performance.crzAlt).slice(0, 3)}` : '-----';
  const costIndex = performance.costIndex ? String(performance.costIndex) : '---';

  return {
    title: 'CRZ',
    pageIndicator: '1/1',
    lines: [
      inverse('  CRZ              1/1', '', '', 'cyan'),
      blank(),
      fmt(' CRZ ALT', '<', '', 'white'),
      fmt(` ${crzAlt}`, '', '', 'green'),
      blank(),
      fmt(' COST INDEX', '<', '', 'white'),
      fmt(` ${costIndex}`, '', '', 'green'),
      blank(),
      fmt(' CRZ WIND', '<', '', 'white'),
      fmt(' ---/---', '', '', 'green'),
      blank(),
      fmt(' ISA DEV', '<', '', 'white'),
      fmt(' +00°C', '', '', 'green'),
      blank(),
      fmt(' OPT ALT', '<', '', 'white'),
      fmt(' -----', '', '', 'green'),
      blank(),
    ],
    lskActions: {
      L1: 'set_crz_alt',
      L2: null,
      L3: 'set_cost_index',
      L4: null,
      L5: null,
      L6: null,
      R1: null,
      R2: null,
      R3: null,
      R4: null,
      R5: null,
      R6: null,
    },
  };
}
