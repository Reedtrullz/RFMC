import type { FMCState, DisplayData } from '../../../types/fmc';
import { buildLnavState } from '../../lnavState';
import { buildPerformancePrediction } from '../../performancePrediction';
import { buildVnavPrediction } from '../../vnavPrediction';
import { boeingPage, boeingTitle, seg } from './boeingGridHelpers';

export function renderBoeingProgressGrid(state: FMCState): DisplayData {
  const { flightPlan } = state;
  const title = state.isModified ? 'MOD PROGRESS' : 'PROGRESS';
  const lnav = buildLnavState(state);
  const perf = buildPerformancePrediction(state);
  const vnav = buildVnavPrediction(state);

  // Extract variables
  const origin = flightPlan.origin || '----';
  const dest = lnav.destination?.ident || flightPlan.destination || state.route.destination || '----';
  const toWpt = lnav.activeWaypoint?.ident || '----';
  const nextWpt = lnav.nextWaypoint?.ident || '----';
  const toDtg =
    lnav.distanceToActiveNm !== null ? String(Math.round(lnav.distanceToActiveNm)).padStart(4, ' ') : '----';
  const destDtg =
    lnav.distanceToDestinationNm !== null ? String(Math.round(lnav.distanceToDestinationNm)).padStart(4, ' ') : '----';
  const fuelDest =
    perf.estimatedFuelAtDestination !== null ? (perf.estimatedFuelAtDestination / 1000).toFixed(1) : '----';
  const vnavStatus = formatProgressVnavStatus(vnav.pathMessages[0], vnav.available, vnav.phase);
  const tod = vnav.topOfDescentDistanceNm !== null ? `${Math.round(vnav.topOfDescentDistanceNm)}NM` : '----';

  return boeingPage(
    [
      ...boeingTitle(title, '1/1'),

      seg(1, 1, 'LAST', 'white', { size: 'small' }),
      seg(1, 15, 'ATA', 'white', { size: 'small' }),
      seg(1, 20, 'FUEL', 'white', { size: 'small' }),
      seg(2, 1, origin, 'green'),
      seg(2, 14, '----', 'green'),
      seg(2, 20, '----', 'green'),

      seg(3, 1, 'TO', 'white', { size: 'small' }),
      seg(3, 15, 'ETA', 'white', { size: 'small' }),
      seg(3, 20, 'DTG', 'white', { size: 'small' }),
      seg(4, 1, toWpt, 'magenta'),
      seg(4, 14, '----', 'magenta'),
      seg(4, 20, toDtg, 'magenta'),

      seg(5, 1, 'NEXT', 'white', { size: 'small' }),
      seg(5, 20, 'DTG', 'white', { size: 'small' }),
      seg(6, 1, nextWpt, 'green'),
      seg(6, 20, '----', 'green'),

      seg(7, 1, 'DEST', 'white', { size: 'small' }),
      seg(7, 15, 'ETA', 'white', { size: 'small' }),
      seg(7, 20, 'DTG', 'white', { size: 'small' }),
      seg(8, 1, dest, 'green'),
      seg(8, 14, '----', 'green'),
      seg(8, 20, destDtg, 'green'),

      seg(10, 1, 'FUEL DEST', 'white', { size: 'small' }),
      seg(10, 15, 'VNAV', 'white', { size: 'small' }),
      seg(10, 21, 'T/D', 'white', { size: 'small' }),
      seg(11, 1, fuelDest, perf.warnings.length > 0 ? 'amber' : 'green'),
      seg(11, 14, vnavStatus.slice(0, 7), vnav.pathMessages.length > 0 ? 'amber' : 'green'),
      seg(11, 21, tod.slice(0, 3), 'green'),

      seg(13, 0, '<POS REF', 'white'),
      seg(13, 16, 'INDEX>', 'white'),
    ],
    {
      L6: 'pos_ref',
      R6: 'menu',
    },
  );
}

function formatProgressVnavStatus(message: string | undefined, available: boolean, phase: string): string {
  if (message === 'PERF/VNAV UNAVAILABLE') return 'VNAV N/A';
  if (message === 'UNABLE NEXT ALT') return 'UNABLE';
  if (message === 'DRAG REQUIRED') return 'DRAG';
  if (message === 'VNAV PATH INTERRUPTED BY DISCONTINUITY') return 'DISCO';
  return available ? phase.toUpperCase() : 'VNAV N/A';
}
