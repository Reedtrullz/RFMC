import type { FMCState, TutorialScenario, TutorialStep } from '../types/fmc';

/**
 * Preflight: Cold cockpit to flight-ready FMC.
 *
 * Real-world flow: Power-up → IDENT verify → POS INIT → RTE → DEP/ARR → PERF → THRUST → TAKEOFF → EXEC
 *
 * Each step explains WHAT you enter, WHY the FMC needs it, and HOW it affects the flight.
 */
export const preflightScenario: TutorialScenario = {
  name: 'Full Preflight (KJFK → KDCA)',
  description: 'Complete FMC setup from cold cockpit — position, route, departure, performance, and takeoff data.',
  steps: [
    // --- IDENT page (already showing) ---
    {
      id: 'ident_note',
      instruction:
        'PM: IDENT page displayed. Check aircraft type (737-800), engine rating (26K), and navigation database currency. This ensures the FMC is running the correct performance models and has up-to-date waypoint data. Press INIT REF to continue.',
      expectedAction: 'POS_INIT',
      validate: () => false,
      page: 'IDENT',
      highlightField: 'POS_INIT',
      role: 'PM',
      requiredPanels: ['cdu'],
      preferredLayout: 'fmc-focus',
      focusPanel: 'cdu',
    },

    // --- POS INIT ---
    {
      id: 'pos_init_ref',
      instruction:
        'PM: Position initialization required. REF AIRPORT tells the FMC where the aircraft is parked. The IRS uses this position to align its gyros. Type KJFK and press LSK L2.',
      expectedAction: 'KJFK',
      validate: (input: string) => input.toUpperCase() === 'KJFK',
      page: 'POS_INIT',
      highlightField: 'L2',
      role: 'PM',
    },
    {
      id: 'irs_align',
      instruction:
        'PM: IRS ALIGNING. Wait for alignment to reach NAV status. WHY: The IRS measures acceleration and rotation to track your position without GPS. It takes 7-10 minutes (accelerated here). Navigation and ND MAP will be available once status shows "IRS NAV".',
      expectedAction: 'WAIT',
      validate: (_input: string, state: FMCState) => state.position.irsState === 'NAV',
      page: 'POS_INIT',
      highlightField: 'IRS_STATUS',
    },
    {
      id: 'pos_init_gate',
      instruction:
        'GATE is optional but good practice. It records your departure gate in the flight log. Type your gate (e.g., A12) and press LSK L3.',
      expectedAction: 'GATE',
      validate: (input: string) => input.toUpperCase().startsWith('GATE') || input.length >= 2,
      page: 'POS_INIT',
      highlightField: 'L3',
    },

    // --- RTE Page 1 ---
    {
      id: 'rte_nav',
      instruction:
        'Press RTE (top row, 2nd button) to define your flight. WHY: The FMC cannot build a flight plan without knowing where you start and where you are going.',
      expectedAction: 'RTE',
      validate: () => true,
      page: 'RTE',
      highlightField: 'RTE',
    },
    {
      id: 'rte_origin',
      instruction: 'PF: Enter origin KJFK. PM: Origin set to KJFK.',
      expectedAction: 'KJFK',
      validate: (input: string) => input.toUpperCase() === 'KJFK',
      page: 'RTE',
      highlightField: 'L1',
      role: 'PF',
    },
    {
      id: 'rte_dest',
      instruction: 'PF: Enter destination KDCA. PM: Destination set to KDCA.',
      expectedAction: 'KDCA',
      validate: (input: string) => input.toUpperCase() === 'KDCA',
      page: 'RTE',
      highlightField: 'L2',
      role: 'PF',
    },
    {
      id: 'rte_fltno',
      instruction:
        'FLT NO is your airline callsign (e.g., UAL123). This identifies your flight to ATC and in the aircraft log. Type UAL123 and press LSK R1.',
      expectedAction: 'UAL123',
      validate: (input: string) => input.toUpperCase().startsWith('UAL') || input.length >= 3,
      page: 'RTE',
      highlightField: 'R1',
    },
    {
      id: 'rte_next',
      instruction:
        'Press NEXT PAGE (bottom-right keypad area) to go to the route entry page. Page 1 defines endpoints; Page 2 defines the path between them.',
      expectedAction: 'NEXT_PAGE',
      validate: () => true,
      page: 'RTE',
      highlightField: 'NEXT_PAGE',
    },
    {
      id: 'rte_route',
      instruction:
        'ROUTE is the lateral path between origin and destination. This uses ICAO format: the SID name, then airways and waypoints, then the STAR. Type: RBV3 DCT DIXIE V229 AML and press LSK L1. The FMC will parse this into individual waypoints with airway assignments.',
      expectedAction: 'RBV3',
      validate: (input: string) => input.toUpperCase().includes('RBV'),
      page: 'RTE',
      highlightField: 'L1',
    },

    // --- DEP/ARR ---
    {
      id: 'dep_arr_nav',
      instruction:
        'Press DEP ARR (top row, 3rd button). WHY: You need to select a Standard Instrument Departure (SID) — a published procedure that guides you from the runway to the enroute airway structure. Without a SID, you have no path out of the departure airport.',
      expectedAction: 'DEP_ARR',
      validate: () => true,
      page: 'DEP_ARR',
      highlightField: 'DEP_ARR',
    },
    {
      id: 'dep_sid',
      instruction:
        'Select RBV3 (Robbinsville Three departure) by pressing LSK L3. This SID departs KJFK runway 22L. It adds the RBV waypoint and transition to your flight plan. Real pilots select SIDs based on the active runway and ATC clearance.',
      expectedAction: 'RBV3',
      validate: (input: string) => input.toUpperCase() === 'RBV3',
      page: 'DEP_ARR',
      highlightField: 'L3',
    },

    // --- PERF INIT ---
    {
      id: 'perf_nav',
      instruction:
        'Press PERF (2nd row, left button). WHY: The FMC needs weight and performance data to compute V-speeds, fuel predictions, and optimal speeds. Without weight data, takeoff calculations are impossible.',
      expectedAction: 'PERF_INIT',
      validate: () => true,
      page: 'PERF_INIT',
      highlightField: 'PERF_INIT',
    },
    {
      id: 'perf_crz',
      instruction:
        'CRZ ALT is your planned cruise altitude. The FMC uses this to calculate step climbs and optimum altitude. Type 350 (for FL350 = 35,000 feet) and press LSK L1. FL350 is typical for eastbound flights in the US.',
      expectedAction: '350',
      validate: (input: string) => parseInt(input) >= 200 && parseInt(input) <= 450,
      page: 'PERF_INIT',
      highlightField: 'L1',
    },
    {
      id: 'perf_ci',
      instruction:
        'COST INDEX balances fuel cost vs. time cost when computing speeds. CI=0 is max range (slowest); CI=999 is minimum time (fastest). Airlines typically use 25-40 for the 737. Type 30 and press LSK L3.',
      expectedAction: '30',
      validate: (input: string) => parseInt(input) > 0 && parseInt(input) <= 999,
      page: 'PERF_INIT',
      highlightField: 'L3',
    },
    {
      id: 'perf_zfw',
      instruction:
        'ZFW (Zero Fuel Weight) is the weight of the aircraft plus payload WITHOUT fuel — this comes from the load sheet. Enter 65.0 (65,000 lbs, typical for a loaded 737-800) and press LSK R1.',
      expectedAction: '65',
      validate: (input: string) => parseFloat(input) > 30 && parseFloat(input) < 100,
      page: 'PERF_INIT',
      highlightField: 'R1',
    },
    {
      id: 'perf_reserve',
      instruction:
        'RESERVES is minimum landing fuel required by regulation. For this short flight, 4.5 (4,500 lbs) is sufficient. Type 4.5 and press LSK R3.',
      expectedAction: '4.5',
      validate: (input: string) => parseFloat(input) > 1,
      page: 'PERF_INIT',
      highlightField: 'R3',
    },

    // --- THRUST LIM ---
    {
      id: 'to_nav',
      instruction:
        'Press LSK L5 to go to THRUST LIM. WHY: You need to select a takeoff thrust setting. Reduced thrust (TO 1 or TO 2) extends engine life dramatically when runway performance permits.',
      expectedAction: 'thrust_lim',
      validate: () => true,
      page: 'PERF_INIT',
      highlightField: 'L5',
    },
    {
      id: 'thrust_sel',
      instruction:
        'Select TO 1 (24K derated thrust) by pressing LSK L3. This reduces engine wear while giving adequate performance for our weight and runway. At lightweight, you might even use TO 2.',
      expectedAction: 'select_to1',
      validate: () => true,
      page: 'THRUST_LIM',
      highlightField: 'L3',
    },

    // --- TAKEOFF REF ---
    {
      id: 'takeoff_nav',
      instruction:
        'Press LSK L6 for TAKEOFF REF. WHY: This is the most critical page — V-speeds and trim are flight safety parameters that both pilots must cross-check.',
      expectedAction: 'takeoff_ref',
      validate: () => true,
      page: 'TAKEOFF_REF',
      highlightField: 'L6',
    },
    {
      id: 'to_rw',
      instruction:
        'Enter the departure runway (22L) and press LSK L1. The FMC needs to know which runway to use for performance calculations.',
      expectedAction: '22L',
      validate: (input: string) => input.toUpperCase().startsWith('22') || input.length >= 2,
      page: 'TAKEOFF_REF',
      highlightField: 'L1',
    },
    {
      id: 'to_v1',
      instruction:
        'V1 is the decision speed — above this speed, you MUST continue the takeoff even with an engine failure. Based on our weight (65K ZFW) at KJFK, V1 is approximately 135 knots. Type 135 and press LSK R1.',
      expectedAction: '135',
      validate: (input: string) => parseInt(input) > 100 && parseInt(input) < 200,
      page: 'TAKEOFF_REF',
      highlightField: 'R1',
    },
    {
      id: 'to_vr',
      instruction:
        'VR is rotation speed — when the pilot pulls back to lift the nose. For our configuration, approximately 140 knots. Type 140 and press LSK R2.',
      expectedAction: '140',
      validate: (input: string) => parseInt(input) > 100 && parseInt(input) < 200,
      page: 'TAKEOFF_REF',
      highlightField: 'R2',
    },
    {
      id: 'to_v2',
      instruction:
        'V2 is takeoff safety speed — the minimum speed to maintain with one engine inoperative. Typically 145 knots for this weight. Type 145 and press LSK R3.',
      expectedAction: '145',
      validate: (input: string) => parseInt(input) > 100 && parseInt(input) < 200,
      page: 'TAKEOFF_REF',
      highlightField: 'R3',
    },
    {
      id: 'to_trim',
      instruction:
        'TRIM sets the horizontal stabilizer for proper rotation. Setting ~4.0 units is typical for a mid-CG 737-800. Type 4.0 and press LSK R4.',
      expectedAction: '4.0',
      validate: (input: string) => parseFloat(input) > 0 && parseFloat(input) < 10,
      page: 'TAKEOFF_REF',
      highlightField: 'R4',
    },
    {
      id: 'to_oat',
      instruction:
        'OAT (Outside Air Temperature) affects engine performance and true airspeed. Enter 15 (15°C, standard day) and press LSK L4.',
      expectedAction: '15',
      validate: (input: string) => parseInt(input) > -50 && parseInt(input) < 60,
      page: 'TAKEOFF_REF',
      highlightField: 'L4',
    },
    {
      id: 'to_wind',
      instruction:
        'WIND direction and speed affect V-speeds. Enter 220/10 (wind from 220° at 10 knots) and press LSK L5.',
      expectedAction: '220/10',
      validate: (input: string) => input.includes('/'),
      page: 'TAKEOFF_REF',
      highlightField: 'L5',
    },
    {
      id: 'to_exec',
      instruction:
        'PF: Takeoff data complete. Check V-speeds. PM: Cross-checked. V1 135, VR 140, V2 145. Press EXEC to activate. PF: Executing. PM: FMC active.',
      expectedAction: 'EXEC',
      validate: () => true,
      page: 'TAKEOFF_REF',
      highlightField: 'EXEC',
      role: 'PF',
    },
  ],
  setup: () => [],
};

/**
 * Takeoff Configuration — standalone V-speed and trim entry.
 * Starts directly on TAKEOFF REF page.
 */
export const takeoffScenario: TutorialScenario = {
  name: 'Takeoff Data Entry',
  description:
    'Enter V-speeds (V1/VR/V2), trim, runway, OAT, and wind — the critical safety parameters both pilots cross-check before every takeoff.',
  steps: [
    {
      id: 'to_rw',
      instruction:
        'Enter the departure runway. For KJFK runway 22L: type 22L on the keypad, then press LSK L1 (highlighted). WHY: Runway length and slope affect V-speed calculations.',
      expectedAction: '22L',
      validate: (input: string) => input.length >= 2,
      page: 'TAKEOFF_REF',
      highlightField: 'L1',
    },
    {
      id: 'to_v1',
      instruction:
        'V1 — the DECISION speed. Above V1, you commit to takeoff even with an engine failure. Below V1, you can abort and stop on the runway. Based on weight/runway/temp, V1 = 135 knots. Type 135 → LSK R1.',
      expectedAction: '135',
      validate: (input: string) => parseInt(input) > 100,
      page: 'TAKEOFF_REF',
      highlightField: 'R1',
    },
    {
      id: 'to_vr',
      instruction:
        'VR — ROTATION speed. The pilot pulls back on the yoke at VR to lift the nose. For a mid-weight 737-800: 140 knots. Type 140 → LSK R2.',
      expectedAction: '140',
      validate: (input: string) => parseInt(input) > 100,
      page: 'TAKEOFF_REF',
      highlightField: 'R2',
    },
    {
      id: 'to_v2',
      instruction:
        'V2 — TAKEOFF SAFETY speed. The minimum speed to maintain with one engine out during initial climb. Must clear all obstacles on the departure path. Type 145 → LSK R3.',
      expectedAction: '145',
      validate: (input: string) => parseInt(input) > 100,
      page: 'TAKEOFF_REF',
      highlightField: 'R3',
    },
    {
      id: 'to_trim',
      instruction:
        'TRIM — Stabilizer trim setting. The 737 has a movable horizontal stabilizer (not elevator trim tabs). The FMC computes trim from CG and flap setting. Type 4.0 → LSK R4.',
      expectedAction: '4.0',
      validate: (input: string) => parseFloat(input) > 0 && parseFloat(input) < 10,
      page: 'TAKEOFF_REF',
      highlightField: 'R4',
    },
    {
      id: 'to_oat',
      instruction:
        'OAT — Outside Air Temperature. Higher temps = thinner air = longer takeoff roll. Enter 15 (15°C) → LSK L4.',
      expectedAction: '15',
      validate: (input: string) => parseInt(input) > -60,
      page: 'TAKEOFF_REF',
      highlightField: 'L4',
    },
    {
      id: 'to_wind',
      instruction:
        'WIND — Headwind helps, tailwind hurts. Format: direction/speed. Enter 220/10 (wind from 220° at 10 kts) → LSK L5.',
      expectedAction: '220/10',
      validate: (input: string) => input.includes('/'),
      page: 'TAKEOFF_REF',
      highlightField: 'L5',
    },
    {
      id: 'to_complete',
      instruction:
        'Press EXEC (glowing green). WHY: The green light means uncommitted data. EXEC activates it. In a real cockpit, BOTH pilots cross-check every V-speed against the takeoff data card before pressing EXEC.',
      expectedAction: 'EXEC',
      validate: () => true,
      page: 'TAKEOFF_REF',
      highlightField: 'EXEC',
    },
  ],
  setup: () => [],
};

/**
 * In-flight review — check progress, flight plan, and arrival selection.
 */

export const cruiseScenario: TutorialScenario = {
  name: 'In-Flight Review',
  description: 'Review flight progress, the active flight plan, and select a STAR and approach for your destination.',
  steps: [
    {
      id: 'crz_prog',
      instruction:
        'Press PROG (2nd row, 2nd button). The PROGRESS page shows distance-to-go, ETA, fuel remaining, wind, and true airspeed. Pilots check this page regularly enroute to monitor fuel and time.',
      expectedAction: 'PROGRESS',
      validate: () => true,
      page: 'PROGRESS',
      highlightField: 'PROGRESS',
    },
    {
      id: 'crz_legs',
      instruction:
        'Press LEGS (top row, right button). WHY: The LEGS page shows your active flight plan waypoint by waypoint. Pilots verify the route, check altitude/speed constraints at each waypoint, and close any discontinuities (gaps between route segments shown as -----).',
      expectedAction: 'LEGS',
      validate: () => true,
      page: 'LEGS',
      highlightField: 'LEGS',
    },
    {
      id: 'crz_next',
      instruction:
        'Multi-page: if your route has more than 5 waypoints, use NEXT PAGE to scroll through them. Press NEXT PAGE (bottom-right keypad).',
      expectedAction: 'NEXT_PAGE',
      validate: () => true,
      page: 'LEGS',
      highlightField: 'NEXT_PAGE',
    },
    {
      id: 'crz_dep_arr',
      instruction:
        'Press DEP ARR (top row, 3rd button). WHY: About 100-150 NM from destination, pilots load the arrival procedure (STAR) and approach. The STAR guides you from the enroute airway structure down to the terminal area.',
      expectedAction: 'DEP_ARR',
      validate: () => true,
      page: 'DEP_ARR',
      highlightField: 'DEP_ARR',
    },
    {
      id: 'crz_arr',
      instruction:
        'Switch to the ARR (arrival) subpage by pressing LSK L6. The DEP/ARR page has two sides — DEP for departure procedures, ARR for arrivals.',
      expectedAction: 'arr_page',
      validate: () => true,
      page: 'DEP_ARR',
      highlightField: 'L6',
    },
    {
      id: 'crz_star',
      instruction:
        'Select a STAR (Standard Terminal Arrival Route). The FRDMM2 arrival guides you into KDCA. Press LSK L3 to select it. WHY: STARS organize arriving traffic into predictable flows, reducing ATC workload and increasing safety.',
      expectedAction: 'FRDMM2',
      validate: () => true,
      page: 'DEP_ARR',
      highlightField: 'L3',
    },
    {
      id: 'crz_approach',
      instruction:
        'Select an approach: ILS 22L (Instrument Landing System to runway 22L). This provides precision vertical and lateral guidance to the runway. Press LSK R3.',
      expectedAction: 'approach',
      validate: () => true,
      page: 'DEP_ARR',
      highlightField: 'R3',
    },
    {
      id: 'crz_complete',
      instruction:
        'Press EXEC (glowing green) to activate the arrival and approach. WHY: Until you press EXEC, the FMC continues with the previously loaded arrival — or none. EXEC makes your STAR and approach selection active.',
      expectedAction: 'EXEC',
      validate: () => true,
      page: 'DEP_ARR',
      highlightField: 'EXEC',
    },
  ],
  setup: () => [],
};

export const tutorialScenarios: TutorialScenario[] = [preflightScenario, takeoffScenario, cruiseScenario];

import { airbusTutorialScenarios } from './tutorials/airbus-tutorials';

export function getTutorialScenario(name: string): TutorialScenario | undefined {
  return [...tutorialScenarios, ...airbusTutorialScenarios].find((s) => s.name === name);
}

export function calculateTutorialGrade(
  errors: number,
  timeMs: number,
  stepCount: number,
  scenarioStandardTime?: number,
): { grade: 'A' | 'B' | 'C' | 'D'; score: number } {
  const standardTimeMs = scenarioStandardTime || stepCount * 15000;
  let score = 100 - errors * 8; // Reduced penalty per error for fairer grading

  if (timeMs > standardTimeMs) {
    const overTimeSeconds = (timeMs - standardTimeMs) / 1000;
    score -= Math.floor(overTimeSeconds / 20); // 1 point per 20s over standard
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let grade: 'A' | 'B' | 'C' | 'D' = 'D';
  if (score >= 90) grade = 'A';
  else if (score >= 75) grade = 'B';
  else if (score >= 60) grade = 'C';

  return { grade, score };
}

/**
 * Check if a tutorial step is satisfied by the current FMC state.
 */
export function isStepComplete(step: TutorialStep, state: FMCState): boolean {
  if (state.currentPage !== step.page) return false;
  if (step.validate) {
    return step.validate(state.scratchpad || '', state);
  }
  return true;
}
