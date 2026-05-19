import type { FMCState, DisplayData } from '../../../types/fmc';
import type { DisplaySegment } from '../../../types/display';
import { airbusDisplaySegment, airbusTitleRow, airbusPage } from './airbusGridHelpers';
import { formatAltitudeConstraint } from '../../../navdata/constraints';

/**
 * Render the Airbus A320 F-PLN page using the DisplaySegment grid format.
 *
 * Layout (14 rows x 24 cols):
 *   Row 0:   Title + page indicator
 *   Row 1:   " SPD/ALT" header
 *   Row 2-11: Waypoints (2 rows each, 4/page) or route discontinuities
 *   Row 12-13: Bottom actions
 */
export function renderFplnGrid(state: FMCState): DisplayData {
  const flightPlan = state.isModified && state.pendingFlightPlan ? state.pendingFlightPlan : state.flightPlan;
  const route = state.isModified && state.pendingRoute ? state.pendingRoute : state.route;
  const waypoints = flightPlan.waypoints;
  const { legsPageIndex } = state;

  const perPage = 4;
  const totalPages = Math.max(1, Math.ceil(waypoints.length / perPage));
  const start = legsPageIndex * perPage;
  const pageWaypoints = waypoints.slice(start, start + perPage);

  const title = state.isModified ? 'TMPY F-PLN' : 'F-PLN';
  const fromTo = `${route.origin || '----'} / ${route.destination || '----'}`;
  const titleText = `${title}  ${fromTo}`.slice(0, 18);

  const segments: DisplaySegment[] = [...airbusTitleRow(titleText, `${legsPageIndex + 1}/${totalPages}`)];

  segments.push(airbusDisplaySegment(1, 1, ' SPD/ALT', 'white'));

  let wpDisplayIdx = 0;
  for (let i = 0; i < pageWaypoints.length; i++) {
    const wp = pageWaypoints[i];
    const baseRow = 2 + wpDisplayIdx * 2;

    if (baseRow >= 13) break;

    if (wp.discontinuity) {
      segments.push(airbusDisplaySegment(baseRow, 1, '----- F-PLN DISCONTINUITY -----', 'amber'));
      segments.push(airbusDisplaySegment(baseRow + 1, 1, '', 'amber'));
      wpDisplayIdx++;
      continue;
    }

    segments.push(
      airbusDisplaySegment(baseRow, 2, wp.ident, 'white', {
        semantic: 'activeData',
      }),
    );

    const alt = wp.altitudeConstraint ? formatAltitude(wp.altitudeConstraint) : ' --- ';
    const spd = wp.speedConstraint ? String(wp.speedConstraint.speed).padStart(3, ' ') : ' --- ';
    segments.push(
      airbusDisplaySegment(baseRow + 1, 3, `${spd}/${alt}`, 'green', {
        semantic: 'activeData',
      }),
    );

    wpDisplayIdx++;
  }

  const lskActions = buildFplnActions(state);

  return airbusPage(segments, lskActions);
}

function formatAltitude(constraint?: any): string {
  const formatted = formatAltitudeConstraint(constraint);
  return formatted || ' --- ';
}

function buildFplnActions(state: FMCState): Record<string, string | null> {
  const actions: Record<string, string | null> = {};
  for (let i = 1; i <= 6; i++) {
    actions[`L${i}`] = null;
    actions[`R${i}`] = null;
  }
  actions['L1'] = 'fpln_dep_arr';

  const flightPlan = state.isModified && state.pendingFlightPlan ? state.pendingFlightPlan : state.flightPlan;
  const wpts = flightPlan.waypoints;
  const deleteMode = state.deleteMode;

  for (let i = 0; i < Math.min(wpts.length, 5); i++) {
    const action = deleteMode ? `delete_wp_${i}` : `edit_wp_${i}`;
    actions[`L${i + 2}`] = action;
  }

  if (state.isModified) {
    actions['R6'] = 'erase';
  }

  const perPage = 5;
  const totalPages = Math.max(1, Math.ceil(wpts.length / perPage));
  if (state.legsPageIndex < totalPages - 1) actions['L6'] = 'next_page';
  if (state.legsPageIndex > 0) actions['R6'] = 'prev_page';

  return actions;
}
