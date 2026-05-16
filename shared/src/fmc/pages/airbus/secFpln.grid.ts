import type { FMCState, DisplayData } from '../../../types/fmc';
import {
  airbusPage,
  airbusTitleRow,
  airbusDisplaySegment,
} from './airbusGridHelpers';

export function renderSecFplnGrid(state: FMCState): DisplayData {
  const route =
    state.isModified && state.pendingRoute
      ? state.pendingRoute
      : state.route;

  return airbusPage(
    [
      ...airbusTitleRow('SEC F-PLN', '1/1'),

      airbusDisplaySegment(1, 1, 'COPY ACTIVE', 'white'),

      airbusDisplaySegment(3, 1, 'FROM/TO', 'white'),
      airbusDisplaySegment(
        4,
        1,
        ` ${route.origin || '----'}/${route.destination || '----'}`,
        'magenta',
      ),
    ],
    {
      L1: 'copy_active',
    },
  );
}
