import { describe, it, expect } from 'vitest';
import { handleLegWpAction } from '../fmc/actionHandlers/legActions';
import { buildInitialFMCState } from '../fmc/initialState';

function makeState(overrides: Partial<ReturnType<typeof buildInitialFMCState>> = {}) {
  return { ...buildInitialFMCState(), ...overrides } as ReturnType<typeof buildInitialFMCState>;
}

describe('handleLegWpAction', () => {
  it('handles edit_wp with scratchpad (side effect — no patch)', () => {
    const state = makeState();
    const result = handleLegWpAction('edit_wp_3', state, 'DCT');

    expect(result.handled).toBe(true);
    expect(result.success).toBeUndefined();
  });

  it('handles edit_wp without scratchpad — sets editWaypointIndex', () => {
    const state = makeState();
    const result = handleLegWpAction('edit_wp_3', state, '');

    expect(result.handled).toBe(true);
    expect(result.success?.patch).toEqual({
      editWaypointIndex: 3,
      scratchpad: '',
      scratchpadError: null,
    });
  });

  it('handles delete_wp in delete mode (side effect — no patch)', () => {
    const state = makeState({ deleteMode: true });
    const result = handleLegWpAction('delete_wp_5', state, '');

    expect(result.handled).toBe(true);
    expect(result.success).toBeUndefined();
  });

  it('returns handled: false for non-matching action', () => {
    const state = makeState();
    const result = handleLegWpAction('set_gate', state, '');

    expect(result.handled).toBe(false);
    expect(result.success).toBeUndefined();
  });
});
