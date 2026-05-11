import type { FMCState, DisplayData, DisplayLine } from '../../types/fmc';
import { PAGE_LINES, PAGE_WIDTH } from '../constants';

function fmt(text: string, left: string = '', right: string = '', color?: DisplayLine["color"]): DisplayLine {
  return { text: text.padEnd(PAGE_WIDTH, ' '), leftLabel: left, rightLabel: right, inverse: false, color };
}
function inverse(text: string, left: string = '', right: string = '', color?: DisplayLine["color"]): DisplayLine {
  return { ...fmt(text, left, right), inverse: true, color };
}
function blank() { return fmt('', '', ''); }

export function renderN1LimitPage(state: FMCState): DisplayData {
  const { takeoff } = state;
  const mode = takeoff.toMode || 'TO';
  const n1Limits: Record<string, { to: string; clb: string; crz: string; cont: string }> = {
    'TO': { to: '98.5%', clb: '92.0%', crz: '82.5%', cont: '94.0%' },
    'TO 1': { to: '94.0%', clb: '88.5%', crz: '80.0%', cont: '90.5%' },
    'TO 2': { to: '88.0%', clb: '84.0%', crz: '77.5%', cont: '86.0%' },
  };
  const limits = n1Limits[mode] || n1Limits['TO'];

  return {
    title: 'N1 LIMIT',
    pageIndicator: '1/1',
    lines: [
      inverse('  N1 LIMIT         1/1', '', '', 'cyan'),
      blank(),
      fmt(` ${mode}`, '', '', 'green'),
      fmt(' TO N1', '<', '', 'white'),
      fmt(` ${limits.to}`, '', '', 'green'),
      blank(),
      fmt(' CLB N1', '<', '', 'white'),
      fmt(` ${limits.clb}`, '', '', 'green'),
      blank(),
      fmt(' CRZ N1', '<', '', 'white'),
      fmt(` ${limits.crz}`, '', '', 'green'),
      blank(),
      fmt(' CONT N1', '<', '', 'white'),
      fmt(` ${limits.cont}`, '', '', 'green'),
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
