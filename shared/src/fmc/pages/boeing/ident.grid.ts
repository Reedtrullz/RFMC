import type { FMCState, DisplayData } from '../../../types/fmc';
import { boeingPage, boeingTitle, seg } from './boeingGridHelpers';

export function renderBoeingIdentGrid(state: FMCState): DisplayData {
  return boeingPage(
    [
      ...boeingTitle('IDENT', '1/1'),

      seg(1, 1, 'MODEL', 'white', { size: 'small' }),
      seg(2, 1, state.ident.aircraftType || '737-800', 'green'),
      seg(1, 16, 'DRAG', 'white', { size: 'small' }),
      seg(2, 16, '+0.0', 'green'),

      seg(3, 1, 'NAV DATA', 'white', { size: 'small' }),
      seg(4, 1, state.ident.navDataVersion || 'OCT05NOV01', 'green'),
      seg(3, 13, 'ACTIVE', 'white', { size: 'small' }),
      seg(5, 1, 'OP PROGRAM', 'white', { size: 'small' }),
      seg(6, 1, state.ident.opProgram || 'BP0101', 'green'),

      seg(7, 1, 'ENGINES', 'white', { size: 'small' }),
      seg(8, 1, state.ident.engRating || '26K SFP', 'green'),

      seg(13, 0, '<INDEX', 'white'),
      seg(13, 15, 'POS INIT>', 'white'),
    ],
    {
      L6: 'menu',
      R6: 'pos_init',
    },
  );
}
