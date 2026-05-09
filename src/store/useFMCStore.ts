import { create } from 'zustand';
import type { FMCState, PageType, DisplayData, CDUKey, LSKId, ConnectionMode, FMCMode, ConnectionStatus, TutorialScenario } from '@shared';
import { SCRATCHPAD_MAX, PAGE_LINES, PAGE_WIDTH, getPageRenderer, parseRouteString, getTutorialScenario } from '@shared';

// ---- Default initial state ----
const defaultState = {
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

  const scenario = getTutorialScenario(state.tutorialScenario);
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

    // Navigation keys
    if (key === 'INIT_REF') { get().setPage('IDENT'); return; }
    if (key === 'RTE') { get().setPage('RTE'); return; }
    if (key === 'DEP_ARR') { get().setPage('DEP_ARR'); return; }
    if (key === 'LEGS') { get().setPage('LEGS'); return; }
    if (key === 'PERF') { get().setPage('PERF_INIT'); return; }
    if (key === 'PROG') { get().setPage('PROGRESS'); return; }
    if (key === 'MENU') { get().setPage('MENU'); return; }

    // Clear
    if (key === 'CLR') {
      if (scratchpad.length > 0) {
        set({ scratchpad: scratchpad.slice(0, -1), scratchpadError: null });
      }
      return;
    }

    // Delete (same as CLR for now)
    if (key === 'DEL') {
      if (scratchpad.length > 0) {
        set({ scratchpad: scratchpad.slice(0, -1), scratchpadError: null });
      }
      return;
    }

    // EXEC
    if (key === 'EXEC') {
      get().pressEXEC();
      return;
    }

    // Page navigation
    if (key === 'NEXT_PAGE') {
      const s = get();
      if (s.currentPage === 'LEGS' && s.legsPageIndex < s.legsPageCount - 1) {
        set({ legsPageIndex: s.legsPageIndex + 1 });
      } else if (s.currentPage === 'RTE' && s.rteSubPage < 1) {
        set({ rteSubPage: s.rteSubPage + 1 });
      }
      return;
    }

    if (key === 'PREV_PAGE') {
      const s = get();
      if (s.currentPage === 'LEGS' && s.legsPageIndex > 0) {
        set({ legsPageIndex: s.legsPageIndex - 1 });
      } else if (s.currentPage === 'RTE' && s.rteSubPage > 0) {
        set({ rteSubPage: s.rteSubPage - 1 });
      }
      return;
    }

    // Character input
    if (scratchpad.length >= SCRATCHPAD_MAX) return;

    const charMap: Record<string, string> = {
      DOT: '.', PLUS_MINUS: '+/-', SLASH: '/', SPACE: ' ',
    };

    const char = charMap[key] || key;
    set({ scratchpad: scratchpad + char, scratchpadError: null });

    // Tutorial: advance if key matches expected action
    tryAdvanceIfMatch(get, key);
  },

  pressLSK: (side: 'L' | 'R', index: number) => {
    const state = get();
    const lskId = `${side}${index}` as LSKId;
    const renderer = getPageRenderer(state.currentPage);
    const displayData = renderer(state);
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
      case 'atc': return; // not implemented
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
    }

    if (Object.keys(updates).length > 0) {
      set({ isModified: true, execLit: true, scratchpad: '', scratchpadError: null, ...(updates as any) });
    }

    // Tutorial: advance on LSK press
    const { tutorialActive } = get();
    if (tutorialActive) {
      get().advanceTutorial();
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
    const renderer = getPageRenderer(state.currentPage);
    return renderer(state);
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

  // ---- Tutorial ----
  startTutorial: (scenarioName: string) => {
    const scenario = getTutorialScenario(scenarioName);
    if (!scenario) return;
    const firstStep = scenario.steps[0];
    set({
      tutorialActive: true,
      tutorialScenario: scenarioName,
      tutorialStepIndex: 0,
      tutorialCompleted: false,
      tutorialHighlight: firstStep?.highlightField || null,
      mode: 'TUTORIAL',
      scratchpad: '',
      scratchpadError: null,
    });
    if (firstStep) {
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
      };
      const target = pageMap[firstStep.page] || 'IDENT';
      set({ currentPage: target, pageHistory: [] });
    }
  },

  advanceTutorial: () => {
    const { tutorialScenario, tutorialStepIndex } = get();
    const scenario = tutorialScenario ? getTutorialScenario(tutorialScenario) : null;
    if (!scenario) return;

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

    // Navigate to the next step's page if different
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
    };
    const target = pageMap[nextStep.page] || 'IDENT';
    if (target !== get().currentPage) {
      set({ currentPage: target });
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
    const scenario = getTutorialScenario(tutorialScenario);
    if (!scenario) return null;
    return scenario.steps[tutorialStepIndex] || null;
  },
}));
