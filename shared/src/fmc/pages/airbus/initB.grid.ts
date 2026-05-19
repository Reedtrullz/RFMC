import type { FMCState, DisplayData } from '../../../types/fmc';
import { airbusDisplaySegment, airbusTitleRow, airbusPage } from './airbusGridHelpers';

export function renderInitBGrid(state: FMCState): DisplayData {
  const { performance } = state;

  const zfwVal = performance.zfw ? (performance.zfw / 1000).toFixed(1) : '---.-';
  const blockVal = performance.fuel ? (performance.fuel / 1000).toFixed(1) : '---.-';
  const cgVal = performance.cg ? performance.cg.toFixed(1) : '--.-';

  return airbusPage(
    [
      ...airbusTitleRow('INIT', 'B'),

      airbusDisplaySegment(1, 0, '< ZFW', 'white', { semantic: 'label' }),
      airbusDisplaySegment(2, 0, ` ${zfwVal}`, 'magenta', {
        semantic: 'activeData',
      }),

      airbusDisplaySegment(3, 0, '< BLOCK', 'white', { semantic: 'label' }),
      airbusDisplaySegment(4, 0, ` ${blockVal}`, 'magenta', {
        semantic: 'activeData',
      }),

      airbusDisplaySegment(5, 0, '< CG', 'white', { semantic: 'label' }),
      airbusDisplaySegment(6, 0, ` ${cgVal}`, 'magenta', {
        semantic: 'activeData',
      }),
    ],
    {
      L1: 'set_zfw',
      L2: 'set_block',
      L3: 'set_cg',
      L4: null,
      L5: null,
      L6: null,
      R1: 'init_a',
      R2: null,
      R3: null,
      R4: null,
      R5: null,
      R6: null,
    },
  );
}
