import { describe, expect, it } from 'vitest';
import { PhaseManager } from '../fmc/PhaseManager';
import { createBaseState } from './testUtils';

describe('PhaseManager', () => {
  it('correctly transitions from descent to approach using HAA 3000 ft', () => {
    const state = createBaseState({
      flightPlan: {
        origin: 'KSEA',
        destination: 'KSEA',
        flightNumber: '',
        route: '',
        waypoints: [],
      },
      aircraftState: {
        lat: 47.4438,
        lon: -122.3017,
        altitude: 3400,
        altitudeFt: 3400,
        heading: 161,
        headingDeg: 161,
        track: 161,
        trackDeg: 161,
        ias: 180,
        indicatedAirspeedKt: 180,
        tas: 190,
        gs: 190,
        verticalSpeedFpm: -500,
        vs: -500,
        fuelTotal: 14000,
        gw: 139000,
      },
    });

    const phase = PhaseManager.inferFlightPhase(state);
    expect(phase).toBe('APPROACH');
  });

  it('remains in descent if above HAA 3000 ft', () => {
    const state = createBaseState({
      flightPlan: {
        origin: 'KSEA',
        destination: 'KSEA',
        flightNumber: '',
        route: '',
        waypoints: [],
      },
      aircraftState: {
        lat: 47.4438,
        lon: -122.3017,
        altitude: 3500,
        altitudeFt: 3500,
        heading: 161,
        headingDeg: 161,
        track: 161,
        trackDeg: 161,
        ias: 180,
        indicatedAirspeedKt: 180,
        tas: 190,
        gs: 190,
        verticalSpeedFpm: -500,
        vs: -500,
        fuelTotal: 14000,
        gw: 139000,
      },
    });

    const phase = PhaseManager.inferFlightPhase(state);
    expect(phase).toBe('DESCENT');
  });

  it('falls back gracefully to 0 ft MSL if airport is not found', () => {
    const state = createBaseState({
      flightPlan: {
        origin: 'UNKN',
        destination: 'UNKN',
        flightNumber: '',
        route: '',
        waypoints: [],
      },
      aircraftState: {
        lat: 0.0,
        lon: 0.0,
        altitude: 2900,
        altitudeFt: 2900,
        heading: 0,
        headingDeg: 0,
        track: 0,
        trackDeg: 0,
        ias: 180,
        indicatedAirspeedKt: 180,
        tas: 190,
        gs: 190,
        verticalSpeedFpm: -500,
        vs: -500,
        fuelTotal: 14000,
        gw: 139000,
      },
    });

    const phase = PhaseManager.inferFlightPhase(state);
    expect(phase).toBe('APPROACH');
  });
});
