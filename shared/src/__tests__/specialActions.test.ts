import { describe, it, expect } from 'vitest';
import { handleSpecialLskAction } from '../fmc/actionHandlers/specialActions';
import { buildInitialFMCState } from '../fmc/initialState';

function makeState(overrides: Partial<ReturnType<typeof buildInitialFMCState>> = {}) {
  return { ...buildInitialFMCState(), ...overrides } as ReturnType<typeof buildInitialFMCState>;
}

describe('handleSpecialLskAction', () => {
  it('des_now returns correct patch', () => {
    const state = makeState();
    const result = handleSpecialLskAction('des_now', state, '');

    expect(result.handled).toBe(true);
    expect(result.success?.patch).toEqual({
      scratchpad: 'DES NOW ARMED',
      scratchpadError: null,
      msgLight: true,
    });
  });

  it('step_plan returns sideEffect=step_plan + returnEarly', () => {
    const state = makeState();
    const result = handleSpecialLskAction('step_plan', state, '');

    expect(result.handled).toBe(true);
    expect((result as any).sideEffect).toBe('step_plan');
    expect((result as any).returnEarly).toBe(true);
    expect(result.success).toBeUndefined();
  });

  it('align_irs returns ALIGNING state for Boeing 737', () => {
    const state = makeState({ aircraft: 'BOEING_737' });
    const result = handleSpecialLskAction('align_irs', state, '');

    expect(result.handled).toBe(true);
    expect(result.success?.patch).toMatchObject({
      position: {
        irsState: 'ALIGNING',
        irsAlignmentProgress: 0,
      },
    });
  });

  it('align_irs returns ALIGNING state for Airbus A320', () => {
    const state = makeState({ aircraft: 'AIRBUS_A320' });
    const result = handleSpecialLskAction('align_irs', state, '');

    expect(result.handled).toBe(true);
    expect(result.success?.patch).toMatchObject({
      position: {
        irsState: 'ALIGNING',
        irsAlignmentProgress: 0,
      },
    });
  });

  it('align_irs returns { handled: false } for unsupported aircraft', () => {
    const state = makeState({ aircraft: 'BOEING_737' });
    const unsupportedState = { ...state, aircraft: 'UNSUPPORTED' as any };
    const result = handleSpecialLskAction('align_irs', unsupportedState, '');

    expect(result.handled).toBe(false);
    expect(result.success).toBeUndefined();
  });

  it('erase returns full cleanup patch', () => {
    const state = makeState({
      pendingRoute: { origin: 'KJFK', destination: 'KDCA', flightNumber: 'UAL123' },
      pendingFlightPlan: { origin: 'KJFK', destination: 'KDCA', flightNumber: 'UAL123', route: '', waypoints: [] },
      isModified: true,
      execLit: true,
      editWaypointIndex: 3,
      scratchpad: 'SOME TEXT',
      scratchpadError: 'SOME ERROR',
    });
    const result = handleSpecialLskAction('erase', state, state.scratchpad);

    expect(result.handled).toBe(true);
    expect(result.success?.patch).toEqual({
      pendingRoute: null,
      pendingFlightPlan: null,
      holdPending: null,
      isModified: false,
      execLit: false,
      editWaypointIndex: null,
    });
  });

  it('copy_active returns copy patch with COPIED TO SEC scratchpad', () => {
    const state = makeState({
      route: { origin: 'KLAX', destination: 'KSFO', flightNumber: 'DAL456' },
      flightPlan: {
        origin: 'KLAX',
        destination: 'KSFO',
        flightNumber: 'DAL456',
        route: 'VTU5 RZS J501 BSR BSR2',
        waypoints: [],
      },
    });
    const result = handleSpecialLskAction('copy_active', state, '');

    expect(result.handled).toBe(true);
    expect(result.success?.patch).toMatchObject({
      isModified: true,
      execLit: true,
      scratchpad: 'COPIED TO SEC',
      msgLight: true,
    });
    expect(result.success?.patch!.pendingFlightPlan).toEqual(state.flightPlan);
    expect(result.success?.patch!.pendingRoute).toEqual(state.route);
  });

  it('unknown action returns { handled: false }', () => {
    const state = makeState();
    const result = handleSpecialLskAction('unknown', state, '');

    expect(result.handled).toBe(false);
    expect(result.success).toBeUndefined();
  });

  it('activate_sec successfully promotes pending route and flight plan and clears modified flags', () => {
    const state = makeState({
      route: { origin: 'KJFK', destination: 'KDCA', flightNumber: 'DAL123' },
      flightPlan: { origin: 'KJFK', destination: 'KDCA', flightNumber: 'DAL123', route: '', waypoints: [] },
      pendingRoute: { origin: 'KLAX', destination: 'KSFO', flightNumber: 'UAL456' },
      pendingFlightPlan: {
        origin: 'KLAX',
        destination: 'KSFO',
        flightNumber: 'UAL456',
        route: 'RZS J501 BSR',
        waypoints: [],
      },
      isModified: true,
      execLit: true,
    });
    const result = handleSpecialLskAction('activate_sec', state, '');

    expect(result.handled).toBe(true);
    expect(result.success?.patch).toEqual({
      flightPlan: state.pendingFlightPlan,
      route: state.pendingRoute,
      pendingRoute: null,
      pendingFlightPlan: null,
      holdPending: null,
      isModified: false,
      execLit: false,
      scratchpad: 'SEC PLAN ACTIVE',
      scratchpadError: null,
      msgLight: true,
    });
  });
});
