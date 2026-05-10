import { create } from 'zustand';
import type { FMCState, PageType, DisplayData, CDUKey, LSKId, ConnectionMode, FMCMode, ConnectionStatus, TutorialScenario, AircraftType } from '@shared';
import { SCRATCHPAD_MAX, PAGE_LINES, PAGE_WIDTH, getPageRenderer, getAirbusPageRenderer, parseRouteString, getTutorialScenario, airbusTutorialScenarios } from '@shared';

function findTutorial(scenarioName: string): TutorialScenario | undefined {
  return getTutorialScenario(scenarioName) || airbusTutorialScenarios.find(s => s.name === scenarioName);
}

// ---- Default initial state ----
const defaultState = {
  aircraft: 'BOEING_737' as AircraftType,
  currentPage: 'IDENT' as PageType,
  pageHistory: [] as PageType[],
  scratchpad: '',
  scratchpadError: null as string | null,

  ident: { aircraftType: '737-800', engRating: '26K', navDataVersion: 'FMC21A1', opProgram: '2247662-03' },
  position: { refAirport: '', gate: '' },
  performance: { crzAlt: 0, costIndex: 0, zfw: 0, fuel: 0, cg: 0, reserve: 0 },
  takeoff: { runway: '', toMode: 'TO', assumedTemp: 0, v1: 0, vr: 0, v2: 0, trim: 0, oat: 0, windDir: 0, windSpeed: 0, qnh: 0 },
  route: { origin: '', destination: '', flightNumber: '', companyRoute: '', routeString: '' },
  flightPlan: { origin: '', destination: '', flightNumber: '', route: '', waypoints: [] },

  isModified: false,
  execLit: false,
  msgLight: false,

  mode: 'STANDBY' as FMCMode,
  connectionStatus: 'DISCONNECTED' as ConnectionStatus,
  connectionMode: 'STANDALONE' as ConnectionMode,

  // Tutorial state
  tutorialActive: false,
  tutorialScenario: null as string | null,
  tutorialStepIndex: 0,
  tutorialCompleted: false,
  tutorialHighlight: null as string | null,

  legsPageIndex: 0,
  legsPageCount: 1,
  depArrSubPage: 'DEP' as 'DEP' | 'ARR',
  rteSubPage: 0,
};

interface FMCActions {
  setPage: (page: PageType) => void;
  goBack: () => void;

  pressKey: (key: CDUKey) => void;
  pressLSK: (side: 'L' | 'R', index: number) => void;

  clearScratchpad: () => void;
  pressEXEC: () => void;

  getDisplayData: () => DisplayData;

  setMode: (mode: FMCMode) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setConnectionMode: (mode: ConnectionMode) => void;

  loadFlightPlan: (data: Partial<FMCState['flightPlan']> & { route: string }) => void;
  resetState: () => void;
  setAircraft: (type: AircraftType) => void;

  // Tutorial actions
  startTutorial: (scenarioName: string) => void;
  advanceTutorial: () => void;
  skipTutorial: () => void;
  getCurrentTutorialStep: () => TutorialScenario['steps'][0] | null;
}

export type FMCStore = FMCState & FMCActions;

type StoreAPI = ReturnType<typeof create<FMCStore>>;

function tryAdvanceIfMatch(get: () => FMCStore, key: string): void {
  const state = get();
  if (!state.tutorialActive || !state.tutorialScenario) return;

  const scenario = findTutorial(state.tutorialScenario);
  if (!scenario) return;

  const step = scenario.steps[state.tutorialStepIndex];
  if (!step) return;

  // Map CDUKey values to the format used in tutorial expectedAction
  const keyMap: Record<string, string> = {
    INIT_REF: 'POS_INIT',
    RTE: 'RTE',
    DEP_ARR: 'DEP_ARR',
    LEGS: 'LEGS',
    PERF: 'PERF_INIT',
    PROG: 'PROGRESS',
    MENU: 'MENU',
    EXEC: 'EXEC',
    NEXT_PAGE: 'NEXT_PAGE',
    PREV_PAGE: 'PREV_PAGE',
    // Airbus keys
    INIT_A: 'INIT_A',
    INIT_B: 'INIT_B',
    F_PLN: 'F_PLN',
    PERF_TAKEOFF: 'PERF_TAKEOFF',
    PROG_A: 'PROG_A',
    MCDU_MENU: 'MCDU_MENU',
    RAD_NAV: 'RAD_NAV',
  };

  const mapped = keyMap[key] || key;
  if (mapped === step.expectedAction || step.expectedAction === key) {
    state.advanceTutorial();
  }
}

export const useFMCStore = create<FMCStore>((set, get) => ({
  ...defaultState,

  setPage: (page: PageType) => {
    const { currentPage, pageHistory } = get();
    set({
      currentPage: page,
      pageHistory: [...pageHistory, currentPage],
      scratchpad: '',
      scratchpadError: null,
    });
  },

  goBack: () => {
    const { pageHistory } = get();
    if (pageHistory.length > 0) {
      const prev = pageHistory[pageHistory.length - 1];
      set({
        currentPage: prev,
        pageHistory: pageHistory.slice(0, -1),
        scratchpad: '',
        scratchpadError: null,
      });
    }
  },

  pressKey: (key: CDUKey) => {
    const { scratchpad, currentPage } = get();
    let handled = false;

    // Navigation keys
    if (key === 'INIT_REF') { get().setPage('POS_INIT'); handled = true; }
    else if (key === 'RTE') { get().setPage('RTE'); handled = true; }
    else if (key === 'DEP_ARR') { get().setPage('DEP_ARR'); handled = true; }
    else if (key === 'LEGS') { get().setPage('LEGS'); handled = true; }
    else if (key === 'PERF') { get().setPage('PERF_INIT'); handled = true; }
    else if (key === 'PROG') { get().setPage('PROGRESS'); handled = true; }
    else if (key === 'MENU') { get().setPage('MENU'); handled = true; }
    // Airbus function keys
    else if (key === 'INIT_A') { get().setPage('INIT_A'); handled = true; }
    else if (key === 'INIT_B') { get().setPage('INIT_B'); handled = true; }
    else if (key === 'F_PLN') { get().setPage('F_PLN'); handled = true; }
    else if (key === 'PERF_TAKEOFF') { get().setPage('PERF_TAKEOFF'); handled = true; }
    else if (key === 'PROG_A') { get().setPage('PROG_A'); handled = true; }
    else if (key === 'RAD_NAV') { get().setPage('RAD_NAV'); handled = true; }
    else if (key === 'MCDU_MENU') { get().setPage('MCDU_MENU'); handled = true; }

    // Clear
    else if (key === 'CLR') {
      if (scratchpad.length > 0) {
        set({ scratchpad: scratchpad.slice(0, -1), scratchpadError: null });
      }
      handled = true;
    }

    // Delete (same as CLR for now)
    else if (key === 'DEL') {
      if (scratchpad.length > 0) {
        set({ scratchpad: scratchpad.slice(0, -1), scratchpadError: null });
      }
      handled = true;
    }

    // EXEC
    else if (key === 'EXEC') {
      get().pressEXEC();
      handled = true;
    }

    // Page navigation
    else if (key === 'NEXT_PAGE') {
      const s = get();
      if (s.currentPage === 'LEGS' && s.legsPageIndex < s.legsPageCount - 1) {
        set({ legsPageIndex: s.legsPageIndex + 1 });
      } else if (s.currentPage === 'RTE' && s.rteSubPage < 1) {
        set({ rteSubPage: s.rteSubPage + 1 });
      }
      handled = true;
    }

    else if (key === 'PREV_PAGE') {
      const s = get();
      if (s.currentPage === 'LEGS' && s.legsPageIndex > 0) {
        set({ legsPageIndex: s.legsPageIndex - 1 });
      } else if (s.currentPage === 'RTE' && s.rteSubPage > 0) {
        set({ rteSubPage: s.rteSubPage - 1 });
      }
      handled = true;
    }

    // Character input
    else if (scratchpad.length < SCRATCHPAD_MAX) {
      const charMap: Record<string, string> = {
        DOT: '.', PLUS_MINUS: '+/-', SLASH: '/', SPACE: ' ',
      };
      const char = charMap[key] || key;
      set({ scratchpad: scratchpad + char, scratchpadError: null });
      handled = true;
    }

    // Tutorial: advance if action matches expected (runs after all key handling)
    if (handled) {
      tryAdvanceIfMatch(get, key);
    }
  },

  pressLSK: (side: 'L' | 'R', index: number) => {
    const state = get();
    const lskId = `${side}${index}` as LSKId;
    let displayData: DisplayData;
    if (state.aircraft === 'AIRBUS_A320') {
      const r = getAirbusPageRenderer(state.currentPage as any);
      displayData = r ? r(state) : getPageRenderer('MENU')!(state);
    } else {
      const r = getPageRenderer(state.currentPage);
      displayData = r ? r(state) : getPageRenderer('MENU')!(state);
    }
    const action = displayData.lskActions[lskId];

    if (!action) return;

    const scratchpad = state.scratchpad.trim();

    // Handle page navigation actions
    switch (action) {
      case 'pos_init': state.setPage('POS_INIT'); return;
      case 'perf_init': state.setPage('PERF_INIT'); return;
      case 'rte': state.setPage('RTE'); return;
      case 'dep_arr': state.setPage('DEP_ARR'); return;
      case 'legs': state.setPage('LEGS'); return;
      case 'thrust_lim': state.setPage('THRUST_LIM'); return;
      case 'takeoff_ref': state.setPage('TAKEOFF_REF'); return;
      case 'menu': state.setPage('MENU'); return;
      case 'ident': state.setPage('IDENT'); return;
      case 'next_page': state.pressKey('NEXT_PAGE'); return;
      case 'prev_page': state.pressKey('PREV_PAGE'); return;
      case 'dep_page': set({ depArrSubPage: 'DEP' }); return;
      case 'arr_page': set({ depArrSubPage: 'ARR' }); return;
      case 'atc': return;
      // Airbus LSK navigation
      case 'init_a': state.setPage('INIT_A'); return;
      case 'init_b': state.setPage('INIT_B'); return;
      case 'perf_to': state.setPage('PERF_TAKEOFF'); return;
      case 'perf_appr': state.setPage('PERF_APPR'); return;
      case 'f_pln': state.setPage('F_PLN'); return;
      case 'fuel_pred': state.setPage('FUEL_PRED'); return;
      case 'sec_fpln': state.setPage('SEC_FPLN'); return;
      case 'rad_nav': state.setPage('RAD_NAV'); return;
      case 'data_index': state.setPage('DATA_INDEX'); return;
      case 'mcdu_menu': state.setPage('MCDU_MENU'); return;
      case 'fpln_dep_arr': state.setPage('DEP_ARR_A'); return;
      case 'fpln_next': state.pressKey('NEXT_PAGE'); return;
      case 'fpln_prev': state.pressKey('PREV_PAGE'); return;
    }

    // Data entry actions
    const updates: Partial<FMCState> = {};

    switch (action) {
      case 'set_ref_airport':
        if (scratchpad) updates.position = { ...state.position, refAirport: scratchpad.toUpperCase() };
        break;
      case 'set_gate':
        if (scratchpad) updates.position = { ...state.position, gate: scratchpad.toUpperCase() };
        break;
      case 'set_crz_alt':
        if (scratchpad) updates.performance = { ...state.performance, crzAlt: parseInt(scratchpad) * 100 || parseInt(scratchpad) || 0 };
        break;
      case 'set_cost_index':
        if (scratchpad) updates.performance = { ...state.performance, costIndex: parseInt(scratchpad) || 0 };
        break;
      case 'set_zfw':
        if (scratchpad) updates.performance = { ...state.performance, zfw: parseFloat(scratchpad) * 1000 || 0 };
        break;
      case 'set_reserve':
        if (scratchpad) updates.performance = { ...state.performance, reserve: parseFloat(scratchpad) * 1000 || 0 };
        break;
      case 'set_origin':
        if (scratchpad) {
          updates.route = { ...state.route, origin: scratchpad.toUpperCase() };
          updates.flightPlan = { ...state.flightPlan, origin: scratchpad.toUpperCase() };
        }
        break;
      case 'set_dest':
        if (scratchpad) {
          updates.route = { ...state.route, destination: scratchpad.toUpperCase() };
          updates.flightPlan = { ...state.flightPlan, destination: scratchpad.toUpperCase() };
        }
        break;
      case 'set_flt_no':
        if (scratchpad) {
          updates.route = { ...state.route, flightNumber: scratchpad.toUpperCase() };
          updates.flightPlan = { ...state.flightPlan, flightNumber: scratchpad.toUpperCase() };
        }
        break;
      case 'set_route':
        if (scratchpad) updates.route = { ...state.route, routeString: scratchpad.toUpperCase() };
        break;
      case 'select_to':
        if (scratchpad) updates.takeoff = { ...state.takeoff, toMode: scratchpad.toUpperCase() };
        else updates.takeoff = { ...state.takeoff, toMode: 'TO' };
        break;
      case 'select_to1':
        updates.takeoff = { ...state.takeoff, toMode: 'TO 1' };
        break;
      case 'select_to2':
        updates.takeoff = { ...state.takeoff, toMode: 'TO 2' };
        break;
      case 'set_runway':
        if (scratchpad) updates.takeoff = { ...state.takeoff, runway: scratchpad };
        break;
      case 'set_to_mode':
        if (scratchpad) updates.takeoff = { ...state.takeoff, toMode: scratchpad };
        break;
      case 'set_v1':
        if (scratchpad) updates.takeoff = { ...state.takeoff, v1: parseInt(scratchpad) || 0 };
        break;
      case 'set_vr':
        if (scratchpad) updates.takeoff = { ...state.takeoff, vr: parseInt(scratchpad) || 0 };
        break;
      case 'set_v2':
        if (scratchpad) updates.takeoff = { ...state.takeoff, v2: parseInt(scratchpad) || 0 };
        break;
      case 'set_trim':
        if (scratchpad) updates.takeoff = { ...state.takeoff, trim: parseFloat(scratchpad) || 0 };
        break;
      case 'set_oat':
        if (scratchpad) updates.takeoff = { ...state.takeoff, oat: parseInt(scratchpad) || 0 };
        break;
      case 'set_wind':
        if (scratchpad) {
          const parts = scratchpad.split('/');
          if (parts.length === 2) {
            updates.takeoff = { ...state.takeoff, windDir: parseInt(parts[0]) || 0, windSpeed: parseInt(parts[1]) || 0 };
          }
        }
        break;
      case 'set_qnh':
        if (scratchpad) updates.takeoff = { ...state.takeoff, qnh: parseInt(scratchpad) * 100 || parseFloat(scratchpad) * 100 || 0 };
        break;
      // Airbus data entry
      case 'set_from_to':
        if (scratchpad && scratchpad.includes('/')) {
          const [from, to] = scratchpad.toUpperCase().split('/');
          updates.route = { ...state.route, origin: from, destination: to };
          updates.flightPlan = { ...state.flightPlan, origin: from, destination: to };
        }
        break;
      case 'set_crz_fl':
        if (scratchpad) updates.performance = { ...state.performance, crzAlt: parseInt(scratchpad) * 100 || parseInt(scratchpad) || 0 };
        break;
      case 'set_altn':
        if (scratchpad) updates.route = { ...state.route, alternate: scratchpad.toUpperCase() };
        break;
      case 'set_block':
        if (scratchpad) updates.performance = { ...state.performance, fuel: parseFloat(scratchpad) * 1000 || 0 };
        break;
      case 'set_flt_nbr':
        if (scratchpad) {
          updates.route = { ...state.route, flightNumber: scratchpad.toUpperCase() };
          updates.flightPlan = { ...state.flightPlan, flightNumber: scratchpad.toUpperCase() };
        }
        break;
      case 'set_sid':
        if (scratchpad) updates.route = { ...state.route, sid: scratchpad.toUpperCase() };
        break;
      case 'set_rwy':
        if (scratchpad) updates.route = { ...state.route, runway: scratchpad.toUpperCase() };
        break;
      case 'set_star':
        if (scratchpad) updates.route = { ...state.route, star: scratchpad.toUpperCase() };
        break;
      case 'set_appr':
        if (scratchpad) updates.route = { ...state.route, approach: scratchpad.toUpperCase() };
        break;
      case 'set_flaps':
        if (scratchpad) updates.takeoff = { ...state.takeoff, flaps: scratchpad.toUpperCase() };
        break;
      case 'set_flex':
        if (scratchpad) updates.takeoff = { ...state.takeoff, flexTemp: parseInt(scratchpad) || 0 };
        break;
      case 'set_cg':
        if (scratchpad) updates.performance = { ...state.performance, cg: parseFloat(scratchpad) || 0 };
        break;
      case 'set_extra':
        break;
    }

    if (Object.keys(updates).length > 0) {
      set({ isModified: true, execLit: true, scratchpad: '', scratchpadError: null, ...(updates as any) });
    }

    // Tutorial: advance on LSK press (only if validate passes)
    const { tutorialActive } = get();
    if (tutorialActive) {
      const scenario = findTutorial(get().tutorialScenario || '');
      if (scenario) {
        const step = scenario.steps[get().tutorialStepIndex];
        if (step && step.validate) {
          const scratchpad = get().scratchpad;
          if (step.validate(scratchpad)) {
            get().advanceTutorial();
          }
        } else {
          get().advanceTutorial(); // No validate function, just advance
        }
      }
    }
  },

  clearScratchpad: () => {
    set({ scratchpad: '', scratchpadError: null });
  },

  pressEXEC: () => {
    const { execLit } = get();
    if (execLit) {
      set({ execLit: false, isModified: false, msgLight: false });
    }
  },

  getDisplayData: () => {
    const state = get();
    if (state.aircraft === 'AIRBUS_A320') {
      const renderer = getAirbusPageRenderer(state.currentPage as any);
      if (renderer) return renderer(state);
    }
    const renderer = getPageRenderer(state.currentPage as any);
    return renderer ? renderer(state) : getPageRenderer('MENU')!(state);
  },

  setMode: (mode: FMCMode) => set({ mode }),
  setConnectionStatus: (status: ConnectionStatus) => set({ connectionStatus: status }),
  setConnectionMode: (mode: ConnectionMode) => set({ connectionMode: mode }),

  loadFlightPlan: (data) => {
    set((state) => ({
      flightPlan: { ...state.flightPlan, ...data },
      route: { ...state.route, origin: data.origin || state.route.origin, destination: data.destination || state.route.destination, routeString: data.route || state.route.routeString },
      msgLight: true,
    }));
  },

  resetState: () => set(defaultState),

  setAircraft: (type: AircraftType) => {
    const startPage = type === 'BOEING_737' ? 'IDENT' as PageType : 'INIT_A' as PageType;
    set({
      ...defaultState,
      aircraft: type,
      currentPage: startPage,
      pageHistory: [],
    });
  },

  // ---- Tutorial ----
  startTutorial: (scenarioName: string) => {
    const scenario = findTutorial(scenarioName);
    if (!scenario) return;
    const firstStep = scenario.steps[0];
    // Call setup function to initialize tutorial state
    if (scenario.setup) scenario.setup();
    
    // Navigate to the first step's page
    const pageMap: Record<string, PageType> = {
      POS_INIT: 'POS_INIT',
      RTE: 'RTE',
      DEP_ARR: 'DEP_ARR',
      PERF_INIT: 'PERF_INIT',
      THRUST_LIM: 'THRUST_LIM',
      TAKEOFF_REF: 'TAKEOFF_REF',
      LEGS: 'LEGS',
      PROGRESS: 'PROGRESS',
      IDENT: 'IDENT',
      MENU: 'MENU',
      HOLD: 'HOLD',
      FIX: 'FIX',
      // Airbus pages
      INIT_A: 'INIT_A',
      INIT_B: 'INIT_B',
      F_PLN: 'F_PLN',
      PERF_TAKEOFF: 'PERF_TAKEOFF',
      PROG_A: 'PROG_A',
      DEP_ARR_A: 'DEP_ARR_A',
      MCDU_MENU: 'MCDU_MENU',
      RAD_NAV: 'RAD_NAV',
      SEC_FPLN: 'SEC_FPLN',
      FUEL_PRED: 'FUEL_PRED',
      DATA_INDEX: 'DATA_INDEX',
    };
    const target = pageMap[firstStep.page] || firstStep.page || 'IDENT';
    
    set({
      tutorialActive: true,
      tutorialScenario: scenarioName,
      tutorialStepIndex: 0,
      tutorialCompleted: false,
      tutorialHighlight: firstStep?.highlightField || null,
      mode: 'TUTORIAL',
      scratchpad: '',
      scratchpadError: null,
      currentPage: target,
      pageHistory: [],
    });
  },

  advanceTutorial: () => {
    const state = get();
    const { tutorialScenario, tutorialStepIndex, currentPage } = state;
    const scenario = tutorialScenario ? findTutorial(tutorialScenario) : null;
    if (!scenario) return;

    const currentStep = scenario.steps[tutorialStepIndex];
    const nextIndex = tutorialStepIndex + 1;
    if (nextIndex >= scenario.steps.length) {
      set({
        tutorialActive: false,
        tutorialCompleted: true,
        tutorialHighlight: null,
        mode: 'ACTIVE',
        msgLight: true,
      });
      return;
    }

    const nextStep = scenario.steps[nextIndex];
    set({
      tutorialStepIndex: nextIndex,
      tutorialHighlight: nextStep.highlightField || null,
      scratchpad: '',
      scratchpadError: null,
    });

    const currentStepPage = currentStep?.page;
    const nextStepPage = nextStep?.page;
    
    // Auto-navigate to next step's page only when the next step
    // is NOT a function key action (the user will press that key themselves).
    // Function keys: INIT_REF, RTE, DEP_ARR, PERF, PROG, LEGS, MENU
    // For those steps, the highlighted button both navigates and advances.
    // Airbus function keys: INIT_A, INIT_B, F-PLN, PERF TO, PROG A, DEP ARR A, MCDU MENU, RAD NAV
    const functionKeyActions = ['POS_INIT', 'RTE', 'DEP_ARR', 'PERF_INIT', 'PROGRESS', 'LEGS', 'MENU',
                              'INIT_A', 'INIT_B', 'F_PLN', 'PERF_TAKEOFF', 'PROG_A', 'DEP_ARR_A', 'MCDU_MENU', 'RAD_NAV'];
    if (!functionKeyActions.includes(nextStep.expectedAction)
        && currentPage === currentStepPage
        && nextStepPage !== currentPage) {
      set({ currentPage: nextStepPage });
    }
  },

  skipTutorial: () => {
    set({
      tutorialActive: false,
      tutorialScenario: null,
      tutorialStepIndex: 0,
      tutorialHighlight: null,
      mode: 'STANDBY',
    });
  },

  getCurrentTutorialStep: () => {
    const { tutorialScenario, tutorialStepIndex, tutorialActive } = get();
    if (!tutorialActive || !tutorialScenario) return null;
    const scenario = findTutorial(tutorialScenario);
    if (!scenario) return null;
    return scenario.steps[tutorialStepIndex] || null;
  },
}));
