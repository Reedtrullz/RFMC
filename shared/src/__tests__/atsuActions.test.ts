import { describe, it, expect } from 'vitest';
import { getPatch } from '../fmc/actionHandlers/actionResult';
import { handleAtsuAction } from '../fmc/actionHandlers/atsuActions';
import { buildInitialFMCState } from '../fmc/initialState';

function makeState(overrides: Partial<ReturnType<typeof buildInitialFMCState>> = {}) {
  return { ...buildInitialFMCState(), ...overrides } as ReturnType<typeof buildInitialFMCState>;
}

describe('handleAtsuAction', () => {
  it('returns handled:false for unknown action', () => {
    const result = handleAtsuAction('unknown', makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('atsu_uplink creates pending uplink', () => {
    const result = handleAtsuAction('atsu_uplink', makeState(), '');
    expect(result.handled).toBe(true);
    expect(result.success?.patch).toBeDefined();
    const patch = getPatch(result);
    expect(patch.atsu?.pendingUplink).toBeDefined();
    expect(patch.atsu?.pendingUplink?.origin).toBe('KJFK');
    expect(patch.atsu?.pendingUplink?.destination).toBe('KLAX');
  });

  it('atsu navigates to ATSU page', () => {
    const result = handleAtsuAction('atsu', makeState(), '');
    expect(result.handled).toBe(true);
    expect((result.success as any).targetPage).toBe('ATSU');
  });

  it('atsu_load_route fails when no uplink exists', () => {
    const result = handleAtsuAction('atsu_load_route', makeState(), '');
    expect(result.handled).toBe(true);
    expect(result.failure).toBeDefined();
    expect(result.failure?.code).toBe('INVALID_ENTRY');
  });

  it('atsu_load_route succeeds when uplink exists', () => {
    const state = makeState({
      atsu: {
        messages: [],
        pendingUplink: {
          origin: 'KJFK',
          destination: 'KDCA',
          flightNumber: 'UAL123',
          route: 'DIRECT',
          waypoints: [],
        },
      },
    });
    const result = handleAtsuAction('atsu_load_route', state, '');
    expect(result.handled).toBe(true);
    expect(result.success?.patch).toBeDefined();
    const patch = getPatch(result);
    expect(patch.isModified).toBe(true);
    expect(patch.execLit).toBe(true);
  });

  it('view_msg_* navigates to ATSU_MSG_DETAIL', () => {
    const state = makeState({
      atsu: {
        messages: [{ id: 'msg1', from: 'ATC', text: 'Hello', timestamp: Date.now(), read: false, type: 'ATC' }],
        pendingUplink: null,
      },
    });
    const result = handleAtsuAction('view_msg_msg1', state, '');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.page).toBe('ATSU_MSG_DETAIL');
    expect(patch.selectedMessageId).toBe('msg1');
  });

  it('atsu_msgs navigates to ATSU_MSGS page', () => {
    const result = handleAtsuAction('atsu_msgs', makeState(), '');
    expect(result.handled).toBe(true);
    expect((result.success as any).targetPage).toBe('ATSU_MSGS');
  });
});
