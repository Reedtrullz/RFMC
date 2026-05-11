import type { FMCState, DisplayData, DisplayLine } from '../../types/fmc';
import { PAGE_LINES, PAGE_WIDTH } from '../constants';
import { greatCircleDistance } from '../flightPlanParser';

function fmt(text: string, left: string = '', right: string = '', color?: DisplayLine["color"]): DisplayLine {
  return { text: text.padEnd(PAGE_WIDTH, ' '), leftLabel: left, rightLabel: right, inverse: false, color };
}
function inverse(text: string, left: string = '', right: string = '', color?: DisplayLine["color"]): DisplayLine {
  return { ...fmt(text, left, right), inverse: true, color };
}
function blank() { return fmt('', '', ''); }

export function renderLegsPage(state: FMCState): DisplayData {
  const { flightPlan, legsPageIndex, aircraftState } = state;
  const waypoints = flightPlan.waypoints;
  const perPage = 5;
  const totalPages = Math.max(1, Math.ceil(waypoints.length / perPage));
  const start = legsPageIndex * perPage;
  const pageWaypoints = waypoints.slice(start, start + perPage);

  const isLive = aircraftState !== null;
  const title = isLive ? '►LEGS' : 'LEGS';
  const modeSuffix = state.deleteMode ? ' DEL' : '';
  const lines = [
    inverse(`  ${title}${modeSuffix}          ${legsPageIndex + 1}/${totalPages}`),
  ];

  if (state.hold.fix) {
    const h = state.hold;
    lines.push(fmt(` HOLD AT ${h.fix}`, '<', '', 'magenta'));
    lines.push(fmt(`  INB ${String(h.inboundCourse).padStart(3, '0')}°  ${h.legTime.toFixed(1)}MIN  ${h.direction}`, '', '', 'magenta'));
  }

  let currentWaypointIndex = -1;
  if (aircraftState && aircraftState.position) {
    let minDist = Infinity;
    for (let i = 0; i < waypoints.length; i++) {
      const wp = waypoints[i];
      if (wp.lat !== undefined && wp.lon !== undefined) {
        const dist = greatCircleDistance(
          aircraftState.position.lat,
          aircraftState.position.lon,
          wp.lat,
          wp.lon
        );
        if (dist < minDist) {
          minDist = dist;
          currentWaypointIndex = i;
        }
      }
    }
  }

  for (let i = 0; i < pageWaypoints.length; i++) {
    const wp = pageWaypoints[i];
    const globalIndex = start + i;
    const isCurrent = globalIndex === currentWaypointIndex;

    if (wp.discontinuity) {
      lines.push(fmt(' ----- DISCONTINUITY', '<'));
      lines.push(fmt(' -----              '));
    } else {
      const alt = wp.altitudeConstraint
        ? formatAltitude(wp.altitudeConstraint)
        : '-----';
      const spd = wp.speedConstraint
        ? `${String(wp.speedConstraint.speed).padStart(3, ' ')}KT`
        : '---KT';
      const marker = isCurrent ? '►' : ' ';
      if (state.deleteMode) {
        const delLabel = `DEL ${wp.ident}`;
        lines.push(fmt(`${marker} ${delLabel}`, '<', '', 'red'));
        lines.push(fmt(`  ${alt} ${spd}`, '', '', 'red'));
      } else {
        lines.push(fmt(`${marker} ${wp.ident}`, '<'));
        lines.push(fmt(`  ${alt} ${spd}`, '', ''));
      }
    }
  }

  while (lines.length < PAGE_LINES) {
    lines.push(blank());
  }

  return {
    title: isLive ? 'LEGS LIVE' : 'LEGS',
    pageIndicator: `${legsPageIndex + 1}/${totalPages}`,
    lines: lines.slice(0, PAGE_LINES),
    lskActions: getLegsLskActions(state),
  };
}

function formatAltitude(constraint: { type: string; altitude: number; altitude2?: number }): string {
  const alt = String(constraint.altitude).padStart(5, ' ');
  switch (constraint.type) {
    case 'AT_OR_ABOVE': return `${alt}A`;
    case 'AT_OR_BELOW': return `${alt}B`;
    case 'BETWEEN':
      return constraint.altitude2 ? `${alt}/${String(constraint.altitude2).padStart(5, ' ')}` : alt;
    default:
      return alt;
  }
}

function getLegsLskActions(state: FMCState): Record<string, string | null> {
  const actions: Record<string, string | null> = {};
  const { flightPlan, legsPageIndex, deleteMode } = state;
  const perPage = 5;
  const start = legsPageIndex * perPage;
  const waypoints = flightPlan.waypoints;
  const totalPages = Math.max(1, Math.ceil(waypoints.length / perPage));
  const pageCount = Math.min(perPage, waypoints.length - start);

  for (let i = 0; i < pageCount; i++) {
    const globalIndex = start + i;
    const prefix = deleteMode ? 'delete_wp' : 'edit_wp';
    actions[`L${i + 1}`] = `${prefix}_${globalIndex}`;
    actions[`R${i + 1}`] = null;
  }

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
  const { flightPlan, performance, aircraftState } = state;
  const origin = flightPlan.origin || '----';
  const dest = flightPlan.destination || '----';

  const isLive = aircraftState !== null;
  const title = isLive ? '►PROGRESS' : 'PROGRESS';
  const titleLine = inverse(`  ${title}          1/1`);

  let altDisplay = performance.crzAlt ? `FL${String(performance.crzAlt).slice(0, 3)}` : '---';
  let speedDisplay = '---';
  let headingDisplay = '---';
  let vsDisplay = '----';

  if (aircraftState) {
    if (aircraftState.altitude !== undefined) {
      const altFeet = Math.round(aircraftState.altitude);
      if (altFeet >= 1000) {
        altDisplay = `FL${String(Math.floor(altFeet / 100)).padStart(3, '0')}`;
      } else {
        altDisplay = String(altFeet).padStart(5, ' ');
      }
    }
    if (aircraftState.speed !== undefined) {
      speedDisplay = String(Math.round(aircraftState.speed)).padStart(3, ' ');
    }
    if (aircraftState.heading !== undefined) {
      headingDisplay = String(Math.round(aircraftState.heading)).padStart(3, '0');
    }
    if (aircraftState.verticalSpeed !== undefined) {
      const vs = Math.round(aircraftState.verticalSpeed);
      vsDisplay = vs >= 0 ? `+${String(vs).padStart(4, ' ')}` : String(vs).padStart(5, ' ');
    }
  }

  let dtgDisplay = ' ---- NM';
  if (aircraftState && aircraftState.position && flightPlan.waypoints.length > 0) {
    const nextWp = flightPlan.waypoints[0];
    if (nextWp.lat !== undefined && nextWp.lon !== undefined) {
      const dist = greatCircleDistance(
        aircraftState.position.lat,
        aircraftState.position.lon,
        nextWp.lat,
        nextWp.lon
      );
      dtgDisplay = ` ${dist.toFixed(1).padStart(5, ' ')} NM`;
    }
  }

  return {
    title: isLive ? 'PROGRESS LIVE' : 'PROGRESS',
    pageIndicator: '1/1',
    lines: [
      titleLine,
      fmt(` ${origin} -> ${dest}`, '', ''),
      blank(),
      fmt(' ALT', '', ''),
      fmt(` ${altDisplay}`),
      blank(),
      fmt(' HDG', '', ` ${headingDisplay}°`),
      fmt(' DTG', '', dtgDisplay),
      fmt(' ETA', '', ` ----Z`),
      fmt(' FUEL REM', '', ` ---.-`),
      fmt(' WIND', '', ` ---/---`),
      fmt(' SPD', '', ` ${speedDisplay} KT`),
      fmt(' VS', '', ` ${vsDisplay} FPM`),
    ],
    lskActions: {
      L1: null, L2: null, L3: null, L4: null, L5: null, L6: null,
      R1: null, R2: null, R3: null, R4: null, R5: null, R6: null,
    },
  };
}

export function renderHoldPage(state: FMCState): DisplayData {
  const { hold, holdPending } = state;
  const h = holdPending ?? hold;
  const fixStr = h.fix || '----';
  const crsStr = h.inboundCourse ? String(h.inboundCourse).padStart(3, '0') : '---';
  const timeStr = h.legTime ? `${h.legTime.toFixed(1)} MIN` : '1.0 MIN';
  const distStr = h.legDist ? `${h.legDist.toFixed(1)} NM` : '---';
  const dirStr = h.direction || 'R';

  return {
    title: 'HOLD',
    pageIndicator: '1/1',
    lines: [
      inverse('  HOLD             1/1', '', '', 'cyan'),
      blank(),
      fmt(' FIX', '<', '', 'white'),
      fmt(` ${fixStr}`, '', '', 'green'),
      blank(),
      fmt(' INBOUND CRS', '<', '', 'white'),
      fmt(` ${crsStr}`, '', '', 'green'),
      fmt(' LEG TIME', '<', '', 'white'),
      fmt(` ${timeStr}`, '', '', 'green'),
      blank(),
      fmt(' LEG DIST', '<', '', 'white'),
      fmt(` ${distStr}`, '', '', 'green'),
      fmt(' DIR', '<', '', 'white'),
      fmt(` ${dirStr}`, '', '', 'green'),
      blank(),
    ],
    lskActions: {
      L1: 'set_hold_fix',
      L2: null,
      L3: 'set_inbound_crs',
      L4: 'set_leg_time',
      L5: 'set_leg_dist',
      L6: null,
      R1: 'set_hold_direction',
      R2: null, R3: null, R4: null, R5: null, R6: null,
    },
    lskLabels: {
      L1: 'FIX', L3: 'CRS', L4: 'TIME', L5: 'DIST', R1: 'DIR',
    },
  };
}

export function renderFixPage(state: FMCState): DisplayData {
  const { fix } = state;
  const refFix = fix.refFix || '----';
  const radDis = fix.refFix && fix.radial > 0
    ? `${String(fix.radial).padStart(3, '0')}/${String(fix.distance).padStart(3, '0')}`
    : '---/---';
  const abeam = fix.refFix && fix.radial > 0
    ? `R${String(fix.radial).padStart(3, '0')} / D${String(fix.distance).padStart(3, '0')}`
    : '----';

  return {
    title: 'FIX',
    pageIndicator: '1/1',
    lines: [
      inverse('  FIX              1/1', '', '', 'cyan'),
      blank(),
      fmt(' REF FIX', '<', '', 'white'),
      fmt(` ${refFix}`, '', '', 'green'),
      blank(),
      fmt(' RAD/DIS', '<', '', 'white'),
      fmt(` ${radDis}`, '', '', 'green'),
      blank(),
      fmt(' ABEAM PTS', '', '', 'white'),
      fmt(` ${abeam}`, '', '', 'green'),
      blank(),
      blank(),
      blank(),
      blank(),
    ],
    lskActions: {
      L1: 'set_fix_ref',
      L2: 'set_fix_radial_distance',
      L3: null, L4: null, L5: null, L6: null,
      R1: null, R2: null, R3: null, R4: null, R5: null, R6: null,
    },
    lskLabels: {
      L1: 'REF', L2: 'RAD/DIS',
    },
  };
}
