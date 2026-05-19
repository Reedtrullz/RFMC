import type { FMCState, DisplayData, DisplayLine } from '../../types/fmc';
import { PAGE_WIDTH } from '../constants';
import { inferBoeingSemantic } from '../pageLineSemantics';

function fmt(text: string, left: string = '', right: string = '', color?: DisplayLine['color']): DisplayLine {
  return {
    text: text.padEnd(PAGE_WIDTH, ' '),
    leftLabel: left,
    rightLabel: right,
    inverse: false,
    color,
    semantic: inferBoeingSemantic(color),
  };
}

function inverse(text: string, left: string = '', right: string = '', color?: DisplayLine['color']): DisplayLine {
  return { ...fmt(text, left, right, color), inverse: true, color, semantic: inferBoeingSemantic(color, true) };
}

function blank() {
  return fmt('', '', '');
}

export function renderIdentPage(state: FMCState): DisplayData {
  const { ident } = state;
  return {
    title: 'IDENT',
    pageIndicator: '1/1',
    lines: [
      inverse('  IDENT            1/1', '', '', 'cyan'),
      fmt(' MODEL', '', '', 'white'),
      fmt(` ${ident.aircraftType || '737-800'}`, '', '', 'green'),
      fmt(' NAV DATA', '', '', 'white'),
      fmt(` ${ident.navDataVersion || 'OCT05NOV01'}`, '', 'NAV DATA >', 'green'),
      fmt(' OP PROGRAM', '', '', 'white'),
      fmt(` ${ident.opProgram || 'BP0101'}`, '', '', 'green'),
      fmt(' ENGINES', '', '', 'white'),
      fmt(` ${ident.engRating || '26K'}`, '', '', 'green'),
      blank(),
      blank(),
      fmt('', ' <INDEX', 'POS INIT>', 'white'),
      blank(),
    ],
    lskActions: {
      R2: 'nav_data',
      L6: 'menu',
      R6: 'pos_init',
    },
  };
}

export function renderNavDataPage(): DisplayData {
  const cycle = 'FMC21A1';
  const effective = 'OCT05/26';
  const expires = 'NOV01/26';

  return {
    title: 'NAV DATA',
    pageIndicator: '1/1',
    lines: [
      inverse('  NAV DATA         1/1', '', '', 'cyan'),
      fmt(' ACTIVE CYCLE', '', '', 'white'),
      fmt(` ${cycle}`, '', '', 'green'),
      fmt(' EFFECTIVE DATE', '', '', 'white'),
      fmt(` ${effective}`, '', '', 'green'),
      fmt(' EXPIRY DATE', '', '', 'white'),
      fmt(` ${expires}`, '', '', 'green'),
      blank(),
      fmt(' DATABASE', '', '', 'white'),
      fmt(' WORLDWIDE HIGH-RES', '', '', 'green'),
      blank(),
      blank(),
      fmt('', ' <IDENT', '', 'white'),
      blank(),
    ],
    lskActions: {
      L6: 'ident',
    },
  };
}

export function renderPerfInitPage(state: FMCState): DisplayData {
  const { performance } = state;
  const grossWt = performance.zfw + performance.fuel;

  return {
    title: 'PERF INIT',
    pageIndicator: '1/2',
    lines: [
      inverse('  PERF INIT        1/2', '', '', 'cyan'),
      fmt(' CRZ ALT', '<', '', 'white'),
      fmt(` ${performance.crzAlt ? `FL${String(performance.crzAlt).slice(0, 3)}` : '[     ]'}`, '', '', 'green'),
      fmt(' COST INDEX', '<', '', 'white'),
      fmt(` ${performance.costIndex ? String(performance.costIndex) : '[   ]'}`, '', '', 'green'),
      blank(),
      fmt(' ZFW', '', '', 'white'),
      fmt(` ${performance.zfw ? (performance.zfw / 1000).toFixed(2) : '[   . ]'}`, '', '', 'green'),
      fmt(' RESERVES', '<', '', 'white'),
      fmt(` ${performance.reserve ? (performance.reserve / 1000).toFixed(2) : '[  . ]'}`, '', '', 'green'),
      blank(),
      fmt(' GROSS WT', '', '', 'white'),
      fmt(` ${grossWt ? (grossWt / 1000).toFixed(2) : '---.-'}`, '', '', 'green'),
      blank(),
      blank(),
      blank(),
    ],
    lskActions: {
      L1: 'set_crz_alt',
      L2: null,
      L3: 'set_cost_index',
      L4: null,
      L5: 'thrust_lim',
      L6: 'next_page',
      R1: 'set_zfw',
      R2: null,
      R3: 'set_reserve',
      R4: null,
      R5: null,
      R6: null,
    },
  };
}

export function renderThrustLimPage(state: FMCState): DisplayData {
  const { takeoff } = state;
  return {
    title: 'THRUST LIM',
    pageIndicator: '1/1',
    lines: [
      inverse('  THRUST LIM       1/1', '', '', 'cyan'),
      fmt(' TO', '<', '', 'white'),
      fmt(' 26K N1', '', '', 'green'),
      fmt(' TO 1', '<', '', 'white'),
      fmt(' 24K N1', '', '', 'green'),
      fmt(' TO 2', '<', '', 'white'),
      fmt(' 22K N1', '', '', 'green'),
      blank(),
      fmt(' SEL OAT', '<', '', 'white'),
      fmt(` ${takeoff.assumedTemp ? `${takeoff.assumedTemp}°C` : '---'}`, '', '', 'green'),
      blank(),
      blank(),
      blank(),
      blank(),
    ],
    lskActions: {
      L1: 'select_to',
      L2: 'set_assumed_temp',
      L3: 'select_to1',
      L4: null,
      L5: 'select_to2',
      L6: 'takeoff_ref',
      R1: null,
      R2: null,
      R3: null,
      R4: null,
      R5: null,
      R6: null,
    },
  };
}

export function renderMenuPage(): DisplayData {
  return {
    title: 'MENU',
    pageIndicator: '1/1',
    lines: [
      inverse('  MENU             1/1', '', '', 'cyan'),
      fmt(' IDENT', '<', '', 'white'),
      fmt(' A/C IDENTIFICATION', '', '', 'green'),
      fmt(' POS INIT', '<', '', 'white'),
      fmt(' POSITION INIT', '', '', 'green'),
      fmt(' PERF INIT', '<', '', 'white'),
      fmt(' PERFORMANCE INIT', '', '', 'green'),
      fmt(' THRUST LIM', '<', '', 'white'),
      fmt(' TAKEOFF REFERENCE', '', '', 'green'),
      fmt(' DEP/ARR', '', '', 'white'),
      fmt(' DEPARTURES/ARRIVAL', '', '', 'green'),
      fmt(' ATC', '', '', 'white'),
      fmt(' COMM/ALTN', '', '', 'green'),
      blank(),
      blank(),
    ],
    lskActions: {
      L1: 'ident',
      L2: null,
      L3: 'pos_init',
      L4: null,
      L5: 'perf_init',
      L6: null,
      R1: 'thrust_lim',
      R2: null,
      R3: 'dep_arr',
      R4: null,
      R5: 'atc',
      R6: null,
    },
  };
}
