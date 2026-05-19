import { describe, expect, it } from 'vitest';
import { buildTrainingProgress } from '../trainingProgress';
import { createBaseState } from '../../__tests__/testUtils';
import type { FMCState } from '../../types/fmc';

function withInitializedPosition(state: FMCState): FMCState {
  return {
    ...state,
    position: {
      ...state.position,
      refAirport: 'ENGM',
      lat: 60.1939,
      lon: 11.1004,
      irsState: 'NAV',
    },
  };
}

function withRoute(state: FMCState): FMCState {
  return {
    ...state,
    route: {
      ...state.route,
      origin: 'ENGM',
      destination: 'ENBR',
      routeString: 'DCT BGO',
    },
    flightPlan: {
      ...state.flightPlan,
      origin: 'ENGM',
      destination: 'ENBR',
      route: 'DCT BGO',
      waypoints: [
        { ident: 'ENGM', discontinuity: false, lat: 60.1939, lon: 11.1004 },
        { ident: 'BGO', discontinuity: false, lat: 60.2893, lon: 5.2181 },
        { ident: 'ENBR', discontinuity: false, lat: 60.2934, lon: 5.2181 },
      ],
    },
  };
}

function withPerformance(state: FMCState): FMCState {
  return {
    ...state,
    performance: {
      ...state.performance,
      crzAlt: 35000,
      costIndex: 25,
      zfw: 58.2,
      fuel: 8.4,
      grossWeight: 66.6,
    },
  };
}

function withTakeoffData(state: FMCState): FMCState {
  return {
    ...state,
    takeoff: {
      ...state.takeoff,
      runway: '01L',
      flaps: '5',
      v1: 136,
      vr: 138,
      v2: 144,
    },
  };
}

describe('buildTrainingProgress', () => {
  it('starts Boeing FMC setup at position initialization', () => {
    const state = createBaseState({
      aircraft: 'BOEING_737',
      cockpitLayoutMode: 'fmc-focus',
      position: { ...createBaseState().position, irsState: 'OFF' },
    });

    const progress = buildTrainingProgress({ fmcState: state });

    expect(progress.currentTrainingStep).toBe('initialize-position');
    expect(progress.expectedPage).toBe('POS_INIT');
    expect(progress.expectedKey).toBe('INIT_REF');
    expect(progress.aircraftSpecificTerminology.fmc).toBe('CDU');
    expect(progress.nextAction).not.toContain('MCDU');
  });

  it('progresses to route entry after position is initialized', () => {
    const state = withInitializedPosition(createBaseState({ aircraft: 'BOEING_737' }));

    const progress = buildTrainingProgress({ fmcState: state });

    expect(progress.currentTrainingStep).toBe('enter-route');
    expect(progress.completedSteps).toContain('initialize-position');
    expect(progress.expectedPage).toBe('RTE');
  });

  it('detects route discontinuities during route verification', () => {
    const state = {
      ...withRoute(withInitializedPosition(createBaseState({ cockpitLayoutMode: 'navigation' }))),
      flightPlan: {
        ...withRoute(withInitializedPosition(createBaseState())).flightPlan,
        waypoints: [
          { ident: 'ENGM', discontinuity: false },
          { ident: 'ROUTE DISCONTINUITY', discontinuity: true },
          { ident: 'ENBR', discontinuity: false },
        ],
      },
    };

    const progress = buildTrainingProgress({ fmcState: state, layoutMode: 'navigation' });

    expect(progress.currentTrainingStep).toBe('resolve-discontinuity');
    expect(progress.warning).toBe('Route discontinuity detected.');
    expect(progress.expectedPage).toBe('LEGS');
  });

  it('maps Boeing selected autoflight values and mode engagement into automation progress', () => {
    const state = withTakeoffData(
      withPerformance(
        withRoute(
          withInitializedPosition(
            createBaseState({
              aircraft: 'BOEING_737',
              cockpitLayoutMode: 'automation',
            }),
          ),
        ),
      ),
    );
    const autopilot = {
      ...state.autopilot,
      boeing: {
        ...state.autopilot.boeing,
        speed: 220,
        heading: 185,
        altitude: 9000,
      },
      truth: {
        ...state.autopilot.truth,
        lateralActive: 'HDG_SEL' as const,
        verticalActive: 'ALT_HOLD' as const,
      },
    };

    const progress = buildTrainingProgress({ fmcState: state, autopilotState: autopilot });

    expect(progress.currentTrainingStep).toBe('complete');
    expect(progress.completedSteps).toContain('set-autoflight-values');
    expect(progress.completedSteps).toContain('engage-autoflight-mode');
    expect(progress.hint).toContain('PFD FMA');
  });

  it('returns to performance review when shared prediction reports insufficient fuel', () => {
    const state = withRoute(
      withInitializedPosition(
        createBaseState({
          aircraft: 'BOEING_737',
          cockpitLayoutMode: 'fmc-focus',
          performance: {
            ...createBaseState().performance,
            crzAlt: 35000,
            costIndex: 25,
            zfw: 130000,
            fuel: 5000,
            reserve: 4500,
            grossWeight: 135000,
          },
          aircraftState: {
            ...createBaseState().aircraftState,
            lat: 60.1939,
            lon: 11.1004,
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
            fuelTotal: 5000,
            gw: 135000,
          },
        }),
      ),
    );

    const progress = buildTrainingProgress({ fmcState: state });

    expect(progress.currentTrainingStep).toBe('enter-performance');
    expect(progress.warning).toBe('INSUFFICIENT FUEL');
    expect(progress.expectedPage).toBe('PERF_INIT');
    expect(progress.hint).toContain('shared trainer-grade performance model');
  });

  it('uses Airbus managed and selected terminology without Boeing leakage', () => {
    const state = withInitializedPosition(
      createBaseState({
        aircraft: 'AIRBUS_A320',
        cockpitLayoutMode: 'fmc-focus',
      }),
    );

    const progress = buildTrainingProgress({ fmcState: state });

    expect(progress.currentTrainingStep).toBe('enter-route');
    expect(progress.expectedPage).toBe('F_PLN');
    expect(progress.aircraftSpecificTerminology.fmc).toBe('MCDU');
    expect(progress.aircraftSpecificTerminology.execute).toBe('INSERT');
    expect(`${progress.nextAction} ${progress.hint}`).not.toContain('EXEC');
    expect(`${progress.nextAction} ${progress.hint}`).not.toContain('LEGS');
  });

  it('detects complete Airbus approach setup', () => {
    const state = {
      ...withRoute(
        withInitializedPosition(
          createBaseState({
            aircraft: 'AIRBUS_A320',
            cockpitLayoutMode: 'approach',
          }),
        ),
      ),
      route: {
        ...withRoute(createBaseState()).route,
        approach: 'ILS27L',
        runway: '27L',
      },
      landing: {
        ...createBaseState().landing,
        runway: '27L',
        flaps: 'CONF 3',
        vref: 138,
        ilsFrequency: '109.50',
        course: 272,
      },
    };

    const progress = buildTrainingProgress({ fmcState: state, layoutMode: 'approach' });

    expect(progress.currentTrainingStep).toBe('complete');
    expect(progress.completedSteps).toContain('configure-approach');
    expect(progress.nextAction).toContain('Approach setup complete');
  });
});
