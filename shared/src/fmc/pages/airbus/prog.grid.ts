import type { FMCState, DisplayData } from '../../../types/fmc';
import { airbusPage, airbusTitleRow, airbusLineLabel, airbusDisplaySegment } from './airbusGridHelpers';
import { AIRBUS_DEFAULT_COLOR } from '../../displayColors';
import { buildLnavState } from '../../lnavState';
import { buildPerformancePrediction } from '../../performancePrediction';

/**
 * Render the Airbus PROG page as a DisplaySegment grid.
 *
 * Fields: origin/destination, CRZ FL, OPT FL, REC MAX FL, DIST, ETA, EFOB,
 * WIND, and NAV ACCUR with RNP/ANP accuracy indicator.
 */
export function renderProgGrid(state: FMCState): DisplayData {
  const { route, performance, navPerformance } = state;
  const lnav = buildLnavState(state);
  const prediction = buildPerformancePrediction(state);

  const crzAltStr = performance.crzAlt ? `FL${String(performance.crzAlt).slice(0, 3)}` : '---';

  const accuracyHigh = navPerformance.anpNm <= navPerformance.rnpNm;
  const accuracyLabel = accuracyHigh ? 'HIGH' : 'LOW';
  const rnpStr = navPerformance.rnpNm.toFixed(2);
  const origin = state.flightPlan.origin || route.origin || '----';
  const destination = lnav.destination?.ident || state.flightPlan.destination || route.destination || '----';
  const distanceStr =
    lnav.distanceToDestinationNm !== null
      ? `${String(Math.round(lnav.distanceToDestinationNm)).padStart(4, ' ')} NM`
      : '---- NM';
  const efobStr =
    prediction.estimatedFuelAtDestination !== null
      ? `${(prediction.estimatedFuelAtDestination / 1000).toFixed(1)}`
      : '---.-';
  const efobColor = prediction.warnings.includes('INSUFFICIENT FUEL') ? 'amber' : 'white';

  return airbusPage(
    [
      // Row 0: Title
      ...airbusTitleRow('PROG'),

      // Row 1: Origin / Destination
      airbusDisplaySegment(1, 1, `${origin} / ${destination}`, 'green', { semantic: 'activeData' }),

      // Row 2: CRZ FL
      airbusLineLabel('CRZ FL', 2, 'L'),
      airbusDisplaySegment(2, 19, crzAltStr, 'white', { semantic: 'activeData' }),

      // Row 3: OPT FL
      airbusLineLabel('OPT FL', 3, 'L'),
      airbusDisplaySegment(3, 21, '---', 'white', { semantic: 'activeData' }),

      // Row 4: REC MAX FL
      airbusLineLabel('REC MAX FL', 4, 'L'),
      airbusDisplaySegment(4, 21, '---', 'white', { semantic: 'activeData' }),

      // Row 5: DIST
      airbusLineLabel('DIST', 5, 'L'),
      airbusDisplaySegment(5, 17, distanceStr, 'white', { semantic: 'activeData' }),

      // Row 6: ETA
      airbusLineLabel('ETA', 6, 'L'),
      airbusDisplaySegment(6, 19, '----Z', 'white', { semantic: 'activeData' }),

      // Row 7: EFOB
      airbusLineLabel('EFOB', 7, 'L'),
      airbusDisplaySegment(7, 19, efobStr, efobColor, { semantic: 'activeData' }),

      // Row 8: WIND label
      airbusLineLabel('WIND', 8, 'L'),

      // Row 9: Wind data
      airbusDisplaySegment(9, 1, '---°/---', 'green', { semantic: 'activeData' }),

      // Row 10: NAV ACCUR — labels for the accuracy section
      airbusLineLabel('NAV ACCUR', 10, 'L'),
      airbusLineLabel('REQUIRED', 10, 'R'),

      // Row 11: ACTUAL navigation performance vs required RNP
      airbusLineLabel('ACTUAL', 11, 'L'),
      airbusDisplaySegment(11, 8, accuracyLabel, 'green', { semantic: 'activeData' }),
      airbusDisplaySegment(11, 18, rnpStr, AIRBUS_DEFAULT_COLOR, { semantic: 'activeData' }),
    ],
    {
      L1: null,
      L2: null,
      L3: null,
      L4: null,
      L5: null,
      L6: null,
      R1: null,
      R2: null,
      R3: null,
      R4: null,
      R5: null,
      R6: null,
    },
  );
}
