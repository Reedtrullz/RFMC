import type { FMCState, DisplayData, DisplayLine } from '../../types/fmc';
import { PAGE_LINES, PAGE_WIDTH } from '../constants';

function fmt(text: string, left: string = '', right: string = '', color?: DisplayLine["color"]): DisplayLine {
  return {
    text: text.padEnd(PAGE_WIDTH, ' '),
    leftLabel: left,
    rightLabel: right,
    inverse: false,
    color,
  };
}

function inverse(text: string, left: string = '', right: string = '', color?: DisplayLine["color"]): DisplayLine {
  return { ...fmt(text, left, right), inverse: true, color };
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
      fmt(' MODEL', '<', '', 'white'),
      fmt(` ${ident.aircraftType || '----'}`, '', '', 'green'),
      blank(),
      fmt(' ENG RATING', '<', '', 'white'),
      fmt(` ${ident.engRating || '----'}`, '', '', 'green'),
      blank(),
      fmt(' NAV DATA', '<', '', 'white'),
      fmt(` ${ident.navDataVersion || '--------'}`, '', '', 'green'),
      blank(),
      fmt(' OP PROGRAM', '', '', 'white'),
      fmt(` ${ident.opProgram || '-------------'}`, '', '', 'green'),
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
    : '----.-  ----.-';

  return {
    title: 'POS INIT',
    pageIndicator: '1/1',
    lines: [
      inverse('  POS INIT         1/1', '', '', 'cyan'),
      fmt(' REF AIRPORT', '<', '', 'white'),
      fmt(` ${position.refAirport || '----'}`, '', '', 'green'),
      fmt(' GATE', '<', '', 'white'),
      fmt(` ${position.gate || '----'}`, '', '', 'green'),
      blank(),
      fmt(' LAST POS', '', '', 'white'),
      fmt(` ${flightPlan.origin || '----'}    `, '', lastPos, 'green'),
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
      inverse('  PERF INIT        1/2', '', '', 'cyan'),
      fmt(' CRZ ALT', '<', '', 'white'),
      fmt(` ${performance.crzAlt ? `FL${String(performance.crzAlt).slice(0, 3)}` : '-----'}`, '', '', 'green'),
      fmt(' COST INDEX', '<', '', 'white'),
      fmt(` ${performance.costIndex ? String(performance.costIndex) : '---'}`, '', '', 'green'),
      blank(),
      fmt(' ZFW', '', '', 'white'),
      fmt(` ${performance.zfw ? (performance.zfw / 1000).toFixed(2) : '---.-'}`, '', '', 'green'),
      fmt(' RESERVES', '<', '', 'white'),
      fmt(` ${performance.reserve ? (performance.reserve / 1000).toFixed(2) : '--.-'}`, '', '', 'green'),
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

export function renderTakeoffRefPage(state: FMCState): DisplayData {
  const { takeoff } = state;
  return {
    title: 'TAKEOFF REF',
    pageIndicator: '1/2',
    lines: [
      inverse('  TAKEOFF REF      1/2', '', '', 'cyan'),
      fmt(' RW', '<', '', 'white'),
      fmt(` ${takeoff.runway || '---'}`, '', '', 'green'),
      fmt(' TO MODE', '<', '', 'white'),
      fmt(` ${takeoff.toMode || 'TO'}`, '', '', 'green'),
      blank(),
      fmt(' V1', '', `${takeoff.v1 ? `${takeoff.v1} KT` : '---'}`, 'white'),
      fmt(' VR', '', `${takeoff.vr ? `${takeoff.vr} KT` : '---'}`, 'white'),
      fmt(' V2', '', `${takeoff.v2 ? `${takeoff.v2} KT` : '---'}`, 'white'),
      fmt(' TRIM', '', `${takeoff.trim ? `${takeoff.trim.toFixed(1)}` : '--.-'}`, 'white'),
      fmt(' OAT', '', `${takeoff.oat ? `${takeoff.oat}°C` : '---'}`, 'white'),
      fmt(' WIND', '', `${takeoff.windDir ? `${takeoff.windDir}°/${takeoff.windSpeed}KT` : '---'}`, 'white'),
      fmt(' QNH', '', `${takeoff.qnh ? `${(takeoff.qnh / 100).toFixed(0)} HPA` : '----'}`, 'white'),
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
