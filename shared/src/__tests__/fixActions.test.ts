import { describe, it, expect } from 'vitest';
import { getPatch } from '../fmc/actionHandlers/actionResult';
import { handleFixAction } from '../fmc/actionHandlers/fixActions';
import { buildInitialFMCState } from '../fmc/initialState';
import type { FMCState } from '../types/fmc';

function makeState(overrides: Partial<FMCState> = {}): FMCState {
  return { ...buildInitialFMCState(), ...overrides } as FMCState;
}

describe('handleFixAction — set_fix_ref', () => {
  it('rejects empty scratchpad', () => {
    const result = handleFixAction('set_fix_ref', makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('accepts a valid waypoint ident', () => {
    const result = handleFixAction('set_fix_ref', makeState(), 'SEA');
    expect(result.handled).toBe(true);
    expect(result.success?.clearScratchpad).toBe(true);
    expect(getPatch(result)?.fixEntries?.[0].refFix).toBe('SEA');
    expect(getPatch(result)?.fix?.refFix).toBe('SEA');
  });

  it('rejects an invalid waypoint (too short)', () => {
    const result = handleFixAction('set_fix_ref', makeState(), '*');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('INVALID_ENTRY');
  });

  it('set_fix_ref_1 targets entry index 1', () => {
    const state = makeState({
      fixEntries: [
        { refFix: 'SEA', radial: 0, distance: 0 },
        { refFix: '', radial: 0, distance: 0 },
      ],
    });
    const result = handleFixAction('set_fix_ref_1', state, 'VAMPS');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.fixEntries?.[1].refFix).toBe('VAMPS');
    expect(patch.fixEntries?.[0].refFix).toBe('SEA');
    // Entry 1 does NOT update legacy fix
    expect(patch.fix).toBeUndefined();
  });

  it('preserves radial/distance when setting refFix', () => {
    const state = makeState({
      fixEntries: [
        { refFix: '', radial: 270, distance: 25 },
        { refFix: '', radial: 0, distance: 0 },
      ],
    });
    const result = handleFixAction('set_fix_ref', state, 'OLM');
    const patch = getPatch(result);
    expect(patch.fixEntries?.[0].refFix).toBe('OLM');
    expect(patch.fixEntries?.[0].radial).toBe(270);
    expect(patch.fixEntries?.[0].distance).toBe(25);
  });
});

describe('handleFixAction — set_fix_radial_distance', () => {
  it('rejects empty scratchpad', () => {
    const result = handleFixAction('set_fix_radial_distance', makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('rejects invalid format (no slash)', () => {
    const result = handleFixAction('set_fix_radial_distance', makeState(), '270');
    expect(result.handled).toBe(true);
    expect(result.failure?.code).toBe('INVALID_FORMAT');
  });

  it('rejects out-of-range radial', () => {
    const result = handleFixAction('set_fix_radial_distance', makeState(), '400/25');
    expect(result.handled).toBe(true);
    expect(result.failure?.text).toBe('INVALID RADIAL');
  });

  it('rejects out-of-range distance', () => {
    const result = handleFixAction('set_fix_radial_distance', makeState(), '270/1500');
    expect(result.handled).toBe(true);
    expect(result.failure?.text).toBe('INVALID DISTANCE');
  });

  it('accepts valid radial/distance entry', () => {
    const result = handleFixAction('set_fix_radial_distance', makeState(), '270/25');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.fixEntries?.[0].radial).toBe(270);
    expect(patch.fixEntries?.[0].distance).toBe(25);
    expect(patch.fix).toBeDefined();
  });

  it('set_fix_radial_distance_1 targets entry index 1', () => {
    const state = makeState({
      fixEntries: [
        { refFix: 'SEA', radial: 90, distance: 10 },
        { refFix: 'OLM', radial: 0, distance: 0 },
      ],
    });
    const result = handleFixAction('set_fix_radial_distance_1', state, '180/15');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.fixEntries?.[1].radial).toBe(180);
    expect(patch.fixEntries?.[1].distance).toBe(15);
    expect(patch.fixEntries?.[0].radial).toBe(90);
  });

  it('rejects radial below 1', () => {
    const result = handleFixAction('set_fix_radial_distance', makeState(), '0/25');
    expect(result.handled).toBe(true);
    expect(result.failure?.text).toBe('INVALID RADIAL');
  });

  it('returns unhandled for unrecognised action', () => {
    const result = handleFixAction('unknown_action', makeState(), '');
    expect(result.handled).toBe(false);
  });
});
