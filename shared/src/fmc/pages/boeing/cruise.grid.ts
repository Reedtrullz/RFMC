import type { FMCState, DisplayData } from '../../../types/fmc';
import { boeingPage, boeingTitle, seg } from './boeingGridHelpers';

export function renderBoeingCruiseGrid(state: FMCState): DisplayData {
  const { performance } = state;
  const crzAlt = performance.crzAlt ? `FL${String(performance.crzAlt).slice(0, 3)}` : '-----';
  const costIndex = performance.costIndex ? String(performance.costIndex) : '---';

  const crzWindStr =
    performance.crzWindDir && performance.crzWindSpeed
      ? `${String(performance.crzWindDir).padStart(3, '0')}/${String(performance.crzWindSpeed).padStart(3, '0')}`
      : '---/---';

  const isaDevStr =
    performance.isaDev !== undefined && performance.isaDev !== null
      ? `${performance.isaDev >= 0 ? '+' : ''}${performance.isaDev}°C`
      : '+00°C';

  const titlePrefix = state.isModified ? 'MOD' : 'ACT';
  const title = `${titlePrefix} CRZ`;

  return boeingPage(
    [
      ...boeingTitle(title, '1/1'),

      seg(1, 1, 'CRZ ALT', 'white', { size: 'small' }),
      seg(2, 0, `<${crzAlt}`, 'green'),

      seg(5, 1, 'COST INDEX', 'white', { size: 'small' }),
      seg(6, 0, `<${costIndex}`, 'green'),

      seg(7, 1, 'CRZ WIND', 'white', { size: 'small' }),
      seg(8, 0, `<${crzWindStr}`, 'green'),

      seg(9, 1, 'ISA DEV', 'white', { size: 'small' }),
      seg(10, 0, `<${isaDevStr}`, 'green'),

      seg(11, 1, 'OPT ALT', 'white', { size: 'small' }),
      seg(12, 1, '-----', 'green'),
    ],
    {
      L1: 'set_crz_alt',
      L2: null,
      L3: 'set_cost_index',
      L4: 'set_crz_wind',
      L5: 'set_isa_dev',
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
