import type { FMCState, DisplayData } from '../../../types/fmc';
import { airbusPage, airbusTitleRow, airbusDisplaySegment } from './airbusGridHelpers';

export function renderDataIndexGrid(state: FMCState): DisplayData {
  return airbusPage(
    [
      ...airbusTitleRow('DATA', 'INDEX'),

      airbusDisplaySegment(1, 1, 'A/C STATUS', 'white'),
      airbusDisplaySegment(2, 1, 'POSITION MONITOR', 'white'),
      airbusDisplaySegment(3, 1, 'IRS MONITOR', 'white'),
      airbusDisplaySegment(4, 1, 'GPS MONITOR', 'white'),
      airbusDisplaySegment(5, 1, 'WAYPOINTS', 'white'),
      airbusDisplaySegment(6, 1, 'NAVAIDS', 'white'),
      airbusDisplaySegment(7, 1, 'RUNWAYS', 'white'),
      airbusDisplaySegment(8, 1, 'ROUTES', 'white'),
    ],
    {
      L1: 'ac_status',
    },
  );
}
