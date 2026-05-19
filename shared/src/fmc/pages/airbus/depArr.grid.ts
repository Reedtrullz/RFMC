import type { FMCState, DisplayData } from '../../../types/fmc';
import { airbusPage, airbusDisplaySegment } from './airbusGridHelpers';

export function renderDepArrA320Grid(state: FMCState): DisplayData {
  const route = state.isModified && state.pendingRoute ? state.pendingRoute : state.route;
  const title = state.isModified ? 'TMPY DEP/ARR' : 'DEP/ARR';

  return airbusPage(
    [
      airbusDisplaySegment(0, 2, `  ${title}     ${route.origin || '----'} / ${route.destination || '----'}`, 'white', {
        inverse: true,
        semantic: 'title',
      }),

      airbusDisplaySegment(1, 1, ' DEPARTURE', 'white'),
      airbusDisplaySegment(2, 1, ` ${route.origin || '----'}`, 'green'),

      airbusDisplaySegment(3, 0, '<', 'white'),
      airbusDisplaySegment(3, 2, 'SID', 'white'),
      airbusDisplaySegment(4, 3, ` ${route.sid || 'NONE'}`, 'magenta'),

      airbusDisplaySegment(5, 0, '<', 'white'),
      airbusDisplaySegment(5, 2, 'RWY', 'white'),
      airbusDisplaySegment(6, 3, ` ${route.runway || '----'}`, 'magenta'),

      airbusDisplaySegment(7, 1, ' ARRIVAL', 'white'),
      airbusDisplaySegment(8, 1, ` ${route.destination || '----'}`, 'green'),

      airbusDisplaySegment(9, 0, '<', 'white'),
      airbusDisplaySegment(9, 2, 'STAR', 'white'),
      airbusDisplaySegment(10, 3, ` ${route.star || 'NONE'}`, 'magenta'),

      airbusDisplaySegment(11, 0, '<', 'white'),
      airbusDisplaySegment(11, 2, 'APPR', 'white'),
      airbusDisplaySegment(12, 3, ` ${route.approach || 'NONE'}`, 'magenta'),
    ],
    {
      L2: 'set_sid',
      L3: 'set_rwy',
      L5: 'set_star',
      L6: 'set_appr',
    },
  );
}
