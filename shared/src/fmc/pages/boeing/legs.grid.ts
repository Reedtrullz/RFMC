import type { FMCState, DisplayData, DisplaySegment, AltitudeConstraint, SpeedConstraint } from '../../../types/fmc';
import { boeingPage, boeingTitle, seg } from './boeingGridHelpers';
import { getLegsLskActions } from '../navigation';

export function renderBoeingLegsGrid(state: FMCState): DisplayData {
  const flightPlan = state.isModified && state.pendingFlightPlan ? state.pendingFlightPlan : state.flightPlan;
  const { legsPageIndex, aircraftState } = state;
  const waypoints = flightPlan.waypoints;
  const perPage = 5;
  const totalPages = Math.max(1, Math.ceil(waypoints.length / perPage));
  const start = legsPageIndex * perPage;
  const pageWaypoints = waypoints.slice(start, start + perPage);

  const titlePrefix = state.isModified ? 'MOD' : 'ACT';
  const titleBase = 'LEGS';
  const title = `${titlePrefix} ${titleBase}`;
  const modeSuffix = state.deleteMode ? ' DEL' : '';

  const segments: DisplaySegment[] = [
    ...boeingTitle(`${title}${modeSuffix}`, `${legsPageIndex + 1}/${totalPages}`),
  ];

  for (let i = 0; i < pageWaypoints.length; i++) {
    const wp = pageWaypoints[i];
    const row = 2 + i * 2;
    const isActive = i === 0 && legsPageIndex === 0;
    const wptColor = isActive ? 'magenta' : 'white';

    if (wp.discontinuity) {
      segments.push(seg(row - 1, 1, '----- ROUTE DISCONTINUITY -----', 'white', { size: 'small' }));
      segments.push(seg(row, 1, '□□□□□', 'white'));
    } else {
      const alt = wp.altitudeConstraint ? formatAltitude(wp.altitudeConstraint) : '-----';
      const spd = wp.speedConstraint ? formatSpeedConstraint(wp.speedConstraint).padStart(3, ' ') : ' ---';
      const legLabel = wp.legType ? `(${wp.legType})` : wp.ident;
      
      segments.push(seg(row - 1, 12, 'SPD/TGT  ALT', 'white', { size: 'small' }));
      segments.push(seg(row, 1, legLabel, wptColor));
      segments.push(seg(row, 11, `${spd}kt /${alt}`, 'white', { size: 'small' }));
    }
  }

  if (state.isModified) {
    segments.push(seg(13, 0, '<ERASE', 'amber'));
  }

  const isBoeingPlanMode = state.efisL?.mode === 'PLN';
  if (isBoeingPlanMode) {
    segments.push(seg(13, 19, 'STEP>', 'white'));
  }

  return boeingPage(segments, getLegsLskActions(state));
}

function formatAltitude(constraint?: AltitudeConstraint): string {
  if (!constraint) return '';
  const isFL = constraint.altitude >= 18000;
  let valStr = '';
  if (isFL) {
    const fl = Math.round(constraint.altitude / 100).toString().padStart(3, '0');
    valStr = `FL${fl}`;
  } else {
    valStr = constraint.altitude.toString();
  }
  
  switch (constraint.type) {
    case 'AT': return valStr;
    case 'AT_OR_ABOVE': return `${valStr}A`;
    case 'AT_OR_BELOW': return `${valStr}B`;
    case 'BETWEEN': return `${valStr}B${constraint.altitude2 ? Math.round(constraint.altitude2 / 100) : ''}A`;
    default: return valStr;
  }
}

function formatSpeedConstraint(constraint?: SpeedConstraint): string {
  if (!constraint) return '';
  const val = constraint.speed.toString();
  switch (constraint.type) {
    case 'AT': return val;
    case 'AT_OR_ABOVE': return `${val}A`;
    case 'AT_OR_BELOW': return `${val}B`;
    default: return val;
  }
}

