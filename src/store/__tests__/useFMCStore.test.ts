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
    expect(state.pendingRoute?.routeString).toBe('KJFK DCT RBV DIXIE KDCA');
    expect(state.pendingFlightPlan?.waypoints.map((w) => w.ident)).toEqual(['RBV', 'DIXIE', 'KDCA']);
    expect(state.legsPageCount).toBe(1);
    expect(state.execLit).toBe(true);

    store.pressEXEC();
    expect(useFMCStore.getState().route.routeString).toBe('KJFK DCT RBV DIXIE KDCA');
    expect(useFMCStore.getState().flightPlan.waypoints.map((w) => w.ident)).toEqual(['RBV', 'DIXIE', 'KDCA']);
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
    expect(useFMCStore.getState().pendingFlightPlan?.waypoints.map((w) => w.ident)).toEqual(['RBV', 'LENDY', 'DIXIE']);
    expect(useFMCStore.getState().flightPlan.waypoints.map((w) => w.ident)).toEqual(['RBV', 'DIXIE']);
    expect(useFMCStore.getState().execLit).toBe(true);

    store.pressEXEC();
    expect(useFMCStore.getState().flightPlan.waypoints.map((w) => w.ident)).toEqual(['RBV', 'LENDY', 'DIXIE']);

    store.pressKey('DEL');
    store.pressLSK('L', 2);
    expect(useFMCStore.getState().pendingFlightPlan?.waypoints.map((w) => w.ident)).toEqual(['RBV', 'DIXIE']);
    expect(useFMCStore.getState().flightPlan.waypoints.map((w) => w.ident)).toEqual(['RBV', 'LENDY', 'DIXIE']);

    store.pressEXEC();
    const state = useFMCStore.getState();
    expect(state.flightPlan.waypoints.map((w) => w.ident)).toEqual(['RBV', 'DIXIE']);
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
    expect(state.pendingFlightPlan?.waypoints).toMatchObject([
      { ident: 'RBV', discontinuity: false },
      { ident: 'LENDY', discontinuity: false },
      { ident: 'DIXIE', discontinuity: false },
    ]);
    expect(state.flightPlan.waypoints[1]).toMatchObject({ ident: 'DISCONTINUITY', discontinuity: true });
    expect(state.execLit).toBe(true);
    expect(state.scratchpad).toBe('');

    store.pressEXEC();
    expect(useFMCStore.getState().flightPlan.waypoints[1].ident).toBe('LENDY');
  });

  it('stages HOLD edits and commits them only on EXEC', () => {
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
    useFMCStore.getState().resetState();
    useFMCStore.setState({
      currentPage: 'TAKEOFF_REF',
      scratchpadError: null,
      scratchpadState: { buffer: '', message: null, messageQueue: [], history: [] },
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
    } as any);

    const store = useFMCStore.getState();
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
      scratchpadState: { buffer: '', message: null, messageQueue: [], history: [] },
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
    expect(state.scratchpadError).toBe('V SPEEDS DELETED');
    expect(state.msgLight).toBe(true);
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

  it('sets two FIX entries through entry-specific LSK actions', () => {
    const store = useFMCStore.getState();
    useFMCStore.setState({ currentPage: 'FIX' });

    for (const key of 'RBV') store.pressKey(key as Parameters<typeof store.pressKey>[0]);
    store.pressLSK('L', 1);
    for (const key of '180/20') store.pressKey(key === '/' ? 'SLASH' : (key as Parameters<typeof store.pressKey>[0]));
    store.pressLSK('L', 2);
    for (const key of 'DIXIE') store.pressKey(key as Parameters<typeof store.pressKey>[0]);
    store.pressLSK('R', 1);
    for (const key of '270/35') store.pressKey(key === '/' ? 'SLASH' : (key as Parameters<typeof store.pressKey>[0]));
    store.pressLSK('R', 2);

    const state = useFMCStore.getState();
    expect(state.fixEntries).toEqual([
      { refFix: 'RBV', radial: 180, distance: 20 },
      { refFix: 'DIXIE', radial: 270, distance: 35 },
    ]);
    expect(state.fix).toEqual({ refFix: 'RBV', radial: 180, distance: 20 });
    expect(state.execLit).toBe(false);
  });

  it('sets DEP/ARR procedures, DIR INTC, and N1 LIMIT values', () => {
    const store = useFMCStore.getState();
    useFMCStore.setState({
      currentPage: 'DEP_ARR',
      route: { origin: 'KJFK', destination: 'KDCA', flightNumber: '', companyRoute: '', routeString: '' },
    });

    store.pressKey('DEP_ARR');
    store.pressLSK('L', 6); // Go to ARR page (while not modified)

    for (const key of 'CAMRN1') store.pressKey(key as Parameters<typeof store.pressKey>[0]);
    store.pressLSK('L', 2); // Set STAR
    for (const key of 'ILS19') store.pressKey(key as Parameters<typeof store.pressKey>[0]);
    store.pressLSK('L', 3); // Set APPR
    for (const key of '04L') store.pressKey(key as Parameters<typeof store.pressKey>[0]);
    store.pressLSK('L', 4); // Set RWY

    let state = useFMCStore.getState();
    expect(state.pendingRoute).toMatchObject({
      star: 'CAMRN1',
      approach: 'ILS19',
      runway: '04L',
    });
    store.pressEXEC();
    expect(useFMCStore.getState().route).toMatchObject({ star: 'CAMRN1', runway: '04L', approach: 'ILS19' });

    store.setPage('DIR_INTC');
    for (const key of 'DIXIE') store.pressKey(key as Parameters<typeof store.pressKey>[0]);
    store.pressLSK('L', 1);
    expect(useFMCStore.getState().pendingRoute?.directTo).toBe('DIXIE');
    store.pressEXEC();
    expect(useFMCStore.getState().route.directTo).toBe('DIXIE');

    useFMCStore.setState({ takeoff: { ...useFMCStore.getState().takeoff, toMode: 'TO 2' } });
    store.setPage('N1_LIMIT');
    const display = useFMCStore.getState().getDisplayData();
    expect(display.lines.some((line) => line.text.includes('88.0'))).toBe(true);
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
    expect(data.lines.some((l) => l.text.includes('FAIL'))).toBe(true);
  });

  it('discards pending modifications with CLR when scratchpad is empty', () => {
    const store = useFMCStore.getState();
    store.setPage('RTE');
    store.pressKey('NEXT_PAGE');
    for (const key of 'KJFK DCT RBV DIXIE KDCA') {
      store.pressKey(key === ' ' ? 'SPACE' : (key as Parameters<typeof store.pressKey>[0]));
    }
    store.pressLSK('L', 1);

    let state = useFMCStore.getState();
    expect(state.pendingRoute?.routeString).toBe('KJFK DCT RBV DIXIE KDCA');
    expect(state.isModified).toBe(true);
    expect(state.execLit).toBe(true);

    store.pressKey('CLR');

    state = useFMCStore.getState();
    expect(state.pendingRoute).toBeNull();
    expect(state.pendingFlightPlan).toBeNull();
    expect(state.isModified).toBe(false);
    expect(state.execLit).toBe(false);
    expect(state.route.routeString).toBe('');
  });

  describe('PLAN mode review actions', () => {
    const planRoute = {
      origin: 'KJFK',
      destination: 'KDCA',
      flightNumber: '',
      route: '',
      waypoints: [
        { ident: 'RBV', discontinuity: false },
        { ident: 'DIXIE', discontinuity: false },
        { ident: 'WHITE', discontinuity: false },
      ],
    };
    // Total route items = origin(1) + 3 waypoints = 4

    it('stepPlanForward increments selectedPlanWaypointIndex', () => {
      useFMCStore.setState({ flightPlan: planRoute, selectedPlanWaypointIndex: 0 });
      useFMCStore.getState().stepPlanForward();
      expect(useFMCStore.getState().selectedPlanWaypointIndex).toBe(1);
    });

    it('stepPlanForward wraps around from last to first', () => {
      useFMCStore.setState({ flightPlan: planRoute, selectedPlanWaypointIndex: 4 }); // Last index: 1(origin)+3(wpts)+1(dest)=5 total
      useFMCStore.getState().stepPlanForward();
      expect(useFMCStore.getState().selectedPlanWaypointIndex).toBe(0);
    });

    it('stepPlanBackward decrements selectedPlanWaypointIndex', () => {
      useFMCStore.setState({ flightPlan: planRoute, selectedPlanWaypointIndex: 2 });
      useFMCStore.getState().stepPlanBackward();
      expect(useFMCStore.getState().selectedPlanWaypointIndex).toBe(1);
    });

    it('stepPlanBackward wraps around from first to last', () => {
      useFMCStore.setState({ flightPlan: planRoute, selectedPlanWaypointIndex: 0 });
      useFMCStore.getState().stepPlanBackward();
      // totalPoints = 1(origin) + 3(waypoints) + 1(dest) = 5, wraps to 4
      expect(useFMCStore.getState().selectedPlanWaypointIndex).toBe(4);
    });

    it('setSelectedPlanWaypoint sets an arbitrary index', () => {
      useFMCStore.setState({ flightPlan: planRoute });
      useFMCStore.getState().setSelectedPlanWaypoint(2);
      expect(useFMCStore.getState().selectedPlanWaypointIndex).toBe(2);
    });

    it('resetPlanWaypoint resets index to null', () => {
      useFMCStore.setState({ flightPlan: planRoute, selectedPlanWaypointIndex: 2 });
      useFMCStore.getState().resetPlanWaypoint();
      expect(useFMCStore.getState().selectedPlanWaypointIndex).toBeNull();
    });

    it('step_plan LSK action calls stepPlanForward', () => {
      useFMCStore.setState({
        currentPage: 'LEGS',
        flightPlan: planRoute,
        selectedPlanWaypointIndex: 0,
        efisL: { ...useFMCStore.getState().efisL, mode: 'PLN' },
      });
      useFMCStore.getState().pressLSK('R', 6); // R6 is the STEP prompt in PLN mode
      expect(useFMCStore.getState().selectedPlanWaypointIndex).toBe(1);
    });

    it('stepPlanForward is a no-op when flight plan has no waypoints', () => {
      useFMCStore.setState({
        flightPlan: { origin: 'KJFK', destination: 'KDCA', flightNumber: '', route: '', waypoints: [] },
        selectedPlanWaypointIndex: 0,
      });
      useFMCStore.getState().stepPlanForward();
      // Should not change — returns early
      expect(useFMCStore.getState().selectedPlanWaypointIndex).toBe(0);
    });
  });

  describe('FMS Ecosystem', () => {
    it('simulates IRS alignment over time', () => {
      const store = useFMCStore.getState();
      useFMCStore.setState({
        position: { ...store.position, irsState: 'ALIGNING', irsTimeRemaining: 10 },
      });

      // One tick
      useFMCStore.getState().updateFmsEcosystem();
      expect(useFMCStore.getState().position.irsTimeRemaining).toBe(9);
      expect(useFMCStore.getState().position.irsState).toBe('ALIGNING');

      // Fast forward
      for (let i = 0; i < 9; i++) useFMCStore.getState().updateFmsEcosystem();
      expect(useFMCStore.getState().position.irsTimeRemaining).toBe(0);
      expect(useFMCStore.getState().position.irsState).toBe('NAV');
    });

    it('manages alerts via Alert Bus', () => {
      // Directly check updateFmsEcosystem logic for RNP alerts
      useFMCStore.setState({
        sensors: [{ source: 'GPS', available: true, positionErrorNm: 2.1 }],
        navPerformance: {
          anp: 2.1,
          rnp: 1.0,
          anpNm: 2.1,
          rnpNm: 1.0,
          phase: 'ENROUTE',
          rnpManual: false,
          activeSource: 'GPS',
          xteNm: 0,
        },
      });

      useFMCStore.getState().updateFmsEcosystem();
      expect(useFMCStore.getState().alerts.some((a) => a.id === 'unable-rnp')).toBe(true);

      useFMCStore.setState({
        sensors: [{ source: 'GPS', available: true, positionErrorNm: 0.1 }],
        navPerformance: {
          anp: 0.1,
          rnp: 1.0,
          anpNm: 0.1,
          rnpNm: 1.0,
          phase: 'ENROUTE',
          rnpManual: false,
          activeSource: 'GPS',
          xteNm: 0,
        },
      });
      useFMCStore.getState().updateFmsEcosystem();
      expect(useFMCStore.getState().alerts.some((a) => a.id === 'unable-rnp')).toBe(false);
    });
  });
});
