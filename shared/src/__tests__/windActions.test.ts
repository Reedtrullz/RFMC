import { describe, it, expect } from 'vitest';
import { getPatch } from '../fmc/actionHandlers/actionResult';
import { handleWindAction } from '../fmc/actionHandlers/windActions';
import { buildInitialFMCState } from '../fmc/initialState';

function makeState(overrides: Partial<ReturnType<typeof buildInitialFMCState>> = {}) {
  return { ...buildInitialFMCState(), ...overrides } as ReturnType<typeof buildInitialFMCState>;
}

describe('handleWindAction', () => {
  it('returns handled:false for unknown action', () => {
    const result = handleWindAction('unknown', makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('set_wind sets takeoff wind dir/speed', () => {
    const result = handleWindAction('set_wind', makeState(), '180/20');
    expect(result.handled).toBe(true);
    expect(result.success?.clearScratchpad).toBe(true);
    const patch = getPatch(result);
    expect(patch.takeoff?.windDir).toBe(180);
    expect(patch.takeoff?.windSpeed).toBe(20);
  });

  it('set_clb_wind sets performance clb wind', () => {
    const result = handleWindAction('set_clb_wind', makeState(), '270/80');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.performance?.clbWindDir).toBe(270);
    expect(patch.performance?.clbWindSpeed).toBe(80);
  });

  it('set_crz_wind sets performance crz wind', () => {
    const result = handleWindAction('set_crz_wind', makeState(), '090/50');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.performance?.crzWindDir).toBe(90);
    expect(patch.performance?.crzWindSpeed).toBe(50);
  });

  it('set_isa_dev sets performance isaDev', () => {
    const result = handleWindAction('set_isa_dev', makeState(), '10');
    expect(result.handled).toBe(true);
    const patch = getPatch(result);
    expect(patch.performance?.isaDev).toBe(10);
  });

  it('invalid wind returns failure', () => {
    const result = handleWindAction('set_clb_wind', makeState(), 'abc');
    expect(result.handled).toBe(true);
    expect(result.failure).toBeDefined();
    expect(result.failure?.code).toBe('INVALID_FORMAT');
  });
});
