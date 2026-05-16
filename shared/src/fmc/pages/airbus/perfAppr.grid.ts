import type { FMCState, DisplayData } from '../../../types/fmc';
import {
  airbusDisplaySegment,
  airbusTitleRow,
  airbusPage,
} from './airbusGridHelpers';

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
  return airbusPage([
    ...airbusTitleRow('PERF', 'APPR'),

    airbusDisplaySegment(1, 0, '< QNH', 'white', { semantic: 'label' }),
    airbusDisplaySegment(2, 0, ' 1013', 'magenta', { semantic: 'activeData' }),

    airbusDisplaySegment(3, 0, ' TEMP', 'white', { semantic: 'label' }),
    airbusDisplaySegment(4, 0, ' 15°C', 'magenta', { semantic: 'activeData' }),

    airbusDisplaySegment(5, 0, '< WIND', 'white', { semantic: 'label' }),
    airbusDisplaySegment(6, 0, ' ---/---', 'magenta', { semantic: 'activeData' }),

    airbusDisplaySegment(7, 0, ' MDA', 'white', { semantic: 'label' }),
    airbusDisplaySegment(8, 0, ' ----', 'magenta', { semantic: 'activeData' }),

    airbusDisplaySegment(9, 0, ' DH', 'white', { semantic: 'label' }),
    airbusDisplaySegment(10, 0, ' ----', 'magenta', { semantic: 'activeData' }),

    airbusDisplaySegment(11, 0, ' LDG CONF', 'white', { semantic: 'label' }),
    airbusDisplaySegment(12, 0, ' FULL', 'green', { semantic: 'activeData' }),
  ], {
    L1: 'set_qnh', L2: null, L3: null, L4: null,
    L5: 'set_wind', L6: null,
    R1: null, R2: null, R3: null, R4: null,
    R5: null, R6: 'perf_to',
  });
}
