import { describe, it, expect } from 'vitest';
import { getPatch } from '../fmc/actionHandlers/actionResult';
import {
  handleSelectTo,
  handleSelectTo1,
  handleSelectTo2,
  handleSetRunway,
  handleSetToMode,
  handleSetV1,
  handleSetVr,
  handleSetV2,
  handleSetTrim,
  handleSetOat,
  handleSetAssumedTemp,
  handleTakeoffWind,
  handleTakeoffAction,
} from '../fmc/actionHandlers/takeoffActions';
import { buildInitialFMCState } from '../fmc/initialState';
import type { FMCState } from '../types/fmc';

function makeState(overrides: Partial<ReturnType<typeof buildInitialFMCState>> = {}): FMCState {
  return { ...buildInitialFMCState(), ...overrides } as FMCState;
}

// ──── handleSelectTo ────

describe('handleSelectTo', () => {
  it('sets TO when scratchpad empty', () => {
    const result = handleSelectTo(makeState(), '');
    expect(result.handled).toBe(true);
    expect(result.success?.patch?.takeoff?.toMode).toBe('TO');
  });

  it('uses scratchpad value when provided', () => {
    const result = handleSelectTo(makeState(), 'TO 1');
    expect(result.handled).toBe(true);
    expect(result.success?.patch?.takeoff?.toMode).toBe('TO 1');
  });
});

describe('handleSelectTo1', () => {
  it('sets toMode to TO 1', () => {
    const result = handleSelectTo1(makeState());
    expect(result.handled).toBe(true);
    expect(result.success?.patch?.takeoff?.toMode).toBe('TO 1');
  });
});

describe('handleSelectTo2', () => {
  it('sets toMode to TO 2', () => {
    const result = handleSelectTo2(makeState());
    expect(result.handled).toBe(true);
    expect(result.success?.patch?.takeoff?.toMode).toBe('TO 2');
  });
});

// ──── handleSetRunway ────

describe('handleSetRunway', () => {
  it('rejects empty scratchpad', () => {
    const result = handleSetRunway(makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('rejects runway shorter than 2 chars', () => {
    const result = handleSetRunway(makeState(), '2');
    expect(result.handled).toBe(true);
    expect(result.failure?.text).toBe('INVALID ENTRY');
  });

  it('sets runway when no previous runway', () => {
    const result = handleSetRunway(makeState(), '27L');
    expect(result.handled).toBe(true);
    expect(result.success?.patch?.takeoff?.runway).toBe('27L');
  });

  it('sets same runway (no speed deletion)', () => {
    const state = makeState({
      takeoff: { ...buildInitialFMCState().takeoff, runway: '27L', v1: 140, vr: 145, v2: 150 },
    });
    const result = handleSetRunway(state, '27L');
    expect(result.handled).toBe(true);
    expect(result.success?.patch?.takeoff?.runway).toBe('27L');
    expect(result.success?.scratchpadMessage).toBeUndefined();
  });

  it('deletes V speeds when runway changes with speeds entered', () => {
    const state = makeState({
      takeoff: { ...buildInitialFMCState().takeoff, runway: '27L', v1: 140, vr: 145, v2: 150 },
    });
    const result = handleSetRunway(state, '18R');
    expect(result.handled).toBe(true);
    expect(result.success?.patch?.takeoff?.runway).toBe('18R');
    expect(result.success?.patch?.takeoff?.v1).toBe(0);
    expect(result.success?.patch?.takeoff?.vr).toBe(0);
    expect(result.success?.patch?.takeoff?.v2).toBe(0);
    expect(result.success?.scratchpadMessage).toBe('V SPEEDS DELETED');
    expect(getPatch(result)?.msgLight).toBe(true);
  });
});

// ──── handleSetToMode ────

describe('handleSetToMode', () => {
  it('rejects empty scratchpad', () => {
    const result = handleSetToMode(makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('accepts valid mode TO', () => {
    const result = handleSetToMode(makeState(), 'TO');
    expect(result.handled).toBe(true);
    expect(result.success?.patch?.takeoff?.toMode).toBe('TO');
  });

  it('accepts valid mode TO 2', () => {
    const result = handleSetToMode(makeState(), 'TO 2');
    expect(result.handled).toBe(true);
    expect(result.success?.patch?.takeoff?.toMode).toBe('TO 2');
  });

  it('rejects invalid mode', () => {
    const result = handleSetToMode(makeState(), 'D-TO');
    expect(result.handled).toBe(true);
    expect(result.failure?.text).toBe('INVALID ENTRY');
  });
});

// ──── handleSetV1 / handleSetVr / handleSetV2 ────

describe('handleSetV1', () => {
  it('rejects empty scratchpad with no suggested value', () => {
    const result = handleSetV1(makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('accepts valid V1', () => {
    const result = handleSetV1(makeState(), '140');
    expect(result.handled).toBe(true);
    expect(result.success?.patch?.takeoff?.v1).toBe(140);
  });

  it('rejects out-of-range speed', () => {
    const result = handleSetV1(makeState(), '600');
    expect(result.handled).toBe(true);
    expect(result.failure?.text).toBe('OUT OF RANGE');
  });

  it('rejects V1 >= VR', () => {
    const state = makeState({
      takeoff: { ...buildInitialFMCState().takeoff, vr: 150 },
    });
    const result = handleSetV1(state, '150');
    expect(result.handled).toBe(true);
    expect(result.failure?.text).toBe('V1 MUST BE < VR');
  });

  it('uses suggestedV1 when scratchpad empty', () => {
    const state = makeState({
      takeoff: { ...buildInitialFMCState().takeoff, suggestedV1: 142 },
    });
    const result = handleSetV1(state, '');
    expect(result.handled).toBe(true);
    expect(result.success?.patch?.takeoff?.v1).toBe(142);
  });
});

describe('handleSetVr', () => {
  it('accepts valid VR', () => {
    const state = makeState({
      takeoff: { ...buildInitialFMCState().takeoff, v1: 140 },
    });
    const result = handleSetVr(state, '145');
    expect(result.handled).toBe(true);
    expect(result.success?.patch?.takeoff?.vr).toBe(145);
  });

  it('rejects VR <= V1', () => {
    const state = makeState({
      takeoff: { ...buildInitialFMCState().takeoff, v1: 150 },
    });
    const result = handleSetVr(state, '140');
    expect(result.handled).toBe(true);
    expect(result.failure?.text).toBe('V1 MUST BE < VR');
  });

  it('uses suggestedVr when scratchpad empty', () => {
    const state = makeState({
      takeoff: { ...buildInitialFMCState().takeoff, v1: 140, suggestedVr: 145 },
    });
    const result = handleSetVr(state, '');
    expect(result.handled).toBe(true);
    expect(result.success?.patch?.takeoff?.vr).toBe(145);
  });
});

describe('handleSetV2', () => {
  it('accepts valid V2', () => {
    const state = makeState({
      takeoff: { ...buildInitialFMCState().takeoff, v1: 140, vr: 145 },
    });
    const result = handleSetV2(state, '155');
    expect(result.handled).toBe(true);
    expect(result.success?.patch?.takeoff?.v2).toBe(155);
  });

  it('rejects V2 <= VR', () => {
    const state = makeState({
      takeoff: { ...buildInitialFMCState().takeoff, v1: 140, vr: 150 },
    });
    const result = handleSetV2(state, '150');
    expect(result.handled).toBe(true);
    expect(result.failure?.text).toBe('VR MUST BE < V2');
  });

  it('uses suggestedV2 when scratchpad empty', () => {
    const state = makeState({
      takeoff: { ...buildInitialFMCState().takeoff, v1: 140, vr: 145, suggestedV2: 150 },
    });
    const result = handleSetV2(state, '');
    expect(result.handled).toBe(true);
    expect(result.success?.patch?.takeoff?.v2).toBe(150);
  });
});

// ──── handleSetTrim / handleSetOat / handleSetAssumedTemp / handleTakeoffWind ────

describe('handleSetTrim', () => {
  it('accepts valid trim', () => {
    const result = handleSetTrim(makeState(), '5.0');
    expect(result.handled).toBe(true);
    expect(result.success?.patch?.takeoff?.trim).toBe(5.0);
  });

  it('rejects non-numeric trim', () => {
    const result = handleSetTrim(makeState(), 'abc');
    expect(result.handled).toBe(true);
    expect(result.failure?.text).toBe('INVALID ENTRY');
  });
});

describe('handleSetOat', () => {
  it('accepts valid OAT', () => {
    const result = handleSetOat(makeState(), '15');
    expect(result.handled).toBe(true);
    expect(result.success?.patch?.takeoff?.oat).toBe(15);
  });

  it('rejects out-of-range OAT', () => {
    const result = handleSetOat(makeState(), '70');
    expect(result.handled).toBe(true);
    expect(result.failure?.text).toBe('OUT OF RANGE');
  });
});

describe('handleSetAssumedTemp', () => {
  it('accepts valid assumed temp', () => {
    const result = handleSetAssumedTemp(makeState(), '55');
    expect(result.handled).toBe(true);
    expect(result.success?.patch?.takeoff?.assumedTemp).toBe(55);
  });

  it('rejects non-numeric assumed temp', () => {
    const result = handleSetAssumedTemp(makeState(), 'xyz');
    expect(result.handled).toBe(true);
    expect(result.failure?.text).toBe('INVALID ENTRY');
  });
});

describe('handleTakeoffWind', () => {
  it('accepts valid wind dir/speed', () => {
    const result = handleTakeoffWind(makeState(), '270/10');
    expect(result.handled).toBe(true);
    expect(result.success?.patch?.takeoff?.windDir).toBe(270);
    expect(result.success?.patch?.takeoff?.windSpeed).toBe(10);
  });

  it('rejects invalid wind format', () => {
    const result = handleTakeoffWind(makeState(), 'bad');
    expect(result.handled).toBe(true);
    expect(result.failure?.text).toBe('INVALID FORMAT');
  });

  it('rejects empty scratchpad', () => {
    const result = handleTakeoffWind(makeState(), '');
    expect(result.handled).toBe(false);
  });
});

// ──── handleTakeoffAction router ────

describe('handleTakeoffAction router', () => {
  it('dispatches set_v1', () => {
    const result = handleTakeoffAction('set_v1', makeState(), '140');
    expect(result.handled).toBe(true);
    expect(result.success?.patch?.takeoff?.v1).toBe(140);
  });

  it('dispatches set_runway', () => {
    const result = handleTakeoffAction('set_runway', makeState(), '27L');
    expect(result.handled).toBe(true);
    expect(result.success?.patch?.takeoff?.runway).toBe('27L');
  });

  it('returns handled: false for unknown action', () => {
    const result = handleTakeoffAction('unknown', makeState(), '');
    expect(result.handled).toBe(false);
  });

  it('dispatches select_to', () => {
    const result = handleTakeoffAction('select_to', makeState(), '');
    expect(result.handled).toBe(true);
    expect(result.success?.patch?.takeoff?.toMode).toBe('TO');
  });

  it('dispatches set_wind', () => {
    const result = handleTakeoffAction('set_wind', makeState(), '180/15');
    expect(result.handled).toBe(true);
    expect(result.success?.patch?.takeoff?.windDir).toBe(180);
    expect(result.success?.patch?.takeoff?.windSpeed).toBe(15);
  });
});
