import type { FMCState, DisplayData } from '../../types/fmc';
import { PAGE_LINES, PAGE_WIDTH } from '../constants';

function fmt(text: string, left: string = '', right: string = ''): { text: string; leftLabel: string; rightLabel: string; inverse: boolean } {
  return { text: text.padEnd(PAGE_WIDTH, ' '), leftLabel: left, rightLabel: right, inverse: false };
}
function inverse(text: string, left: string = '', right: string = ''): { text: string; leftLabel: string; rightLabel: string; inverse: boolean } {
  return { ...fmt(text, left, right), inverse: true };
}
function blank() { return fmt('', '', ''); }

export function renderLegsPage(state: FMCState): DisplayData {
  const { flightPlan, legsPageIndex, legsPageCount } = state;
  const waypoints = flightPlan.waypoints;
  const perPage = 5;
  const totalPages = Math.max(1, Math.ceil(waypoints.length / perPage));
  const start = legsPageIndex * perPage;
  const pageWaypoints = waypoints.slice(start, start + perPage);

  const lines = [
    inverse(`  LEGS          ${legsPageIndex + 1}/${totalPages}`),
  ];

  for (const wp of pageWaypoints) {
    if (wp.discontinuity) {
      lines.push(fmt(' ----- DISCONTINUITY', '<'));
      lines.push(fmt(' -----              '));
    } else {
      const alt = wp.altitudeConstraint
        ? `FL${String(wp.altitudeConstraint.altitude).slice(0, 3)}`
        : '----';
      const spd = wp.speedConstraint
        ? `${wp.speedConstraint.speed}KT`
        : '---KT';
      lines.push(fmt(` ${wp.ident}`, '<'));
      lines.push(fmt(`  ${alt} ${spd}`, '', ''));
    }
  }

  // Pad to 14 lines
  while (lines.length < PAGE_LINES) {
    lines.push(blank());
  }

  return {
    title: 'LEGS',
    pageIndicator: `${legsPageIndex + 1}/${totalPages}`,
    lines: lines.slice(0, PAGE_LINES),
    lskActions: getLegsLskActions(state),
  };
}

function getLegsLskActions(state: FMCState): Record<string, string | null> {
  const actions: Record<string, string | null> = {};
  const { flightPlan, legsPageIndex } = state;
  const perPage = 5;
  const start = legsPageIndex * perPage;
  const waypoints = flightPlan.waypoints;
  const totalPages = Math.max(1, Math.ceil(waypoints.length / perPage));

  const wpIndices = waypoints.slice(start, start + perPage);
  const lskKeys: string[] = [];

  for (let i = 0; i < wpIndices.length; i++) {
    lskKeys.push(`L${i + 1}`);
    lskKeys.push(`R${i + 1}`);
  }

  for (const key of lskKeys) {
    actions[key] = null; // Will be wired to "edit waypoint" logic in store
  }

  // Navigation for multi-page
  if (totalPages > 1) {
    if (legsPageIndex < totalPages - 1) {
      actions['L6'] = 'next_page';
    }
    if (legsPageIndex > 0) {
      actions['R6'] = 'prev_page';
    }
  }

  return actions;
}

export function renderProgressPage(state: FMCState): DisplayData {
  const { flightPlan, performance } = state;
  const origin = flightPlan.origin || '----';
  const dest = flightPlan.destination || '----';

  return {
    title: 'PROGRESS',
    pageIndicator: '1/1',
    lines: [
      inverse('  PROGRESS          1/1'),
      fmt(` ${origin} -> ${dest}`, '', ''),
      blank(),
      fmt(' ALT', '', ''),
      fmt(` ${performance.crzAlt ? `FL${String(performance.crzAlt).slice(0, 3)}` : '---'}`),
      blank(),
      fmt(' DTG', '', ` ---- NM`),
      fmt(' ETA', '', ` ----Z`),
      fmt(' FUEL REM', '', ` ---.-`),
      fmt(' WIND', '', ` ---/---`),
      fmt(' TAS', '', ` --- KT`),
      blank(),
      blank(),
      blank(),
    ],
    lskActions: {
      L1: null, L2: null, L3: null, L4: null, L5: null, L6: null,
      R1: null, R2: null, R3: null, R4: null, R5: null, R6: null,
    },
  };
}

export function renderHoldPage(state: FMCState): DisplayData {
  return {
    title: 'HOLD',
    pageIndicator: '1/1',
    lines: [
      inverse('  HOLD             1/1'),
      blank(),
      fmt(' FIX', '<'),
      fmt(' ----'),
      blank(),
      fmt(' INBOUND CRS', '<'),
      fmt(' ---'),
      fmt(' LEG TIME', '<'),
      fmt(' 1.0 MIN'),
      blank(),
      fmt(' LEG DIST', '<'),
      fmt(' ---'),
      blank(),
      blank(),
      blank(),
    ],
    lskActions: {
      L1: 'set_hold_fix',
      L2: null, L3: null, L4: null, L5: null, L6: null,
      R1: 'set_inbound_crs',
      R2: null, R3: null, R4: null, R5: null, R6: null,
    },
  };
}

export function renderFixPage(state: FMCState): DisplayData {
  return {
    title: 'FIX',
    pageIndicator: '1/1',
    lines: [
      inverse('  FIX              1/1'),
      blank(),
      fmt(' REF FIX', '<'),
      fmt(' ----'),
      blank(),
      fmt(' RAD/DIS', '<'),
      fmt(' ---/---'),
      blank(),
      fmt(' ABEAM PTS', ''),
      fmt(' ----'),
      blank(),
      blank(),
      blank(),
      blank(),
    ],
    lskActions: {
      L1: 'set_fix',
      L2: null, L3: null, L4: null, L5: null, L6: null,
      R1: null, R2: null, R3: null, R4: null, R5: null, R6: null,
    },
  };
}
