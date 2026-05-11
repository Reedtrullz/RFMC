import { describe, expect, it } from 'vitest';
import { FMCEngine } from '../fmc-engine';

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
    expect(state.route.routeString).toBe('KJFK DCT RBV DIXIE KDCA');
    expect(state.flightPlan.waypoints.map(w => w.ident)).toEqual(['RBV', 'DIXIE', 'KDCA']);
    expect(state.legsPageCount).toBe(1);
    expect(state.execLit).toBe(true);
  });

  it('resolves backend LEGS discontinuities by replacing them with scratchpad waypoint entries', () => {
    const engine = new FMCEngine();
    engine.getState().currentPage = 'LEGS';
    engine.getState().flightPlan = {
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
    expect(state.flightPlan.waypoints).toEqual([
      { ident: 'RBV', discontinuity: false },
      { ident: 'LENDY', discontinuity: false },
      { ident: 'DIXIE', discontinuity: false },
    ]);
    expect(state.execLit).toBe(true);
    expect(state.scratchpad).toBe('');
  });

  it('handles DEP/ARR procedure entries in backend CONTROL mode', () => {
    const engine = new FMCEngine();
    engine.processInput('DEP_ARR');
    enter(engine, 'MERIT4');
    engine.processInput('L2');
    enter(engine, '04L');
    engine.processInput('L3');
    engine.processInput('L6');
    enter(engine, 'FRDMM2');
    engine.processInput('L2');
    enter(engine, 'ILS19');
    engine.processInput('L3');

    expect(engine.getState().route).toMatchObject({
      sid: 'MERIT4',
      runway: '04L',
      star: 'FRDMM2',
      approach: 'ILS19',
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

  it('sets direct-to waypoint and renders mode-dependent N1 limits', () => {
    const engine = new FMCEngine();
    engine.processInput('DIR_INTC');
    enter(engine, 'DIXIE');
    engine.processInput('L1');
    expect(engine.getState().route.directTo).toBe('DIXIE');

    engine.processInput('PERF');
    engine.processInput('L5');
    engine.processInput('L3');
    engine.processInput('N1_LIMIT');
    const display = engine.getDisplayData();

    expect(engine.getState().takeoff.toMode).toBe('TO 1');
    expect(display.lines.some(line => line.text.includes('94.0%'))).toBe(true);
  });

  it('arms DES NOW from the backend DES page', () => {
    const engine = new FMCEngine();
    engine.processInput('DES');
    engine.processInput('R6');

    expect(engine.getState().scratchpad).toBe('DES NOW ARMED');
    expect(engine.getState().scratchpadError).toBeNull();
    expect(engine.getState().msgLight).toBe(true);
  });
});
