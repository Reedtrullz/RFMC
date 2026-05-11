import type { FMCState, DisplayData, DisplayLine } from '../../types/fmc';
import { PAGE_LINES, PAGE_WIDTH } from '../constants';
import { inferBoeingSemantic } from '../pageLineSemantics';

function fmt(text: string, left: string = '', right: string = '', color?: DisplayLine["color"]): DisplayLine {
  return { text: text.padEnd(PAGE_WIDTH, ' '), leftLabel: left, rightLabel: right, inverse: false, color, semantic: inferBoeingSemantic(color) };
}
function inverse(text: string, left: string = '', right: string = '', color?: DisplayLine["color"]): DisplayLine {
  return { ...fmt(text, left, right, color), inverse: true, color, semantic: inferBoeingSemantic(color, true) };
}
function blank() { return fmt('', '', ''); }

export function renderDesPage(state: FMCState): DisplayData {
  const { performance } = state;
  const crzAlt = performance.crzAlt ? `FL${String(performance.crzAlt).slice(0, 3)}` : '-----';

  return {
    title: 'DES',
    pageIndicator: '1/1',
    lines: [
      inverse('  DES              1/1', '', '', 'cyan'),
      blank(),
      fmt(' CRZ ALT', '<', '', 'white'),
      fmt(` ${crzAlt}`, '', '', 'green'),
      blank(),
      fmt(' DES WIND', '<', '', 'white'),
      fmt(' ---/---', '', '', 'green'),
      blank(),
      fmt(' ISA DEV', '<', '', 'white'),
      fmt(' +00°C', '', '', 'green'),
      blank(),
      fmt(' OPT ALT', '<', '', 'white'),
      fmt(' -----', '', '', 'green'),
      blank(),
      fmt(' DES PATH', '<', '', 'white'),
      fmt(' ----°', '', '', 'green'),
      blank(),
    ],
    lskActions: {
      L1: 'set_crz_alt',
      L2: null,
      L3: null,
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
