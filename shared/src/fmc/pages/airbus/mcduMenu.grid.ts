import type { FMCState, DisplayData } from '../../../types/fmc';
import { airbusPage, airbusTitleRow, airbusDisplaySegment } from './airbusGridHelpers';

export function renderMcduMenuGrid(state: FMCState): DisplayData {
  return airbusPage(
    [
      ...airbusTitleRow('MCDU MENU'),

      airbusDisplaySegment(1, 0, '< FMGC', 'magenta'),
      airbusDisplaySegment(2, 1, ' SELECT', 'green'),

      airbusDisplaySegment(3, 0, '< ATSU', 'magenta'),
      airbusDisplaySegment(4, 1, ' SELECT', 'green'),

      airbusDisplaySegment(5, 0, '< AIDS', 'magenta'),
      airbusDisplaySegment(6, 1, ' SELECT', 'green'),

      airbusDisplaySegment(7, 0, '< CFDS', 'magenta'),
      airbusDisplaySegment(8, 1, ' SELECT', 'green'),
    ],
    {
      L1: 'f_pln',
      L2: 'atsu',
    },
  );
}
