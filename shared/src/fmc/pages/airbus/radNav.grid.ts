import type { FMCState, DisplayData } from '../../../types/fmc';
import { airbusPage, airbusTitleRow, airbusDisplaySegment, airbusSelectableField } from './airbusGridHelpers';

/**
 * Render the Airbus RAD NAV page as a DisplaySegment grid.
 *
 * Fields: VOR1/FREQ, VOR2/FREQ, ADF1/FREQ with '<' selectable markers.
 * LSK actions: L1=set_vor1, L2=set_vor2, L3=set_adf1.
 */
export function renderRadNavGrid(state: FMCState): DisplayData {
  const { radios } = state;

  return airbusPage(
    [
      // Row 0: Title
      ...airbusTitleRow('RAD NAV'),

      // Row 1: VOR1/FREQ label
      airbusDisplaySegment(1, 1, 'VOR1/FREQ', 'white', { semantic: 'label' }),

      // Row 2: VOR1 frequency (selectable)
      airbusSelectableField('<', 2, 0, 'L1', 'set_vor1'),
      airbusSelectableField(` --- / ${radios.vor1}`, 2, 2, 'L1', 'set_vor1'),

      // Row 3: VOR2/FREQ label
      airbusDisplaySegment(3, 1, 'VOR2/FREQ', 'white', { semantic: 'label' }),

      // Row 4: VOR2 frequency (selectable)
      airbusSelectableField('<', 4, 0, 'L2', 'set_vor2'),
      airbusSelectableField(` --- / ${radios.vor2}`, 4, 2, 'L2', 'set_vor2'),

      // Row 5: ADF1/FREQ label
      airbusDisplaySegment(5, 1, 'ADF1/FREQ', 'white', { semantic: 'label' }),

      // Row 6: ADF1 frequency (selectable)
      airbusSelectableField('<', 6, 0, 'L3', 'set_adf1'),
      airbusSelectableField(` ${radios.adf1}`, 6, 2, 'L3', 'set_adf1'),
    ],
    {
      L1: 'set_vor1',
      L2: 'set_vor2',
      L3: 'set_adf1',
      L4: null,
      L5: null,
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
