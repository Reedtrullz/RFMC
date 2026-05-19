import { describe, it, expect } from 'vitest';
import { getPatch } from '../fmc/actionHandlers/actionResult';
import { dispatchLskAction } from '../fmc/actionHandlers/lskDispatcher';
import { buildInitialFMCState } from '../fmc/initialState';

function makeState(overrides: Partial<ReturnType<typeof buildInitialFMCState>> = {}) {
  return { ...buildInitialFMCState(), ...overrides } as ReturnType<typeof buildInitialFMCState>;
}

describe('dispatchLskAction', () => {
  it('dispatches page navigation (pos_init → POS_INIT)', () => {
    const result = dispatchLskAction({ state: makeState(), action: 'pos_init', scratchpad: '' });
    expect(result.handled).toBe(true);
    expect((result.success as any).targetPage).toBe('POS_INIT');
  });

  it('dispatches page navigation (rte → RTE)', () => {
    const result = dispatchLskAction({ state: makeState(), action: 'rte', scratchpad: '' });
    expect(result.handled).toBe(true);
    expect((result.success as any).targetPage).toBe('RTE');
  });

  it('dispatches special action (erase)', () => {
    const result = dispatchLskAction({ state: makeState(), action: 'erase', scratchpad: '' });
    expect(result.handled).toBe(true);
    expect(result.success?.patch).toBeDefined();
    expect(getPatch(result)?.isModified).toBe(false);
  });

  it('dispatches special action (align_irs)', () => {
    const result = dispatchLskAction({ state: makeState(), action: 'align_irs', scratchpad: '' });
    expect(result.handled).toBe(true);
    expect(result.success?.patch).toBeDefined();
  });

  it('dispatches route action (set_from_to KJFK/KDCA)', () => {
    const result = dispatchLskAction({ state: makeState(), action: 'set_from_to', scratchpad: 'KJFK/KDCA' });
    expect(result.handled).toBe(true);
    expect(result.success?.patch).toBeDefined();
    expect(result.sideEffects).toContain('expand_active_route');
  });

  it('dispatches route action (set_origin)', () => {
    const result = dispatchLskAction({ state: makeState(), action: 'set_origin', scratchpad: 'KJFK' });
    expect(result.handled).toBe(true);
    expect(result.success?.patch).toBeDefined();
  });

  it('dispatches performance action (set_crz_alt)', () => {
    const result = dispatchLskAction({ state: makeState(), action: 'set_crz_alt', scratchpad: '350' });
    expect(result.handled).toBe(true);
    expect(result.success?.patch).toBeDefined();
  });

  it('dispatches takeoff action (set_v1)', () => {
    const result = dispatchLskAction({ state: makeState(), action: 'set_v1', scratchpad: '145' });
    expect(result.handled).toBe(true);
    expect(result.success?.patch).toBeDefined();
  });

  it('dispatches wind action (set_clb_wind)', () => {
    const result = dispatchLskAction({ state: makeState(), action: 'set_clb_wind', scratchpad: '270/50' });
    expect(result.handled).toBe(true);
    expect(result.success?.patch).toBeDefined();
  });

  it('dispatches position action (set_ref_airport)', () => {
    const result = dispatchLskAction({ state: makeState(), action: 'set_ref_airport', scratchpad: 'KJFK' });
    expect(result.handled).toBe(true);
    expect(result.success?.patch).toBeDefined();
  });

  it('dispatches ATSU action (atsu → targetPage)', () => {
    const result = dispatchLskAction({ state: makeState(), action: 'atsu', scratchpad: '' });
    expect(result.handled).toBe(true);
    expect((result.success as any).targetPage).toBe('ATSU');
  });

  it('returns handled:false for unknown action', () => {
    const result = dispatchLskAction({ state: makeState(), action: 'nonexistent_action', scratchpad: '' });
    expect(result.handled).toBe(false);
  });

  it('dispatches fix action (set_fix_ref)', () => {
    const result = dispatchLskAction({ state: makeState(), action: 'set_fix_ref', scratchpad: 'JFK' });
    expect(result.handled).toBe(true);
    expect(result.success?.patch).toBeDefined();
  });

  it('dispatches hold action (set_hold_fix)', () => {
    const state = makeState({
      flightPlan: {
        origin: '',
        destination: '',
        flightNumber: '',
        route: '',
        waypoints: [{ ident: 'JFK', discontinuity: false }],
      },
    });
    const result = dispatchLskAction({ state, action: 'set_hold_fix', scratchpad: 'JFK' });
    expect(result.handled).toBe(true);
  });
});
