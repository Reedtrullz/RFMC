import type { FMCState, TutorialScenario } from '../../types/fmc';

export const airbusBasicsScenario: TutorialScenario = {
  name: 'Airbus A320 Basics',
  description:
    'Learn the fundamentals of the Airbus MCDU — INIT page setup, flight plan review, and radio navigation tuning.',
  steps: [
    {
      id: 'airbus_init_nav',
      instruction:
        'Welcome to the A320 MCDU. Press INIT to start initialization. Airbus uses the INIT pages to define route endpoints, performance data, weight, and fuel information.',
      expectedAction: 'INIT_A',
      validate: () => false,
      page: 'INIT_A',
      highlightField: 'INIT_A',
    },
    {
      id: 'airbus_align_irs',
      instruction:
        'The ND currently shows MAP NOT AVAIL because the IRS is off. Press LSK L6 to ALIGN IRS and start the 7-minute alignment process.',
      expectedAction: 'align_irs',
      validate: (_input: string) => true,
      page: 'INIT_A',
      highlightField: 'L6',
    },
    {
      id: 'airbus_align_irs_wait',
      instruction:
        'The IRS is now aligning. Notice the "MAP NOT AVAIL" flag on the ND. Navigation will be unavailable until alignment is complete (NAV status). This takes 7 minutes in a real A320, but is accelerated here. Wait for status to show "IRS NAV".',
      expectedAction: 'WAIT',
      validate: (_input: string, state: FMCState) => state.position.irsState === 'NAV',
      page: 'INIT_A',
    },
    {
      id: 'airbus_from_to',
      instruction: 'Enter the origin and destination airports. Type KJFK/KORD and press LSK R1.',
      expectedAction: 'KJFK/KORD',
      validate: (input: string) => input.toUpperCase().includes('/'),
      page: 'INIT_A',
      highlightField: 'R1',
    },
    {
      id: 'airbus_flt_nr',
      instruction: 'Enter your flight number, for example AAL456, and press LSK L2.',
      expectedAction: 'AAL456',
      validate: (input: string) => input.length >= 3,
      page: 'INIT_A',
      highlightField: 'L2',
    },
    {
      id: 'airbus_ci',
      instruction: 'Enter the Cost Index. Type 30 and press the COST INDEX LSK.',
      expectedAction: '30',
      validate: (input: string) => parseInt(input) > 0,
      page: 'INIT_A',
      highlightField: 'L3',
    },
    {
      id: 'airbus_crz_fl',
      instruction: 'Enter your cruise flight level. Type 320 for FL320 and press LSK L4.',
      expectedAction: '320',
      validate: (input: string) => parseInt(input) >= 100,
      page: 'INIT_A',
      highlightField: 'L4',
    },
    {
      id: 'airbus_fpln_nav',
      instruction: 'Press F-PLN to review your route. The Flight Plan page shows waypoints and constraints.',
      expectedAction: 'F_PLN',
      validate: () => true,
      page: 'F_PLN',
      highlightField: 'F_PLN',
    },
    {
      id: 'airbus_radnav_nav',
      instruction: 'Press RAD NAV. The Radio Navigation page is used to review or manually tune radio navigation aids.',
      expectedAction: 'RAD_NAV',
      validate: () => true,
      page: 'RAD_NAV',
      highlightField: 'RAD_NAV',
    },
  ],
  setup: () => [],
};

export const airbusPreflight: TutorialScenario = {
  name: 'A320 Preflight (ENGM → ENBR)',
  description: 'Complete Airbus A320 MCDU setup — INIT A/B, F-PLN, PERF TO, and FUEL PRED.',
  steps: [
    {
      id: 'a_init_a_intro',
      instruction:
        'You are on the INIT A page. This is the A320 equivalent of the Boeing POS INIT + RTE page combined. Enter FROM/TO (origin/destination), cost index, cruise flight level, and alternate.',
      expectedAction: 'INIT_A',
      validate: () => false,
      page: 'INIT_A',
      highlightField: 'R1',
    },
    {
      id: 'a_from_to',
      instruction:
        'Enter FROM/TO in the format ENGM/ENBR (Oslo to Bergen). Type ENGM/ENBR on the keypad and press LSK R1. WHY: Airbus uses the FROM/TO format to load the origin and destination simultaneously.',
      expectedAction: 'ENGM/ENBR',
      validate: (input: string) => input.toUpperCase().includes('ENGM'),
      page: 'INIT_A',
      highlightField: 'R1',
    },
    {
      id: 'a_cost_index',
      instruction: 'Cost Index balances fuel vs time. Enter 30 and press LSK L3. Higher CI = faster flight, more fuel.',
      expectedAction: '30',
      validate: (input: string) => parseInt(input) > 0,
      page: 'INIT_A',
      highlightField: 'L3',
    },
    {
      id: 'a_crz_fl',
      instruction: 'Cruise Flight Level. Enter 350 and press LSK L4. The MCDU automatically adds "FL" prefix.',
      expectedAction: '350',
      validate: (input: string) => parseInt(input) >= 100,
      page: 'INIT_A',
      highlightField: 'L4',
    },
    {
      id: 'a_flt_nbr',
      instruction: 'Flight number (callsign). Enter NAX123 and press LSK L2.',
      expectedAction: 'NAX123',
      validate: (input: string) => input.toUpperCase().length >= 3,
      page: 'INIT_A',
      highlightField: 'L2',
    },
    {
      id: 'a_init_b',
      instruction: 'Press LSK R6 (marked with INIT B >) to go to INIT B page for weight and balance data.',
      expectedAction: 'init_b',
      validate: () => false,
      page: 'INIT_A',
      highlightField: 'R6',
    },
    {
      id: 'a_zfw',
      instruction: 'Zero Fuel Weight. Type 58.0 and press LSK L1.',
      expectedAction: '58',
      validate: (input: string) => parseFloat(input) > 30,
      page: 'INIT_B',
      highlightField: 'L1',
    },
    {
      id: 'a_block',
      instruction: 'Block fuel — total fuel loaded. Enter 5.0 and press LSK L2.',
      expectedAction: '5',
      validate: (input: string) => parseFloat(input) > 1,
      page: 'INIT_B',
      highlightField: 'L2',
    },
    {
      id: 'a_v1',
      instruction: 'V1 — decision speed. Approximately 140 knots. Enter 140 and press LSK L1.',
      expectedAction: '140',
      validate: (input: string) => parseInt(input) > 100,
      page: 'PERF_TAKEOFF',
      highlightField: 'L1',
    },
    {
      id: 'a_vr',
      instruction: 'VR — rotation speed. Enter 145 and press LSK L2.',
      expectedAction: '145',
      validate: (input: string) => parseInt(input) > 100,
      page: 'PERF_TAKEOFF',
      highlightField: 'L2',
    },
    {
      id: 'a_v2',
      instruction: 'V2 — takeoff safety speed. Enter 150 and press LSK L3.',
      expectedAction: '150',
      validate: (input: string) => parseInt(input) > 100,
      page: 'PERF_TAKEOFF',
      highlightField: 'L3',
    },
    {
      id: 'a_flex',
      instruction: 'FLEX takeoff temperature. Enter 45 and press LSK L6.',
      expectedAction: '45',
      validate: (input: string) => parseInt(input) > 0,
      page: 'PERF_TAKEOFF',
      highlightField: 'L6',
    },
    {
      id: 'a_fuel_pred',
      instruction: 'Press R6 (→) or FUEL PRED to check fuel predictions.',
      expectedAction: 'perf_appr',
      validate: () => false,
      page: 'PERF_TAKEOFF',
      highlightField: 'R6',
    },
    {
      id: 'a_exec',
      instruction:
        'Press EXEC (glowing green) to activate all entries. The Airbus MCDU now has a complete preflight setup.',
      expectedAction: 'EXEC',
      validate: () => true,
      page: 'FUEL_PRED',
      highlightField: 'EXEC',
    },
  ],
  setup: () => [],
};

export const airbusTakeoffScenario: TutorialScenario = {
  name: 'A320 Takeoff Configuration',
  description:
    'Enter V-speeds (V1/VR/V2), FLX temp, runway, and wind — critical safety parameters for every A320 takeoff.',
  steps: [
    {
      id: 'a_to_nav',
      instruction:
        'Press PERF (top row, 3rd button) to go to PERF TO page. This is where Airbus pilots enter takeoff performance data.',
      expectedAction: 'PERF_TAKEOFF',
      validate: () => false,
      page: 'INIT_A', // We're on IDENT page (INIT_A for Airbus)
      highlightField: 'PERF_TAKEOFF',
    },
    {
      id: 'a_to_flaps',
      instruction: 'Enter the takeoff flap setting. For this flight, type 1 (for CONF1) and press LSK L5.',
      expectedAction: '1',
      validate: (input: string) => input.toUpperCase().startsWith('1') || input.toUpperCase().includes('CONF1'),
      page: 'PERF_TAKEOFF',
      highlightField: 'L5',
    },
    {
      id: 'a_to_v1',
      instruction:
        'V1 — Decision speed. Above V1, you MUST continue takeoff even with engine failure. For our A320 at 58T ZFW: approximately 140 knots. Type 140 and press LSK L1.',
      expectedAction: '140',
      validate: (input: string) => parseInt(input) > 100 && parseInt(input) < 200,
      page: 'PERF_TAKEOFF',
      highlightField: 'L1',
    },
    {
      id: 'a_to_vr',
      instruction:
        'VR — Rotation speed. The pilot pulls back to lift the nose at this speed. For A320: approximately 145 knots. Type 145 and press LSK L2.',
      expectedAction: '145',
      validate: (input: string) => parseInt(input) > 100 && parseInt(input) < 200,
      page: 'PERF_TAKEOFF',
      highlightField: 'L2',
    },
    {
      id: 'a_to_v2',
      instruction:
        'V2 — Takeoff safety speed. Minimum speed to maintain with one engine out. A320 typical: 150 knots. Type 150 and press LSK L3.',
      expectedAction: '150',
      validate: (input: string) => parseInt(input) > 100 && parseInt(input) < 200,
      page: 'PERF_TAKEOFF',
      highlightField: 'L3',
    },
    {
      id: 'a_to_flex',
      instruction:
        'FLX TEMP — Assumed temperature for reduced thrust takeoff. Higher temp = more reduction = longer engine life. Enter 45 (45°C) and press LSK L6. Real A320 fleets often use 40-55°C for FLX.',
      expectedAction: '45',
      validate: (input: string) => parseInt(input) > 0 && parseInt(input) < 70,
      page: 'PERF_TAKEOFF',
      highlightField: 'L6',
    },
    {
      id: 'a_to_exec',
      instruction:
        'Press EXEC (glowing green). On Airbus, EXEC activates the takeoff performance data. Both pilots cross-check V-speeds against the load sheet and takeoff data card before takeoff.',
      expectedAction: 'EXEC',
      validate: () => true,
      page: 'PERF_TAKEOFF',
      highlightField: 'EXEC',
    },
  ],
  setup: () => [],
};

export const airbusInFlightScenario: TutorialScenario = {
  name: 'A320 In-Flight Review',
  description:
    'Review flight progress, the active flight plan (F-PLN), and select a STAR and approach for your destination.',
  steps: [
    {
      id: 'a_crz_prog',
      instruction:
        'Press PROG (top row, 2nd button). The A320 PROG page shows distance-to-go, ETA, fuel remaining, wind, and true airspeed. Pilots check this page regularly enroute to monitor fuel burn and time.',
      expectedAction: 'PROG_A',
      validate: () => false,
      page: 'PROG_A',
      highlightField: 'PROG_A',
    },
    {
      id: 'a_crz_fpln',
      instruction:
        'Press F-PLN (top row, 1st button). WHY: The F-PLN page shows your active flight plan waypoint by waypoint. A320 pilots verify the route, check altitude/speed constraints, and close any discontinuities (-----) between route segments.',
      expectedAction: 'F_PLN',
      validate: () => true,
      page: 'F_PLN',
      highlightField: 'F_PLN',
    },
    {
      id: 'a_crz_next',
      instruction:
        'Multi-page: if your route has more than 5 waypoints, use NEXT PAGE to scroll. Press NEXT PAGE (bottom-right keypad).',
      expectedAction: 'NEXT_PAGE',
      validate: () => false,
      page: 'F_PLN',
      highlightField: 'NEXT_PAGE',
    },
    {
      id: 'a_crz_sec_fpln',
      instruction:
        'Press LSK R6 (→) to view SEC F-PLN (Secondary Flight Plan). This is an Airbus feature — a backup flight plan you can activate instantly if ATC gives you a reroute. Pilots often load an alternate route here.',
      expectedAction: 'sec_fpln',
      validate: () => false,
      page: 'F_PLN',
      highlightField: 'R6',
    },
    {
      id: 'a_crz_dep_arr',
      instruction:
        'Press ARR (top row, 3rd button area). WHY: About 100-150 NM from destination, A320 pilots load the arrival procedure (STAR) and approach. The STAR guides you from cruise down to the terminal area.',
      expectedAction: 'DEP_ARR',
      validate: () => true,
      page: 'DEP_ARR',
      highlightField: 'DEP_ARR',
    },
    {
      id: 'a_crz_arr',
      instruction:
        'Switch to the ARR (arrival) subpage by pressing LSK L6. The DEP/ARR page has two sides — DEP for departure procedures, ARR for arrivals.',
      expectedAction: 'arr_page',
      validate: () => false,
      page: 'DEP_ARR',
      highlightField: 'L6',
    },
    {
      id: 'a_crz_star',
      instruction:
        'Select a STAR (Standard Terminal Arrival Route). The FRR2B arrival guides you into ENBR (Bergen). Press LSK L3 to select it. WHY: STARs organize arriving traffic into predictable flows, reducing ATC workload.',
      expectedAction: 'FRR2B',
      validate: (input: string) => input.toUpperCase().includes('FRR'),
      page: 'DEP_ARR',
      highlightField: 'L3',
    },
    {
      id: 'a_crz_approach',
      instruction:
        'Select an approach: ILS 25 (Instrument Landing System to runway 25). This provides precision vertical and lateral guidance to the runway. Press LSK R3.',
      expectedAction: 'approach',
      validate: () => true,
      page: 'DEP_ARR',
      highlightField: 'R3',
    },
    {
      id: 'a_crz_complete',
      instruction:
        'Press EXEC (glowing green) to activate the arrival and approach. On Airbus, EXEC makes your STAR and approach selection active. The MCDU now has a complete arrival procedure loaded.',
      expectedAction: 'EXEC',
      validate: () => true,
      page: 'DEP_ARR',
      highlightField: 'EXEC',
    },
  ],
  setup: () => [],
};

export const airbusTutorialScenarios: TutorialScenario[] = [
  airbusBasicsScenario,
  airbusPreflight,
  airbusTakeoffScenario,
  airbusInFlightScenario,
];
