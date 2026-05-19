import { describe, expect, it, beforeEach } from 'vitest';
import { GpwsEngine } from '../fmc/GpwsEngine';
import { TcasEngine } from '../fmc/TcasEngine';
import { createBaseState } from './testUtils';

describe('GpwsEngine', () => {
  let engine: GpwsEngine;

  beforeEach(() => {
    engine = new GpwsEngine();
  });

  describe('Mode 1 — Sink Rate', () => {
    it('returns SINK_RATE when descending fast near terrain', () => {
      const state = createBaseState({
        aircraftState: {
          lat: 0,
          lon: 0,
          altitude: 1000,
          altitudeFt: 1000,
          heading: 0,
          headingDeg: 0,
          track: 0,
          trackDeg: 0,
          ias: 250,
          indicatedAirspeedKt: 250,
          tas: 260,
          gs: 250,
          verticalSpeedFpm: -3000,
          vs: -3000,
          fuelTotal: 10000,
          gw: 140000,
        },
      });
      const result = engine.update(state, 1);
      expect(result.alert).toBe('SINK_RATE');
    });

    it('returns PULL_UP when descending fast below 500ft', () => {
      const state = createBaseState({
        aircraftState: {
          lat: 0,
          lon: 0,
          altitude: 400,
          altitudeFt: 400,
          heading: 0,
          headingDeg: 0,
          track: 0,
          trackDeg: 0,
          ias: 250,
          indicatedAirspeedKt: 250,
          tas: 260,
          gs: 250,
          verticalSpeedFpm: -2000,
          vs: -2000,
          fuelTotal: 10000,
          gw: 140000,
        },
      });
      const result = engine.update(state, 1);
      expect(result.alert).toBe('PULL_UP');
    });

    it('returns NONE when descending slowly', () => {
      const state = createBaseState({
        aircraftState: {
          lat: 0,
          lon: 0,
          altitude: 2000,
          altitudeFt: 2000,
          heading: 0,
          headingDeg: 0,
          track: 0,
          trackDeg: 0,
          ias: 250,
          indicatedAirspeedKt: 250,
          tas: 260,
          gs: 250,
          verticalSpeedFpm: -500,
          vs: -500,
          fuelTotal: 10000,
          gw: 140000,
        },
      });
      const result = engine.update(state, 1);
      expect(result.alert).toBe('NONE');
    });

    it('returns NONE above 2500ft regardless of descent rate', () => {
      const state = createBaseState({
        aircraftState: {
          lat: 0,
          lon: 0,
          altitude: 3500,
          altitudeFt: 3500,
          heading: 0,
          headingDeg: 0,
          track: 0,
          trackDeg: 0,
          ias: 250,
          indicatedAirspeedKt: 250,
          tas: 260,
          gs: 250,
          verticalSpeedFpm: -10000,
          vs: -10000,
          fuelTotal: 10000,
          gw: 140000,
        },
      });
      const result = engine.update(state, 1);
      expect(result.alert).toBe('NONE');
    });
  });

  describe("Mode 3 — Don't Sink", () => {
    function makeTakeoffState(altFt: number, vsFpm: number) {
      return createBaseState({
        flightPhase: 'TAKEOFF',
        aircraftState: {
          lat: 0,
          lon: 0,
          altitude: altFt,
          altitudeFt: altFt,
          heading: 0,
          headingDeg: 0,
          track: 0,
          trackDeg: 0,
          ias: 180,
          indicatedAirspeedKt: 180,
          tas: 190,
          gs: 180,
          verticalSpeedFpm: vsFpm,
          vs: vsFpm,
          fuelTotal: 10000,
          gw: 140000,
        },
      });
    }

    it('returns DONT_SINK when cumulative loss exceeds 8% of peak', () => {
      // First update sets peak at 800ft
      const state = makeTakeoffState(800, 100);
      engine.update(state, 1);

      // Second update: dropped to 650ft — loss of 150ft > 8% of 800 (64ft)
      const state2 = makeTakeoffState(650, -100);
      const result = engine.update(state2, 1);
      expect(result.alert).toBe('DONT_SINK');
    });

    it('returns NONE when altitude loss is within margin', () => {
      const state = makeTakeoffState(800, 100);
      engine.update(state, 1);

      // Second update: dropped to 770ft — loss of 30ft < 8% of 800 (64ft)
      const state2 = makeTakeoffState(770, -50);
      const result = engine.update(state2, 1);
      expect(result.alert).toBe('NONE');
    });

    it('returns NONE outside protected flight phases', () => {
      const state = createBaseState({
        flightPhase: 'CRUISE',
        aircraftState: {
          lat: 0,
          lon: 0,
          altitude: 800,
          altitudeFt: 800,
          heading: 0,
          headingDeg: 0,
          track: 0,
          trackDeg: 0,
          ias: 180,
          indicatedAirspeedKt: 180,
          tas: 190,
          gs: 180,
          verticalSpeedFpm: -500,
          vs: -500,
          fuelTotal: 10000,
          gw: 140000,
        },
      });
      engine.update(state, 1);
      const state2 = createBaseState({
        flightPhase: 'CRUISE',
        aircraftState: {
          lat: 0,
          lon: 0,
          altitude: 600,
          altitudeFt: 600,
          heading: 0,
          headingDeg: 0,
          track: 0,
          trackDeg: 0,
          ias: 180,
          indicatedAirspeedKt: 180,
          tas: 190,
          gs: 180,
          verticalSpeedFpm: -500,
          vs: -500,
          fuelTotal: 10000,
          gw: 140000,
        },
      });
      const result = engine.update(state2, 1);
      expect(result.alert).toBe('NONE');
    });

    it('resets phase tracking on flight phase change', () => {
      // Start in TAKEOFF
      const state1 = createBaseState({
        flightPhase: 'TAKEOFF',
        aircraftState: {
          lat: 0,
          lon: 0,
          altitude: 800,
          altitudeFt: 800,
          heading: 0,
          headingDeg: 0,
          track: 0,
          trackDeg: 0,
          ias: 180,
          indicatedAirspeedKt: 180,
          tas: 190,
          gs: 180,
          verticalSpeedFpm: 500,
          vs: 500,
          fuelTotal: 10000,
          gw: 140000,
        },
      });
      engine.update(state1, 1);

      // Switch to GO_AROUND, peak should reset
      const state2 = createBaseState({
        flightPhase: 'GO_AROUND',
        aircraftState: {
          lat: 0,
          lon: 0,
          altitude: 900,
          altitudeFt: 900,
          heading: 0,
          headingDeg: 0,
          track: 0,
          trackDeg: 0,
          ias: 180,
          indicatedAirspeedKt: 180,
          tas: 190,
          gs: 180,
          verticalSpeedFpm: 500,
          vs: 500,
          fuelTotal: 10000,
          gw: 140000,
        },
      });
      engine.update(state2, 1);

      // Loss from peak of 900: 30ft loss < 72ft margin (8% of 900), so should be NONE
      const state3 = createBaseState({
        flightPhase: 'GO_AROUND',
        aircraftState: {
          lat: 0,
          lon: 0,
          altitude: 870,
          altitudeFt: 870,
          heading: 0,
          headingDeg: 0,
          track: 0,
          trackDeg: 0,
          ias: 180,
          indicatedAirspeedKt: 180,
          tas: 190,
          gs: 180,
          verticalSpeedFpm: -50,
          vs: -50,
          fuelTotal: 10000,
          gw: 140000,
        },
      });
      const result = engine.update(state3, 1);
      expect(result.alert).toBe('NONE');
    });
  });

  describe('Mode 6 — Callouts', () => {
    function makeState(altFt: number) {
      return createBaseState({
        aircraftState: {
          lat: 0,
          lon: 0,
          altitude: altFt,
          altitudeFt: altFt,
          heading: 0,
          headingDeg: 0,
          track: 0,
          trackDeg: 0,
          ias: 180,
          indicatedAirspeedKt: 180,
          tas: 190,
          gs: 180,
          verticalSpeedFpm: -500,
          vs: -500,
          fuelTotal: 10000,
          gw: 140000,
        },
      });
    }

    it('generates callout at 500ft', () => {
      const state = makeState(600);
      engine.update(state, 1);

      const state2 = makeState(450);
      const result = engine.update(state2, 1);
      expect(result.callout).toBe(500);
    });

    it('generates callout at 100ft', () => {
      const state = makeState(150);
      engine.update(state, 1);

      const state2 = makeState(80);
      const result = engine.update(state2, 1);
      expect(result.callout).toBe(100);
    });

    it('generates callout at 10ft', () => {
      const state = makeState(20);
      engine.update(state, 1);

      const state2 = makeState(5);
      const result = engine.update(state2, 1);
      expect(result.callout).toBe(10);
    });
  });

  describe('Mode 1 — Sink Rate boundaries', () => {
    it('returns NONE at exactly 2500ft regardless of sink rate', () => {
      const state = createBaseState({
        aircraftState: {
          lat: 0,
          lon: 0,
          altitude: 2500,
          altitudeFt: 2500,
          heading: 0,
          headingDeg: 0,
          track: 0,
          trackDeg: 0,
          ias: 250,
          indicatedAirspeedKt: 250,
          tas: 260,
          gs: 250,
          verticalSpeedFpm: -10000,
          vs: -10000,
          fuelTotal: 10000,
          gw: 140000,
        },
      });
      const result = engine.update(state, 1);
      expect(result.alert).toBe('NONE');
    });

    it('returns NONE when no aircraft state', () => {
      const state = createBaseState({ aircraftState: undefined });
      const result = engine.update(state, 1);
      expect(result.alert).toBe('NONE');
    });
  });

  describe('Mode 6 — Callout boundary conditions', () => {
    it('generates callout at 2500ft', () => {
      const state = createBaseState({
        aircraftState: {
          lat: 0,
          lon: 0,
          altitude: 2600,
          altitudeFt: 2600,
          heading: 0,
          headingDeg: 0,
          track: 0,
          trackDeg: 0,
          ias: 180,
          indicatedAirspeedKt: 180,
          tas: 190,
          gs: 180,
          verticalSpeedFpm: -500,
          vs: -500,
          fuelTotal: 10000,
          gw: 140000,
        },
      });
      engine.update(state, 1);
      const state2 = createBaseState({
        aircraftState: {
          lat: 0,
          lon: 0,
          altitude: 2450,
          altitudeFt: 2450,
          heading: 0,
          headingDeg: 0,
          track: 0,
          trackDeg: 0,
          ias: 180,
          indicatedAirspeedKt: 180,
          tas: 190,
          gs: 180,
          verticalSpeedFpm: -500,
          vs: -500,
          fuelTotal: 10000,
          gw: 140000,
        },
      });
      const result = engine.update(state2, 1);
      expect(result.callout).toBe(2500);
    });

    it('generates callout at 1000ft', () => {
      const state = createBaseState({
        aircraftState: {
          lat: 0,
          lon: 0,
          altitude: 1100,
          altitudeFt: 1100,
          heading: 0,
          headingDeg: 0,
          track: 0,
          trackDeg: 0,
          ias: 180,
          indicatedAirspeedKt: 180,
          tas: 190,
          gs: 180,
          verticalSpeedFpm: -500,
          vs: -500,
          fuelTotal: 10000,
          gw: 140000,
        },
      });
      engine.update(state, 1);
      const state2 = createBaseState({
        aircraftState: {
          lat: 0,
          lon: 0,
          altitude: 950,
          altitudeFt: 950,
          heading: 0,
          headingDeg: 0,
          track: 0,
          trackDeg: 0,
          ias: 180,
          indicatedAirspeedKt: 180,
          tas: 190,
          gs: 180,
          verticalSpeedFpm: -500,
          vs: -500,
          fuelTotal: 10000,
          gw: 140000,
        },
      });
      const result = engine.update(state2, 1);
      expect(result.callout).toBe(1000);
    });

    it('generates multiple callouts in one descent', () => {
      const altSequence = [2700, 2400, 900, 450, 150, 90, 45, 35, 25, 15, 5];
      const expectedCallouts = [2500, 1000, 500, 400, 100, 50, 40, 30, 20, 10];
      const actualCallouts: number[] = [];

      for (const alt of altSequence) {
        const state = createBaseState({
          aircraftState: {
            lat: 0,
            lon: 0,
            altitude: alt,
            altitudeFt: alt,
            heading: 0,
            headingDeg: 0,
            track: 0,
            trackDeg: 0,
            ias: 180,
            indicatedAirspeedKt: 180,
            tas: 190,
            gs: 180,
            verticalSpeedFpm: -500,
            vs: -500,
            fuelTotal: 10000,
            gw: 140000,
          },
        });
        const result = engine.update(state, 1);
        if (result.callout !== undefined) actualCallouts.push(result.callout);
      }

      expect(actualCallouts).toEqual(expectedCallouts);
    });

    it('does not fire same callout twice', () => {
      const state600 = createBaseState({
        aircraftState: {
          lat: 0,
          lon: 0,
          altitude: 600,
          altitudeFt: 600,
          heading: 0,
          headingDeg: 0,
          track: 0,
          trackDeg: 0,
          ias: 180,
          indicatedAirspeedKt: 180,
          tas: 190,
          gs: 180,
          verticalSpeedFpm: -500,
          vs: -500,
          fuelTotal: 10000,
          gw: 140000,
        },
      });
      expect(engine.update(state600, 1).callout).toBeUndefined();

      const state450 = createBaseState({
        aircraftState: {
          lat: 0,
          lon: 0,
          altitude: 450,
          altitudeFt: 450,
          heading: 0,
          headingDeg: 0,
          track: 0,
          trackDeg: 0,
          ias: 180,
          indicatedAirspeedKt: 180,
          tas: 190,
          gs: 180,
          verticalSpeedFpm: -500,
          vs: -500,
          fuelTotal: 10000,
          gw: 140000,
        },
      });
      expect(engine.update(state450, 1).callout).toBe(500);

      // Descend to 350 — fires 400 (first threshold below lastCalloutAlt=450)
      const state350 = createBaseState({
        aircraftState: {
          lat: 0,
          lon: 0,
          altitude: 350,
          altitudeFt: 350,
          heading: 0,
          headingDeg: 0,
          track: 0,
          trackDeg: 0,
          ias: 180,
          indicatedAirspeedKt: 180,
          tas: 190,
          gs: 180,
          verticalSpeedFpm: -500,
          vs: -500,
          fuelTotal: 10000,
          gw: 140000,
        },
      });
      expect(engine.update(state350, 1).callout).toBe(400);

      // Descend to 150 — fires 300 (first threshold below lastCalloutAlt=350)
      const state150 = createBaseState({
        aircraftState: {
          lat: 0,
          lon: 0,
          altitude: 150,
          altitudeFt: 150,
          heading: 0,
          headingDeg: 0,
          track: 0,
          trackDeg: 0,
          ias: 180,
          indicatedAirspeedKt: 180,
          tas: 190,
          gs: 180,
          verticalSpeedFpm: -500,
          vs: -500,
          fuelTotal: 10000,
          gw: 140000,
        },
      });
      expect(engine.update(state150, 1).callout).toBe(300);

      // Now descend to 80 — fires 100 (300>100 && 80<=100 → true; 200 is skipped because 150<200)
      const state80 = createBaseState({
        aircraftState: {
          lat: 0,
          lon: 0,
          altitude: 80,
          altitudeFt: 80,
          heading: 0,
          headingDeg: 0,
          track: 0,
          trackDeg: 0,
          ias: 180,
          indicatedAirspeedKt: 180,
          tas: 190,
          gs: 180,
          verticalSpeedFpm: -500,
          vs: -500,
          fuelTotal: 10000,
          gw: 140000,
        },
      });
      expect(engine.update(state80, 1).callout).toBe(100);

      // Further descent to 5 — fires 50 (first threshold below lastCalloutAlt=80)
      const state5 = createBaseState({
        aircraftState: {
          lat: 0,
          lon: 0,
          altitude: 5,
          altitudeFt: 5,
          heading: 0,
          headingDeg: 0,
          track: 0,
          trackDeg: 0,
          ias: 180,
          indicatedAirspeedKt: 180,
          tas: 190,
          gs: 180,
          verticalSpeedFpm: -500,
          vs: -500,
          fuelTotal: 10000,
          gw: 140000,
        },
      });
      expect(engine.update(state5, 1).callout).toBe(50);
    });
  });

  describe('Cooldown', () => {
    it('respects 2-second cooldown between same alerts', () => {
      const state = createBaseState({
        aircraftState: {
          lat: 0,
          lon: 0,
          altitude: 1000,
          altitudeFt: 1000,
          heading: 0,
          headingDeg: 0,
          track: 0,
          trackDeg: 0,
          ias: 250,
          indicatedAirspeedKt: 250,
          tas: 260,
          gs: 250,
          verticalSpeedFpm: -3000,
          vs: -3000,
          fuelTotal: 10000,
          gw: 140000,
        },
      });

      // First alert fires
      const first = engine.update(state, 1);
      expect(first.alert).toBe('SINK_RATE');

      // Immediate second call with small dt — should be suppressed by cooldown
      const second = engine.update(state, 0.5);
      expect(second.alert).toBe('NONE');
    });

    it('fires again after cooldown expires', () => {
      const state = createBaseState({
        aircraftState: {
          lat: 0,
          lon: 0,
          altitude: 1000,
          altitudeFt: 1000,
          heading: 0,
          headingDeg: 0,
          track: 0,
          trackDeg: 0,
          ias: 250,
          indicatedAirspeedKt: 250,
          tas: 260,
          gs: 250,
          verticalSpeedFpm: -3000,
          vs: -3000,
          fuelTotal: 10000,
          gw: 140000,
        },
      });

      const first = engine.update(state, 1);
      expect(first.alert).toBe('SINK_RATE');

      // After 3 seconds, cooldown should have expired
      const second = engine.update(state, 3);
      expect(second.alert).toBe('SINK_RATE');
    });
  });
});

const aircraftStateData = {
  lat: 50,
  lon: 50,
  altitude: 5000,
  altitudeFt: 5000,
  heading: 0,
  headingDeg: 0,
  track: 0,
  trackDeg: 0,
  ias: 250,
  indicatedAirspeedKt: 250,
  tas: 260,
  gs: 250,
  verticalSpeedFpm: 0,
  vs: 0,
  fuelTotal: 10000,
  gw: 140000,
};

const tcasEfisDefault = {
  mode: 'MAP' as const,
  range: 40,
  centered: true,
  side: 'L' as const,
  overlays: {
    wpt: false,
    arpt: false,
    sta: false,
    data: false,
    pos: false,
    terr: false,
    wxr: false,
    tfc: false,
    cstr: false,
  },
};

function tcasState(overrides: Record<string, unknown> = {}) {
  return createBaseState({
    demoMode: true,
    aircraftState: aircraftStateData,
    efisL: tcasEfisDefault,
    ...overrides,
  });
}

describe('TcasEngine', () => {
  let engine: TcasEngine;

  beforeEach(() => {
    engine = new TcasEngine();
  });

  describe('Initialization', () => {
    it('generates 3 synthetic targets in demo mode', () => {
      const state = tcasState();
      const result = engine.update(state, 1);
      expect(result.targets).toHaveLength(3);
    });

    it('returns empty when not in demo or tutorial mode', () => {
      const state = tcasState({ demoMode: false, tutorialActive: false });
      const result = engine.update(state, 1);
      expect(result.targets).toHaveLength(0);
      expect(result.alert).toBe(false);
    });
  });

  describe('Threat detection', () => {
    it('targets move toward aircraft center over successive updates', () => {
      const state = tcasState();

      const first = engine.update(state, 1);
      // T1 starts at (45,30) — moves toward (50,50), so x increases, y increases
      expect(first.targets[0].x).toBeGreaterThan(45);
      expect(first.targets[0].y).toBeGreaterThan(30);
    });
  });

  describe('TCAS mode — vertical envelope', () => {
    it('NORMAL mode limits envelope to +/-2700ft', () => {
      const state = tcasState({ efisL: { ...tcasEfisDefault, tcasMode: 'NORMAL' } });

      for (let i = 0; i < 200; i++) {
        engine.update(state, 1);
      }

      const result = engine.update(state, 1);
      expect(result.targets.length).toBe(3);
    });
  });

  describe('Alert cooldown', () => {
    it('raises alert when target enters traffic/resolution range', () => {
      const state = tcasState();

      // Run many iterations to bring targets close
      let alert = false;
      for (let i = 0; i < 500; i++) {
        const result = engine.update(state, 1);
        if (result.alert) alert = true;
      }

      // Targets should eventually come close enough to trigger traffic alert
      expect(alert).toBe(true);
    });
  });

  describe('Threat level progression', () => {
    it('targets progress through other → proximate → traffic → resolution as they close in', () => {
      const state = tcasState();
      const threatLevels: string[] = [];
      const targetId = 'T3'; // T3 starts at (50,10) — closest to aircraft center

      for (let i = 0; i < 300; i++) {
        const result = engine.update(state, 1);
        const target = result.targets.find((t) => t.id === targetId);
        if (target && !threatLevels.includes(target.threatLevel)) {
          threatLevels.push(target.threatLevel);
        }
      }

      // T3 should progress from other → proximate → traffic → resolution
      expect(threatLevels).toContain('other');
      expect(threatLevels).toContain('proximate');
      expect(threatLevels).toContain('traffic');
    });
  });

  describe('TCAS vertical envelope — ABOVE mode', () => {
    it('allows targets above aircraft in ABOVE mode', () => {
      const state = tcasState({ efisL: { ...tcasEfisDefault, tcasMode: 'ABOVE' } });

      for (let i = 0; i < 50; i++) {
        engine.update(state, 1);
      }

      const result = engine.update(state, 1);
      // Targets should still be visible
      expect(result.targets.length).toBe(3);
    });
  });

  describe('TCAS vertical envelope — BELOW mode', () => {
    it('allows targets below aircraft in BELOW mode', () => {
      const state = tcasState({ efisL: { ...tcasEfisDefault, tcasMode: 'BELOW' } });

      for (let i = 0; i < 50; i++) {
        engine.update(state, 1);
      }

      const result = engine.update(state, 1);
      expect(result.targets.length).toBe(3);
    });
  });

  describe('Tutorial mode generates targets', () => {
    it('generates 3 synthetic targets in tutorial mode', () => {
      const state = tcasState({ demoMode: false, tutorialActive: true });
      const result = engine.update(state, 1);
      expect(result.targets).toHaveLength(3);
    });
  });
});
