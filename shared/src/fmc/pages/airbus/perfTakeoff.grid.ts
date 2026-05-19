import type { FMCState, DisplayData } from '../../../types/fmc';
import { airbusDisplaySegment, airbusTitleRow, airbusPage } from './airbusGridHelpers';

/**
 * Render the Airbus PERF TAKEOFF page using grid segments.
 *
 * Layout:
 *   Row  0:  PERF                          TO
 *   Row  1:  V1                           [v1]   (RHS value, green if set)
 *   Row  2:  VR                           [vr]   (RHS value, green if set)
 *   Row  3:  V2                           [v2]   (RHS value, green if set)
 *   Row  4:  TRANS ALT                          (label)
 *   Row  5:  5000                               (green)
 *   Row  6:  THR RED/ACC                        (label)
 *   Row  7:  1500/3000                          (green)
 *   Row  8:  FLAPS/THS                          (label)
 *   Row  9:   flaps/ths value                   (magenta, LHS)
 *   Row 10:  FLEX TO TEMP                       (label)
 *   Row 11:  flex temp value                    (magenta, LHS)
 *   Row 12:  ENG OUT ACC                        (label)
 *   Row 13:  1500              NEXT PHASE>      (value + next page, magenta)
 *
 * LSK: L1=set_v1, L2=set_vr, L3=set_v2, L5=set_flaps, L6=set_flex, R6=perf_appr
 */
export function renderPerfTakeoffGrid(state: FMCState): DisplayData {
  const { takeoff } = state;

  const v1Text = takeoff.v1 ? `${takeoff.v1}` : '[  ]';
  const vrText = takeoff.vr ? `${takeoff.vr}` : '[  ]';
  const v2Text = takeoff.v2 ? `${takeoff.v2}` : '[  ]';
  const flapsVal = takeoff.flaps ? `${takeoff.flaps}/UP0.0` : '1/UP0.0';
  const flexVal = takeoff.flexTemp !== undefined ? `${takeoff.flexTemp}°` : '---';

  return airbusPage(
    [
      ...airbusTitleRow('PERF', 'TO'),

      airbusDisplaySegment(1, 1, ' V1', 'white', { semantic: 'label' }),
      airbusDisplaySegment(1, 20, v1Text.padStart(4), takeoff.v1 ? 'green' : 'white'),

      airbusDisplaySegment(2, 1, ' VR', 'white', { semantic: 'label' }),
      airbusDisplaySegment(2, 20, vrText.padStart(4), takeoff.vr ? 'green' : 'white'),

      airbusDisplaySegment(3, 1, ' V2', 'white', { semantic: 'label' }),
      airbusDisplaySegment(3, 20, v2Text.padStart(4), takeoff.v2 ? 'green' : 'white'),

      airbusDisplaySegment(4, 1, ' TRANS ALT', 'white', { semantic: 'label' }),
      airbusDisplaySegment(5, 1, ' 5000', 'green', { semantic: 'activeData' }),

      airbusDisplaySegment(6, 1, ' THR RED/ACC', 'white', { semantic: 'label' }),
      airbusDisplaySegment(7, 1, ' 1500/3000', 'green', { semantic: 'activeData' }),

      airbusDisplaySegment(8, 1, ' FLAPS/THS', 'white', { semantic: 'label' }),
      airbusDisplaySegment(9, 1, ` ${flapsVal}`, 'magenta', { semantic: 'guidance' }),

      airbusDisplaySegment(10, 1, ' FLEX TO TEMP', 'white', { semantic: 'label' }),
      airbusDisplaySegment(11, 1, ` ${flexVal}`, 'magenta', { semantic: 'guidance' }),

      airbusDisplaySegment(12, 1, ' ENG OUT ACC', 'white', { semantic: 'label' }),
      airbusDisplaySegment(13, 1, ' 1500', 'white', { semantic: 'activeData' }),
      airbusDisplaySegment(13, 13, 'NEXT PHASE>', 'magenta', { semantic: 'guidance' }),
    ],
    {
      L1: 'set_v1',
      L2: 'set_vr',
      L3: 'set_v2',
      L4: null,
      L5: 'set_flaps',
      L6: 'set_flex',
      R1: null,
      R2: null,
      R3: null,
      R4: null,
      R5: null,
      R6: 'perf_appr',
    },
  );
}
