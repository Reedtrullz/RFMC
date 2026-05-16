import type { FMCState, DisplayData, AirbusPageType, PageType, DisplayLine } from '../../../types/fmc';
import { inferAirbusSemantic } from '../../pageLineSemantics';
import { renderAtsuMenu, renderAtsuMessages, renderAtsuMessageDetail } from './atsu';
import { renderProgGrid } from './prog.grid';
import { renderRadNavGrid } from './radNav.grid';
import { renderFuelPredGrid } from './fuelPred.grid';
import { renderSecFplnGrid } from './secFpln.grid';
import { renderDataIndexGrid } from './dataIndex.grid';
import { renderMcduMenuGrid } from './mcduMenu.grid';
import { renderDepArrA320Grid } from './depArr.grid';
import { renderFplnGrid } from './fpln.grid';
import { renderInitAGrid } from './initA.grid';
import { renderInitBGrid } from './initB.grid';
import { renderPerfTakeoffGrid } from './perfTakeoff.grid';
import { renderPerfApprGrid } from './perfAppr.grid';

const W = 24;
export function fmt(text: string, left: string = '', right: string = '', color?: DisplayLine['color'], small: boolean = false): DisplayLine {
  return { text: text.padEnd(W, ' '), leftLabel: left, rightLabel: right, inverse: false, color, small, semantic: inferAirbusSemantic(color) };
}
export function inv(text: string, left: string = '', right: string = '', color?: DisplayLine['color']): DisplayLine {
  return { text: text.padEnd(W, ' '), leftLabel: left, rightLabel: right, inverse: true, color, semantic: inferAirbusSemantic(color, true) };
}
export function blank() { return fmt(''); }

const AIRBUS_PAGES: readonly string[] = ['INIT_A', 'INIT_B', 'F_PLN', 'DEP_ARR_A', 'PERF_TAKEOFF', 'PERF_APPR', 'FUEL_PRED', 'SEC_FPLN', 'RAD_NAV', 'PROG_A', 'DATA_INDEX', 'MCDU_MENU', 'ATSU', 'ATSU_MSGS', 'ATSU_MSG_DETAIL'];

export function getAirbusPageRenderer(page: PageType): ((state: FMCState) => DisplayData) | null {
  if (!AIRBUS_PAGES.includes(page)) return null;
  const renderers: Partial<Record<PageType, (state: FMCState) => DisplayData>> = {
    INIT_A:             renderInitAGrid,
    INIT_B:             renderInitBGrid,
    F_PLN:              renderFplnGrid,
    DEP_ARR_A:          renderDepArrA320Grid,
    PERF_TAKEOFF:       renderPerfTakeoffGrid,
    PERF_APPR:          renderPerfApprGrid,
    FUEL_PRED:          renderFuelPredGrid,
    SEC_FPLN:           renderSecFplnGrid,
    RAD_NAV:            renderRadNavGrid,
    PROG_A:             renderProgGrid,
    DATA_INDEX:         renderDataIndexGrid,
    MCDU_MENU:          renderMcduMenuGrid,
    ATSU:               renderAtsuMenu,
    ATSU_MSGS:          renderAtsuMessages,
    ATSU_MSG_DETAIL:    renderAtsuMessageDetail,
  };
  return renderers[page] || null;
}

export function renderInitA(state: FMCState): DisplayData {
  const route = state.isModified && state.pendingRoute ? state.pendingRoute : state.route;
  const { performance, position } = state;
  const title = state.isModified ? 'TMPY INIT' : 'INIT';
  const fromTo = route.origin && route.destination ? `${route.origin}/${route.destination}` : ' [  ]/[  ] ';

  const isAligning = position.irsState === 'ALIGNING';
  const isNav = position.irsState === 'NAV';

  return {
    title,
    pageIndicator: 'A',
    lines: [
      inv(`  ${title}              A`, '', '', 'cyan'),
      fmt(' FROM/TO', 'CO RTE', '', 'white'),
      fmt(` ${fromTo}`, ' --------', '', route.origin ? 'green' : 'magenta'),
      fmt(' ALTN/CO RTE', 'FLT NBR', '', 'white'),
      fmt(` ${route.alternate || '----'}/--------`, ` ${route.flightNumber || '--------'}`, '', 'magenta'),
      fmt(' COST INDEX', 'LAT', '', 'white'),
      fmt(` ${performance.costIndex || '---'}`, `  ${Math.abs(position.lat).toFixed(1)}${position.lat >= 0 ? 'N' : 'S'}`, '', 'magenta'),
      fmt(' CRZ FL/TEMP', 'LONG', '', 'white'),
      fmt(` ${performance.crzAlt ? `FL${String(performance.crzAlt).slice(0,3)}` : '-----'}/--°`, ` ${Math.abs(position.lon).toFixed(1)}${position.lon >= 0 ? 'E' : 'W'}`, '', 'magenta'),
      blank(),
      fmt(' TROPO', '', '', 'white'),
      fmt(' 36090', '', '', 'green'),
      blank(),
      fmt('', isAligning ? `IN ALIGN ${Math.ceil(position.irsTimeRemaining/60)} MIN` : isNav ? 'IRS RELAY >' : '<IRS INIT', 'INIT B >', 'magenta'),
    ],
    lskActions: {
      L1: 'data_index', L2: 'set_flt_nbr', L3: 'set_cost_index', L4: 'set_crz_fl',
      L5: null, L6: isNav ? 'irs_relay' : 'align_irs',
      R1: 'set_from_to', R2: 'set_altn', R3: null,
      R4: null, R5: null, R6: 'init_b',
    },
  };
}

export function renderInitB(state: FMCState): DisplayData {
  const { performance, route } = state;
  return {
    title: 'INIT',
    pageIndicator: 'B',
    lines: [
      inv('  INIT              B', '', '', 'cyan'),
      fmt(' ZFW', '<', '', 'white'),
      fmt(` ${performance.zfw ? (performance.zfw / 1000).toFixed(1) : '---.-'}`, '', '', 'magenta'),
      fmt(' BLOCK', '<', '', 'white'),
      fmt(` ${performance.fuel ? (performance.fuel / 1000).toFixed(1) : '---.-'}`, '', '', 'magenta'),
      fmt(' CG', '<', '', 'white'),
      fmt(` ${performance.cg ? performance.cg.toFixed(1) : '--.-'}`, '', '', 'magenta'),
      blank(),
      blank(),
      blank(),
      blank(),
      blank(),
      blank(),
      blank(),
   ],
    lskActions: {
      L1: 'set_zfw', L2: 'set_block', L3: 'set_cg', L4: null,
      L5: null, L6: null,
      R1: 'init_a', R2: null, R3: null, R4: null,
      R5: null, R6: null,
    },
  };
}

export function renderDepArrA320(state: FMCState): DisplayData {
  const route = state.isModified && state.pendingRoute ? state.pendingRoute : state.route;
  const title = state.isModified ? 'TMPY DEP/ARR' : 'DEP/ARR';
  return {
    title,
    pageIndicator: '',
    lines: [
      inv(`  ${title}     ${route.origin || '----'} / ${route.destination || '----'}`, '', '', 'cyan'),
      fmt(' DEPARTURE', '', '', 'white'),
      fmt(` ${route.origin || '----'}`, '', '', 'green'),
      fmt('  SID', '<', '', 'white'),
      fmt(`   ${route.sid || 'NONE'}`, '', '', 'magenta'),
      fmt('  RWY', '<', '', 'white'),
      fmt(`   ${route.runway || '----'}`, '', '', 'magenta'),
      fmt(' ARRIVAL', '', '', 'white'),
      fmt(` ${route.destination || '----'}`, '', '', 'green'),
      fmt('  STAR', '<', '', 'white'),
      fmt(`   ${route.star || 'NONE'}`, '', '', 'magenta'),
      fmt('  APPR', '<', '', 'white'),
      fmt(`   ${route.approach || 'NONE'}`, '', '', 'magenta'),
      blank(),
   ],
    lskActions: {
      L1: null, L2: 'set_sid', L3: 'set_rwy', L4: null,
      L5: 'set_star', L6: 'set_appr',
      R1: null, R2: null, R3: null, R4: null,
      R5: null, R6: null,
    },
  };
}

export function renderPerfTakeoff(state: FMCState): DisplayData {
  const { takeoff } = state;
  return {
    title: 'PERF',
    pageIndicator: 'TO',
    lines: [
      inv('  PERF              TO', '', '', 'cyan'),
      fmt(' V1', '', `${takeoff.v1 ? `${takeoff.v1}` : '[  ]'}`, 'white'),
      fmt(' VR', '', `${takeoff.vr ? `${takeoff.vr}` : '[  ]'}`, 'white'),
      fmt(' V2', '', `${takeoff.v2 ? `${takeoff.v2}` : '[  ]'}`, 'white'),
      fmt(' TRANS ALT', '', '', 'white'),
      fmt(' 5000', '', '', 'green'),
      fmt(' THR RED/ACC', '', '', 'white'),
      fmt(' 1500/3000', '', '', 'green'),
      fmt(' FLAPS/THS', '', '', 'white'),
      fmt(` ${takeoff.flaps || '1'}/UP0.0`, '', '', 'magenta'),
      fmt(' FLEX TO TEMP', '', '', 'white'),
      fmt(`  ${takeoff.flexTemp ? `${takeoff.flexTemp}°` : '---'}`, '', '', 'magenta'),
      fmt(' ENG OUT ACC', '', '', 'white'),
      fmt(' 1500', '', 'NEXT PHASE>', 'magenta'),
   ],
    lskActions: {
      L1: 'set_v1', L2: 'set_vr', L3: 'set_v2', L4: null,
      L5: 'set_flaps', L6: 'set_flex',
      R1: null, R2: null, R3: null, R4: null,
      R5: null, R6: 'perf_appr',
    },
  };
}

export function renderPerfAppr(state: FMCState): DisplayData {
  return {
    title: 'PERF',
    pageIndicator: 'APPR',
    lines: [
      inv('  PERF              APPR', '', '', 'cyan'),
      fmt(' QNH', '<', '', 'white'),
      fmt(' 1013', '', '', 'magenta'),
      fmt(' TEMP', '', '', 'white'),
      fmt(' 15°C', '', '', 'magenta'),
      fmt(' WIND', '<', '', 'white'),
      fmt(' ---/---', '', '', 'magenta'),
      fmt(' MDA', '', '', 'white'),
      fmt(' ----', '', '', 'magenta'),
      fmt(' DH', '', '', 'white'),
      fmt(' ----', '', '', 'magenta'),
      fmt(' LDG CONF', '', '', 'white'),
      fmt(' FULL', '', '', 'green'),
      blank(),
   ],
    lskActions: {
      L1: 'set_qnh', L2: null, L3: null, L4: null,
      L5: 'set_wind', L6: null,
      R1: null, R2: null, R3: null, R4: null,
      R5: null, R6: 'perf_to',
    },
  };
}

export function renderFuelPred(state: FMCState): DisplayData {
  const { route, performance } = state;
  return {
    title: 'FUEL PRED',
    pageIndicator: '',
    lines: [
      inv('  FUEL PRED', '', '', 'cyan'),
       fmt(` ${route.origin || '----'} / ${route.destination || '----'}`, '', '', 'green'),
       fmt(' FOB', '', `${performance.fuel ? (performance.fuel/1000).toFixed(1) : '---.-'} T`, 'white'),
       fmt(' EXTRA', '', '', 'white'),
       fmt(` ${(performance.fuel > 0 ? (performance.fuel - 5000)/1000 : 0).toFixed(1)}`, '', '', 'magenta'),
       fmt(' MIN DEST FOB', '', '', 'white'),
       fmt(' 2.5', '', '', 'green'),
       fmt(' ALTN', '', '', 'white'),
       fmt(`   ${route.alternate || '----'}`, '', '', 'green'),
       fmt('  ALTN FOB', '', '', 'white'),
       fmt(`   0.0`, '', `${performance.reserve ? (performance.reserve/1000).toFixed(1) : '--.-'}`, 'green'),
       fmt(' EXTRA/TIME', '', '', 'white'),
       fmt(` ${(performance.fuel > 0 ? (performance.fuel - 5000)/1000 : 0).toFixed(1)}    00:45`, '', '', 'green'),
       fmt(' FINAL/TIME', '', '', 'white'),
    ],
    lskActions: {
      L1: null, L2: null, L3: null, L4: null,
      L5: null, L6: null,
      R1: null, R2: null, R3: null, R4: null,
      R5: null, R6: null,
    },
  };
}

export function renderSecFpln(state: FMCState): DisplayData {
  return {
    title: 'SEC F-PLN',
    pageIndicator: '1/1',
    lines: [
      inv('  SEC F-PLN         1/1', '', '', 'cyan'),
      fmt(' COPY ACTIVE', '', '', 'white'),
      fmt(' ', '', '', 'white'),
      fmt(' FROM/TO', '', '', 'white'),
      fmt(' ----/----', '', '', 'magenta'),
      blank(),
      blank(),
      blank(),
      blank(),
      blank(),
      blank(),
      blank(),
      blank(),
      blank(),
   ],
    lskActions: {
      L1: 'copy_active', L2: null, L3: null, L4: null,
      L5: null, L6: null,
      R1: null, R2: null, R3: null, R4: null,
      R5: null, R6: null,
    },
  };
}

export function renderRadNav(state: FMCState): DisplayData {
  const { radios } = state;
  return {
    title: 'RAD NAV',
    pageIndicator: '',
    lines: [
      inv('  RAD NAV', '', '', 'cyan'),
      fmt(' VOR1/FREQ', '', '', 'white'),
      fmt(` --- / ${radios.vor1}`, '<', '', 'magenta'),
      fmt(' VOR2/FREQ', '', '', 'white'),
      fmt(` --- / ${radios.vor2}`, '<', '', 'magenta'),
      fmt(' ADF1/FREQ', '', '', 'white'),
      fmt(` ${radios.adf1}`, '<', '', 'magenta'),
      blank(),
      blank(),
      blank(),
      blank(),
      blank(),
      blank(),
      blank(),
    ],
    lskActions: {
      L1: 'set_vor1', L2: 'set_vor2', L3: 'set_adf1', L4: null,
      L5: null, L6: null,
      R1: null, R2: null, R3: null, R4: null,
      R5: null, R6: null,
    },
  };
}

export function renderProgA320(state: FMCState): DisplayData {
  const { route, performance } = state;
  return {
    title: 'PROG',
    pageIndicator: '',
    lines: [
      inv('  PROG', '', '', 'cyan'),
      fmt(` ${route.origin || '----'} / ${route.destination || '----'}`, '', '', 'green'),
      fmt(' CRZ FL', '', `FL${performance.crzAlt ? String(performance.crzAlt).slice(0,3) : '---'}`, 'white'),
      fmt(' OPT FL', '', '---', 'white'),
      fmt(' REC MAX FL', '', '---', 'white'),
      fmt(' DIST', '', '---- NM', 'white'),
      fmt(' ETA', '', '----Z', 'white'),
      fmt(' EFOB', '', '---.-', 'white'),
      fmt(' WIND', '', '', 'white'),
      fmt(' ---°/---', '', '', 'green'),
      fmt(' NAV ACCUR', 'REQUIRED', '', 'white'),
      fmt(` ${state.navPerformance.anpNm > state.navPerformance.rnpNm ? 'LOW' : 'HIGH'}`, `   ${state.navPerformance.rnpNm.toFixed(2)}`, '', 'green'),
      blank(),
      blank(),
   ],
    lskActions: {
      L1: null, L2: null, L3: null, L4: null,
      L5: null, L6: null,
      R1: null, R2: null, R3: null, R4: null,
      R5: null, R6: null,
    },
  };
}

export function renderDataIndex(state: FMCState): DisplayData {
  return {
    title: 'DATA',
    pageIndicator: 'INDEX',
    lines: [
      inv('  DATA          INDEX', '', '', 'cyan'),
      fmt(' A/C STATUS', '', '', 'white'),
      fmt(' POSITION MONITOR', '', '', 'white'),
      fmt(' IRS MONITOR', '', '', 'white'),
      fmt(' GPS MONITOR', '', '', 'white'),
      fmt(' WAYPOINTS', '', '', 'white'),
      fmt(' NAVAIDS', '', '', 'white'),
      fmt(' RUNWAYS', '', '', 'white'),
      fmt(' ROUTES', '', '', 'white'),
      blank(),
      blank(),
      blank(),
      blank(),
      blank(),
   ],
    lskActions: {
      L1: 'ac_status', L2: null, L3: null, L4: null,
      L5: null, L6: null,
      R1: null, R2: null, R3: null, R4: null,
      R5: null, R6: null,
    },
  };
}

export function renderMcduMenu(state: FMCState): DisplayData {
  return {
    title: 'MCDU MENU',
    pageIndicator: '',
    lines: [
      inv('  MCDU MENU', '', '', 'cyan'),
      fmt(' FMGC', '<', '', 'magenta'),
      fmt(' SELECT', '', '', 'green'),
      fmt(' ATSU', '<', '', 'magenta'),
      fmt(' SELECT', '', '', 'green'),
      fmt(' AIDS', '<', '', 'magenta'),
      fmt(' SELECT', '', '', 'green'),
      fmt(' CFDS', '<', '', 'magenta'),
      fmt(' SELECT', '', '', 'green'),
      blank(),
      blank(),
      blank(),
      blank(),
    ],
    lskActions: {
      L1: 'f_pln',
      L2: 'atsu',
    },
  };
}
