import type { FMCState, DisplayData } from '../../../types/fmc';
import { boeingPage, boeingTitle, seg } from './boeingGridHelpers';

export function renderBoeingN1LimitGrid(state: FMCState): DisplayData {
  const { takeoff } = state;
  const mode = takeoff.toMode || 'TO';
  const n1Limits: Record<string, { to: string; clb: string; crz: string; cont: string }> = {
    TO: { to: '98.5', clb: '92.0', crz: '82.5', cont: '94.0' },
    'TO 1': { to: '94.0', clb: '88.5', crz: '80.0', cont: '90.5' },
    'TO 2': { to: '88.0', clb: '84.0', crz: '77.5', cont: '86.0' },
  };
  const limits = n1Limits[mode] || n1Limits['TO'];

  const assumedTempStr = takeoff.assumedTemp ? `${takeoff.assumedTemp}°C` : '---';

  const titlePrefix = state.isModified ? 'MOD' : 'ACT';
  const title = `${titlePrefix} N1 LIMIT`;

  return boeingPage(
    [
      ...boeingTitle(title, '1/1'),

      seg(1, 1, 'SEL OAT', 'white', { size: 'small' }),
      seg(1, 16, 'REDUCED', 'white', { size: 'small' }),
      seg(2, 0, `<${assumedTempStr}`, 'green'),
      seg(2, 16, '<ARMED>', 'green'),

      seg(3, 0, `<${mode}`, mode === 'TO' ? 'green' : 'white'),
      seg(4, 1, limits.to, 'green'),

      seg(5, 0, '<CLB', mode === 'CLB' ? 'green' : 'white'),
      seg(6, 1, limits.clb, 'green'),

      seg(7, 0, '<CRZ', mode === 'CRZ' ? 'green' : 'white'),
      seg(8, 1, limits.crz, 'green'),

      seg(9, 0, '<CON', mode === 'CON' ? 'green' : 'white'),
      seg(10, 1, limits.cont, 'green'),

      seg(13, 0, '<INDEX', 'white'),
      seg(13, 15, 'TAKEOFF>', 'white'),
    ],
    {
      L1: 'set_assumed_temp',
      L2: 'select_to',
      L3: 'select_clb',
      L4: 'select_crz',
      L5: 'select_con',
      L6: 'menu',
      R1: null,
      R2: null,
      R3: null,
      R4: null,
      R5: null,
      R6: 'takeoff_ref',
    },
  );
}
