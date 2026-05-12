import type { FMCState, DisplayData } from '@shared';
import { boeingPage, boeingTitle, seg } from './boeingGridHelpers';

export function renderBoeingRteGrid(state: FMCState): DisplayData {
  const route = state.isModified && state.pendingRoute ? state.pendingRoute : state.route;
  const { rteSubPage } = state;
  const title = state.isModified ? 'MOD RTE' : 'RTE';
  const color = state.isModified ? 'white' : 'green';

  if (rteSubPage === 0) {
    return boeingPage([
      ...boeingTitle(title, '1/2'),

      seg(1, 1, 'ORIGIN', 'white', { size: 'small' }),
      seg(2, 1, route.origin || '[    ]', color),

      seg(3, 1, 'DEST', 'white', { size: 'small' }),
      seg(4, 1, route.destination || '[    ]', color),

      seg(5, 1, 'CO ROUTE', 'white', { size: 'small' }),
      seg(6, 1, route.companyRoute || '---------', color),

      seg(1, 17, 'FLT NO', 'white', { size: 'small' }),
      seg(2, 16, route.flightNumber || '--------', color),

      ...(state.isModified ? [seg(13, 0, '<ERASE', 'amber')] : []),
      seg(13, 18, 'ROUTE>', 'white'),
    ], {
      L1: 'set_origin',
      L3: 'set_dest',
      L6: state.isModified ? 'erase' : 'next_page',
      R1: 'set_flt_no',
      R3: 'dep_arr',
    });
  }

  // Page 2
  const routeLines = route.routeString || '----';
  return boeingPage([
    ...boeingTitle(title, '2/2'),

    seg(1, 1, 'VIA', 'white', { size: 'small' }),
    seg(1, 13, 'TO', 'white', { size: 'small' }),

    seg(2, 1, 'DIRECT', 'green'),
    seg(2, 13, routeLines.length > 11 ? routeLines.slice(0, 11) : routeLines, color),

    ...(state.isModified ? [seg(13, 0, '<ERASE', 'amber')] : []),
    seg(13, 18, 'LEGS>', 'white'),
  ], {
    L1: 'set_route',
    L6: state.isModified ? 'erase' : 'prev_page',
    R3: 'legs',
  });
}
