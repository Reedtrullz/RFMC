import type { FMCState, DisplayData } from '../../../types/fmc';
import { airbusDisplaySegment, airbusTitleRow, airbusPage } from './airbusGridHelpers';

/**
 * Render the Airbus PERF APPR page using grid segments.
 *
 * Layout:
 *   Row  0:  PERF                         APPR
 *   Row  1:  < QNH                              (label with selectable marker)
 *   Row  2:   1013                              (value, magenta)
 *   Row  3:   TEMP                              (label)
 *   Row  4:   15°C                              (value, magenta)
 *   Row  5:  < WIND                             (label with selectable marker)
 *   Row  6:   ---/---                           (value, magenta)
 *   Row  7:   MDA                               (label)
 *   Row  8:   ----                              (value, magenta)
 *   Row  9:   DH                                (label)
 *   Row 10:   ----                              (value, magenta)
 *   Row 11:   LDG CONF                          (label)
 *   Row 12:   FULL                              (value, green)
 *   Row 13:                                     (empty)
 *
 * LSK: L1=set_qnh, L5=set_wind, R6=perf_to
 */
export function renderPerfApprGrid(state: FMCState): DisplayData {
  const landing = state.landing || {};
  const qnhVal = landing.qnh !== undefined ? ` ${landing.qnh}` : ' 1013';
  const tempVal = landing.temp !== undefined ? ` ${landing.temp}°C` : ' 15°C';

  let windVal = ' ---/---';
  if (landing.windDir !== undefined && landing.windSpeed !== undefined) {
    windVal = ` ${String(landing.windDir).padStart(3, '0')}/${landing.windSpeed}`;
  }

  const mdaVal = landing.mda !== undefined ? ` ${landing.mda}` : ' ----';
  const dhVal = landing.dh !== undefined ? ` ${landing.dh}` : ' ----';
  const ldgConfVal = ` ${landing.ldgConf || landing.flaps || 'FULL'}`;

  return airbusPage(
    [
      ...airbusTitleRow('PERF', 'APPR'),

      airbusDisplaySegment(1, 0, '< QNH', 'white', { semantic: 'label' }),
      airbusDisplaySegment(2, 0, qnhVal, 'magenta', { semantic: 'activeData' }),

      airbusDisplaySegment(3, 0, '< TEMP', 'white', { semantic: 'label' }),
      airbusDisplaySegment(4, 0, tempVal, 'magenta', { semantic: 'activeData' }),

      airbusDisplaySegment(5, 0, '< WIND', 'white', { semantic: 'label' }),
      airbusDisplaySegment(6, 0, windVal, 'magenta', { semantic: 'activeData' }),

      airbusDisplaySegment(7, 0, '< MDA', 'white', { semantic: 'label' }),
      airbusDisplaySegment(8, 0, mdaVal, 'magenta', { semantic: 'activeData' }),

      airbusDisplaySegment(9, 0, '< DH', 'white', { semantic: 'label' }),
      airbusDisplaySegment(10, 0, dhVal, 'magenta', { semantic: 'activeData' }),

      airbusDisplaySegment(11, 0, '< LDG CONF', 'white', { semantic: 'label' }),
      airbusDisplaySegment(12, 0, ldgConfVal, 'green', { semantic: 'activeData' }),
    ],
    {
      L1: 'set_qnh',
      L2: 'set_landing_temp',
      L3: 'set_landing_wind',
      L4: 'set_mda',
      L5: 'set_dh',
      L6: 'toggle_ldg_conf',
      R1: null,
      R2: null,
      R3: null,
      R4: null,
      R5: null,
      R6: 'perf_to',
    },
  );
}
