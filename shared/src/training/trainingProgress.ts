import type { AircraftType, CDUKey, FMCState, LSKId, PageType } from '../types/fmc';
import type { CockpitLayoutMode, PanelId } from '../types/cockpit';
import type { AutopilotState } from '../autopilot/autopilotTypes';
import { buildPerformancePrediction } from '../fmc/performancePrediction';

export type TrainingProgressStep =
  | 'initialize-position'
  | 'enter-route'
  | 'resolve-discontinuity'
  | 'execute-modification'
  | 'enter-performance'
  | 'enter-takeoff-data'
  | 'verify-route'
  | 'set-autoflight-values'
  | 'engage-autoflight-mode'
  | 'configure-approach'
  | 'scan-flight-deck'
  | 'complete';

export interface TrainingProgress {
  currentTrainingStep: TrainingProgressStep;
  completedSteps: TrainingProgressStep[];
  nextAction: string;
  expectedPage: PageType | null;
  expectedLSK: LSKId | null;
  expectedKey: CDUKey | null;
  expectedPanel: PanelId | null;
  missingFields: string[];
  warning: string | null;
  hint: string;
  aircraftSpecificTerminology: {
    fmc: string;
    routePage: string;
    legsPage: string;
    execute: string;
    temporaryPlan: string;
    selectedMode: string;
    managedMode: string;
  };
}

export interface BuildTrainingProgressInput {
  aircraft?: AircraftType;
  layoutMode?: CockpitLayoutMode;
  fmcState: FMCState;
  autopilotState?: AutopilotState;
}

type FieldCheck = {
  id: string;
  complete: boolean;
};

const boeingTerms: TrainingProgress['aircraftSpecificTerminology'] = {
  fmc: 'CDU',
  routePage: 'RTE',
  legsPage: 'LEGS',
  execute: 'EXEC',
  temporaryPlan: 'MOD',
  selectedMode: 'selected',
  managedMode: 'VNAV/LNAV',
};

const airbusTerms: TrainingProgress['aircraftSpecificTerminology'] = {
  fmc: 'MCDU',
  routePage: 'F-PLN',
  legsPage: 'F-PLN',
  execute: 'INSERT',
  temporaryPlan: 'TMPY',
  selectedMode: 'selected',
  managedMode: 'managed',
};

export function buildTrainingProgress(input: BuildTrainingProgressInput): TrainingProgress {
  const state = input.fmcState;
  const aircraft = input.aircraft ?? state.aircraft;
  const layoutMode = input.layoutMode ?? state.cockpitLayoutMode;
  const autopilot = input.autopilotState ?? state.autopilot;
  const terms = aircraft === 'AIRBUS_A320' ? airbusTerms : boeingTerms;

  if (layoutMode === 'navigation') {
    return buildRouteVerificationProgress(state, aircraft, terms);
  }

  if (layoutMode === 'automation') {
    return buildAutomationProgress(state, aircraft, autopilot, terms);
  }

  if (layoutMode === 'approach') {
    return buildApproachProgress(state, aircraft, terms);
  }

  if (layoutMode === 'full-deck') {
    return {
      ...baseProgress(terms),
      currentTrainingStep: 'scan-flight-deck',
      completedSteps: collectCompletedPreflightSteps(state),
      nextAction: `Scan ${terms.fmc}, PFD, ND, and ${aircraft === 'AIRBUS_A320' ? 'FCU' : 'MCP'} for agreement.`,
      expectedPanel: 'pfd',
      hint: 'Start at the PFD/FMA, then compare ND route cues, autoflight selections, and CDU/MCDU messages.',
    };
  }

  return buildFmcSetupProgress(state, aircraft, terms);
}

function buildFmcSetupProgress(
  state: FMCState,
  aircraft: AircraftType,
  terms: TrainingProgress['aircraftSpecificTerminology'],
): TrainingProgress {
  const completedSteps = collectCompletedPreflightSteps(state);
  const missingFields = preflightMissingFields(state);
  const hasDiscontinuity = routeHasDiscontinuity(state);
  const performancePrediction = buildPerformancePrediction(state);
  const blockingPerformanceWarning = performancePrediction.warnings.find(
    (warning) => warning === 'INSUFFICIENT FUEL' || warning === 'RUNWAY TOO SHORT',
  );

  if (!isPositionInitialized(state)) {
    return {
      ...baseProgress(terms),
      currentTrainingStep: 'initialize-position',
      completedSteps,
      nextAction:
        aircraft === 'AIRBUS_A320'
          ? 'Initialize the FMGC position before building the flight plan.'
          : 'Initialize IRS position before route entry.',
      expectedPage: aircraft === 'AIRBUS_A320' ? 'INIT_A' : 'POS_INIT',
      expectedKey: aircraft === 'AIRBUS_A320' ? 'INIT_A' : 'INIT_REF',
      expectedLSK: 'R4',
      expectedPanel: 'cdu',
      missingFields,
      hint: `Use the ${terms.fmc} position page and confirm the reference position.`,
    };
  }

  if (!hasRouteEndpoints(state) || !hasRouteContent(state)) {
    return {
      ...baseProgress(terms),
      currentTrainingStep: 'enter-route',
      completedSteps,
      nextAction: `Enter origin, destination, and route on ${terms.routePage}.`,
      expectedPage: aircraft === 'AIRBUS_A320' ? 'F_PLN' : 'RTE',
      expectedKey: aircraft === 'AIRBUS_A320' ? 'F_PLN' : 'RTE',
      expectedLSK: 'L1',
      expectedPanel: 'cdu',
      missingFields,
      hint: `The ${terms.routePage} data must exist before route verification or performance setup can be complete.`,
    };
  }

  if (hasDiscontinuity) {
    return {
      ...baseProgress(terms),
      currentTrainingStep: 'resolve-discontinuity',
      completedSteps,
      nextAction: `Resolve the route discontinuity on ${terms.legsPage}.`,
      expectedPage: aircraft === 'AIRBUS_A320' ? 'F_PLN' : 'LEGS',
      expectedKey: aircraft === 'AIRBUS_A320' ? 'F_PLN' : 'LEGS',
      expectedLSK: null,
      expectedPanel: 'cdu',
      missingFields,
      warning: 'Route discontinuity blocks completion.',
      hint:
        aircraft === 'AIRBUS_A320'
          ? 'Review the TMPY F-PLN gap and insert a connected path when correct.'
          : 'Use LEGS to connect the route, then EXEC the modification when correct.',
    };
  }

  if (state.execLit || state.isModified || state.pendingFlightPlan || state.pendingRoute) {
    return {
      ...baseProgress(terms),
      currentTrainingStep: 'execute-modification',
      completedSteps,
      nextAction: `${terms.execute} the pending ${terms.temporaryPlan} route modification.`,
      expectedPage: aircraft === 'AIRBUS_A320' ? 'F_PLN' : 'LEGS',
      expectedKey: 'EXEC',
      expectedLSK: null,
      expectedPanel: 'cdu',
      missingFields,
      hint: `Verify the route first, then press ${terms.execute} only when the pending change is correct.`,
    };
  }

  if (!isPerformanceInitialized(state)) {
    return {
      ...baseProgress(terms),
      currentTrainingStep: 'enter-performance',
      completedSteps,
      nextAction:
        aircraft === 'AIRBUS_A320'
          ? 'Complete INIT B fuel and weight data.'
          : 'Complete PERF INIT weight, fuel, cost index, and cruise altitude.',
      expectedPage: aircraft === 'AIRBUS_A320' ? 'INIT_B' : 'PERF_INIT',
      expectedKey: aircraft === 'AIRBUS_A320' ? 'INIT_B' : 'PERF',
      expectedLSK: 'L1',
      expectedPanel: 'cdu',
      missingFields,
      hint: 'Performance data is required before meaningful VNAV and takeoff guidance.',
    };
  }

  if (blockingPerformanceWarning) {
    return {
      ...baseProgress(terms),
      currentTrainingStep: 'enter-performance',
      completedSteps,
      nextAction:
        aircraft === 'AIRBUS_A320'
          ? 'Review fuel prediction and performance data before continuing.'
          : 'Review PERF INIT fuel, reserves, runway, and takeoff assumptions before continuing.',
      expectedPage: aircraft === 'AIRBUS_A320' ? 'FUEL_PRED' : 'PERF_INIT',
      expectedKey: aircraft === 'AIRBUS_A320' ? null : 'PERF',
      expectedLSK: null,
      expectedPanel: 'cdu',
      missingFields: [blockingPerformanceWarning.toLowerCase()],
      warning: blockingPerformanceWarning,
      hint: `${blockingPerformanceWarning} comes from the shared trainer-grade performance model; correct the setup before takeoff data is considered complete.`,
    };
  }

  if (!isTakeoffDataComplete(state)) {
    return {
      ...baseProgress(terms),
      currentTrainingStep: 'enter-takeoff-data',
      completedSteps,
      nextAction:
        aircraft === 'AIRBUS_A320'
          ? 'Complete PERF TAKEOFF runway, flap/THS, and V-speeds.'
          : 'Complete TAKEOFF REF runway, flap, trim, and V-speeds.',
      expectedPage: aircraft === 'AIRBUS_A320' ? 'PERF_TAKEOFF' : 'TAKEOFF_REF',
      expectedKey: aircraft === 'AIRBUS_A320' ? 'PERF_TAKEOFF' : 'INIT_REF',
      expectedLSK: 'L1',
      expectedPanel: 'cdu',
      missingFields,
      hint: 'Takeoff data closes the preflight setup loop and should agree with selected runway.',
    };
  }

  return {
    ...baseProgress(terms),
    currentTrainingStep: 'complete',
    completedSteps: [...completedSteps, 'complete'],
    nextAction: 'Preflight setup is complete. Move to route verification or automation practice.',
    expectedPanel: 'nd',
    hint: 'Use route verification to compare the flight plan against the ND before departure.',
  };
}

function buildRouteVerificationProgress(
  state: FMCState,
  aircraft: AircraftType,
  terms: TrainingProgress['aircraftSpecificTerminology'],
): TrainingProgress {
  const completedSteps = collectCompletedPreflightSteps(state);

  if (!hasRouteContent(state)) {
    return {
      ...baseProgress(terms),
      currentTrainingStep: 'enter-route',
      completedSteps,
      nextAction: `Enter a route before using ${aircraft === 'AIRBUS_A320' ? 'F-PLN/ND' : 'LEGS/ND'} verification.`,
      expectedPage: aircraft === 'AIRBUS_A320' ? 'F_PLN' : 'RTE',
      expectedKey: aircraft === 'AIRBUS_A320' ? 'F_PLN' : 'RTE',
      expectedPanel: 'cdu',
      missingFields: preflightMissingFields(state),
      hint: `The ND can only be cross-checked after ${terms.routePage} has route content.`,
    };
  }

  if (routeHasDiscontinuity(state)) {
    return {
      ...baseProgress(terms),
      currentTrainingStep: 'resolve-discontinuity',
      completedSteps,
      nextAction: `Compare the route gap on ${terms.legsPage} with the ND, then resolve it.`,
      expectedPage: aircraft === 'AIRBUS_A320' ? 'F_PLN' : 'LEGS',
      expectedKey: aircraft === 'AIRBUS_A320' ? 'F_PLN' : 'LEGS',
      expectedPanel: 'cdu',
      warning: 'Route discontinuity detected.',
      hint: 'A discontinuity should appear as a break in the flight plan and must be reviewed before activation.',
    };
  }

  return {
    ...baseProgress(terms),
    currentTrainingStep: 'verify-route',
    completedSteps,
    nextAction: 'Verify active waypoint, route line, constraints, and selected range on the ND.',
    expectedPage: aircraft === 'AIRBUS_A320' ? 'F_PLN' : 'LEGS',
    expectedKey: aircraft === 'AIRBUS_A320' ? 'F_PLN' : 'LEGS',
    expectedPanel: 'nd',
    hint: `Cross-check ${terms.legsPage} against the ND route line and waypoint labels.`,
  };
}

function buildAutomationProgress(
  state: FMCState,
  aircraft: AircraftType,
  autopilot: AutopilotState,
  terms: TrainingProgress['aircraftSpecificTerminology'],
): TrainingProgress {
  const missingFields: string[] = [];
  const selectedSpeed = aircraft === 'AIRBUS_A320' ? autopilot.airbus.speed : autopilot.boeing.speed;
  const selectedHeading = aircraft === 'AIRBUS_A320' ? autopilot.airbus.heading : autopilot.boeing.heading;
  const selectedAltitude = aircraft === 'AIRBUS_A320' ? autopilot.airbus.altitude : autopilot.boeing.altitude;

  if (selectedSpeed === null || selectedSpeed <= 0) missingFields.push('selected speed');
  if (selectedHeading === null) missingFields.push('selected heading');
  if (selectedAltitude === null || selectedAltitude <= 0) missingFields.push('selected altitude');

  if (missingFields.length > 0) {
    return {
      ...baseProgress(terms),
      currentTrainingStep: 'set-autoflight-values',
      completedSteps: collectCompletedPreflightSteps(state),
      nextAction: `Set ${missingFields[0]} on the ${aircraft === 'AIRBUS_A320' ? 'FCU' : 'MCP'}.`,
      expectedPanel: 'autoflight',
      missingFields,
      hint: 'Selected values should be visible on the autoflight panel and reflected on the PFD/ND.',
    };
  }

  if (autopilot.truth.lateralActive === 'OFF' && autopilot.truth.verticalActive === 'OFF') {
    return {
      ...baseProgress(terms),
      currentTrainingStep: 'engage-autoflight-mode',
      completedSteps: [...collectCompletedPreflightSteps(state), 'set-autoflight-values'],
      nextAction:
        aircraft === 'AIRBUS_A320'
          ? 'Select or manage a lateral/vertical mode and verify the Airbus FMA.'
          : 'Engage HDG SEL, LNAV, VNAV, or another MCP mode and verify the Boeing FMA.',
      expectedPanel: 'autoflight',
      hint: `Use ${terms.selectedMode}/${terms.managedMode} cues and confirm the FMA changes on the PFD.`,
    };
  }

  return {
    ...baseProgress(terms),
    currentTrainingStep: 'complete',
    completedSteps: [
      ...collectCompletedPreflightSteps(state),
      'set-autoflight-values',
      'engage-autoflight-mode',
      'complete',
    ],
    nextAction: 'Automation drill complete. Cross-check FMA, selected values, and ND selected heading cues.',
    expectedPanel: 'pfd',
    hint: 'The PFD FMA is the authority for active and armed autoflight modes.',
  };
}

function buildApproachProgress(
  state: FMCState,
  aircraft: AircraftType,
  terms: TrainingProgress['aircraftSpecificTerminology'],
): TrainingProgress {
  const missingFields = approachMissingFields(state);
  if (missingFields.length > 0) {
    return {
      ...baseProgress(terms),
      currentTrainingStep: 'configure-approach',
      completedSteps: collectCompletedPreflightSteps(state),
      nextAction:
        aircraft === 'AIRBUS_A320'
          ? 'Complete approach selection and PERF APPR landing data.'
          : 'Complete arrival/approach selection and approach reference data.',
      expectedPage: aircraft === 'AIRBUS_A320' ? 'PERF_APPR' : 'TAKEOFF_REF',
      expectedKey: aircraft === 'AIRBUS_A320' ? 'PERF_TAKEOFF' : 'INIT_REF',
      expectedPanel: 'cdu',
      missingFields,
      hint: 'Approach monitoring needs runway, approach, landing speed, frequency, and course data.',
    };
  }

  return {
    ...baseProgress(terms),
    currentTrainingStep: 'complete',
    completedSteps: [...collectCompletedPreflightSteps(state), 'configure-approach', 'complete'],
    nextAction: 'Approach setup complete. Monitor FMA, ND final segment, and selected altitude.',
    expectedPanel: 'pfd',
    hint: 'Arm approach mode only when the route and approach data are verified.',
  };
}

function collectCompletedPreflightSteps(state: FMCState): TrainingProgressStep[] {
  const checks: FieldCheck[] = [
    { id: 'initialize-position', complete: isPositionInitialized(state) },
    { id: 'enter-route', complete: hasRouteEndpoints(state) && hasRouteContent(state) },
    { id: 'resolve-discontinuity', complete: hasRouteContent(state) && !routeHasDiscontinuity(state) },
    {
      id: 'execute-modification',
      complete: !state.execLit && !state.isModified && !state.pendingFlightPlan && !state.pendingRoute,
    },
    { id: 'enter-performance', complete: isPerformanceInitialized(state) },
    { id: 'enter-takeoff-data', complete: isTakeoffDataComplete(state) },
  ];

  return checks.filter((check) => check.complete).map((check) => check.id as TrainingProgressStep);
}

function baseProgress(terms: TrainingProgress['aircraftSpecificTerminology']): TrainingProgress {
  return {
    currentTrainingStep: 'initialize-position',
    completedSteps: [],
    nextAction: '',
    expectedPage: null,
    expectedLSK: null,
    expectedKey: null,
    expectedPanel: null,
    missingFields: [],
    warning: null,
    hint: '',
    aircraftSpecificTerminology: terms,
  };
}

function isPositionInitialized(state: FMCState): boolean {
  return (
    state.position.irsState === 'NAV' &&
    (Boolean(state.position.refAirport) || (state.position.lat !== 0 && state.position.lon !== 0))
  );
}

function hasRouteEndpoints(state: FMCState): boolean {
  return Boolean(
    (state.route.origin && state.route.destination) || (state.flightPlan.origin && state.flightPlan.destination),
  );
}

function hasRouteContent(state: FMCState): boolean {
  return Boolean(state.route.routeString || state.flightPlan.route || state.flightPlan.waypoints.length > 0);
}

function routeHasDiscontinuity(state: FMCState): boolean {
  const activeHasGap = state.flightPlan.waypoints.some((waypoint) => waypoint.discontinuity);
  const pendingHasGap = state.pendingFlightPlan?.waypoints.some((waypoint) => waypoint.discontinuity) ?? false;
  return activeHasGap || pendingHasGap;
}

function isPerformanceInitialized(state: FMCState): boolean {
  return (
    state.performance.crzAlt > 0 &&
    state.performance.costIndex >= 0 &&
    state.performance.zfw > 0 &&
    state.performance.fuel > 0 &&
    state.performance.grossWeight > 0
  );
}

function isTakeoffDataComplete(state: FMCState): boolean {
  return (
    Boolean(state.takeoff.runway) &&
    Boolean(state.takeoff.flaps) &&
    state.takeoff.v1 > 0 &&
    state.takeoff.vr > 0 &&
    state.takeoff.v2 > 0 &&
    state.takeoff.v1 < state.takeoff.vr &&
    state.takeoff.vr < state.takeoff.v2
  );
}

function preflightMissingFields(state: FMCState): string[] {
  const fields: FieldCheck[] = [
    { id: 'position', complete: isPositionInitialized(state) },
    { id: 'origin', complete: Boolean(state.route.origin || state.flightPlan.origin) },
    { id: 'destination', complete: Boolean(state.route.destination || state.flightPlan.destination) },
    { id: 'route', complete: hasRouteContent(state) },
    { id: 'performance', complete: isPerformanceInitialized(state) },
    { id: 'takeoff data', complete: isTakeoffDataComplete(state) },
  ];

  return fields.filter((field) => !field.complete).map((field) => field.id);
}

function approachMissingFields(state: FMCState): string[] {
  const fields: FieldCheck[] = [
    { id: 'approach', complete: Boolean(state.route.approach) },
    { id: 'runway', complete: Boolean(state.route.runway || state.landing.runway || state.takeoff.runway) },
    { id: 'landing flaps', complete: Boolean(state.landing.flaps) },
    { id: 'landing speed', complete: state.landing.vref > 0 },
    { id: 'ILS frequency', complete: Boolean(state.landing.ilsFrequency) },
    { id: 'course', complete: state.landing.course > 0 },
  ];

  return fields.filter((field) => !field.complete).map((field) => field.id);
}
