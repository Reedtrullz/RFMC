import type { FMCState, DisplayData, AirbusPageType, PageType, DisplayLine } from '../../../types/fmc';
import { inferAirbusSemantic } from '../../pageLineSemantics';

const W = 24;
function fmt(text: string, left: string = '', right: string = '', color?: DisplayLine['color']): DisplayLine {
  return { text: text.padEnd(W, ' '), leftLabel: left, rightLabel: right, inverse: false, color, semantic: inferAirbusSemantic(color) };
}
function inv(text: string, left: string = '', right: string = '', color?: DisplayLine['color']): DisplayLine {
  return { text: text.padEnd(W, ' '), leftLabel: left, rightLabel: right, inverse: true, color, semantic: inferAirbusSemantic(color, true) };
}
function blank() { return fmt(''); }

const AIRBUS_PAGES: readonly string[] = ['INIT_A', 'INIT_B', 'F_PLN', 'DEP_ARR_A', 'PERF_TAKEOFF', 'PERF_APPR', 'FUEL_PRED', 'SEC_FPLN', 'RAD_NAV', 'PROG_A', 'DATA_INDEX', 'MCDU_MENU'];

export function getAirbusPageRenderer(page: PageType): ((state: FMCState) => DisplayData) | null {
  if (!AIRBUS_PAGES.includes(page)) return null;
  const renderers: Record<AirbusPageType, (state: FMCState) => DisplayData> = {
    INIT_A:             renderInitA,
    INIT_B:             renderInitB,
    F_PLN:              renderFpln,
    DEP_ARR_A:          renderDepArrA320,
    PERF_TAKEOFF:       renderPerfTakeoff,
    PERF_APPR:          renderPerfAppr,
    FUEL_PRED:          renderFuelPred,
    SEC_FPLN:           renderSecFpln,
    RAD_NAV:            renderRadNav,
    PROG_A:             renderProgA320,
    DATA_INDEX:         renderDataIndex,
    MCDU_MENU:          renderMcduMenu,
  };
  return renderers[page as AirbusPageType];
}

export function renderInitA(state: FMCState): DisplayData {
  const route = state.isModified && state.pendingRoute ? state.pendingRoute : state.route;
  const { performance } = state;
  const title = state.isModified ? 'TMPY INIT' : 'INIT';
  return {
    title,
    pageIndicator: 'A',
    lines: [
      inv(`  ${title}              A`, '', '', 'cyan'),
      fmt(' FROM/TO', 'ALN', '', 'white'),
      fmt(` ${route.origin || '----'}/${route.destination || '----'}`, ` ${route.alternate || '----'}`, '', 'magenta'),
      fmt(' COST INDEX', 'FLT NBR', '', 'white'),
      fmt(` ${performance.costIndex || '---'}`, ` ${route.flightNumber || '--------'}`, '', 'magenta'),
      fmt(' CRZ FL', '', '', 'white'),
      fmt(` ${performance.crzAlt ? `FL${String(performance.crzAlt).slice(0,3)}` : '-----'}`, '', '', 'magenta'),
      blank(),
      blank(),
      blank(),
      blank(),
      fmt('', '→', '', 'magenta'),
      blank(),
    ],
    lskActions: {
      L1: 'set_from_to', L2: 'set_cost_index', L3: 'set_crz_fl',
      L4: null, L5: null, L6: null,
      R1: 'set_altn', R2: 'set_flt_nbr', R3: null,
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

export function renderFpln(state: FMCState): DisplayData {
  const route = state.isModified && state.pendingRoute ? state.pendingRoute : state.route;
  const flightPlan = state.isModified && state.pendingFlightPlan ? state.pendingFlightPlan : state.flightPlan;
  const wpts = flightPlan.waypoints;
  const title = state.isModified ? 'TMPY F-PLN' : 'F-PLN';
  const lines = [inv(`  ${title}     ${route.origin || '----'} / ${route.destination || '----'}`, '', '', 'cyan')];
  
  for (let i = 0; i < Math.min(wpts.length, 10); i++) {
    const wp = wpts[i];
    if (wp.discontinuity) {
      lines.push(fmt(' ----- DISCONTINUITY', '', '', 'amber'));
    } else {
      lines.push(fmt(` ${wp.ident}`, '', '', 'green'));
    }
  }
  while (lines.length < 14) lines.push(blank());
  return {
    title: 'F-PLN',
    pageIndicator: '1',
    lines: lines.slice(0, 14),
    lskActions: buildFplnActions(state),
  };
}

function buildFplnActions(state: FMCState): Record<string, string | null> {
  const actions: Record<string, string | null> = {};
  for (let i = 1; i <= 6; i++) { actions[`L${i}`] = null; actions[`R${i}`] = null; }
  actions['L1'] = 'fpln_dep_arr';
  actions['R6'] = null;
  return actions;
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
      fmt(' V1', '', `${takeoff.v1 ? `${takeoff.v1} KT` : '---'}`, 'white'),
      fmt(' VR', '', `${takeoff.vr ? `${takeoff.vr} KT` : '---'}`, 'white'),
      fmt(' V2', '', `${takeoff.v2 ? `${takeoff.v2} KT` : '---'}`, 'white'),
      fmt(' FLAPS', '<', '', 'white'),
      fmt(` ${takeoff.flaps || 'CONF 2'}`, '', '', 'magenta'),
      fmt(' FLEX TO TEMP', '<', '', 'white'),
      fmt(` ${takeoff.flexTemp ? `${takeoff.flexTemp}°C` : '---'}`, '', '', 'magenta'),
      fmt(' TRANS ALT', '', '', 'white'),
      fmt(' 5000', '', '', 'green'),
      blank(),
      blank(),
      blank(),
      blank(),
   ],
    lskActions: {
      L1: 'set_v1', L2: null, L3: 'set_vr', L4: null,
      L5: 'set_v2', L6: null,
      R1: 'set_flaps', R2: null, R3: 'set_flex', R4: null,
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
      fmt(' 0.0', '', '', 'magenta'),
      fmt(' MIN DEST FOB', '', '', 'white'),
      fmt(' 2.5', '', '', 'green'),
      fmt(' ALTN', '', '', 'white'),
      fmt(`   ${route.alternate || '----'}`, '', '', 'green'),
      fmt('  ALTN FOB', '', '', 'white'),
      fmt(`   0.0`, '', `${performance.reserve ? (performance.reserve/1000).toFixed(1) : '--.-'}`, 'green'),
      fmt(' EXTRA/TIME', '', '', 'white'),
      fmt(' ----     ----', '', '', 'green'),
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
      L1: null, L2: null, L3: null, L4: null,
      L5: null, L6: null,
      R1: null, R2: null, R3: null, R4: null,
      R5: null, R6: null,
    },
  };
}

export function renderRadNav(state: FMCState): DisplayData {
  return {
    title: 'RAD NAV',
    pageIndicator: '1/1',
    lines: [
      inv('  RAD NAV           1/1', '', '', 'cyan'),
      fmt(' VOR 1', '', '', 'white'),
      fmt(' ----/----', '', '', 'magenta'),
      fmt(' VOR 2', '', '', 'white'),
      fmt(' ----/----', '', '', 'magenta'),
      fmt(' ADF 1', '', '', 'white'),
      fmt(' ----', '', '', 'magenta'),
      fmt(' ADF 2', '', '', 'white'),
      fmt(' ----', '', '', 'magenta'),
      blank(),
      blank(),
      blank(),
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
      blank(),
      blank(),
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
      L1: null, L2: null, L3: null, L4: null,
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
      fmt(' INIT', '<', '', 'magenta'),
      fmt(' INITIALIZE', '', '', 'green'),
      fmt(' F-PLN', '<', '', 'magenta'),
      fmt(' FLIGHT PLAN', '', '', 'green'),
      fmt(' PERF', '<', '', 'magenta'),
      fmt(' PERFORMANCE', '', '', 'green'),
      fmt(' FUEL PRED', '<', '', 'magenta'),
      fmt(' FUEL PREDICTION', '', '', 'green'),
      fmt(' SEC F-PLN', '<', '', 'magenta'),
      fmt(' SECONDARY FLT PLN', '', '', 'green'),
      fmt(' RAD NAV', '<', '', 'magenta'),
      fmt(' RADIO NAVIGATION', '', '', 'green'),
    ],
    lskActions: {
      L1: 'init_a', L2: null, L3: 'f_pln', L4: null,
      L5: 'perf_to', L6: null,
      R1: 'fuel_pred', R2: null, R3: 'sec_fpln', R4: null,
      R5: 'rad_nav', R6: null,
    },
  };
}
