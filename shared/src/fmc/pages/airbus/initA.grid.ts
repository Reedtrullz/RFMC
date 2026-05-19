import type { FMCState, DisplayData } from '../../../types/fmc';
import { airbusDisplaySegment, airbusTitleRow, airbusPage } from './airbusGridHelpers';

export function renderInitAGrid(state: FMCState): DisplayData {
  const route = state.isModified && state.pendingRoute ? state.pendingRoute : state.route;
  const { performance, position } = state;
  const title = state.isModified ? 'TMPY INIT' : 'INIT';
  const fromTo = route.origin && route.destination ? `${route.origin}/${route.destination}` : ' [  ]/[  ] ';

  const isAligning = position.irsState === 'ALIGNING';
  const isNav = position.irsState === 'NAV';

  const fltNbr = route.flightNumber || '--------';

  const latStr = `${Math.abs(position.lat).toFixed(1)}${position.lat >= 0 ? 'N' : 'S'}`;
  const lonStr = `${Math.abs(position.lon).toFixed(1)}${position.lon >= 0 ? 'E' : 'W'}`;

  const crzVal = performance.crzAlt ? `FL${String(performance.crzAlt).slice(0, 3)}` : '-----';
  const crzDisplay = ` ${crzVal}/--°`;

  let irsDisplay: string;
  if (isAligning) {
    irsDisplay = `IN ALIGN ${Math.ceil(position.irsTimeRemaining / 60)} MIN`;
  } else if (isNav) {
    irsDisplay = 'IRS RELAY >';
  } else {
    irsDisplay = '<IRS INIT';
  }

  return airbusPage(
    [
      // Row 0: Title
      ...airbusTitleRow(title, 'A'),

      // Row 1: CO RTE / FROM/TO (LSK 1 label)
      airbusDisplaySegment(1, 0, 'CO RTE', 'white', { semantic: 'label' }),
      airbusDisplaySegment(1, 7, 'FROM/TO', 'white', { semantic: 'label' }),

      // Row 2: FROM/TO value (LSK 1 data)
      airbusDisplaySegment(2, 0, ' --------', 'white', { semantic: 'label' }),
      airbusDisplaySegment(2, 10, fromTo, route.origin ? 'green' : 'magenta', {
        semantic: 'activeData',
      }),

      // Row 3: FLT NBR / ALTN/CO RTE (LSK 2 label)
      airbusDisplaySegment(3, 0, 'FLT NBR', 'white', { semantic: 'label' }),
      airbusDisplaySegment(3, 8, 'ALTN/CO RTE', 'white', { semantic: 'label' }),

      // Row 4: Flight number and alternate values (LSK 2 data)
      airbusDisplaySegment(4, 0, ` ${fltNbr}`, 'magenta', {
        semantic: 'activeData',
      }),
      airbusDisplaySegment(4, 9, `${route.alternate || '----'}/--------`, 'magenta', {
        semantic: 'activeData',
      }),

      // Row 5: LAT / COST INDEX (LSK 3 label)
      airbusDisplaySegment(5, 0, 'LAT', 'white', { semantic: 'label' }),
      airbusDisplaySegment(5, 4, 'COST INDEX', 'white', { semantic: 'label' }),

      // Row 6: Cost index and latitude values (LSK 3 data)
      airbusDisplaySegment(6, 0, ` ${latStr}`, 'magenta', {
        semantic: 'activeData',
      }),
      airbusDisplaySegment(6, 8, ` ${performance.costIndex || '---'}`, 'magenta', {
        semantic: 'activeData',
      }),

      // Row 7: LONG / CRZ FL/TEMP (LSK 4 label)
      airbusDisplaySegment(7, 0, 'LONG', 'white', { semantic: 'label' }),
      airbusDisplaySegment(7, 5, 'CRZ FL/TEMP', 'white', { semantic: 'label' }),

      // Row 8: Cruise FL/Temp and longitude values (LSK 4 data)
      airbusDisplaySegment(8, 0, ` ${lonStr}`, 'magenta', {
        semantic: 'activeData',
      }),
      airbusDisplaySegment(8, 8, crzDisplay, 'magenta', {
        semantic: 'activeData',
      }),

      // Row 9: blank

      // Row 10: TROPO label
      airbusDisplaySegment(10, 0, ' TROPO', 'white', { semantic: 'label' }),

      // Row 11: TROPO value
      airbusDisplaySegment(11, 0, ' 36090', 'green', { semantic: 'activeData' }),

      // Row 12: blank

      // Row 13: IRS/Nav status and INIT B
      airbusDisplaySegment(13, 0, irsDisplay, 'magenta', {
        semantic: 'activeData',
      }),
      airbusDisplaySegment(13, 16, 'INIT B >', 'magenta', {
        semantic: 'activeData',
      }),
    ],
    {
      L1: 'data_index',
      L2: 'set_flt_nbr',
      L3: 'set_cost_index',
      L4: 'set_crz_fl',
      L5: null,
      L6: isNav ? 'irs_relay' : 'align_irs',
      R1: 'set_from_to',
      R2: 'set_altn',
      R3: null,
      R4: null,
      R5: null,
      R6: 'init_b',
    },
  );
}
