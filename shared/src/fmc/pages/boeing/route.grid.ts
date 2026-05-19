import type { FMCState, DisplayData } from '../../../types/fmc';
import { boeingPage, boeingTitle, seg } from './boeingGridHelpers';

export function renderBoeingRteGrid(state: FMCState): DisplayData {
  const route = state.isModified && state.pendingRoute ? state.pendingRoute : state.route;
  const { rteSubPage } = state;
  const title = state.isModified ? 'MOD RTE' : 'RTE';
  const color = state.isModified ? 'white' : 'green';

  if (rteSubPage === 0) {
    const origin = route.origin || '[    ]';
    const dest = route.destination || '[    ]';
    const fltNo = route.flightNumber || '--------';
    const coRte = route.companyRoute || '---------';

    return boeingPage(
      [
        ...boeingTitle(title, '1/2'),

        seg(1, 1, 'ORIGIN', 'white', { size: 'small' }),
        seg(1, 17, 'FLT NO', 'white', { size: 'small' }),
        seg(2, 1, origin, color),
        seg(2, 16, fltNo, color),

        seg(3, 1, 'DEST', 'white', { size: 'small' }),
        seg(4, 1, dest, color),

        seg(5, 1, 'CO ROUTE', 'white', { size: 'small' }),
        seg(6, 1, coRte, color),

        ...(state.atsu?.pendingUplink ? [seg(11, 0, '<LOAD', 'white')] : []),
        ...(state.isModified ? [seg(13, 0, '<ERASE', 'amber')] : []),
        seg(13, 18, 'ROUTE>', 'white'),
      ],
      {
        L1: 'set_origin',
        L2: 'set_dest',
        L3: 'set_co_route',
        L6: state.atsu?.pendingUplink ? 'atsu_load_route' : state.isModified ? 'erase' : null,
        R1: 'set_flt_no',
        R6: 'next_page',
      },
    );
  }

  // Page 2: Route Legs
  const via = 'DIRECT';
  const toRaw = route.routeString ? route.routeString.split(/\s+/)[0] : ' [    ] ';
  const to = toRaw.slice(0, 10);

  return boeingPage(
    [
      ...boeingTitle(title, '2/2'),

      seg(1, 1, 'VIA', 'white', { size: 'small' }),
      seg(1, 13, 'TO', 'white', { size: 'small' }),

      seg(2, 1, via, 'green'),
      seg(2, 13, to, color),

      seg(3, 1, '----', 'white', { size: 'small' }),
      seg(3, 13, '----------', 'white', { size: 'small' }),

      ...(state.isModified ? [seg(13, 0, '<ERASE', 'amber')] : []),
      seg(13, 1, '<ROUTE', 'white'),
      seg(13, 18, 'LEGS>', 'white'),
    ],
    {
      L1: 'set_route',
      L6: 'prev_page',
      R3: 'legs',
    },
  );
}
