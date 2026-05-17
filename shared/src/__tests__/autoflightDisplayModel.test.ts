import { describe, expect, it } from 'vitest';
import {
  buildAirbusFcuDisplayModel,
  buildBoeingMcpDisplayModel,
  formatAltitude,
  formatDegrees,
  formatVerticalSpeed,
} from '../autopilot/autoflightDisplayModel';
import { createBaseState } from './testUtils';

describe('autoflight display models', () => {
  it('formats Boeing MCP windows consistently', () => {
    const state = createBaseState();
    state.autopilot.boeing.courseL = 12;
    state.autopilot.boeing.speed = 245;
    state.autopilot.boeing.heading = 7;
    state.autopilot.boeing.altitude = 9000;
    state.autopilot.boeing.verticalSpeed = 1200;
    state.autopilot.boeing.courseR = 276;
    state.autopilot.truth.verticalActive = 'VS';

    const model = buildBoeingMcpDisplayModel(state.autopilot.boeing, state.autopilot.truth);

    expect(model.windows.courseL.text).toBe('012');
    expect(model.windows.iasMach.text).toBe('245');
    expect(model.windows.iasMach.unit).toBe('SPD');
    expect(model.windows.heading.text).toBe('007');
    expect(model.windows.altitude.text).toBe('09000');
    expect(model.windows.verticalSpeed.text).toBe('+1200');
    expect(model.windows.verticalSpeed.active).toBe(true);
    expect(model.windows.courseR.text).toBe('276');
  });

  it('formats Boeing Mach and blank vertical-speed windows', () => {
    const state = createBaseState();
    state.autopilot.boeing.speed = null;
    state.autopilot.boeing.mach = 0.78;
    state.autopilot.boeing.verticalSpeed = 800;
    state.autopilot.truth.verticalActive = 'ALT_HOLD';

    const model = buildBoeingMcpDisplayModel(state.autopilot.boeing, state.autopilot.truth);

    expect(model.windows.iasMach.text).toBe('.78');
    expect(model.windows.iasMach.unit).toBe('MACH');
    expect(model.windows.verticalSpeed.text).toBe('');
    expect(model.windows.verticalSpeed.active).toBe(false);
  });

  it('formats Airbus FCU managed windows from autoflight truth', () => {
    const state = createBaseState({ aircraft: 'AIRBUS_A320' });
    state.autopilot.airbus.speed = 210;
    state.autopilot.airbus.heading = 184;
    state.autopilot.airbus.altitude = 12000;
    state.autopilot.airbus.verticalSpeed = null;
    state.autopilot.truth.thrustActive = 'SPEED';
    state.autopilot.truth.lateralActive = 'NAV';
    state.autopilot.truth.verticalArmed = 'VNAV_PTH';

    const model = buildAirbusFcuDisplayModel(state.autopilot.airbus, state.autopilot.truth);

    expect(model.managed.speed).toBe(true);
    expect(model.managed.heading).toBe(true);
    expect(model.managed.altitude).toBe(true);
    expect(model.windows.speed.text).toBe('---');
    expect(model.windows.heading.text).toBe('---');
    expect(model.windows.altitude.text).toBe('12000');
    expect(model.windows.altitude.managed).toBe(true);
    expect(model.windows.verticalSpeed.text).toBe('-----');
  });

  it('keeps shared primitive formatters deterministic', () => {
    expect(formatDegrees(5)).toBe('005');
    expect(formatAltitude(35000)).toBe('35000');
    expect(formatVerticalSpeed(null)).toBe('0000');
    expect(formatVerticalSpeed(-700)).toBe('-700');
  });
});
