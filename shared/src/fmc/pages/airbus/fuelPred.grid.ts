import type { FMCState, DisplayData } from '../../../types/fmc';
import {
  airbusPage,
  airbusTitleRow,
  airbusDisplaySegment,
} from './airbusGridHelpers';

export function renderFuelPredGrid(state: FMCState): DisplayData {
  const { route, performance } = state;
  const fob = performance.fuel ? (performance.fuel / 1000).toFixed(1) : '---.-';
  const extra =
    performance.fuel > 0
      ? ((performance.fuel - 5000) / 1000).toFixed(1)
      : '0.0';
  const reserve = performance.reserve
    ? (performance.reserve / 1000).toFixed(1)
    : '--.-';

  return airbusPage([
    ...airbusTitleRow('FUEL PRED'),

    airbusDisplaySegment(
      1,
      1,
      `${route.origin || '----'} / ${route.destination || '----'}`,
      'green',
    ),

    airbusDisplaySegment(2, 1, 'FOB', 'white'),
    airbusDisplaySegment(2, 18, `${fob} T`, 'white'),

    airbusDisplaySegment(3, 1, 'EXTRA', 'white'),
    airbusDisplaySegment(4, 1, ` ${extra}`, 'magenta'),

    airbusDisplaySegment(5, 1, 'MIN DEST FOB', 'white'),
    airbusDisplaySegment(6, 1, ' 2.5', 'green'),

    airbusDisplaySegment(7, 1, ' ALTN', 'white'),
    airbusDisplaySegment(8, 1, `   ${route.alternate || '----'}`, 'green'),

    airbusDisplaySegment(9, 1, '  ALTN FOB', 'white'),
    airbusDisplaySegment(10, 1, '   0.0', 'green'),
    airbusDisplaySegment(10, 18, reserve, 'green'),

    airbusDisplaySegment(11, 1, ' EXTRA/TIME', 'white'),
    airbusDisplaySegment(12, 1, ` ${extra}    00:45`, 'green'),

    airbusDisplaySegment(13, 1, ' FINAL/TIME', 'white'),
  ], {});
}
