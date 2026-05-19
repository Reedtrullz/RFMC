import type { FMCState, DisplayData } from '../../../types/fmc';
import { boeingPage, boeingTitle, seg } from './boeingGridHelpers';

export function renderBoeingDirectGrid(state: FMCState): DisplayData {
  const { flightPlan, route } = state;
  const origin = flightPlan.origin || '----';
  const destination = flightPlan.destination || '----';
  const directTo = route.directTo || '----';

  const titlePrefix = state.isModified ? 'MOD' : 'ACT';
  const title = `${titlePrefix} DIR INTC`;

  return boeingPage(
    [
      ...boeingTitle(title, '1/1'),

      seg(1, 1, 'DIRECT TO', 'white', { size: 'small' }),
      seg(2, 0, `<${directTo}`, 'green'),

      seg(3, 1, 'INTERCEPT', 'white', { size: 'small' }),
      seg(4, 0, '< ----°', 'green'),

      seg(5, 1, 'FROM', 'white', { size: 'small' }),
      seg(6, 1, origin, 'green'),

      seg(7, 1, 'TO', 'white', { size: 'small' }),
      seg(8, 1, destination, 'green'),
    ],
    {
      L1: 'set_direct_to',
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
