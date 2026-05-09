import type { FMCState, TutorialScenario, TutorialStep } from '../types/fmc';

/**
 * Preflight scenario — complete FMC setup from cold start.
 */
export const preflightScenario: TutorialScenario = {
  name: 'Preflight Setup',
  description: 'Set up the FMC for a flight from KJFK to KDCA using the RBV3 departure.',
  steps: [
    {
      id: 'pos_init_1',
      instruction: 'Press POS INIT to enter reference airport',
      expectedAction: 'POS_INIT',
      validate: () => true,
      page: 'POS_INIT',
    },
    {
      id: 'pos_init_2',
      expectedAction: 'KJFK',
      validate: (input: string) => input.toUpperCase() === 'KJFK',
      instruction: 'Type KJFK in the scratchpad and press LSK L1 to set REF AIRPORT',
      page: 'POS_INIT',
      highlightField: 'L1',
    },
    {
      id: 'pos_init_3',
      expectedAction: 'GATE A12',
      validate: (input: string) => input.toUpperCase().startsWith('GATE'),
      instruction: 'Type your gate and press LSK L3 to set it',
      page: 'POS_INIT',
      highlightField: 'L3',
    },
    {
      id: 'rte_1',
      expectedAction: 'RTE',
      validate: () => true,
      instruction: 'Press RTE to enter route information',
      page: 'RTE',
    },
    {
      id: 'rte_origin',
      expectedAction: 'KJFK',
      validate: (input: string) => input.toUpperCase() === 'KJFK',
      instruction: 'Type KJFK and press LSK L1 for ORIGIN',
      page: 'RTE',
      highlightField: 'L1',
    },
    {
      id: 'rte_dest',
      expectedAction: 'KDCA',
      validate: (input: string) => input.toUpperCase() === 'KDCA',
      instruction: 'Type KDCA and press LSK L3 for DEST',
      page: 'RTE',
      highlightField: 'L3',
    },
    {
      id: 'rte_fltno',
      expectedAction: 'UAL123',
      validate: (input: string) => input.toUpperCase().startsWith('UAL'),
      instruction: 'Type your flight number (e.g., UAL123) and press LSK R1',
      page: 'RTE',
      highlightField: 'R1',
    },
    {
      id: 'rte_next',
      expectedAction: 'NEXT_PAGE',
      validate: () => true,
      instruction: 'Press NEXT PAGE to go to route entry',
      page: 'RTE',
    },
    {
      id: 'rte_route',
      expectedAction: 'RBV3',
      validate: (input: string) => input.toUpperCase().includes('RBV'),
      instruction: 'Enter the route: RBV3 and press LSK L1',
      page: 'RTE',
      highlightField: 'L1',
    },
    {
      id: 'dep_arr',
      expectedAction: 'DEP_ARR',
      validate: () => true,
      instruction: 'Press DEP/ARR to select departure procedure',
      page: 'DEP_ARR',
    },
    {
      id: 'dep_sid',
      expectedAction: 'RBV3',
      validate: (input: string) => input.toUpperCase() === 'RBV3',
      instruction: 'Select RBV3 SID by pressing LSK L3',
      page: 'DEP_ARR',
      highlightField: 'L3',
    },
    {
      id: 'perf_init',
      expectedAction: 'PERF_INIT',
      validate: () => true,
      instruction: 'Press PERF INIT to enter performance data',
      page: 'PERF_INIT',
    },
    {
      id: 'perf_crz',
      expectedAction: '350',
      validate: (input: string) => parseInt(input) >= 200 && parseInt(input) <= 450,
      instruction: 'Enter cruise altitude FL350 (type 350) and press LSK L1',
      page: 'PERF_INIT',
      highlightField: 'L1',
    },
    {
      id: 'perf_ci',
      expectedAction: '30',
      validate: (input: string) => parseInt(input) > 0,
      instruction: 'Enter cost index 30 and press LSK L3',
      page: 'PERF_INIT',
      highlightField: 'L3',
    },
    {
      id: 'perf_zfw',
      expectedAction: '65',
      validate: (input: string) => parseFloat(input) > 30,
      instruction: 'Enter ZFW (e.g., 65 for 65000lbs) and press LSK R1',
      page: 'PERF_INIT',
      highlightField: 'R1',
    },
    {
      id: 'complete',
      expectedAction: 'EXEC',
      validate: () => true,
      instruction: 'Press EXEC to activate the flight plan. Preflight complete!',
      page: 'PERF_INIT',
    },
  ],
  setup: () => [],
};

/**
 * Takeoff scenario — configure takeoff reference.
 */
export const takeoffScenario: TutorialScenario = {
  name: 'Takeoff Configuration',
  description: 'Configure takeoff reference data including V-speeds and trim.',
  steps: [
    {
      id: 'to_1',
      expectedAction: 'TAKEOFF_REF',
      validate: () => true,
      instruction: 'Press THRUST LIM or TAKEOFF REF to configure takeoff',
      page: 'TAKEOFF_REF',
    },
    {
      id: 'to_rw',
      expectedAction: '22L',
      validate: (input: string) => input.length >= 2,
      instruction: 'Enter runway (22L) and press LSK L1',
      page: 'TAKEOFF_REF',
      highlightField: 'L1',
    },
    {
      id: 'to_v1',
      expectedAction: '135',
      validate: (input: string) => parseInt(input) > 100,
      instruction: 'Enter V1 speed (135) and press LSK R1',
      page: 'TAKEOFF_REF',
      highlightField: 'R1',
    },
    {
      id: 'to_vr',
      expectedAction: '140',
      validate: (input: string) => parseInt(input) > 100,
      instruction: 'Enter VR speed (140) and press LSK R2',
      page: 'TAKEOFF_REF',
      highlightField: 'R2',
    },
    {
      id: 'to_v2',
      expectedAction: '145',
      validate: (input: string) => parseInt(input) > 100,
      instruction: 'Enter V2 speed (145) and press LSK R3',
      page: 'TAKEOFF_REF',
      highlightField: 'R3',
    },
    {
      id: 'to_trim',
      expectedAction: '4.0',
      validate: (input: string) => parseFloat(input) > 0,
      instruction: 'Enter trim setting (4.0) and press LSK R4',
      page: 'TAKEOFF_REF',
      highlightField: 'R4',
    },
    {
      id: 'to_oat',
      expectedAction: '15',
      validate: (input: string) => parseInt(input) > -50,
      instruction: 'Enter OAT (15°C) and press LSK L4',
      page: 'TAKEOFF_REF',
      highlightField: 'L4',
    },
    {
      id: 'to_complete',
      expectedAction: 'EXEC',
      validate: () => true,
      instruction: 'Press EXEC. Takeoff data configured!',
      page: 'TAKEOFF_REF',
    },
  ],
  setup: () => [],
};

/**
 * Cruise/Descent scenario — review flight progress.
 */
export const cruiseScenario: TutorialScenario = {
  name: 'Cruise & Descent',
  description: 'Review flight progress, check LEGS, and prepare for descent.',
  steps: [
    {
      id: 'crz_prog',
      expectedAction: 'PROGRESS',
      validate: () => true,
      instruction: 'Press PROG to view flight progress',
      page: 'PROGRESS',
    },
    {
      id: 'crz_legs',
      expectedAction: 'LEGS',
      validate: () => true,
      instruction: 'Press LEGS to review the flight plan waypoints',
      page: 'LEGS',
    },
    {
      id: 'crz_next',
      expectedAction: 'NEXT_PAGE',
      validate: () => true,
      instruction: 'Press NEXT PAGE to see remaining waypoints',
      page: 'LEGS',
    },
    {
      id: 'crz_dep_arr',
      expectedAction: 'DEP_ARR',
      validate: () => true,
      instruction: 'Press DEP/ARR to select arrival procedure',
      page: 'DEP_ARR',
    },
    {
      id: 'crz_arr',
      expectedAction: 'ARR',
      validate: () => true,
      instruction: 'Switch to ARR page by pressing LSK L6',
      page: 'DEP_ARR',
      highlightField: 'L6',
    },
    {
      id: 'crz_star',
      expectedAction: 'FRDMM2',
      validate: () => true,
      instruction: 'Select the FRDMM2 STAR',
      page: 'DEP_ARR',
      highlightField: 'L3',
    },
    {
      id: 'crz_complete',
      expectedAction: 'EXEC',
      validate: () => true,
      instruction: 'Press EXEC to activate. Descent preparation complete!',
      page: 'DEP_ARR',
    },
  ],
  setup: () => [],
};

export const tutorialScenarios: TutorialScenario[] = [
  preflightScenario,
  takeoffScenario,
  cruiseScenario,
];

export function getTutorialScenario(name: string): TutorialScenario | undefined {
  return tutorialScenarios.find(s => s.name === name);
}
