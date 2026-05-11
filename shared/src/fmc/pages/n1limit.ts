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

export function renderN1LimitPage(state: FMCState): DisplayData {
  const { takeoff } = state;
  const mode = takeoff.toMode || 'TO';
  const n1Limits: Record<string, { to: string; clb: string; crz: string; cont: string }> = {
    'TO': { to: '98.5', clb: '92.0', crz: '82.5', cont: '94.0' },
    'TO 1': { to: '94.0', clb: '88.5', crz: '80.0', cont: '90.5' },
    'TO 2': { to: '88.0', clb: '84.0', crz: '77.5', cont: '86.0' },
  };
  const limits = n1Limits[mode] || n1Limits['TO'];

  return {
    title: 'N1 LIMIT',
    pageIndicator: '1/1',
    lines: [
      inverse('  N1 LIMIT         1/1', '', '', 'cyan'),
      fmt(' SEL OAT', '', 'REDUCED', 'white'),
      fmt(`  ${takeoff.assumedTemp ? `${takeoff.assumedTemp}°C` : '---'}`, '', ' <ARMED>', 'green'),
      fmt(` <${mode}`, '', '', mode === 'TO' ? 'green' : 'white'),
      fmt(` ${limits.to}`, '', '', 'green'),
      fmt(' <CLB', '', '', mode === 'CLB' ? 'green' : 'white'),
      fmt(` ${limits.clb}`, '', '', 'green'),
      fmt(' <CRZ', '', '', mode === 'CRZ' ? 'green' : 'white'),
      fmt(` ${limits.crz}`, '', '', 'green'),
      fmt(' <CON', '', '', mode === 'CON' ? 'green' : 'white'),
      fmt(` ${limits.cont}`, '', '', 'green'),
      blank(),
      fmt('', ' <INDEX', 'TAKEOFF>', 'white'),
    ],
    lskActions: {
      L1: 'select_to',
      L2: 'select_clb',
      L3: 'select_crz',
      L4: 'select_con',
      L6: 'menu',
      R6: 'takeoff_ref',
    },
  };
}
