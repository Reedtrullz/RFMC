import type { FMCState, DisplayData, DisplaySegment } from '@shared';
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

  const titleBase = aircraftState !== null ? '►LEGS' : 'LEGS';
  const title = state.isModified ? `MOD ${titleBase}` : titleBase;
  const modeSuffix = state.deleteMode ? ' DEL' : '';

  const segments: DisplaySegment[] = [
    ...boeingTitle(`${title}${modeSuffix}`, `${legsPageIndex + 1}/${totalPages}`),
  ];

  for (let i = 0; i < pageWaypoints.length; i++) {
    const wp = pageWaypoints[i];
    const row = 2 + i * 2;
    const color = i === 0 && legsPageIndex === 0 ? 'magenta' : 'white';

    if (wp.discontinuity) {
      segments.push(seg(row, 0, '□□□□□-DISCONTINUITY', 'white'));
    } else {
      const alt = wp.altitudeConstraint ? formatAltitude(wp.altitudeConstraint) : '-----';
      const spd = wp.speedConstraint ? `${String(wp.speedConstraint.speed).padStart(3, ' ')}KT` : '---KT';
      
      segments.push(seg(row, 1, wp.ident, color));
      segments.push(seg(row, 13, `${spd} ${alt}`, 'white', { size: 'small' }));
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
