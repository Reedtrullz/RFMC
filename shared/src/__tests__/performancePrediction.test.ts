import { describe, expect, it } from 'vitest';
import { buildPerformancePrediction } from '../fmc/performancePrediction';
import { createBaseState } from './testUtils';

function completePerformanceState() {
  return createBaseState({
    performance: {
      crzAlt: 35000,
      costIndex: 30,
      zfw: 130000,
      fuel: 16000,
      cg: 24,
      reserve: 4500,
      grossWeight: 146000,
    },
    takeoff: {
      ...createBaseState().takeoff,
      runway: '01L',
      flaps: '5',
      oat: 15,
      windSpeed: 8,
    },
    route: { origin: 'ENGM', destination: 'ENBR', flightNumber: '', routeString: 'BAMAD BGO' },
    flightPlan: {
      origin: 'ENGM',
      destination: 'ENBR',
      flightNumber: '',
      route: 'BAMAD BGO',
      waypoints: [
        { ident: 'ENGM', lat: 60.1939, lon: 11.1004, discontinuity: false },
        { ident: 'BGO', lat: 60.2893, lon: 5.2181, discontinuity: false },
        { ident: 'ENBR', lat: 60.2934, lon: 5.2181, discontinuity: false },
      ],
    },
    aircraftState: {
      lat: 60.18,
      lon: 11.08,
      altitude: 0,
      altitudeFt: 0,
      heading: 270,
      headingDeg: 270,
      track: 270,
      trackDeg: 270,
      ias: 0,
      indicatedAirspeedKt: 0,
      tas: 0,
      gs: 0,
      verticalSpeedFpm: 0,
      vs: 0,
      fuelTotal: 16000,
      gw: 146000,
    },
  });
}

describe('buildPerformancePrediction', () => {
  it('generates plausible trainer-grade V-speeds and fuel prediction', () => {
    const prediction = buildPerformancePrediction(completePerformanceState());

    expect(prediction.available).toBe(true);
    expect(prediction.vnavAvailable).toBe(true);
    expect(prediction.vSpeeds.v1).toBeGreaterThan(130);
    expect(prediction.vSpeeds.vr).toBeGreaterThan(prediction.vSpeeds.v1 ?? 0);
    expect(prediction.vSpeeds.v2).toBeGreaterThan(prediction.vSpeeds.vr ?? 0);
    expect(prediction.estimatedTripFuel).toBeGreaterThan(0);
    expect(prediction.estimatedFuelAtDestination).toBeGreaterThan(4500);
    expect(prediction.notes[0]).toContain('Trainer-grade');
  });

  it('marks VNAV unavailable when performance basics are missing', () => {
    const prediction = buildPerformancePrediction(createBaseState());

    expect(prediction.available).toBe(false);
    expect(prediction.vnavAvailable).toBe(false);
    expect(prediction.warnings).toContain('PERF/VNAV UNAVAILABLE');
  });

  it('warns when predicted destination fuel is below reserve', () => {
    const state = completePerformanceState();
    state.performance.fuel = 5000;
    state.performance.reserve = 4500;
    state.performance.grossWeight = 135000;

    const prediction = buildPerformancePrediction(state);

    expect(prediction.available).toBe(false);
    expect(prediction.warnings).toContain('INSUFFICIENT FUEL');
  });

  it('warns for a deliberately short trainer runway', () => {
    const state = completePerformanceState();
    state.takeoff.runway = 'SHORT';
    state.performance.grossWeight = 170000;

    const prediction = buildPerformancePrediction(state);

    expect(prediction.runwayLengthFt).toBe(4800);
    expect(prediction.requiredRunwayLengthFt).toBeGreaterThan(prediction.runwayLengthFt ?? 0);
    expect(prediction.warnings).toContain('RUNWAY TOO SHORT');
  });
});
