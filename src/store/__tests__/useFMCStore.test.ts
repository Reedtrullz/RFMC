import { describe, it, expect, beforeEach } from 'vitest';
import { useFMCStore } from '../useFMCStore';

describe('FMC Store', () => {
  beforeEach(() => {
    useFMCStore.getState().resetState();
  });

  it('sets page correctly', () => {
    const store = useFMCStore.getState();
    store.setPage('RTE');
    expect(useFMCStore.getState().currentPage).toBe('RTE');
  });

  it('tracks page history', () => {
    const store = useFMCStore.getState();
    store.setPage('RTE');
    store.setPage('PERF_INIT');
    expect(useFMCStore.getState().pageHistory).toContain('RTE');
  });

  it('goes back to previous page', () => {
    const store = useFMCStore.getState();
    store.setPage('RTE');
    store.setPage('PERF_INIT');
    store.goBack();
    expect(useFMCStore.getState().currentPage).toBe('RTE');
  });

  it('presses keys into scratchpad', () => {
    const store = useFMCStore.getState();
    store.pressKey('1');
    store.pressKey('2');
    expect(useFMCStore.getState().scratchpad).toBe('12');
  });

  it('clears scratchpad with CLR', () => {
    const store = useFMCStore.getState();
    store.pressKey('A');
    store.pressKey('B');
    store.pressKey('CLR');
    expect(useFMCStore.getState().scratchpad).toBe('A');
  });

  it('sets aircraft type', () => {
    const store = useFMCStore.getState();
    store.setAircraft('AIRBUS_A320');
    expect(useFMCStore.getState().aircraft).toBe('AIRBUS_A320');
  });

  it('loads flight plan', () => {
    const store = useFMCStore.getState();
    store.loadFlightPlan({ origin: 'KJFK', destination: 'KDCA', route: 'DCT' });
    const state = useFMCStore.getState();
    expect(state.flightPlan.origin).toBe('KJFK');
    expect(state.flightPlan.destination).toBe('KDCA');
  });

  it('parses RTE route entry into LEGS waypoints', () => {
    const store = useFMCStore.getState();
    store.setPage('RTE');
    store.pressKey('NEXT_PAGE');
    for (const key of 'KJFK DCT RBV DIXIE KDCA') {
      store.pressKey(key === ' ' ? 'SPACE' : (key as Parameters<typeof store.pressKey>[0]));
    }
    store.pressLSK('L', 1);

    const state = useFMCStore.getState();
    expect(state.route.routeString).toBe('KJFK DCT RBV DIXIE KDCA');
    expect(state.flightPlan.waypoints.map(w => w.ident)).toEqual(['RBV', 'DIXIE', 'KDCA']);
    expect(state.legsPageCount).toBe(1);
    expect(state.execLit).toBe(true);
  });

  it('inserts and deletes LEGS waypoints through LSK actions', () => {
    const store = useFMCStore.getState();
    useFMCStore.setState({
      currentPage: 'LEGS',
      flightPlan: {
        origin: 'KJFK',
        destination: 'KDCA',
        flightNumber: '',
        route: '',
        waypoints: [
          { ident: 'RBV', discontinuity: false },
          { ident: 'DIXIE', discontinuity: false },
        ],
      },
    });

    for (const key of 'LENDY') store.pressKey(key as Parameters<typeof store.pressKey>[0]);
    store.pressLSK('L', 2);
    expect(useFMCStore.getState().flightPlan.waypoints.map(w => w.ident)).toEqual(['RBV', 'LENDY', 'DIXIE']);
    expect(useFMCStore.getState().execLit).toBe(true);

    store.pressKey('DEL');
    store.pressLSK('L', 2);
    const state = useFMCStore.getState();
    expect(state.flightPlan.waypoints.map(w => w.ident)).toEqual(['RBV', 'DIXIE']);
    expect(state.deleteMode).toBe(false);
  });

  it('resolves a LEGS discontinuity by replacing it with the scratchpad waypoint', () => {
    const store = useFMCStore.getState();
    useFMCStore.setState({
      currentPage: 'LEGS',
      flightPlan: {
        origin: 'KJFK',
        destination: 'KDCA',
        flightNumber: '',
        route: '',
        waypoints: [
          { ident: 'RBV', discontinuity: false },
          { ident: 'DISCONTINUITY', discontinuity: true },
          { ident: 'DIXIE', discontinuity: false },
        ],
      },
    });

    for (const key of 'LENDY') store.pressKey(key as Parameters<typeof store.pressKey>[0]);
    store.pressLSK('L', 2);

    const state = useFMCStore.getState();
    expect(state.flightPlan.waypoints).toEqual([
      { ident: 'RBV', discontinuity: false },
      { ident: 'LENDY', discontinuity: false },
      { ident: 'DIXIE', discontinuity: false },
    ]);
    expect(state.execLit).toBe(true);
    expect(state.scratchpad).toBe('');
  });

  it('stages HOLD edits and commits them only on EXEC', () => {
    const store = useFMCStore.getState();
    useFMCStore.setState({ currentPage: 'HOLD' });

    for (const key of 'RBV') store.pressKey(key as Parameters<typeof store.pressKey>[0]);
    store.pressLSK('L', 1);
    for (const key of '270') store.pressKey(key as Parameters<typeof store.pressKey>[0]);
    store.pressLSK('L', 3);
    for (const key of '1.5') store.pressKey(key === '.' ? 'DOT' : (key as Parameters<typeof store.pressKey>[0]));
    store.pressLSK('L', 4);
    for (const key of 'L') store.pressKey(key as Parameters<typeof store.pressKey>[0]);
    store.pressLSK('R', 1);

    let state = useFMCStore.getState();
    expect(state.hold.fix).toBe('');
    expect(state.holdPending).toMatchObject({ fix: 'RBV', inboundCourse: 270, legTime: 1.5, direction: 'L' });
    expect(state.execLit).toBe(true);

    store.pressEXEC();
    state = useFMCStore.getState();
    expect(state.hold).toMatchObject({ fix: 'RBV', inboundCourse: 270, legTime: 1.5, direction: 'L' });
    expect(state.holdPending).toBeNull();
    expect(state.execLit).toBe(false);
  });

  it('rejects HOLD fixes that are not in the active route', () => {
    const store = useFMCStore.getState();
    useFMCStore.setState({
      currentPage: 'HOLD',
      flightPlan: {
        origin: 'KJFK',
        destination: 'KDCA',
        flightNumber: '',
        route: '',
        waypoints: [
          { ident: 'RBV', discontinuity: false },
          { ident: 'DIXIE', discontinuity: false },
        ],
      },
    });

    for (const key of 'LENDY') store.pressKey(key as Parameters<typeof store.pressKey>[0]);
    store.pressLSK('L', 1);

    const state = useFMCStore.getState();
    expect(state.holdPending).toBeNull();
    expect(state.scratchpadError).toBe('NOT IN ROUTE');
    expect(state.execLit).toBe(false);
  });

  it('rejects V-speeds that violate V1 < VR < V2', () => {
    const store = useFMCStore.getState();
    useFMCStore.setState({
      currentPage: 'TAKEOFF_REF',
      takeoff: {
        runway: '',
        toMode: 'TO',
        assumedTemp: 0,
        v1: 130,
        vr: 140,
        v2: 145,
        trim: 0,
        oat: 0,
        windDir: 0,
        windSpeed: 0,
        qnh: 0,
      },
    });

    for (const key of '150') store.pressKey(key as Parameters<typeof store.pressKey>[0]);
    store.pressLSK('R', 1);

    const state = useFMCStore.getState();
    expect(state.takeoff.v1).toBe(130);
    expect(state.scratchpadError).toBe('V1 MUST BE < VR');
    expect(state.execLit).toBe(false);
  });

  it('deletes V-speeds when takeoff runway changes after speeds are entered', () => {
    const store = useFMCStore.getState();
    useFMCStore.setState({
      currentPage: 'TAKEOFF_REF',
      scratchpad: '',
      scratchpadError: null,
      msgLight: false,
      takeoff: {
        runway: '04L',
        toMode: 'TO',
        assumedTemp: 0,
        v1: 130,
        vr: 135,
        v2: 140,
        trim: 0,
        oat: 0,
        windDir: 0,
        windSpeed: 0,
        qnh: 0,
      },
    });

    for (const key of '19') store.pressKey(key as Parameters<typeof store.pressKey>[0]);
    store.pressLSK('L', 1);

    const state = useFMCStore.getState();
    expect(state.takeoff).toMatchObject({ runway: '19', v1: 0, vr: 0, v2: 0 });
    expect(state.scratchpad).toBe('V SPEEDS DELETED');
    expect(state.msgLight).toBe(true);
    expect(state.execLit).toBe(true);
  });

  it('sets landing approach reference values from TAKEOFF REF page 2', () => {
    const store = useFMCStore.getState();
    useFMCStore.setState({
      currentPage: 'TAKEOFF_REF',
      takeoffRefPageIndex: 1,
      route: { origin: '', destination: '', flightNumber: '', companyRoute: '', routeString: '', approach: 'ILS19' },
    });

    for (const key of '19') store.pressKey(key as Parameters<typeof store.pressKey>[0]);
    store.pressLSK('L', 1);
    for (const key of '30') store.pressKey(key as Parameters<typeof store.pressKey>[0]);
    store.pressLSK('L', 3);
    for (const key of '142') store.pressKey(key as Parameters<typeof store.pressKey>[0]);
    store.pressLSK('R', 3);
    for (const key of '109.90') store.pressKey(key === '.' ? 'DOT' : (key as Parameters<typeof store.pressKey>[0]));
    store.pressLSK('L', 4);
    for (const key of '193') store.pressKey(key as Parameters<typeof store.pressKey>[0]);
    store.pressLSK('R', 4);

    const state = useFMCStore.getState();
    expect(state.landing).toEqual({ runway: '19', flaps: '30', vref: 142, ilsFrequency: '109.90', course: 193 });
    expect(state.route.runway).toBe('19');
    expect(state.execLit).toBe(true);
  });

  it('sets DEP/ARR procedures, DIR INTC, and N1 LIMIT values', () => {
    const store = useFMCStore.getState();
    useFMCStore.setState({ currentPage: 'DEP_ARR', route: { origin: 'KJFK', destination: 'KDCA', flightNumber: '', companyRoute: '', routeString: '' } });

    for (const key of 'MERIT4') store.pressKey(key as Parameters<typeof store.pressKey>[0]);
    store.pressLSK('L', 2);
    for (const key of '04L') store.pressKey(key as Parameters<typeof store.pressKey>[0]);
    store.pressLSK('L', 3);
    store.pressLSK('L', 6);
    for (const key of 'FRDMM2') store.pressKey(key as Parameters<typeof store.pressKey>[0]);
    store.pressLSK('L', 2);
    for (const key of 'ILS19') store.pressKey(key as Parameters<typeof store.pressKey>[0]);
    store.pressLSK('L', 3);

    let state = useFMCStore.getState();
    expect(state.route).toMatchObject({ sid: 'MERIT4', runway: '04L', star: 'FRDMM2', approach: 'ILS19' });

    store.setPage('DIR_INTC');
    for (const key of 'DIXIE') store.pressKey(key as Parameters<typeof store.pressKey>[0]);
    store.pressLSK('L', 1);
    expect(useFMCStore.getState().route.directTo).toBe('DIXIE');

    useFMCStore.setState({ takeoff: { ...useFMCStore.getState().takeoff, toMode: 'TO 2' } });
    store.setPage('N1_LIMIT');
    const display = useFMCStore.getState().getDisplayData();
    expect(display.lines.some(line => line.text.includes('88.0%'))).toBe(true);
  });

  it('arms DES NOW from the DES page instead of exposing an unsupported LSK', () => {
    const store = useFMCStore.getState();
    store.setPage('DES');
    store.pressLSK('R', 6);

    const state = useFMCStore.getState();
    expect(state.scratchpad).toBe('DES NOW ARMED');
    expect(state.scratchpadError).toBeNull();
    expect(state.msgLight).toBe(true);
  });

  it('sets and clears failure mode', () => {
    const store = useFMCStore.getState();
    store.setFailureMode('FAIL', 'TEST FAILURE');
    let state = useFMCStore.getState();
    expect(state.mode).toBe('FAIL');
    expect(state.failureMessage).toBe('TEST FAILURE');

    store.clearFailureMode();
    state = useFMCStore.getState();
    expect(state.mode).toBe('ACTIVE');
    expect(state.failureMessage).toBeNull();
  });

  it('renders FAIL display data', () => {
    const store = useFMCStore.getState();
    store.setFailureMode('FAIL');
    const data = store.getDisplayData();
    expect(data.title).toBe('FAIL');
    expect(data.lines.some(l => l.text.includes('FAIL'))).toBe(true);
  });
});
