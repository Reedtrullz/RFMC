import type { FMCState, DisplayData } from '../../../types/fmc';
import { boeingPage, boeingTitle, seg } from './boeingGridHelpers';

export function renderBoeingTakeoffRefGrid(state: FMCState): DisplayData {
  const { takeoff, landing, takeoffRefPageIndex } = state;

  if (takeoffRefPageIndex === 1) {
    // Page 2
    return boeingPage(
      [
        ...boeingTitle('TAKEOFF REF', '2/2'),
        seg(1, 1, 'LANDING RW', 'white', { size: 'small' }),
        seg(2, 1, landing.runway || state.route.runway || takeoff.runway || '---', 'green'),
        seg(5, 1, 'FLAPS', 'white', { size: 'small' }),
        seg(6, 1, landing.flaps || '[  ]', landing.flaps ? 'green' : 'white'),
        seg(5, 19, 'VREF', 'white', { size: 'small' }),
        seg(6, 18, landing.vref ? `${landing.vref}KT` : '[   ]', landing.vref ? 'green' : 'white'),
        seg(7, 1, 'ILS FREQ', 'white', { size: 'small' }),
        seg(8, 1, landing.ilsFrequency || '---.--', landing.ilsFrequency ? 'green' : 'white'),
        seg(7, 19, 'CRS', 'white', { size: 'small' }),
        seg(8, 19, landing.course ? `${landing.course}` : '---', landing.course ? 'green' : 'white'),
        seg(13, 0, '<PREV PAGE', 'white'),
      ],
      {
        L1: 'set_landing_runway',
        L3: 'set_landing_flaps',
        L4: 'set_ils_frequency',
        R3: 'set_landing_vref',
        R4: 'set_ils_course',
        L6: 'prev_page',
      },
    );
  }

  const renderVSpeed = (val: number | undefined, suggested: number | undefined) => {
    if (val) return { text: `${val}`, size: 'normal' as const, color: 'green' as const };
    if (suggested) return { text: `${suggested}`, size: 'small' as const, color: 'white' as const };
    return { text: '[   ]', size: 'normal' as const, color: 'white' as const };
  };

  const v1 = renderVSpeed(takeoff.v1, takeoff.suggestedV1);
  const vr = renderVSpeed(takeoff.vr, takeoff.suggestedVr);
  const v2 = renderVSpeed(takeoff.v2, takeoff.suggestedV2);

  return boeingPage(
    [
      ...boeingTitle('TAKEOFF REF', '1/2'),

      seg(1, 1, 'RW', 'white', { size: 'small' }),
      seg(2, 1, takeoff.runway || '---', 'green'),

      seg(3, 1, 'TO MODE', 'white', { size: 'small' }),
      seg(4, 1, takeoff.toMode || 'TO', 'green'),

      seg(5, 1, 'FLAPS', 'white', { size: 'small' }),
      seg(6, 1, takeoff.flaps || '[  ]', takeoff.flaps ? 'green' : 'white'),

      seg(7, 1, 'WIND', 'white', { size: 'small' }),
      seg(8, 1, takeoff.windDir ? `${takeoff.windDir}°/${takeoff.windSpeed}` : '---', 'green'),

      seg(9, 1, 'OAT', 'white', { size: 'small' }),
      seg(10, 1, takeoff.oat !== undefined ? `${takeoff.oat}°` : '---', 'green'),

      seg(1, 20, 'V1', 'white', { size: 'small' }),
      seg(2, 18, v1.text.padStart(3), v1.color, { size: v1.size }),

      seg(3, 20, 'VR', 'white', { size: 'small' }),
      seg(4, 18, vr.text.padStart(3), vr.color, { size: vr.size }),

      seg(5, 20, 'V2', 'white', { size: 'small' }),
      seg(6, 18, v2.text.padStart(3), v2.color, { size: v2.size }),

      seg(9, 11, 'THRUST LIMIT', 'white', { size: 'small' }),
      seg(10, 14, 'SEL/24K >', 'white'),

      seg(13, 0, '<INDEX', 'white'),
      seg(13, 15, 'POS INIT>', 'white'),
    ],
    {
      L1: 'set_runway',
      L2: 'set_to_mode',
      L3: 'set_flaps',
      L4: 'set_wind',
      L5: 'set_oat',
      L6: 'menu',
      R1: 'set_v1',
      R2: 'set_vr',
      R3: 'set_v2',
      R5: 'thrust_limit',
      R6: 'pos_init',
    },
  );
}
