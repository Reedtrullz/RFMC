import type { FMCState, DisplayData } from '../../types/fmc';
import { PAGE_LINES, PAGE_WIDTH } from '../constants';

function fmt(text: string, left: string = '', right: string = ''): { text: string; leftLabel: string; rightLabel: string; inverse: boolean } {
  return {
    text: text.padEnd(PAGE_WIDTH, ' '),
    leftLabel: left,
    rightLabel: right,
    inverse: false,
  };
}

function inverse(text: string, left: string = '', right: string = ''): { text: string; leftLabel: string; rightLabel: string; inverse: boolean } {
  return { ...fmt(text, left, right), inverse: true };
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
      inverse('  IDENT            1/1'),
      fmt(' MODEL', '<'),
      fmt(` ${ident.aircraftType || '----'}`),
      blank(),
      fmt(' ENG RATING', '<'),
      fmt(` ${ident.engRating || '----'}`),
      blank(),
      fmt(' NAV DATA', '<'),
      fmt(` ${ident.navDataVersion || '--------'}`),
      blank(),
      fmt(' OP PROGRAM', ''),
      fmt(` ${ident.opProgram || '-------------'}`),
      blank(),
      blank(),
    ],
    lskActions: {
      L1: 'pos_init',
      L2: null,
      L3: 'perf_init',
      L4: null,
      L5: null,
      L6: null,
      R1: null,
      R2: null,
      R3: null,
      R4: null,
      R5: null,
      R6: 'menu',
    },
  };
}

export function renderPosInitPage(state: FMCState): DisplayData {
  const { position, flightPlan } = state;
  const lastPos = position.lat != null && position.lon != null
    ? `${position.lat.toFixed(1)} ${position.lon.toFixed(1)}`
    : '----.-  -----.-';

  return {
    title: 'POS INIT',
    pageIndicator: '1/1',
    lines: [
      inverse('  POS INIT         1/1'),
      fmt(' REF AIRPORT', '<'),
      fmt(` ${position.refAirport || '----'}`),
      fmt(' GATE', '<'),
      fmt(` ${position.gate || '----'}`),
      blank(),
      fmt(' LAST POS', ''),
      fmt(` ${flightPlan.origin || '----'}    `, '', lastPos),
      blank(),
      blank(),
      blank(),
      blank(),
      blank(),
      blank(),
    ],
    lskActions: {
      L1: 'set_ref_airport',
      L2: null,
      L3: 'set_gate',
      L4: null,
      L5: 'rte',
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

export function renderPerfInitPage(state: FMCState): DisplayData {
  const { performance, flightPlan } = state;
  const grossWt = performance.zfw + performance.fuel;

  return {
    title: 'PERF INIT',
    pageIndicator: '1/2',
    lines: [
      inverse('  PERF INIT        1/2'),
      fmt(' CRZ ALT', '<'),
      fmt(` ${performance.crzAlt ? `FL${String(performance.crzAlt).slice(0, 3)}` : '-----'}`),
      fmt(' COST INDEX', '<'),
      fmt(` ${performance.costIndex ? String(performance.costIndex) : '---'}`),
      blank(),
      fmt(' ZFW', ''),
      fmt(` ${performance.zfw ? (performance.zfw / 1000).toFixed(2) : '---.-'}`),
      fmt(' RESERVES', '<'),
      fmt(` ${performance.reserve ? (performance.reserve / 1000).toFixed(2) : '--.-'}`),
      blank(),
      fmt(' GROSS WT', ''),
      fmt(` ${grossWt ? (grossWt / 1000).toFixed(2) : '---.-'}`),
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
      inverse('  THRUST LIM       1/1'),
      fmt(' TO', '<'),
      fmt(' 26K N1'),
      fmt(' TO 1', '<'),
      fmt(' 24K N1'),
      fmt(' TO 2', '<'),
      fmt(' 22K N1'),
      blank(),
      fmt(' SEL OAT', '<'),
      fmt(` ${takeoff.assumedTemp ? `${takeoff.assumedTemp}°C` : '---'}`),
      blank(),
      blank(),
      blank(),
      blank(),
    ],
    lskActions: {
      L1: 'select_to',
      L2: null,
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

export function renderTakeoffRefPage(state: FMCState): DisplayData {
  const { takeoff } = state;
  return {
    title: 'TAKEOFF REF',
    pageIndicator: '1/2',
    lines: [
      inverse('  TAKEOFF REF      1/2'),
      fmt(' RW', '<'),
      fmt(` ${takeoff.runway || '---'}`),
      fmt(' TO MODE', '<'),
      fmt(` ${takeoff.toMode || 'TO'}`),
      blank(),
      fmt(' V1', '', `${takeoff.v1 ? `${takeoff.v1} KT` : '---'}`),
      fmt(' VR', '', `${takeoff.vr ? `${takeoff.vr} KT` : '---'}`),
      fmt(' V2', '', `${takeoff.v2 ? `${takeoff.v2} KT` : '---'}`),
      fmt(' TRIM', '', `${takeoff.trim ? `${takeoff.trim.toFixed(1)}` : '--.-'}`),
      fmt(' OAT', '', `${takeoff.oat ? `${takeoff.oat}°C` : '---'}`),
      fmt(' WIND', '', `${takeoff.windDir ? `${takeoff.windDir}°/${takeoff.windSpeed}KT` : '---'}`),
      fmt(' QNH', '', `${takeoff.qnh ? `${(takeoff.qnh / 100).toFixed(0)} HPA` : '----'}`),
      blank(),
    ],
    lskActions: {
      L1: 'set_runway',
      L2: null,
      L3: 'set_to_mode',
      L4: 'set_oat',
      L5: 'set_wind',
      L6: 'next_page',
      R1: 'set_v1',
      R2: 'set_vr',
      R3: 'set_v2',
      R4: 'set_trim',
      R5: 'set_qnh',
      R6: null,
    },
  };
}

export function renderMenuPage(state: FMCState): DisplayData {
  return {
    title: 'MENU',
    pageIndicator: '1/1',
    lines: [
      inverse('  MENU             1/1'),
      fmt(' IDENT', '<'),
      fmt(' A/C IDENTIFICATION'),
      fmt(' POS INIT', '<'),
      fmt(' POSITION INIT'),
      fmt(' PERF INIT', '<'),
      fmt(' PERFORMANCE INIT'),
      fmt(' THRUST LIM', '<'),
      fmt(' TAKEOFF REFERENCE'),
      fmt(' DEP/ARR', ''),
      fmt(' DEPARTURES/ARRIVAL'),
      fmt(' ATC', ''),
      fmt(' COMM/ALTN'),
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
