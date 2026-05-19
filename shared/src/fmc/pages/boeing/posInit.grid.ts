import type { FMCState, DisplayData } from '../../../types/fmc';
import { boeingPage, boeingTitle, seg } from './boeingGridHelpers';

export function renderBoeingPosInitGrid(state: FMCState): DisplayData {
  const pageIndex = state.posPageIndex ?? 0;

  if (pageIndex === 0) return renderPosInitPage1(state);
  if (pageIndex === 1) return renderPosRefPage1(state);
  return renderPosRefPage2(state);
}

function renderPosInitPage1(state: FMCState): DisplayData {
  const lastPos = formatLatLon(state.position.lat, state.position.lon);

  return boeingPage(
    [
      ...boeingTitle('POS INIT', '1/3'),

      seg(1, 1, 'LAST POS', 'white', { size: 'small' }),
      seg(2, 1, lastPos, 'green'),

      seg(3, 0, '<REF AIRPORT', 'white', { size: 'small' }),
      seg(4, 1, state.position.refAirport || '----', 'green'),

      seg(5, 0, '<GATE', 'white', { size: 'small' }),
      seg(6, 1, state.position.gate || '----', 'green'),

      seg(8, 14, 'IRS STATUS', 'white', { size: 'small' }),
      ...(state.position.irsState === 'ALIGNING'
        ? [
            seg(9, 13, 'IN ALIGN', 'white'),
            seg(10, 14, `${Math.ceil(state.position.irsTimeRemaining / 60)} MIN`, 'white'),
          ]
        : state.position.irsState === 'NAV'
          ? [seg(9, 13, 'IRS NAV', 'green')]
          : [seg(9, 13, 'IRS OFF', 'amber')]),

      seg(12, 13, 'SET IRS POS', 'white', { size: 'small' }),
      state.position.irsState === 'NAV'
        ? seg(13, 8, lastPos.slice(0, 10), 'green')
        : state.position.irsAlignmentProgress > 0
          ? seg(13, 8, `ALIGN ${state.position.irsAlignmentProgress}%`.slice(0, 10), 'white', {
              blink: state.position.irsTimeRemaining < 60,
            })
          : seg(13, 8, '□□□□.□ □□'.slice(0, 10), 'white'),

      seg(13, 0, '<INDEX', 'white'),
      seg(13, 18, 'ROUTE>', 'white'),
    ],
    {
      L1: null,
      L2: 'set_ref_airport',
      L3: 'set_gate',
      L4: 'align_irs',
      L6: 'menu',
      R4: 'set_irs_pos',
      R6: 'rte',
    },
  );
}

function renderPosRefPage1(state: FMCState): DisplayData {
  const fmcPos = formatLatLon(state.position.lat, state.position.lon);
  const gps = state.sensors.find((s) => s.source === 'GPS');
  const irs = state.sensors.find((s) => s.source === 'IRS');
  const radio = state.sensors.find((s) => s.source === 'DME_DME' || s.source === 'VOR_DME');

  return boeingPage(
    [
      ...boeingTitle('POS REF', '2/3'),

      seg(1, 1, `FMC POS (${state.activeNavSource})`, 'white', { size: 'small' }),
      seg(2, 1, fmcPos, 'green'),

      seg(3, 1, 'GPS', 'white', { size: 'small' }),
      seg(4, 1, gps?.available ? `${gps.positionErrorNm.toFixed(2)} NM` : 'OFF', 'green'),

      seg(5, 1, 'RADIO', 'white', { size: 'small' }),
      seg(6, 1, radio?.available ? `${radio.positionErrorNm.toFixed(2)} NM` : 'OFF', 'green'),

      seg(7, 1, 'IRS', 'white', { size: 'small' }),
      seg(8, 1, irs?.available ? `${irs.positionErrorNm.toFixed(2)} NM` : 'OFF', 'green'),

      seg(13, 0, '<INDEX', 'white'),
      seg(13, 18, 'BRIGHTNESS>', 'white'),
    ],
    {
      L6: 'menu',
    },
  );
}

function renderPosRefPage2(state: FMCState): DisplayData {
  const { anpNm, rnpNm } = state.navPerformance;

  return boeingPage(
    [
      ...boeingTitle('POS REF', '3/3'),

      seg(1, 1, 'ACTUAL', 'white', { size: 'small' }),
      seg(2, 1, `${anpNm.toFixed(2)} NM`, anpNm > rnpNm ? 'amber' : 'green'),

      seg(3, 1, 'REQUIRED', 'white', { size: 'small' }),
      seg(4, 1, `${rnpNm.toFixed(2)} NM`, 'green'),

      seg(13, 0, '<INDEX', 'white'),
    ],
    {
      L6: 'menu',
    },
  );
}

function formatLatLon(lat?: number, lon?: number): string {
  if (lat == null || lon == null) return '----.-  ----.-';
  return `${Math.abs(lat).toFixed(1)}${lat >= 0 ? 'N' : 'S'} ${Math.abs(lon).toFixed(1)}${lon >= 0 ? 'E' : 'W'}`;
}
