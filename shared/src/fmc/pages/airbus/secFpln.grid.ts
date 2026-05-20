import type { FMCState, DisplayData } from '../../../types/fmc';
import { airbusPage, airbusTitleRow, airbusDisplaySegment } from './airbusGridHelpers';

export function renderSecFplnGrid(state: FMCState): DisplayData {
  const hasSec = state.isModified && !!state.pendingRoute;
  const route = hasSec && state.pendingRoute ? state.pendingRoute : state.route;

  const segments = [
    ...airbusTitleRow('SEC F-PLN', '1/1'),
    airbusDisplaySegment(4, 1, ` ${route.origin || '----'}/${route.destination || '----'}`, 'magenta'),
  ];

  const lskActions: Record<string, string | null> = {};

  if (hasSec) {
    segments.push(
      airbusDisplaySegment(1, 0, '<ACTIVATE SEC', 'white'),
      airbusDisplaySegment(3, 0, '<ERASE SEC', 'white'),
    );
    lskActions.L1 = 'activate_sec';
    lskActions.L2 = 'erase';
  } else {
    segments.push(
      airbusDisplaySegment(1, 0, '<', 'white'),
      airbusDisplaySegment(1, 1, 'COPY ACTIVE', 'white'),
      airbusDisplaySegment(3, 1, 'FROM/TO', 'white'),
    );
    lskActions.L1 = 'copy_active';
  }

  return airbusPage(segments, lskActions);
}
