import type { FMCState, DisplayData } from '@shared';
import { boeingPage, boeingTitle, seg } from './boeingGridHelpers';

export function renderBoeingPosInitGrid(state: FMCState): DisplayData {
  const lastPos =
    state.position.lat != null && state.position.lon != null
      ? `${Math.abs(state.position.lat).toFixed(1)}${state.position.lat >= 0 ? 'N' : 'S'} ${Math.abs(state.position.lon).toFixed(1)}${state.position.lon >= 0 ? 'E' : 'W'}`
      : '----.-  ----.-';

  return boeingPage([
    ...boeingTitle('POS INIT', '1/1'),

    seg(1, 1, 'LAST POS', 'white', { size: 'small' }),
    seg(2, 1, lastPos, 'green'),

    seg(3, 0, '<REF AIRPORT', 'white', { size: 'small' }),
    seg(4, 1, state.position.refAirport || '----', 'green'),

    seg(5, 0, '<GATE', 'white', { size: 'small' }),
    seg(6, 1, state.position.gate || '----', 'green'),

    seg(8, 13, 'SET IRS POS', 'white', { size: 'small' }),
    state.position.irsAligned 
      ? seg(9, 10, lastPos, 'green')
      : state.position.irsAlignmentProgress > 0
        ? seg(9, 10, 'ALIGNING...', 'white', { blinking: true })
        : seg(9, 10, '□□□□.□ □□□□□.□', 'green'),

    seg(13, 0, '<INDEX', 'white'),
    seg(13, 18, 'ROUTE>', 'white'),
  ], {
    L1: 'set_ref_airport',
    L3: 'set_gate',
    L6: 'menu',
    R6: 'rte',
  });
}
