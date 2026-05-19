import { describe, expect, it } from 'vitest';
import {
  buildAirbusFMAState,
  buildAirbusPFDState,
  buildBoeingFMAState,
  buildBoeingPFDState,
  buildPfdDisplayModel,
} from '../index';
import { createBaseState } from './testUtils';

describe('PFD display models', () => {
  it('routes the unified PFD display model to the active aircraft family', () => {
    const boeing = buildPfdDisplayModel({ fmcState: createBaseState() });
    expect(boeing.aircraft).toBe('BOEING_737');
    expect(boeing.boeingFma).toBeDefined();
    expect(boeing.airbusFma).toBeUndefined();

    const airbus = buildPfdDisplayModel({ fmcState: createBaseState({ aircraft: 'AIRBUS_A320' }) });
    expect(airbus.aircraft).toBe('AIRBUS_A320');
    expect(airbus.airbusFma).toBeDefined();
    expect(airbus.boeingFma).toBeUndefined();
  });

  it('projects Boeing MCP selected values into the PFD model', () => {
    const state = createBaseState();
    state.aircraftState = {
      lat: 59.9,
      lon: 10.7,
      altitude: 12400,
      altitudeFt: 12400,
      indicatedAirspeedKt: 246,
      ias: 246,
      tas: 252,
      groundSpeedKt: 300,
      gs: 300,
      heading: 271,
      headingDeg: 271,
      track: 270,
      trackDeg: 270,
      verticalSpeedFpm: 900,
      vs: 900,
      pitchDeg: 3,
      bankDeg: -12,
      fuelTotal: 9000,
      gw: 62000,
      accelerationKtS: 0.4,
    };
    state.autopilot.boeing.speed = 250;
    state.autopilot.boeing.heading = 280;
    state.autopilot.boeing.altitude = 15000;
    state.autopilot.boeing.verticalSpeed = 1000;

    const pfd = buildBoeingPFDState(state);

    expect(pfd.speed).toBe(246);
    expect(pfd.targetSpeed).toBe(250);
    expect(pfd.targetHeading).toBe(280);
    expect(pfd.targetAltitude).toBe(15000);
    expect(pfd.targetVerticalSpeed).toBe(1000);
    expect(pfd.speedTrend).toBe(4);
  });

  it('sets Boeing unavailable flags from IRS state', () => {
    const pfd = buildBoeingPFDState(
      createBaseState({
        position: {
          refAirport: '',
          gate: '',
          lat: 0,
          lon: 0,
          irsState: 'OFF',
          irsTimeRemaining: 0,
          irsAlignmentProgress: 0,
        },
      }),
    );

    expect(pfd.failureFlags?.attitude).toBe(true);
    expect(pfd.failureFlags?.navigation).toBe(true);
  });

  it('keeps Airbus managed speed and heading distinct from selected targets', () => {
    const state = createBaseState({ aircraft: 'AIRBUS_A320' });
    state.autopilot.airbus.speed = 210;
    state.autopilot.airbus.speedManaged = true;
    state.autopilot.airbus.heading = 180;
    state.autopilot.airbus.headingManaged = true;
    state.autopilot.airbus.altitude = 7000;
    state.autopilot.airbus.altitudeManaged = true;

    const managed = buildAirbusPFDState(state);
    expect(managed.targetSpeed).toBeNull();
    expect(managed.targetHeading).toBeNull();
    expect(managed.targetAltitude).toBe(7000);
    expect(managed.managedSpeed).toBe(true);
    expect(managed.managedHeading).toBe(true);
    expect(managed.managedAltitude).toBe(true);

    state.autopilot.airbus.speedManaged = false;
    state.autopilot.airbus.headingManaged = false;

    const selected = buildAirbusPFDState(state);
    expect(selected.targetSpeed).toBe(210);
    expect(selected.targetHeading).toBe(180);
  });

  it('maps Boeing and Airbus FMA status from active autoflight state', () => {
    const state = createBaseState();
    state.autopilot.truth.thrustActive = 'SPEED';
    state.autopilot.truth.lateralActive = 'HDG_SEL';
    state.autopilot.truth.verticalActive = 'ALT_HOLD';
    state.autopilot.truth.autopilotStatus = 'CMD_A';
    state.autopilot.airbus.ap1 = true;
    state.autopilot.airbus.fd1 = true;
    state.autopilot.airbus.athr = true;

    const boeing = buildBoeingFMAState(state.autopilot, state);
    expect(boeing.autothrottleMode).toBe('MCP SPD');
    expect(boeing.rollMode).toBe('HDG SEL');
    expect(boeing.pitchMode).toBe('ALT HOLD');
    expect(boeing.apStatus).toBe('CMD A');

    const airbus = buildAirbusFMAState(state.autopilot, state);
    expect(airbus.lateralMode).toBe('HDG');
    expect(airbus.verticalMode).toBe('ALT');
    expect(airbus.status.ap1).toBe(true);
    expect(airbus.status.fd1).toBe(true);
    expect(airbus.status.athr).toBe(true);
  });

  it('maps Boeing approach armed and active modes into the FMA', () => {
    const state = createBaseState();
    state.autopilot.truth.thrustActive = 'SPEED';
    state.autopilot.truth.lateralActive = 'VOR_LOC';
    state.autopilot.truth.lateralArmed = 'APP';
    state.autopilot.truth.verticalActive = 'G_S';
    state.autopilot.truth.verticalArmed = 'G_S';
    state.autopilot.truth.autopilotStatus = 'CMD_A';

    const fma = buildBoeingFMAState(state.autopilot, state);

    expect(fma.autothrottleMode).toBe('MCP SPD');
    expect(fma.rollMode).toBe('VOR/LOC');
    expect(fma.armedRollMode).toBe('APP');
    expect(fma.pitchMode).toBe('G/S');
    expect(fma.armedPitchMode).toBe('G/S');
  });

  it('maps Airbus approach modes into Airbus FMA terminology', () => {
    const state = createBaseState({ aircraft: 'AIRBUS_A320' });
    state.autopilot.airbus.ap1 = true;
    state.autopilot.airbus.fd1 = true;
    state.autopilot.airbus.athr = true;
    state.autopilot.truth.thrustActive = 'SPEED';
    state.autopilot.truth.lateralActive = 'LOC';
    state.autopilot.truth.lateralArmed = 'NAV';
    state.autopilot.truth.verticalActive = 'G_S';
    state.autopilot.truth.verticalArmed = 'G_S';
    state.autopilot.truth.autopilotStatus = 'AP1';

    const fma = buildAirbusFMAState(state.autopilot, state);

    expect(fma.autothrustMode).toBe('SPEED');
    expect(fma.lateralMode).toBe('LOC');
    expect(fma.verticalMode).toBe('G/S');
    expect(fma.armedModes).toContain('NAV');
    expect(fma.armedModes).toContain('G/S');
    expect(fma.status.ap1).toBe(true);
  });
});
