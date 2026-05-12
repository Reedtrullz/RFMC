import type { FMCState, DisplayData } from '@shared';
import { boeingPage, boeingTitle, seg } from './boeingGridHelpers';

export function renderBoeingTakeoffRefGrid(state: FMCState): DisplayData {
  const { takeoff, takeoffRefPageIndex } = state;

  if (takeoffRefPageIndex === 1) {
    // Page 2
    return boeingPage([
      ...boeingTitle('TAKEOFF REF', '2/2'),
      seg(1, 1, 'LANDING RW', 'white', { size: 'small' }),
      seg(2, 1, state.landing.runway || '---', 'green'),
      seg(13, 0, '<PREV PAGE', 'white'),
    ], {
      L1: 'set_landing_runway',
      L6: 'prev_page',
    });
  }

  return boeingPage([
    ...boeingTitle('TAKEOFF REF', '1/2'),

    seg(1, 1, 'RW', 'white', { size: 'small' }),
    seg(2, 1, takeoff.runway || '---', 'green'),

    seg(3, 1, 'TO MODE', 'white', { size: 'small' }),
    seg(4, 1, takeoff.toMode || 'TO', 'green'),

    seg(5, 1, 'OAT', 'white', { size: 'small' }),
    seg(6, 1, takeoff.oat ? `${takeoff.oat}°C` : '---', 'green'),

    seg(7, 1, 'WIND', 'white', { size: 'small' }),
    seg(8, 1, takeoff.windDir ? `${takeoff.windDir}°/${takeoff.windSpeed}KT` : '---', 'green'),

    seg(1, 20, 'V1', 'white', { size: 'small' }),
    seg(2, 19, takeoff.v1 ? `${takeoff.v1}KT` : '[   ]', 'white'),

    seg(3, 20, 'VR', 'white', { size: 'small' }),
    seg(4, 19, takeoff.vr ? `${takeoff.vr}KT` : '[   ]', 'white'),

    seg(5, 20, 'V2', 'white', { size: 'small' }),
    seg(6, 19, takeoff.v2 ? `${takeoff.v2}KT` : '[   ]', 'white'),

    seg(13, 16, 'INDEX>', 'white'),
  ], {
    L1: 'set_runway',
    L3: 'set_to_mode',
    L4: 'set_oat',
    L5: 'set_wind',
    L6: 'next_page',
    R1: 'set_v1',
    R2: 'set_vr',
    R3: 'set_v2',
    R6: 'ident',
  });
}
