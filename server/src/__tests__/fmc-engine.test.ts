import { describe, expect, it, vi } from 'vitest';
import { FMCEngine } from '../fmc-engine';
import { FmsRuntimeEngine } from '@virtual-cdu/shared';

function enter(engine: FMCEngine, text: string): void {
  for (const char of text) {
    if (char === ' ') engine.processInput('SPACE');
    else if (char === '.') engine.processInput('DOT');
    else if (char === '/') engine.processInput('SLASH');
    else engine.processInput(char);
  }
}

describe('FMCEngine', () => {
  it('falls back to a safe display for unknown pages', () => {
    const engine = new FMCEngine();
    engine.setPage('NOT_A_PAGE');

    const display = engine.getDisplayData();

    expect(display.title).toBe('MENU');
    expect(display.lines.length).toBeGreaterThan(0);
  });

  it('parses RTE route entry into backend LEGS waypoints', () => {
    const engine = new FMCEngine();
    engine.processInput('RTE');
    engine.processInput('NEXT_PAGE');
    enter(engine, 'KJFK DCT RBV DIXIE KDCA');
    engine.processInput('L1');

    const state = engine.getState();
    expect(state.pendingRoute?.routeString).toBe('KJFK DCT RBV DIXIE KDCA');
    expect(state.pendingFlightPlan?.waypoints.map((w) => w.ident)).toEqual(['RBV', 'DIXIE', 'KDCA']);
    expect(state.legsPageCount).toBe(1);
    expect(state.execLit).toBe(true);

    engine.processInput('EXEC');
    expect(engine.getState().route.routeString).toBe('KJFK DCT RBV DIXIE KDCA');
    expect(engine.getState().flightPlan.waypoints.map((w) => w.ident)).toEqual(['RBV', 'DIXIE', 'KDCA']);
  });

  it('triggers ROUTE/SID MISMATCH when entered route procedure conflicts with route.sid', () => {
    const engine = new FMCEngine();
    (engine as any).state.route.sid = 'DEEZZ1';

    engine.processInput('RTE');
    engine.processInput('NEXT_PAGE');
    enter(engine, 'KJFK LENDY1 KDCA');
    engine.processInput('L1');

    const state = engine.getState();
    // Route should not have updated
    expect(state.pendingRoute).toBeNull();
    // Error should be set
    expect(state.scratchpadError).toBe('ROUTE/SID MISMATCH');
  });

  it('resolves backend LEGS discontinuities by replacing them with scratchpad waypoint entries', () => {
    const engine = new FMCEngine();
    (engine as any).state.currentPage = 'LEGS';
    (engine as any).state.flightPlan = {
      origin: 'KJFK',
      destination: 'KDCA',
      flightNumber: '',
      route: '',
      waypoints: [
        { ident: 'RBV', discontinuity: false },
        { ident: 'DISCONTINUITY', discontinuity: true },
        { ident: 'DIXIE', discontinuity: false },
      ],
    };

    enter(engine, 'LENDY');
    engine.processInput('L2');

    const state = engine.getState();
    expect(state.pendingFlightPlan?.waypoints).toEqual([
      { ident: 'RBV', discontinuity: false },
      { ident: 'LENDY', discontinuity: false },
      { ident: 'DIXIE', discontinuity: false },
    ]);
    expect(state.flightPlan.waypoints[1]).toEqual({ ident: 'DISCONTINUITY', discontinuity: true });
    expect(state.execLit).toBe(true);
    expect(state.scratchpad).toBe('');

    engine.processInput('EXEC');
    expect(engine.getState().flightPlan.waypoints[1].ident).toBe('LENDY');
  });

  it('handles DEP/ARR procedure entries in backend CONTROL mode', () => {
    const engine = new FMCEngine();
    engine.processInput('DEP_ARR');
    engine.processInput('L6'); // Go to ARR page (while not modified)

    for (const key of 'CAMRN1') engine.processInput(key);
    engine.processInput('L2'); // Set STAR

    for (const key of 'ILS19') engine.processInput(key);
    engine.processInput('L3'); // Set APPR

    for (const key of '04L') engine.processInput(key);
    engine.processInput('L4'); // Set RWY

    expect(engine.getState().pendingRoute).toMatchObject({
      star: 'CAMRN1',
      approach: 'ILS19',
      runway: '04L',
    });

    engine.processInput('EXEC');
    expect(engine.getState().route).toMatchObject({
      star: 'CAMRN1',
      approach: 'ILS19',
      runway: '04L',
    });
  });

  it('commits staged HOLD edits only after EXEC', () => {
    const engine = new FMCEngine();
    engine.processInput('HOLD');
    enter(engine, 'RBV');
    engine.processInput('L1');
    enter(engine, '270');
    engine.processInput('L3');
    enter(engine, '1.5');
    engine.processInput('L4');
    enter(engine, 'L');
    engine.processInput('R1');

    expect(engine.getState().hold.fix).toBe('');
    expect(engine.getState().holdPending).toMatchObject({
      fix: 'RBV',
      inboundCourse: 270,
      legTime: 1.5,
      direction: 'L',
    });

    engine.processInput('EXEC');
    expect(engine.getState().hold).toMatchObject({
      fix: 'RBV',
      inboundCourse: 270,
      legTime: 1.5,
      direction: 'L',
    });
    expect(engine.getState().holdPending).toBeNull();
  });

  it('rejects backend HOLD fixes that are not in the active route', () => {
    const engine = new FMCEngine();
    engine.processInput('RTE');
    engine.processInput('NEXT_PAGE');
    enter(engine, 'KJFK DCT RBV DIXIE KDCA');
    engine.processInput('L1');
    engine.processInput('HOLD');
    enter(engine, 'LENDY');
    engine.processInput('L1');

    const state = engine.getState();
    expect(state.holdPending).toBeNull();
    expect(state.scratchpadError).toBe('NOT IN ROUTE');
    expect(state.execLit).toBe(true);
  });

  it('rejects invalid V-speed ordering without mutating state', () => {
    const engine = new FMCEngine();
    engine.processInput('PERF');
    engine.processInput('NEXT_PAGE');
    enter(engine, '130');
    engine.processInput('R1');
    enter(engine, '140');
    engine.processInput('R2');
    enter(engine, '145');
    engine.processInput('R3');
    enter(engine, '150');
    engine.processInput('R1');

    const state = engine.getState();
    expect(state.takeoff.v1).toBe(130);
    expect(state.scratchpadError).toBe('V1 MUST BE < VR');
  });

  it('deletes V-speeds when takeoff runway changes after speeds are entered', () => {
    const engine = new FMCEngine();
    engine.processInput('PERF');
    engine.processInput('NEXT_PAGE');
    enter(engine, '04L');
    engine.processInput('L1');
    enter(engine, '130');
    engine.processInput('R1');
    enter(engine, '135');
    engine.processInput('R2');
    enter(engine, '140');
    engine.processInput('R3');
    enter(engine, '19');
    engine.processInput('L1');

    const state = engine.getState();
    expect(state.takeoff).toMatchObject({ runway: '19', v1: 0, vr: 0, v2: 0 });
    expect(state.scratchpad).toBe('V SPEEDS DELETED');
    expect(state.msgLight).toBe(true);
    expect(state.execLit).toBe(true);
  });

  it('sets backend landing approach reference values from TAKEOFF REF page 2', () => {
    const engine = new FMCEngine();
    engine.processInput('PERF');
    engine.processInput('NEXT_PAGE');
    engine.processInput('NEXT_PAGE');

    enter(engine, '19');
    engine.processInput('L1');
    enter(engine, '30');
    engine.processInput('L3');
    enter(engine, '142');
    engine.processInput('R3');
    enter(engine, '109.90');
    engine.processInput('L4');
    enter(engine, '193');
    engine.processInput('R4');

    const state = engine.getState();
    expect(state.landing).toEqual({ runway: '19', flaps: '30', vref: 142, ilsFrequency: '109.90', course: 193 });
    expect(state.route.runway).toBe('19');
  });

  it('sets two backend FIX entries through entry-specific LSK actions', () => {
    const engine = new FMCEngine();
    engine.processInput('FIX');

    enter(engine, 'RBV');
    engine.processInput('L1');
    enter(engine, '180/20');
    engine.processInput('L2');
    enter(engine, 'DIXIE');
    engine.processInput('R1');
    enter(engine, '270/35');
    engine.processInput('R2');

    const state = engine.getState();
    expect(state.fixEntries).toEqual([
      { refFix: 'RBV', radial: 180, distance: 20 },
      { refFix: 'DIXIE', radial: 270, distance: 35 },
    ]);
    expect(state.fix).toEqual({ refFix: 'RBV', radial: 180, distance: 20 });
  });

  it('sets direct-to waypoint and renders mode-dependent N1 limits', () => {
    const engine = new FMCEngine();
    engine.processInput('DIR_INTC');
    enter(engine, 'DIXIE');
    engine.processInput('L1');
    expect(engine.getState().pendingRoute?.directTo).toBe('DIXIE');
    engine.processInput('EXEC');
    expect(engine.getState().route.directTo).toBe('DIXIE');

    engine.processInput('PERF');
    engine.processInput('L5');
    engine.processInput('L3');
    engine.processInput('N1_LIMIT');
    const display = engine.getDisplayData();

    expect(engine.getState().takeoff.toMode).toBe('TO 1');
    expect(display.lines.some((line) => line.text.includes('94.0'))).toBe(true);
  });

  it('arms DES NOW from the backend DES page', () => {
    const engine = new FMCEngine();
    engine.processInput('DES');
    engine.processInput('R6');

    expect(engine.getState().scratchpad).toBe('DES NOW ARMED');
    expect(engine.getState().scratchpadError).toBeNull();
    expect(engine.getState().msgLight).toBe(true);
  });

  it('sets CLB, CRZ, and DES wind and ISA dev parameters', () => {
    const engine = new FMCEngine();

    // CLB page
    engine.processInput('CLB');
    enter(engine, '250/15');
    engine.processInput('L2');
    enter(engine, '+10');
    engine.processInput('L3');

    expect(engine.getState().performance.clbWindDir).toBe(250);
    expect(engine.getState().performance.clbWindSpeed).toBe(15);
    expect(engine.getState().performance.isaDev).toBe(10);

    let display = engine.getDisplayData();
    expect(display.lines.some((l) => l.text.includes('250/015'))).toBe(true);
    expect(display.lines.some((l) => l.text.includes('+10°C'))).toBe(true);

    // CRZ page
    engine.processInput('CRZ');
    enter(engine, '270/45');
    engine.processInput('L4');
    enter(engine, '-05');
    engine.processInput('L5');

    expect(engine.getState().performance.crzWindDir).toBe(270);
    expect(engine.getState().performance.crzWindSpeed).toBe(45);
    expect(engine.getState().performance.isaDev).toBe(-5);

    display = engine.getDisplayData();
    expect(display.lines.some((l) => l.text.includes('270/045'))).toBe(true);
    expect(display.lines.some((l) => l.text.includes('-5°C'))).toBe(true);

    // DES page
    engine.processInput('DES');
    enter(engine, '180/10');
    engine.processInput('L2');

    expect(engine.getState().performance.desWindDir).toBe(180);
    expect(engine.getState().performance.desWindSpeed).toBe(10);

    display = engine.getDisplayData();
    expect(display.lines.some((l) => l.text.includes('180/010'))).toBe(true);
  });

  it('discards pending modifications with CLR when scratchpad is empty', () => {
    const engine = new FMCEngine();
    engine.processInput('RTE');
    engine.processInput('NEXT_PAGE');
    enter(engine, 'KJFK DCT RBV DIXIE KDCA');
    engine.processInput('L1');

    expect(engine.getState().pendingRoute?.routeString).toBe('KJFK DCT RBV DIXIE KDCA');
    expect(engine.getState().isModified).toBe(true);
    expect(engine.getState().execLit).toBe(true);

    engine.processInput('CLR');

    expect(engine.getState().pendingRoute).toBeNull();
    expect(engine.getState().pendingFlightPlan).toBeNull();
    expect(engine.getState().isModified).toBe(false);
    expect(engine.getState().execLit).toBe(false);
    expect(engine.getState().route.routeString).toBe('');
  });

  it('renders Airbus PROG with shared LNAV and performance truth in backend CONTROL mode', () => {
    const engine = new FMCEngine();
    const state = (engine as any).state;
    state.aircraft = 'AIRBUS_A320';
    state.currentPage = 'PROG_A';
    state.route = {
      ...state.route,
      origin: 'EHAM',
      destination: 'EGLL',
      flightNumber: 'BA123',
      routeString: 'LON',
    };
    state.flightPlan = {
      origin: 'EHAM',
      destination: 'EGLL',
      flightNumber: 'BA123',
      route: 'LON',
      waypoints: [
        { ident: 'EHAM', lat: 52.3086, lon: 4.7639, discontinuity: false },
        { ident: 'LON', lat: 51.487, lon: -0.466, discontinuity: false },
        { ident: 'EGLL', lat: 51.47, lon: -0.4543, discontinuity: false },
      ],
    };
    state.performance = {
      ...state.performance,
      crzAlt: 35000,
      costIndex: 35,
      zfw: 55000,
      fuel: 12500,
      reserve: 2500,
      grossWeight: 67500,
    };
    state.aircraftState = {
      lat: 52.3086,
      lon: 4.7639,
      altitude: 0,
      altitudeFt: 0,
      heading: 240,
      headingDeg: 240,
      track: 240,
      trackDeg: 240,
      ias: 0,
      indicatedAirspeedKt: 0,
      tas: 0,
      gs: 0,
      verticalSpeedFpm: 0,
      vs: 0,
      fuelTotal: 12500,
      gw: 67500,
    };

    const display = engine.getDisplayData();
    const originDestination = display.segments?.find((segment) => segment.text === 'EHAM / EGLL');
    const distance = display.segments?.find((segment) => segment.row === 5 && segment.col === 17);
    const efob = display.segments?.find((segment) => segment.row === 7 && segment.col === 19);

    expect(originDestination).toBeDefined();
    expect(distance?.text).toMatch(/\d+ NM/);
    expect(efob?.text).toMatch(/\d+\.\d/);
  });

  it('renders Airbus FUEL PRED with shared performance truth in backend CONTROL mode', () => {
    const engine = new FMCEngine();
    const state = (engine as any).state;
    state.aircraft = 'AIRBUS_A320';
    state.currentPage = 'FUEL_PRED';
    state.route = {
      ...state.route,
      origin: 'EHAM',
      destination: 'EGLL',
      alternate: 'EGKK',
      flightNumber: 'BA123',
      routeString: 'LON',
    };
    state.flightPlan = {
      origin: 'EHAM',
      destination: 'EGLL',
      flightNumber: 'BA123',
      route: 'LON',
      waypoints: [
        { ident: 'EHAM', lat: 52.3086, lon: 4.7639, discontinuity: false },
        { ident: 'LON', lat: 51.487, lon: -0.466, discontinuity: false },
        { ident: 'EGLL', lat: 51.47, lon: -0.4543, discontinuity: false },
      ],
    };
    state.performance = {
      ...state.performance,
      crzAlt: 35000,
      costIndex: 35,
      zfw: 55000,
      fuel: 12500,
      reserve: 2500,
      grossWeight: 67500,
    };
    state.aircraftState = {
      lat: 52.3086,
      lon: 4.7639,
      altitude: 0,
      altitudeFt: 0,
      heading: 240,
      headingDeg: 240,
      track: 240,
      trackDeg: 240,
      ias: 0,
      indicatedAirspeedKt: 0,
      tas: 0,
      gs: 0,
      verticalSpeedFpm: 0,
      vs: 0,
      fuelTotal: 12500,
      gw: 67500,
    };

    const display = engine.getDisplayData();
    const originDestination = display.segments?.find((segment) => segment.text === 'EHAM / EGLL');
    const extra = display.segments?.find((segment) => segment.row === 4 && segment.col === 1);
    const minDestinationFuel = display.segments?.find((segment) => segment.row === 6 && segment.col === 1);
    const reserve = display.segments?.find((segment) => segment.row === 10 && segment.col === 18);

    expect(originDestination).toBeDefined();
    expect(extra?.text).toMatch(/^ \d+\.\d$/);
    expect(extra?.color).toBe('green');
    expect(minDestinationFuel?.text).toBe(' 2.5');
    expect(reserve?.text).toBe('2.5');
  });

  it('notifies onError and stops the tick loop when engine tick throws', async () => {
    const tickSpy = vi.spyOn(FmsRuntimeEngine, 'tick').mockImplementation(() => {
      throw new Error('Test tick error');
    });

    let caughtError: any = null;
    const engine = new FMCEngine({
      onError: (err) => {
        caughtError = err;
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(caughtError).not.toBeNull();
    expect(caughtError?.message).toBe('Test tick error');

    tickSpy.mockRestore();
    engine.destroy();
  });
});
