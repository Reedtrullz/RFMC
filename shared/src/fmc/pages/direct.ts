import type { FMCState, DisplayData, DisplayLine } from '../../types/fmc';
import { PAGE_LINES, PAGE_WIDTH } from '../constants';

function fmt(text: string, left: string = '', right: string = '', color?: DisplayLine["color"]): DisplayLine {
  return { text: text.padEnd(PAGE_WIDTH, ' '), leftLabel: left, rightLabel: right, inverse: false, color };
}
function inverse(text: string, left: string = '', right: string = '', color?: DisplayLine["color"]): DisplayLine {
  return { ...fmt(text, left, right), inverse: true, color };
}
function blank() { return fmt('', '', ''); }

export function renderDirIntcPage(state: FMCState): DisplayData {
  const { flightPlan } = state;
  const origin = flightPlan.origin || '----';
  const destination = flightPlan.destination || '----';

  return {
    title: 'DIR INTC',
    pageIndicator: '1/1',
    lines: [
      inverse('  DIR INTC         1/1', '', '', 'cyan'),
      blank(),
      fmt(' DIRECT TO', '<', '', 'white'),
      fmt(' ----', '', '', 'green'),
      blank(),
      fmt(' INTERCEPT', '<', '', 'white'),
      fmt(' ----°', '', '', 'green'),
      blank(),
      fmt(' FROM', '', '', 'white'),
      fmt(` ${origin}`, '', '', 'green'),
      blank(),
      fmt(' TO', '', '', 'white'),
      fmt(` ${destination}`, '', '', 'green'),
      blank(),
      blank(),
      blank(),
    ],
    lskActions: {
      L1: null,
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
