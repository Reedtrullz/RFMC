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
      instruction: 'Press INIT REF (top-left button) to enter position data',
      expectedAction: 'POS_INIT',
      validate: () => true,
      page: 'POS_INIT',
      highlightField: 'POS_INIT',
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
      instruction: 'Press RTE (top row, second button) to enter route info',
      page: 'RTE',
      highlightField: 'RTE',
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
      instruction: 'Press NEXT PAGE (bottom-right keypad area) to continue',
      page: 'RTE',
      highlightField: 'NEXT_PAGE',
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
      instruction: 'Press DEP/ARR (top row, third button) to select departure',
      page: 'DEP_ARR',
      highlightField: 'DEP_ARR',
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
      instruction: 'Press PERF (second row, left button) to enter performance',
      page: 'PERF_INIT',
      highlightField: 'PERF_INIT',
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
      instruction: 'Press EXEC (bottom-left, glowing green) to activate. Done!',
      page: 'PERF_INIT',
      highlightField: 'EXEC',
    },
  ],
  setup: () => [],
};

/**
 * Takeoff scenario — configure takeoff reference.
 */
export const takeoffScenario: TutorialScenario = {
  name: 'Takeoff Configuration',
  description: 'Enter takeoff reference data including V-speeds and trim.',
  steps: [
    {
      id: 'to_rw',
      expectedAction: '22L',
      validate: (input: string) => input.length >= 2,
      instruction: 'Type 22L on the keypad, then press LSK L1 (highlighted) to set runway',
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
      instruction: 'Press EXEC (bottom-left). Takeoff data configured!',
      page: 'TAKEOFF_REF',
      highlightField: 'EXEC',
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
      instruction: 'Press PROG (second row, second button) to view flight progress',
      page: 'PROGRESS',
      highlightField: 'PROGRESS',
    },
    {
      id: 'crz_legs',
      expectedAction: 'LEGS',
      validate: () => true,
      instruction: 'Press LEGS (top row, right button) to review the flight plan',
      page: 'LEGS',
      highlightField: 'LEGS',
    },
    {
      id: 'crz_next',
      expectedAction: 'NEXT_PAGE',
      validate: () => true,
      instruction: 'Press NEXT PAGE (bottom-right keypad) to see more waypoints',
      page: 'LEGS',
      highlightField: 'NEXT_PAGE',
    },
    {
      id: 'crz_dep_arr',
      expectedAction: 'DEP_ARR',
      validate: () => true,
      instruction: 'Press DEP/ARR (top row, third button) for arrival procedures',
      page: 'DEP_ARR',
      highlightField: 'DEP_ARR',
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
      instruction: 'Select the FRDMM2 STAR (press LSK L3)',
      page: 'DEP_ARR',
      highlightField: 'L3',
    },
    {
      id: 'crz_complete',
      expectedAction: 'EXEC',
      validate: () => true,
      instruction: 'Press EXEC (bottom-left). Descent prep complete!',
      page: 'DEP_ARR',
      highlightField: 'EXEC',
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
