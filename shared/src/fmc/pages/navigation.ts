import type { FMCState, DisplayData, DisplayLine } from '../../types/fmc';
import { PAGE_LINES, PAGE_WIDTH } from '../constants';
import { greatCircleDistance } from '../flightPlanParser';
import { inferBoeingSemantic } from '../pageLineSemantics';

function fmt(text: string, left: string = '', right: string = '', color?: DisplayLine["color"], semantic?: DisplayLine['semantic']): DisplayLine {
  return { text: text.padEnd(PAGE_WIDTH, ' '), leftLabel: left, rightLabel: right, inverse: false, color, semantic: semantic ?? inferBoeingSemantic(color) };
}
function inverse(text: string, left: string = '', right: string = '', color?: DisplayLine["color"]): DisplayLine {
  return { ...fmt(text, left, right, color), inverse: true, color, semantic: inferBoeingSemantic(color, true) };
}
function blank() { return fmt('', '', ''); }
function modData(text: string, isModified: boolean, left: string = '', right: string = '', color?: DisplayLine['color']): DisplayLine {
  return fmt(text, left, right, color, isModified ? 'modified' : undefined);
}

export function renderLegsPage(state: FMCState): DisplayData {
  const flightPlan = state.isModified && state.pendingFlightPlan ? state.pendingFlightPlan : state.flightPlan;
  const { legsPageIndex, aircraftState } = state;
  const waypoints = flightPlan.waypoints;
  const perPage = 5;
  const totalPages = Math.max(1, Math.ceil(waypoints.length / perPage));
  const start = legsPageIndex * perPage;
  const pageWaypoints = waypoints.slice(start, start + perPage);

  const isLive = aircraftState !== null;
  const titleBase = isLive ? '►LEGS' : 'LEGS';
  const title = state.isModified ? `MOD ${titleBase}` : titleBase;
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
  if (aircraftState) {
    let minDist = Infinity;
    for (let i = 0; i < waypoints.length; i++) {
      const wp = waypoints[i];
      if (wp.lat !== undefined && wp.lon !== undefined) {
        const dist = greatCircleDistance(
          aircraftState.lat,
          aircraftState.lon,
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
        const color = isCurrent ? 'magenta' : undefined;
        lines.push(modData(`${marker} ${wp.ident}`, state.isModified, '<', '', color));
        lines.push(modData(`  ${alt} ${spd}`, state.isModified, '', '', color));
      }
    }
  }

  if (state.isModified) {
    lines[11] = fmt(' ERASE', '<', '', 'amber');
  }

  while (lines.length < PAGE_LINES) {
    lines.push(blank());
  }

  const isBoeingPlanMode = state.efisL?.mode === 'PLN';
  if (isBoeingPlanMode) {
    lines[11] = fmt(lines[11] ? lines[11].text.substring(0, 14) : '', '', 'STEP>', 'white');
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

export function getLegsLskActions(state: FMCState): Record<string, string | null> {
  const actions: Record<string, string | null> = {};
  const flightPlan = state.isModified && state.pendingFlightPlan ? state.pendingFlightPlan : state.flightPlan;
  const { legsPageIndex, deleteMode } = state;
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

  if (state.efisL.mode === 'PLN') {
    actions['R6'] = 'step_plan';
  }

  if (state.isModified) {
    actions['L6'] = 'erase';
  }

  const isBoeingPlanMode = state.efisL?.mode === 'PLN';
  if (isBoeingPlanMode) {
    actions['R6'] = 'step_plan';
  }

  return actions;
}

export function renderProgressPage(state: FMCState): DisplayData {
  const { flightPlan, aircraftState, performance } = state;
  const isLive = aircraftState !== null;
  const title = isLive ? '►PROGRESS' : 'PROGRESS';

  // Extract variables
  const origin = flightPlan.origin || '----';
  const dest = flightPlan.destination || '----';
  
  // Calculate DTG
  let toWpt = '----';
  let nextWpt = '----';
  
  let dtgTo = 0;
  let dtgNext = 0;
  let dtgDest = 0;

  let hasTo = false;
  let hasNext = false;

  if (aircraftState && flightPlan.waypoints.length > 0) {
    const w0 = flightPlan.waypoints[0];
    if (w0.lat && w0.lon) {
      toWpt = w0.ident;
      hasTo = true;
      dtgTo = greatCircleDistance(aircraftState.lat, aircraftState.lon, w0.lat, w0.lon);
      dtgDest += dtgTo;

      if (flightPlan.waypoints.length > 1) {
        const w1 = flightPlan.waypoints[1];
        if (w1.lat && w1.lon) {
          nextWpt = w1.ident;
          hasNext = true;
          dtgNext = dtgTo + greatCircleDistance(w0.lat, w0.lon, w1.lat, w1.lon);
        }
      }

      // Calculate total dest
      let prevLat = w0.lat;
      let prevLon = w0.lon;
      for (let i = 1; i < flightPlan.waypoints.length; i++) {
        const w = flightPlan.waypoints[i];
        if (w.lat && w.lon) {
          dtgDest += greatCircleDistance(prevLat, prevLon, w.lat, w.lon);
          prevLat = w.lat;
          prevLon = w.lon;
        }
      }
    }
  }

  // Formatting strings
  const lastStr = origin.padEnd(5, ' ');
  const toStr = toWpt.padEnd(5, ' ');
  const nextStr = nextWpt.padEnd(5, ' ');
  const destStr = dest.padEnd(5, ' ');

  const formatDtg = (dtg: number, valid: boolean) => valid ? String(Math.round(dtg)).padStart(4, ' ') : '----';
  
  const toDtgStr = formatDtg(dtgTo, hasTo);
  const nextDtgStr = formatDtg(dtgNext, hasNext);
  const destDtgStr = formatDtg(dtgDest, hasTo); // If we have TO, we have a partial route to dest

  // Command speed
  let cmdSpd = '---';
  if (aircraftState?.ias !== undefined) {
    // Usually PROG shows commanded Mach or IAS, e.g. .78 MACH or 280 KT
    // We'll just show current rounded speed as KT for now
    cmdSpd = `${String(Math.round(aircraftState.ias))} KT`;
  } else if (performance.costIndex) {
    // Fallback if not live
    cmdSpd = `ECON`;
  }

  return {
    title: isLive ? 'PROGRESS LIVE' : 'PROGRESS',
    pageIndicator: '1/1',
    lines: [
      inverse(`  ${title}          1/1`),
      fmt(' LAST             ATA  FUEL', '', '', 'white'),
      fmt(` ${lastStr}          ----- ----`, '', '', 'green'),
      fmt(' TO               ETA   DTG', '', '', 'white'),
      fmt(` ${toStr}           -----${toDtgStr}`, '', '', 'magenta'),
      fmt(' NEXT             ETA   DTG', '', '', 'white'),
      fmt(` ${nextStr}           -----${nextDtgStr}`, '', '', 'green'),
      fmt(' DEST             ETA  FUEL', '', '', 'white'),
      fmt(` ${destStr}           ----- ----`, '', '', 'green'),
      fmt(' CMD SPD', '', '', 'white'),
      fmt(` ${cmdSpd}`, '', '', 'green'),
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
  const entries = getFixEntries(state);
  const [entry1, entry2] = entries;
  const refFix1 = entry1.refFix || '----';
  const radDis1 = formatFixRadialDistance(entry1);
  const refFix2 = entry2.refFix || '----';
  const radDis2 = formatFixRadialDistance(entry2);
  const abeam1 = entry1.refFix && entry1.radial > 0
    ? `1 ${entry1.refFix} R${String(entry1.radial).padStart(3, '0')} D${String(entry1.distance).padStart(3, '0')}`
    : '---/---';
  const abeam2 = entry2.refFix && entry2.radial > 0
    ? `2 ${entry2.refFix} R${String(entry2.radial).padStart(3, '0')} D${String(entry2.distance).padStart(3, '0')}`
    : '----';

  return {
    title: 'FIX',
    pageIndicator: '1/1',
    lines: [
      inverse('  FIX              1/1', '', '', 'cyan'),
      blank(),
      fmt(' REF FIX 1', '<', 'REF FIX 2', 'white'),
      fmt(` ${refFix1}`, '', refFix2, 'green'),
      blank(),
      fmt(' RAD/DIS 1', '<', 'RAD/DIS 2', 'white'),
      fmt(` ${radDis1}`, '', radDis2, 'green'),
      blank(),
      fmt(' ABEAM PTS', '', '', 'white'),
      fmt(` ${abeam1}`, '', '', 'green'),
      fmt(` ${abeam2}`, '', '', 'green'),
      blank(),
      blank(),
      blank(),
    ],
    lskActions: {
      L1: 'set_fix_ref_0',
      L2: 'set_fix_radial_distance_0',
      L3: null, L4: null, L5: null, L6: null,
      R1: 'set_fix_ref_1',
      R2: 'set_fix_radial_distance_1',
      R3: null, R4: null, R5: null, R6: null,
    },
    lskLabels: {
      L1: 'REF1', L2: 'R/D1', R1: 'REF2', R2: 'R/D2',
    },
  };
}

function getFixEntries(state: FMCState) {
  const entries = state.fixEntries.some(entry => entry.refFix)
    ? state.fixEntries
    : [state.fix];
  return [
    entries[0] ?? { refFix: '', radial: 0, distance: 0 },
    entries[1] ?? { refFix: '', radial: 0, distance: 0 },
  ];
}

function formatFixRadialDistance(entry: { refFix: string; radial: number; distance: number }): string {
  return entry.refFix && entry.radial > 0
    ? `${String(entry.radial).padStart(3, '0')}/${String(entry.distance).padStart(3, '0')}`
    : '---/---';
}
