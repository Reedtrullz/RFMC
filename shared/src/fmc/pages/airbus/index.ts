import type { FMCState, DisplayData, AirbusPageType } from '../../../types/fmc';

const W = 24;
function fmt(text: string, left: string = '', right: string = ''): { text: string; leftLabel: string; rightLabel: string; inverse: boolean } {
  return { text: text.padEnd(W, ' '), leftLabel: left, rightLabel: right, inverse: false };
}
function inv(text: string, left: string = '', right: string = ''): { text: string; leftLabel: string; rightLabel: string; inverse: boolean } {
  return { text: text.padEnd(W, ' '), leftLabel: left, rightLabel: right, inverse: true };
}
function blank() { return fmt(''); }

export function getAirbusPageRenderer(page: AirbusPageType): (state: FMCState) => DisplayData {
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
  return renderers[page];
}

// ============================================================
// INIT A — From/To, Alternate, Cost Index, Cruise FL
// ============================================================
export function renderInitA(state: FMCState): DisplayData {
  const { route, performance } = state;
  return {
    title: 'INIT',
    pageIndicator: 'A',
    lines: [
      inv('  INIT              A'),
      fmt(' FROM/TO', ''),
      fmt(` ${route.origin || '----'}/${route.destination || '----'}`),
      blank(),
      fmt(' COST INDEX', '<'),
      fmt(` ${performance.costIndex || '---'}`),
      fmt(' CRZ FL', '<'),
      fmt(` ${performance.crzAlt ? `FL${String(performance.crzAlt).slice(0,3)}` : '-----'}`),
      blank(),
      fmt(' ALTN', '<'),
      fmt(` ${route.alternate || '----'}`),
      blank(),
      blank(),
      fmt(' FLT NBR', '<'),
      fmt(` ${route.flightNumber || '--------'}`),
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
      L1: 'set_from_to', L2: null, L3: 'set_cost_index', L4: null,
      L5: 'set_crz_fl', L6: null,
      R1: 'set_altn', R2: null, R3: 'set_flt_nbr', R4: null,
      R5: null, R6: 'init_b',
    },
  };
}

// ============================================================
// INIT B — ZFW, Block Fuel, CG
// ============================================================
export function renderInitB(state: FMCState): DisplayData {
  const { performance, route } = state;
  return {
    title: 'INIT',
    pageIndicator: 'B',
    lines: [
      inv('  INIT              B'),
      fmt(' ZFW', '<'),
      fmt(` ${performance.zfw ? (performance.zfw / 1000).toFixed(1) : '---.-'}`),
      fmt(' BLOCK', '<'),
      fmt(` ${performance.fuel ? (performance.fuel / 1000).toFixed(1) : '---.-'}`),
      blank(),
      blank(),
      fmt(' CG', '<'),
      fmt(` ${performance.cg ? performance.cg.toFixed(1) : '--.-'}`),
      blank(),
      blank(),
      blank(),
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
      L1: 'set_zfw', L2: null, L3: 'set_block', L4: null,
      L5: 'set_cg', L6: null,
      R1: 'init_a', R2: null, R3: null, R4: null,
      R5: null, R6: null,
    },
  };
}

// ============================================================
// F-PLN — Flight Plan
// ============================================================
export function renderFpln(state: FMCState): DisplayData {
  const { flightPlan, route } = state;
  const wpts = flightPlan.waypoints;
  const lines = [inv(`  F-PLN             ${route.origin || '----'} / ${route.destination || '----'}`)];
  
  for (let i = 0; i < Math.min(wpts.length, 10); i++) {
    const wp = wpts[i];
    if (wp.discontinuity) {
      lines.push(fmt(' ----- DISCONTINUITY'));
    } else {
      lines.push(fmt(` ${wp.ident}`));
    }
  }
  while (lines.length < 24) lines.push(blank());
  return {
    title: 'F-PLN',
    pageIndicator: '1',
    lines: lines.slice(0, 24),
    lskActions: buildFplnActions(state),
  };
}

function buildFplnActions(state: FMCState): Record<string, string | null> {
  const actions: Record<string, string | null> = {};
  for (let i = 1; i <= 6; i++) { actions[`L${i}`] = null; actions[`R${i}`] = null; }
  actions['L1'] = 'fpln_dep_arr';
  actions['R6'] = 'fpln_next';
  return actions;
}

// ============================================================
// DEP/ARR A320
// ============================================================
export function renderDepArrA320(state: FMCState): DisplayData {
  const { route } = state;
  return {
    title: 'DEP/ARR',
    pageIndicator: '',
    lines: [
      inv(`  DEP/ARR     ${route.origin || '----'} / ${route.destination || '----'}`),
      fmt(''),
      fmt(' DEPARTURE', ''),
      fmt(` ${route.origin || '----'}`),
      fmt('  SID', '<'),
      fmt(`   ${route.sid || 'NONE'}`),
      fmt('  RWY', '<'),
      fmt(`   ${route.runway || '----'}`),
      blank(),
      fmt(' ARRIVAL', ''),
      fmt(` ${route.destination || '----'}`),
      fmt('  STAR', '<'),
      fmt(`   ${route.star || 'NONE'}`),
      fmt('  APPR', '<'),
      fmt(`   ${route.approach || 'NONE'}`),
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
      L1: 'set_sid', L2: null, L3: 'set_rwy', L4: null,
      L5: 'set_star', L6: null,
      R1: 'set_appr', R2: null, R3: null, R4: null,
      R5: null, R6: null,
    },
  };
}

// ============================================================
// PERF TAKEOFF
// ============================================================
export function renderPerfTakeoff(state: FMCState): DisplayData {
  const { takeoff } = state;
  return {
    title: 'PERF',
    pageIndicator: 'TO',
    lines: [
      inv('  PERF              TO'),
      fmt(''),
      fmt(' V1', '', `${takeoff.v1 ? `${takeoff.v1} KT` : '---'}`),
      fmt(' VR', '', `${takeoff.vr ? `${takeoff.vr} KT` : '---'}`),
      fmt(' V2', '', `${takeoff.v2 ? `${takeoff.v2} KT` : '---'}`),
      blank(),
      fmt(' FLAPS', '<'),
      fmt(` ${takeoff.flaps || 'CONF 2'}`),
      fmt(' FLEX TO TEMP', '<'),
      fmt(` ${takeoff.flexTemp ? `${takeoff.flexTemp}°C` : '---'}`),
      blank(),
      blank(),
      blank(),
      fmt(' TRANS ALT', '<'),
      fmt(' 5000'),
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
      L1: 'set_v1', L2: null, L3: 'set_vr', L4: null,
      L5: 'set_v2', L6: null,
      R1: 'set_flaps', R2: null, R3: 'set_flex', R4: null,
      R5: null, R6: 'perf_appr',
    },
  };
}

// ============================================================
// PERF APPR
// ============================================================
export function renderPerfAppr(state: FMCState): DisplayData {
  return {
    title: 'PERF',
    pageIndicator: 'APPR',
    lines: [
      inv('  PERF              APPR'),
      fmt(''),
      fmt(' QNH', '<'),
      fmt(' 1013'),
      fmt(' TEMP', '<'),
      fmt(' 15°C'),
      blank(),
      fmt(' WIND', '<'),
      fmt(' ---/---'),
      blank(),
      blank(),
      blank(),
      fmt(' MDA', '<'),
      fmt(' ----'),
      fmt(' DH', '<'),
      fmt(' ----'),
      blank(),
      blank(),
      fmt(' LDG CONF', '<'),
      fmt(' FULL'),
      blank(),
      blank(),
      blank(),
      blank(),
    ],
    lskActions: {
      L1: 'set_qnh', L2: null, L3: 'set_temp', L4: null,
      L5: 'set_wind', L6: null,
      R1: 'set_mda', R2: null, R3: 'set_dh', R4: null,
      R5: null, R6: 'perf_to',
    },
  };
}

// ============================================================
// FUEL PRED
// ============================================================
export function renderFuelPred(state: FMCState): DisplayData {
  const { route, performance } = state;
  return {
    title: 'FUEL PRED',
    pageIndicator: '',
    lines: [
      inv('  FUEL PRED'),
      fmt(` ${route.origin || '----'} / ${route.destination || '----'}`),
      blank(),
      fmt(' FOB', '', `${performance.fuel ? (performance.fuel/1000).toFixed(1) : '---.-'} T`),
      fmt(' EXTRA', '<'),
      fmt(' 0.0'),
      blank(),
      blank(),
      fmt(' MIN DEST FOB', ''),
      fmt(' 2.5'),
      fmt(' ALTN', '', ''),
      fmt(`   ${route.alternate || '----'}`),
      fmt('  ALTN FOB', '', ''),
      fmt(`   0.0`, '', `${performance.reserve ? (performance.reserve/1000).toFixed(1) : '--.-'}`),
      fmt(' EXTRA/TIME', ''),
      fmt(' ----     ----'),
      fmt(' FINAL/TIME', ''),
      fmt(' ----     ----'),
      blank(),
      blank(),
      blank(),
      blank(),
      blank(),
    ],
    lskActions: {
      L1: null, L2: null, L3: 'set_extra', L4: null,
      L5: null, L6: null,
      R1: null, R2: null, R3: null, R4: null,
      R5: null, R6: null,
    },
  };
}

// ============================================================
// SEC F-PLN
// ============================================================
export function renderSecFpln(state: FMCState): DisplayData {
  return {
    title: 'SEC F-PLN',
    pageIndicator: '1/1',
    lines: [
      inv('  SEC F-PLN         1/1'),
      fmt(' COPY ACTIVE', ''),
      fmt(' '),
      blank(),
      fmt(' FROM/TO', '<'),
      fmt(' ----/----'),
      blank(),
      blank(),
      blank(),
      blank(),
      blank(),
      blank(),
      blank(),
      blank(),
      blank(),
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
      L1: 'copy_active', L2: null, L3: 'set_sec_from_to', L4: null,
      L5: null, L6: null,
      R1: 'activate_sec', R2: null, R3: null, R4: null,
      R5: null, R6: null,
    },
  };
}

// ============================================================
// RAD NAV
// ============================================================
export function renderRadNav(state: FMCState): DisplayData {
  return {
    title: 'RAD NAV',
    pageIndicator: '1/1',
    lines: [
      inv('  RAD NAV           1/1'),
      fmt(''),
      fmt(' VOR 1', '<'),
      fmt(' ----/----'),
      fmt(' VOR 2', '<'),
      fmt(' ----/----'),
      blank(),
      fmt(' ADF 1', '<'),
      fmt(' ----'),
      fmt(' ADF 2', '<'),
      fmt(' ----'),
      blank(),
      blank(),
      blank(),
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
      L1: 'set_vor1', L2: null, L3: 'set_vor2', L4: null,
      L5: 'set_adf1', L6: null,
      R1: null, R2: null, R3: null, R4: null,
      R5: null, R6: null,
    },
  };
}

// ============================================================
// PROG
// ============================================================
export function renderProgA320(state: FMCState): DisplayData {
  const { route, performance } = state;
  return {
    title: 'PROG',
    pageIndicator: '',
    lines: [
      inv('  PROG'),
      fmt(` ${route.origin || '----'} / ${route.destination || '----'}`),
      blank(),
      fmt(' CRZ FL', '', `FL${performance.crzAlt ? String(performance.crzAlt).slice(0,3) : '---'}`),
      fmt(' OPT FL', '', '---'),
      fmt(' REC MAX FL', '', '---'),
      blank(),
      fmt(' DIST', '', '---- NM'),
      fmt(' ETA', '', '----Z'),
      fmt(' EFOB', '', '---.-'),
      blank(),
      blank(),
      fmt(' WIND', ''),
      fmt(' ---°/---'),
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

// ============================================================
// DATA INDEX
// ============================================================
export function renderDataIndex(state: FMCState): DisplayData {
  return {
    title: 'DATA',
    pageIndicator: 'INDEX',
    lines: [
      inv('  DATA          INDEX'),
      blank(),
      fmt(' A/C STATUS', '<'),
      fmt(' POSITION MONITOR', '<'),
      fmt(' IRS MONITOR', '<'),
      fmt(' GPS MONITOR', '<'),
      blank(),
      fmt(' WAYPOINTS', '<'),
      fmt(' NAVAIDS', '<'),
      fmt(' RUNWAYS', '<'),
      fmt(' ROUTES', '<'),
      blank(),
      blank(),
      blank(),
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

// ============================================================
// MCDU MENU
// ============================================================
export function renderMcduMenu(state: FMCState): DisplayData {
  return {
    title: 'MCDU MENU',
    pageIndicator: '',
    lines: [
      inv('  MCDU MENU'),
      blank(),
      fmt(' INIT', '<'),
      fmt(' INITIALIZE'),
      fmt(' F-PLN', '<'),
      fmt(' FLIGHT PLAN'),
      fmt(' PERF', '<'),
      fmt(' PERFORMANCE'),
      fmt(' FUEL PRED', '<'),
      fmt(' FUEL PREDICTION'),
      fmt(' SEC F-PLN', '<'),
      fmt(' SECONDARY FLT PLN'),
      fmt(' RAD NAV', '<'),
      fmt(' RADIO NAVIGATION'),
      fmt(' DATA', '<'),
      fmt(' DATA INDEX'),
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
      L1: 'init_a', L2: null, L3: 'f_pln', L4: null,
      L5: 'perf_to', L6: null,
      R1: 'fuel_pred', R2: null, R3: 'sec_fpln', R4: null,
      R5: 'rad_nav', R6: null,
    },
  };
}
