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
      const spd = wp.speedConstraint ? `${String(wp.speedConstraint.speed).padStart(3, ' ')}` : ' ---';
      const legLabel = wp.legType ? `(${wp.legType})` : wp.ident;
      
      segments.push(seg(row - 1, 17, 'SPD/TGT  ALT', 'white', { size: 'small' }));
      segments.push(seg(row, 1, legLabel, wptColor));
      segments.push(seg(row, 16, `${spd}kt /${alt}`, 'white', { size: 'small' }));
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

import { formatAltitudeConstraint, formatSpeedConstraint } from '@shared';

function formatAltitude(constraint: any): string {
  return formatAltitudeConstraint(constraint);
}
