import { describe, expect, it } from 'vitest';
import { buildAirbusFMAState, buildAirbusPFDState, buildBoeingFMAState, buildBoeingPFDState } from '../index';
import { createBaseState } from './testUtils';

describe('PFD display models', () => {
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
    const pfd = buildBoeingPFDState(createBaseState({
      position: {
        refAirport: '',
        gate: '',
        lat: 0,
        lon: 0,
        irsState: 'OFF',
        irsTimeRemaining: 0,
        irsAlignmentProgress: 0,
      },
    }));

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
});
