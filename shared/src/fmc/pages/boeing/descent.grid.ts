import type { FMCState, DisplayData } from '../../../types/fmc';
import { boeingPage, boeingTitle, seg } from './boeingGridHelpers';

export function renderBoeingDescentGrid(state: FMCState): DisplayData {
  const { performance } = state;
  const crzAlt = performance.crzAlt ? `FL${String(performance.crzAlt).slice(0, 3)}` : '-----';

  const desWindStr =
    performance.desWindDir && performance.desWindSpeed
      ? `${String(performance.desWindDir).padStart(3, '0')}/${String(performance.desWindSpeed).padStart(3, '0')}`
      : '---/---';

  const isaDevStr =
    performance.isaDev !== undefined && performance.isaDev !== null
      ? `${performance.isaDev >= 0 ? '+' : ''}${performance.isaDev}°C`
      : '+00°C';

  const titlePrefix = state.isModified ? 'MOD' : 'ACT';
  const title = `${titlePrefix} DES`;

  return {
    ...boeingPage(
      [
        ...boeingTitle(title, '1/1'),

        seg(1, 1, 'CRZ ALT', 'white', { size: 'small' }),
        seg(2, 0, `<${crzAlt}`, 'green'),

        seg(3, 1, 'DES WIND', 'white', { size: 'small' }),
        seg(4, 0, `<${desWindStr}`, 'green'),

        seg(5, 1, 'ISA DEV', 'white', { size: 'small' }),
        seg(6, 0, `<${isaDevStr}`, 'green'),

        seg(7, 1, 'OPT ALT', 'white', { size: 'small' }),
        seg(8, 1, '-----', 'green'),

        seg(9, 1, 'DES PATH', 'white', { size: 'small' }),
        seg(10, 1, '----°', 'green'),

        seg(11, 16, 'DES NOW', 'white', { size: 'small' }),
        seg(12, 20, '<ARM', 'white'),
      ],
      {
        L1: 'set_crz_alt',
        L2: 'set_des_wind',
        L3: 'set_isa_dev',
        L4: null,
        L5: null,
        L6: null,
        R1: null,
        R2: null,
        R3: null,
        R4: null,
        R5: null,
        R6: 'des_now',
      },
    ),
    lskLabels: {
      R6: 'DES NOW',
    },
  };
}
