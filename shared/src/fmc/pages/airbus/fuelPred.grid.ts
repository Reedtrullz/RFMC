import type { FMCState, DisplayData } from '../../../types/fmc';
import { airbusPage, airbusTitleRow, airbusDisplaySegment } from './airbusGridHelpers';
import { buildPerformancePrediction } from '../../performancePrediction';

export function renderFuelPredGrid(state: FMCState): DisplayData {
  const { route, performance, flightPlan } = state;
  const prediction = buildPerformancePrediction(state);
  const origin = flightPlan.origin || route.origin || '----';
  const destination = flightPlan.destination || route.destination || '----';
  const fob = performance.fuel ? (performance.fuel / 1000).toFixed(1) : '---.-';
  const reserveFuel = performance.reserve ?? 0;
  const fallbackExtra = performance.fuel > 0 ? Math.max(0, performance.fuel - 5000) : 0;
  const extraFuel =
    prediction.estimatedFuelAtDestination !== null && reserveFuel > 0
      ? Math.max(0, prediction.estimatedFuelAtDestination - reserveFuel)
      : fallbackExtra;
  const extra = (extraFuel / 1000).toFixed(1);
  const minDestFob = reserveFuel ? (reserveFuel / 1000).toFixed(1) : '2.5';
  const alternateFuel =
    prediction.estimatedFuelAtDestination !== null
      ? Math.max(0, prediction.estimatedFuelAtDestination - reserveFuel)
      : 0;
  const reserve = reserveFuel ? (reserveFuel / 1000).toFixed(1) : '--.-';
  const fuelColor = prediction.warnings.includes('INSUFFICIENT FUEL') ? 'amber' : 'green';

  return airbusPage(
    [
      ...airbusTitleRow('FUEL PRED'),

      airbusDisplaySegment(1, 1, `${origin} / ${destination}`, 'green'),

      airbusDisplaySegment(2, 1, 'FOB', 'white'),
      airbusDisplaySegment(2, 18, `${fob} T`, 'white'),

      airbusDisplaySegment(3, 1, 'EXTRA', 'white'),
      airbusDisplaySegment(4, 1, ` ${extra}`, prediction.estimatedFuelAtDestination !== null ? fuelColor : 'magenta'),

      airbusDisplaySegment(5, 1, 'MIN DEST FOB', 'white'),
      airbusDisplaySegment(6, 1, ` ${minDestFob}`, fuelColor),

      airbusDisplaySegment(7, 1, ' ALTN', 'white'),
      airbusDisplaySegment(8, 1, `   ${route.alternate || '----'}`, 'green'),

      airbusDisplaySegment(9, 1, '  ALTN FOB', 'white'),
      airbusDisplaySegment(10, 1, `   ${(alternateFuel / 1000).toFixed(1)}`, fuelColor),
      airbusDisplaySegment(10, 18, reserve, fuelColor),

      airbusDisplaySegment(11, 1, ' EXTRA/TIME', 'white'),
      airbusDisplaySegment(12, 1, ` ${extra}    00:45`, fuelColor),

      airbusDisplaySegment(13, 1, ' FINAL/TIME', 'white'),
    ],
    {},
  );
}
