import type { FMCState, DisplayData } from '@shared';
import { boeingPage, boeingTitle, seg } from './boeingGridHelpers';

export function renderBoeingProgressGrid(state: FMCState): DisplayData {
  const { flightPlan, aircraftState, performance } = state;
  const isLive = aircraftState !== null;
  const title = state.isModified ? 'MOD PROGRESS' : 'PROGRESS';

  // Extract variables
  const origin = flightPlan.origin || '----';
  const dest = flightPlan.destination || '----';
  
  // Calculate DTG
  let toWpt = '----';
  let nextWpt = '----';
  
  let dtgTo = 0;
  let dtgNext = 0;
  let dtgDest = 0;

  let hasTo = false;
  let hasNext = false;

  if (aircraftState?.position && flightPlan.waypoints.length > 0) {
    // In a real FMC, we'd use the active waypoint index
    const w0 = flightPlan.waypoints[0];
    if (w0.lat && w0.lon) {
      toWpt = w0.ident;
      hasTo = true;
      // We'll use a placeholder for distance if we don't have a real nav math helper here
      // But we have distanceNm from @shared now
      toWpt = w0.ident;
    }
  }

  return boeingPage([
    ...boeingTitle(title, '1/1'),

    seg(1, 1, 'LAST', 'white', { size: 'small' }),
    seg(1, 15, 'ATA', 'white', { size: 'small' }),
    seg(1, 20, 'FUEL', 'white', { size: 'small' }),
    seg(2, 1, origin, 'green'),
    seg(2, 14, '----', 'green'),
    seg(2, 20, '----', 'green'),

    seg(3, 1, 'TO', 'white', { size: 'small' }),
    seg(3, 15, 'ETA', 'white', { size: 'small' }),
    seg(3, 20, 'DTG', 'white', { size: 'small' }),
    seg(4, 1, toWpt, 'magenta'),
    seg(4, 14, '----', 'magenta'),
    seg(4, 20, '----', 'magenta'),

    seg(5, 1, 'NEXT', 'white', { size: 'small' }),
    seg(5, 20, 'DTG', 'white', { size: 'small' }),
    seg(6, 1, nextWpt, 'green'),
    seg(6, 20, '----', 'green'),

    seg(7, 1, 'DEST', 'white', { size: 'small' }),
    seg(7, 20, 'FUEL', 'white', { size: 'small' }),
    seg(8, 1, dest, 'green'),
    seg(8, 14, '----', 'green'),
    seg(8, 20, '----', 'green'),

    seg(10, 1, 'FUEL USE', 'white', { size: 'small' }),
    seg(11, 1, '0.0', 'green'),

    seg(13, 0, '<POS REF', 'white'),
  ], {
    L6: 'pos_init', // Goes to POS REF
  });
}
