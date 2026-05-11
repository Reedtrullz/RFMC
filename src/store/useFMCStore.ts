import { create } from 'zustand';
import type { FMCState, PageType, DisplayData, CDUKey, LSKId, ConnectionMode, FMCMode, ConnectionStatus, TutorialScenario, AircraftType, AltitudeConstraint, SpeedConstraint } from '@shared';
import { SCRATCHPAD_MAX, PAGE_LINES, PAGE_WIDTH, getPageRenderer, getAirbusPageRenderer, parseRouteString, getTutorialScenario, airbusTutorialScenarios } from '@shared';
import { isValidICAO, isValidAltitude, isValidSpeed, isValidTemperature, isValidVSpeeds, isValidWind, isValidWaypoint, isValidFlightNumber } from '@shared';
import { devLog, devError } from '@shared';

function findTutorial(scenarioName: string): TutorialScenario | undefined {
  return getTutorialScenario(scenarioName) || airbusTutorialScenarios.find(s => s.name === scenarioName);
}

function isFixInActiveRoute(state: FMCState, ident: string): boolean {
  const routeFixes = new Set([
    state.flightPlan.origin,
    state.flightPlan.destination,
    ...state.flightPlan.waypoints.map(wp => wp.ident),
  ].filter(Boolean).map(fix => fix.toUpperCase()));

  return routeFixes.size === 0 || routeFixes.has(ident.toUpperCase());
}

function ensureFixEntries(entries: FMCState['fixEntries'], legacy: FMCState['fix']): FMCState['fixEntries'] {
  return [
    { ...(entries[0] ?? legacy) },
    { ...(entries[1] ?? { refFix: '', radial: 0, distance: 0 }) },
  ];
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
  landing: { runway: '', flaps: '', vref: 0, ilsFrequency: '', course: 0 },
  route: { origin: '', destination: '', flightNumber: '', companyRoute: '', routeString: '' },
  flightPlan: { origin: '', destination: '', flightNumber: '', route: '', waypoints: [] },
  pendingRoute: null,
  pendingFlightPlan: null,

  isModified: false,
  execLit: false,
  msgLight: false,

  mode: 'STANDBY' as FMCMode,
  connectionStatus: 'DISCONNECTED' as ConnectionStatus,
  connectionMode: 'STANDALONE' as ConnectionMode,
  connectedAircraft: null as string | null,
  connectedAircraftType: null as AircraftType | null,
  connectedCapabilities: [] as string[],
  lastError: null as string | null,
  simVariables: {} as Record<string, number>,
  failureMessage: null as string | null,
  externalDisplayData: null as DisplayData | null,

  // Tutorial state
  tutorialActive: false,
  tutorialScenario: null as string | null,
  tutorialStepIndex: 0,
  tutorialCompleted: false,
  tutorialHighlight: null as string | null,
  tutorialErrors: 0,
  tutorialStartTime: null as number | null,
  tutorialHint: null as string | null,
  tutorialSkipAvailable: false,

  legsPageIndex: 0,
  legsPageCount: 1,
  depArrSubPage: 'DEP' as 'DEP' | 'ARR',
  rteSubPage: 0,
  takeoffRefPageIndex: 0,

  fix: { refFix: '', radial: 0, distance: 0 },
  fixEntries: [
    { refFix: '', radial: 0, distance: 0 },
    { refFix: '', radial: 0, distance: 0 },
  ],

  hold: { fix: '', inboundCourse: 0, legTime: 1.0, legDist: 0, direction: 'R' as 'L' | 'R' },
  holdPending: null as FMCState['holdPending'],

  deleteMode: false,
  editWaypointIndex: null,

  aircraftState: null,
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
  setConnectionDiagnostics: (diagnostics: Partial<ConnectionDiagnostics>) => void;
  setSimVariables: (variables: Record<string, number>) => void;
  setAircraftState: (state: FMCState['aircraftState']) => void;
  setConnectedAircraft: (aircraft: string | null, capabilities?: string[] | null, aircraftType?: AircraftType | null) => void;
  setConnectedLastError: (error: string | null) => void;
  setExternalDisplayData: (data: DisplayData | null) => void;
  setFailureMode: (mode: 'FAIL' | 'OFF', message?: string) => void;
  clearFailureMode: () => void;

  loadFlightPlan: (data: Partial<FMCState['flightPlan']> & { route: string }) => void;
  resetState: () => void;
  setAircraft: (type: AircraftType) => void;

  // Waypoint editing actions
  insertWaypoint: (index: number, ident: string) => void;
  deleteWaypoint: (index: number) => void;
  updateWaypointConstraint: (index: number, altitude?: AltitudeConstraint, speed?: SpeedConstraint) => void;

  // Fix page actions
  setFixRef: (ident: string) => void;
  setFixRadialDistance: (radial: number, distance: number) => void;

  setHoldFix: (ident: string) => void;
  setInboundCourse: (crs: number) => void;
  setLegTime: (time: number) => void;
  setLegDist: (dist: number) => void;
  setHoldDirection: (dir: 'L' | 'R') => void;

  // Tutorial actions
  startTutorial: (scenarioName: string) => void;
  advanceTutorial: () => void;
  skipTutorial: () => void;
  getCurrentTutorialStep: () => TutorialScenario['steps'][0] | null;
  recordTutorialError: () => void;
  skipTutorialStep: () => void;
  clearTutorialHint: () => void;
}

interface ConnectionDiagnostics {
  connectedAircraft: string | null;
  connectedAircraftType: AircraftType | null;
  connectedCapabilities: string[] | null;
  lastError: string | null;
  simVariables: Record<string, number>;
}

interface TutorialState {
  tutorialActive: boolean;
  tutorialCompleted: boolean;
  tutorialStepIndex: number;
  tutorialScenario: string | null;
  tutorialStartTime: number | null;
  tutorialErrors: number;
  tutorialHint: string | null;
  tutorialSkipAvailable: boolean;
  tutorialHighlight: string | null;
}

export type FMCStore = FMCState & ConnectionDiagnostics & TutorialState & FMCActions;

type StoreAPI = import('zustand').StoreApi<FMCStore>;

function tryAdvanceIfMatch(get: () => FMCStore, key: string): void {
  devLog('tryAdvanceIfMatch called with:', key);
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
    DATA_INDEX: 'DATA_INDEX',
    DIR_INTC: 'DIR_INTC',
    MCDU_MENU: 'MCDU_MENU',
    RAD_NAV: 'RAD_NAV',
  };

  const mapped = keyMap[key] || key;
  if (mapped === step.expectedAction || step.expectedAction === key) {
    state.advanceTutorial();
  } else {
    state.recordTutorialError();
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
      takeoffRefPageIndex: page === 'TAKEOFF_REF' ? 0 : get().takeoffRefPageIndex,
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
    devLog('pressKey called with:', key);
    const { scratchpad, currentPage } = get();
    let handled = false;

    // Navigation keys
    if (key === 'INIT_REF') { get().setPage('POS_INIT'); handled = true; }
    else if (key === 'RTE') { get().setPage('RTE'); handled = true; }
    else if (key === 'CLB') { get().setPage('CLB'); handled = true; }
    else if (key === 'CRZ') { get().setPage('CRZ'); handled = true; }
    else if (key === 'DES') { get().setPage('DES'); handled = true; }
    else if (key === 'DIR_INTC') { get().setPage('DIR_INTC'); handled = true; }
    else if (key === 'LEGS') { get().setPage('LEGS'); handled = true; }
    else if (key === 'DEP_ARR') { get().setPage('DEP_ARR'); handled = true; }
    else if (key === 'HOLD') { get().setPage('HOLD'); handled = true; }
    else if (key === 'PERF') { get().setPage('PERF_INIT'); handled = true; }
    else if (key === 'PROG') { get().setPage('PROGRESS'); handled = true; }
    else if (key === 'N1_LIMIT') { get().setPage('N1_LIMIT'); handled = true; }
    else if (key === 'FIX') { get().setPage('FIX'); handled = true; }
    else if (key === 'MENU') { get().setPage('MENU'); handled = true; }
    // Airbus function keys
    else if (key === 'INIT_A') { get().setPage('INIT_A'); handled = true; }
    else if (key === 'INIT_B') { get().setPage('INIT_B'); handled = true; }
    else if (key === 'F_PLN') { get().setPage('F_PLN'); handled = true; }
    else if (key === 'DATA_INDEX') { get().setPage('DATA_INDEX'); handled = true; }
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

    else if (key === 'DEL') {
      if (scratchpad.length > 0) {
        set({ scratchpad: scratchpad.slice(0, -1), scratchpadError: null });
      } else if (currentPage === 'LEGS') {
        set({ deleteMode: !get().deleteMode, scratchpadError: null });
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
      } else if (s.currentPage === 'PERF_INIT') {
        set({ currentPage: 'TAKEOFF_REF', takeoffRefPageIndex: 0, scratchpad: '', scratchpadError: null });
      } else if (s.currentPage === 'TAKEOFF_REF') {
        if (s.takeoffRefPageIndex < 1) {
          set({ takeoffRefPageIndex: s.takeoffRefPageIndex + 1, scratchpad: '', scratchpadError: null });
        } else {
          set({ currentPage: 'PERF_INIT', takeoffRefPageIndex: 0, scratchpad: '', scratchpadError: null });
        }
      }
      handled = true;
    }

    else if (key === 'PREV_PAGE') {
      const s = get();
      if (s.currentPage === 'LEGS' && s.legsPageIndex > 0) {
        set({ legsPageIndex: s.legsPageIndex - 1 });
      } else if (s.currentPage === 'RTE' && s.rteSubPage > 0) {
        set({ rteSubPage: s.rteSubPage - 1 });
      } else if (s.currentPage === 'PERF_INIT') {
        set({ currentPage: 'TAKEOFF_REF', takeoffRefPageIndex: 0, scratchpad: '', scratchpadError: null });
      } else if (s.currentPage === 'TAKEOFF_REF') {
        if (s.takeoffRefPageIndex > 0) {
          set({ takeoffRefPageIndex: s.takeoffRefPageIndex - 1, scratchpad: '', scratchpadError: null });
        } else {
          set({ currentPage: 'PERF_INIT', scratchpad: '', scratchpadError: null });
        }
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
      const r = getAirbusPageRenderer(state.currentPage);
      displayData = r ? r(state) : getPageRenderer('MENU')!(state);
    } else {
      const r = getPageRenderer(state.currentPage);
      displayData = r ? r(state) : getPageRenderer('MENU')!(state);
    }
    const action = displayData.lskActions[lskId];

    if (!action) return;

    const scratchpad = state.scratchpad.trim();
    let handled = false;
    let scratchpadMessage = '';

    // Handle page navigation actions
    switch (action) {
      case 'pos_init': state.setPage('POS_INIT'); handled = true; break;
      case 'perf_init': state.setPage('PERF_INIT'); handled = true; break;
      case 'rte': state.setPage('RTE'); handled = true; break;
      case 'dep_arr': state.setPage('DEP_ARR'); handled = true; break;
      case 'legs': state.setPage('LEGS'); handled = true; break;
      case 'thrust_lim': state.setPage('THRUST_LIM'); handled = true; break;
      case 'takeoff_ref': state.setPage('TAKEOFF_REF'); handled = true; break;
      case 'menu': state.setPage('MENU'); handled = true; break;
      case 'ident': state.setPage('IDENT'); handled = true; break;
      case 'next_page': state.pressKey('NEXT_PAGE'); handled = true; break;
      case 'prev_page': state.pressKey('PREV_PAGE'); handled = true; break;
      case 'dep_page': set({ depArrSubPage: 'DEP' }); handled = true; break;
      case 'arr_page': set({ depArrSubPage: 'ARR' }); handled = true; break;
      case 'atc': handled = true; break;
      case 'des_now':
        set({ scratchpad: 'DES NOW ARMED', scratchpadError: null, msgLight: true });
        handled = true;
        break;
      // Airbus LSK navigation
      case 'init_a': state.setPage('INIT_A'); handled = true; break;
      case 'init_b': state.setPage('INIT_B'); handled = true; break;
      case 'perf_to': state.setPage('PERF_TAKEOFF'); handled = true; break;
      case 'perf_appr': state.setPage('PERF_APPR'); handled = true; break;
      case 'f_pln': state.setPage('F_PLN'); handled = true; break;
      case 'fuel_pred': state.setPage('FUEL_PRED'); handled = true; break;
      case 'sec_fpln': state.setPage('SEC_FPLN'); handled = true; break;
      case 'rad_nav': state.setPage('RAD_NAV'); handled = true; break;
      case 'data_index': state.setPage('DATA_INDEX'); handled = true; break;
      case 'mcdu_menu': state.setPage('MCDU_MENU'); handled = true; break;
      case 'fpln_dep_arr': state.setPage('DEP_ARR_A'); handled = true; break;
      case 'fpln_next': state.pressKey('NEXT_PAGE'); handled = true; break;
      case 'fpln_prev': state.pressKey('PREV_PAGE'); handled = true; break;
    }

    if (!handled && state.currentPage === 'LEGS') {
      const wpMatch = action.match(/^(edit_wp|delete_wp|insert_wp)_(\d+)$/);
      if (wpMatch) {
        const wpAction = wpMatch[1];
        const wpIndex = parseInt(wpMatch[2], 10);
        if (wpAction === 'delete_wp' && state.deleteMode) {
          state.deleteWaypoint(wpIndex);
          handled = true;
        } else if (wpAction === 'edit_wp') {
          if (scratchpad) {
            state.insertWaypoint(wpIndex, scratchpad);
          } else {
            set({ editWaypointIndex: wpIndex, scratchpad: '', scratchpadError: null });
          }
          handled = true;
        }
      }
    }

    // Data entry actions (only if not handled by navigation)
    const updates: Partial<FMCState> = {};

    if (!handled) {
      switch (action) {
        case 'set_ref_airport':
        if (scratchpad) {
          const result = isValidICAO(scratchpad.toUpperCase());
          if (!result.valid) { set({ scratchpadError: result.error }); return; }
          updates.position = { ...state.position, refAirport: scratchpad.toUpperCase() };
        }
        break;
      case 'set_gate':
        if (scratchpad) updates.position = { ...state.position, gate: scratchpad.toUpperCase() };
        break;
      case 'set_crz_alt':
        if (scratchpad) {
          const result = isValidAltitude(scratchpad);
          if (!result.valid) { set({ scratchpadError: result.error }); return; }
          updates.performance = { ...state.performance, crzAlt: parseInt(scratchpad) * 100 || parseInt(scratchpad) || 0 };
        }
        break;
      case 'set_cost_index': {
        if (scratchpad) {
          const ci = parseInt(scratchpad);
          if (isNaN(ci) || ci < 0 || ci > 500) { set({ scratchpadError: 'INVALID ENTRY' }); return; }
          updates.performance = { ...state.performance, costIndex: ci };
        }
        break;
      }
      case 'set_zfw': {
        if (scratchpad) {
          const zfw = parseFloat(scratchpad);
          if (isNaN(zfw) || zfw <= 0) { set({ scratchpadError: 'INVALID ENTRY' }); return; }
          updates.performance = { ...state.performance, zfw: zfw * 1000 };
        }
        break;
      }
      case 'set_reserve': {
        if (scratchpad) {
          const res = parseFloat(scratchpad);
          if (isNaN(res) || res < 0) { set({ scratchpadError: 'INVALID ENTRY' }); return; }
          updates.performance = { ...state.performance, reserve: res * 1000 };
        }
        break;
      }
      case 'set_origin':
        if (scratchpad) {
          const result = isValidICAO(scratchpad.toUpperCase());
          if (!result.valid) { set({ scratchpadError: result.error }); return; }
          const route = state.pendingRoute ?? state.route;
          const flightPlan = state.pendingFlightPlan ?? state.flightPlan;
          updates.pendingRoute = { ...route, origin: scratchpad.toUpperCase() };
          updates.pendingFlightPlan = { ...flightPlan, origin: scratchpad.toUpperCase() };
        }
        break;
      case 'set_dest':
        if (scratchpad) {
          const result = isValidICAO(scratchpad.toUpperCase());
          if (!result.valid) { set({ scratchpadError: result.error }); return; }
          const route = state.pendingRoute ?? state.route;
          const flightPlan = state.pendingFlightPlan ?? state.flightPlan;
          updates.pendingRoute = { ...route, destination: scratchpad.toUpperCase() };
          updates.pendingFlightPlan = { ...flightPlan, destination: scratchpad.toUpperCase() };
        }
        break;
      case 'set_flt_no':
        if (scratchpad) {
          const result = isValidFlightNumber(scratchpad);
          if (!result.valid) { set({ scratchpadError: result.error }); return; }
          const route = state.pendingRoute ?? state.route;
          const flightPlan = state.pendingFlightPlan ?? state.flightPlan;
          updates.pendingRoute = { ...route, flightNumber: scratchpad.toUpperCase() };
          updates.pendingFlightPlan = { ...flightPlan, flightNumber: scratchpad.toUpperCase() };
        }
        break;
      case 'set_route': {
        if (scratchpad) {
          const routeStr = scratchpad.toUpperCase();
          const parsed = parseRouteString(routeStr);
          const route = state.pendingRoute ?? state.route;
          const flightPlan = state.pendingFlightPlan ?? state.flightPlan;
          const waypoints = parsed.waypoints.length > 0 ? parsed.waypoints : [{ ident: parsed.origin, discontinuity: false }, { ident: parsed.destination, discontinuity: false }].filter(w => w.ident);
          updates.pendingRoute = { ...route, routeString: routeStr };
          updates.pendingFlightPlan = { ...flightPlan, waypoints, route: routeStr };
          updates.legsPageCount = Math.max(1, Math.ceil(waypoints.length / 5));
        }
        break;
      }
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
      case 'set_runway': {
        if (scratchpad) {
          if (scratchpad.length < 2) { set({ scratchpadError: 'INVALID ENTRY' }); return; }
          const runway = scratchpad.toUpperCase();
          const runwayChanged = state.takeoff.runway && state.takeoff.runway !== runway;
          const speedsEntered = state.takeoff.v1 > 0 || state.takeoff.vr > 0 || state.takeoff.v2 > 0;
          updates.takeoff = runwayChanged && speedsEntered
            ? { ...state.takeoff, runway, v1: 0, vr: 0, v2: 0 }
            : { ...state.takeoff, runway };
          if (runwayChanged && speedsEntered) {
            updates.msgLight = true;
            scratchpadMessage = 'V SPEEDS DELETED';
          }
        }
        break;
      }
      case 'set_to_mode': {
        if (scratchpad) {
          const mode = scratchpad.toUpperCase();
          if (!['TO', 'TO 1', 'TO 2'].includes(mode)) { set({ scratchpadError: 'INVALID ENTRY' }); return; }
          updates.takeoff = { ...state.takeoff, toMode: mode };
        }
        break;
      }
      case 'set_v1':
        if (scratchpad) {
          const v1 = parseInt(scratchpad) || 0;
          const result = isValidSpeed(scratchpad);
          if (!result.valid) { set({ scratchpadError: result.error }); return; }
          const newTakeoff = { ...state.takeoff, v1 };
          const vsResult = isValidVSpeeds(newTakeoff.v1, newTakeoff.vr, newTakeoff.v2);
          if (!vsResult.valid) { set({ scratchpadError: vsResult.error }); return; }
          updates.takeoff = newTakeoff;
        }
        break;
      case 'set_vr':
        if (scratchpad) {
          const vr = parseInt(scratchpad) || 0;
          const result = isValidSpeed(scratchpad);
          if (!result.valid) { set({ scratchpadError: result.error }); return; }
          const newTakeoff = { ...state.takeoff, vr };
          const vsResult = isValidVSpeeds(newTakeoff.v1, newTakeoff.vr, newTakeoff.v2);
          if (!vsResult.valid) { set({ scratchpadError: vsResult.error }); return; }
          updates.takeoff = newTakeoff;
        }
        break;
      case 'set_v2':
        if (scratchpad) {
          const v2 = parseInt(scratchpad) || 0;
          const result = isValidSpeed(scratchpad);
          if (!result.valid) { set({ scratchpadError: result.error }); return; }
          const newTakeoff = { ...state.takeoff, v2 };
          const vsResult = isValidVSpeeds(newTakeoff.v1, newTakeoff.vr, newTakeoff.v2);
          if (!vsResult.valid) { set({ scratchpadError: vsResult.error }); return; }
          updates.takeoff = newTakeoff;
        }
        break;
      case 'set_trim': {
        if (scratchpad) {
          const trim = parseFloat(scratchpad);
          if (isNaN(trim)) { set({ scratchpadError: 'INVALID ENTRY' }); return; }
          updates.takeoff = { ...state.takeoff, trim };
        }
        break;
      }
      case 'set_oat':
        if (scratchpad) {
          const result = isValidTemperature(scratchpad);
          if (!result.valid) { set({ scratchpadError: result.error }); return; }
          updates.takeoff = { ...state.takeoff, oat: parseInt(scratchpad) || 0 };
        }
        break;
      case 'set_assumed_temp': {
        if (scratchpad) {
          const temp = parseInt(scratchpad);
          if (isNaN(temp)) { set({ scratchpadError: 'INVALID ENTRY' }); return; }
          updates.takeoff = { ...state.takeoff, assumedTemp: temp };
        }
        break;
      }
      case 'set_direct_to': {
        if (scratchpad) {
          const result = isValidWaypoint(scratchpad.toUpperCase());
          if (!result.valid) { set({ scratchpadError: result.error }); return; }
          const route = state.pendingRoute ?? state.route;
          updates.pendingRoute = { ...route, directTo: scratchpad.toUpperCase() };
        }
        break;
      }
      case 'set_wind':
        if (scratchpad) {
          const result = isValidWind(scratchpad);
          if (!result.valid) { set({ scratchpadError: result.error }); return; }
          const parts = scratchpad.split('/');
          if (parts.length === 2) {
            updates.takeoff = { ...state.takeoff, windDir: parseInt(parts[0]) || 0, windSpeed: parseInt(parts[1]) || 0 };
          }
        }
        break;
      case 'set_qnh': {
        if (scratchpad) {
          const qnh = parseFloat(scratchpad);
          if (isNaN(qnh) || qnh < 900 || qnh > 1100) { set({ scratchpadError: 'INVALID ENTRY' }); return; }
          updates.takeoff = { ...state.takeoff, qnh: qnh * 100 };
        }
        break;
      }
      case 'set_landing_runway': {
        if (scratchpad) {
          if (scratchpad.length < 2) { set({ scratchpadError: 'INVALID ENTRY' }); return; }
          const runway = scratchpad.toUpperCase();
          updates.landing = { ...state.landing, runway };
          updates.route = { ...state.route, runway };
        }
        break;
      }
      case 'set_landing_flaps': {
        if (scratchpad) {
          const flaps = scratchpad.toUpperCase();
          if (!['15', '30', '40'].includes(flaps)) { set({ scratchpadError: 'INVALID ENTRY' }); return; }
          updates.landing = { ...state.landing, flaps };
        }
        break;
      }
      case 'set_landing_vref': {
        if (scratchpad) {
          const vref = parseInt(scratchpad, 10);
          if (isNaN(vref) || vref < 80 || vref > 200) { set({ scratchpadError: 'INVALID ENTRY' }); return; }
          updates.landing = { ...state.landing, vref };
        }
        break;
      }
      case 'set_ils_frequency': {
        if (scratchpad) {
          const frequency = parseFloat(scratchpad);
          if (isNaN(frequency) || frequency < 108.1 || frequency > 111.95) { set({ scratchpadError: 'INVALID ENTRY' }); return; }
          updates.landing = { ...state.landing, ilsFrequency: frequency.toFixed(2) };
        }
        break;
      }
      case 'set_ils_course': {
        if (scratchpad) {
          const course = parseInt(scratchpad, 10);
          if (isNaN(course) || course < 1 || course > 360) { set({ scratchpadError: 'OUT OF RANGE' }); return; }
          updates.landing = { ...state.landing, course };
        }
        break;
      }
      // Airbus data entry
      case 'set_from_to': {
        if (scratchpad && scratchpad.includes('/')) {
          const [from, to] = scratchpad.toUpperCase().split('/');
          const fromResult = isValidICAO(from);
          const toResult = isValidICAO(to);
          if (!fromResult.valid) { set({ scratchpadError: fromResult.error }); return; }
          if (!toResult.valid) { set({ scratchpadError: toResult.error }); return; }
          updates.route = { ...state.route, origin: from, destination: to };
          updates.flightPlan = { ...state.flightPlan, origin: from, destination: to };
        }
        break;
      }
      case 'set_crz_fl': {
        if (scratchpad) {
          const result = isValidAltitude(scratchpad);
          if (!result.valid) { set({ scratchpadError: result.error }); return; }
          updates.performance = { ...state.performance, crzAlt: parseInt(scratchpad) * 100 || parseInt(scratchpad) || 0 };
        }
        break;
      }
      case 'set_altn': {
        if (scratchpad) {
          const result = isValidICAO(scratchpad.toUpperCase());
          if (!result.valid) { set({ scratchpadError: result.error }); return; }
          updates.route = { ...state.route, alternate: scratchpad.toUpperCase() };
        }
        break;
      }
      case 'set_block': {
        if (scratchpad) {
          const fuel = parseFloat(scratchpad);
          if (isNaN(fuel) || fuel <= 0) { set({ scratchpadError: 'INVALID ENTRY' }); return; }
          updates.performance = { ...state.performance, fuel: fuel * 1000 };
        }
        break;
      }
      case 'set_flt_nbr': {
        if (scratchpad) {
          const result = isValidFlightNumber(scratchpad);
          if (!result.valid) { set({ scratchpadError: result.error }); return; }
          updates.route = { ...state.route, flightNumber: scratchpad.toUpperCase() };
          updates.flightPlan = { ...state.flightPlan, flightNumber: scratchpad.toUpperCase() };
        }
        break;
      }
      case 'set_sid':
        if (scratchpad) {
          const route = state.pendingRoute ?? state.route;
          updates.pendingRoute = { ...route, sid: scratchpad.toUpperCase() };
        }
        break;
      case 'set_rwy': {
        if (scratchpad) {
          if (scratchpad.length < 2) { set({ scratchpadError: 'INVALID ENTRY' }); return; }
          const route = state.pendingRoute ?? state.route;
          updates.pendingRoute = { ...route, runway: scratchpad.toUpperCase() };
        }
        break;
      }
      case 'set_star':
        if (scratchpad) {
          const route = state.pendingRoute ?? state.route;
          updates.pendingRoute = { ...route, star: scratchpad.toUpperCase() };
        }
        break;
      case 'set_appr':
        if (scratchpad) {
          const route = state.pendingRoute ?? state.route;
          updates.pendingRoute = { ...route, approach: scratchpad.toUpperCase() };
        }
        break;
      case 'set_flaps':
        if (scratchpad) updates.takeoff = { ...state.takeoff, flaps: scratchpad.toUpperCase() };
        break;
      case 'set_flex': {
        if (scratchpad) {
          const temp = parseInt(scratchpad);
          if (isNaN(temp)) { set({ scratchpadError: 'INVALID ENTRY' }); return; }
          updates.takeoff = { ...state.takeoff, flexTemp: temp };
        }
        break;
      }
      case 'set_cg': {
        if (scratchpad) {
          const cg = parseFloat(scratchpad);
          if (isNaN(cg)) { set({ scratchpadError: 'INVALID ENTRY' }); return; }
          updates.performance = { ...state.performance, cg };
        }
        break;
      }
      case 'set_extra':
        break;
      case 'set_fix_ref':
      case 'set_fix_ref_0':
      case 'set_fix_ref_1':
        if (scratchpad) {
          const result = isValidWaypoint(scratchpad.toUpperCase());
          if (!result.valid) { set({ scratchpadError: result.error }); return; }
          const entryIndex = action.endsWith('_1') ? 1 : 0;
          const fixEntries = ensureFixEntries(state.fixEntries, state.fix);
          fixEntries[entryIndex] = { ...fixEntries[entryIndex], refFix: scratchpad.toUpperCase() };
          updates.fixEntries = fixEntries;
          if (entryIndex === 0) updates.fix = fixEntries[0];
        }
        break;
      case 'set_fix_radial_distance':
      case 'set_fix_radial_distance_0':
      case 'set_fix_radial_distance_1':
        if (scratchpad) {
          const parts = scratchpad.split('/');
          if (parts.length !== 2) { set({ scratchpadError: 'INVALID FORMAT' }); return; }
          const radial = parseInt(parts[0], 10);
          const distance = parseInt(parts[1], 10);
          if (isNaN(radial) || radial < 1 || radial > 360) { set({ scratchpadError: 'INVALID RADIAL' }); return; }
          if (isNaN(distance) || distance < 0 || distance > 999) { set({ scratchpadError: 'INVALID DISTANCE' }); return; }
          const entryIndex = action.endsWith('_1') ? 1 : 0;
          const fixEntries = ensureFixEntries(state.fixEntries, state.fix);
          fixEntries[entryIndex] = { ...fixEntries[entryIndex], radial, distance };
          updates.fixEntries = fixEntries;
          if (entryIndex === 0) updates.fix = fixEntries[0];
        }
        break;
      case 'set_hold_fix':
        if (scratchpad) {
          const ident = scratchpad.toUpperCase();
          const result = isValidWaypoint(ident);
          if (!result.valid) { set({ scratchpadError: result.error }); return; }
          if (!isFixInActiveRoute(state, ident)) { set({ scratchpadError: 'NOT IN ROUTE' }); return; }
          state.setHoldFix(ident);
          handled = true;
        }
        break;
      case 'set_inbound_crs':
        if (scratchpad) {
          const crs = parseInt(scratchpad, 10);
          if (isNaN(crs) || crs < 1 || crs > 360) { set({ scratchpadError: 'OUT OF RANGE' }); return; }
          state.setInboundCourse(crs);
          handled = true;
        }
        break;
      case 'set_leg_time':
        if (scratchpad) {
          const time = parseFloat(scratchpad);
          if (isNaN(time) || time <= 0 || time > 9.9) { set({ scratchpadError: 'OUT OF RANGE' }); return; }
          state.setLegTime(time);
          handled = true;
        }
        break;
      case 'set_leg_dist':
        if (scratchpad) {
          const dist = parseFloat(scratchpad);
          if (isNaN(dist) || dist < 0 || dist > 999) { set({ scratchpadError: 'OUT OF RANGE' }); return; }
          state.setLegDist(dist);
          handled = true;
        }
        break;
      case 'set_hold_direction':
        if (scratchpad) {
          const dir = scratchpad.toUpperCase();
          if (dir !== 'L' && dir !== 'R') { set({ scratchpadError: 'INVALID ENTRY' }); return; }
          state.setHoldDirection(dir as 'L' | 'R');
          handled = true;
        }
        break;
    }
    } // close if (!handled)

    if (Object.keys(updates).length > 0) {
      set({ isModified: true, execLit: true, scratchpad: scratchpadMessage, scratchpadError: null, ...updates });
    }

    // Tutorial: advance on LSK press (check action matches expectedAction OR validate passes)
    const { tutorialActive } = get();
    if (tutorialActive) {
      const scenario = findTutorial(get().tutorialScenario || '');
      if (scenario) {
        const step = scenario.steps[get().tutorialStepIndex];
        if (step) {
          const actionMatches = action === step.expectedAction;
          const validatePasses = step.validate ? step.validate(scratchpad) : true;
          if (actionMatches || validatePasses) {
            get().advanceTutorial();
          } else {
            get().recordTutorialError();
          }
        }
      }
    }
  },

  clearScratchpad: () => {
    set({ scratchpad: '', scratchpadError: null });
  },

  pressEXEC: () => {
    const state = get();
    if (state.editWaypointIndex !== null && state.scratchpad.trim()) {
      const scratchpad = state.scratchpad.trim();
      const idx = state.editWaypointIndex;
      let altitude: AltitudeConstraint | undefined;
      let speed: SpeedConstraint | undefined;

      const altMatch = scratchpad.match(/^(\d{3,5})$/);
      const spdMatch = scratchpad.match(/^\/(\d{3})$/);
      const bothMatch = scratchpad.match(/^(\d{3,5})\/(\d{3})$/);

      if (bothMatch) {
        const alt = parseInt(bothMatch[1], 10);
        const spd = parseInt(bothMatch[2], 10);
        altitude = { type: 'AT', altitude: alt >= 1000 ? alt : alt * 100 };
        speed = { type: 'AT', speed: spd };
      } else if (spdMatch) {
        speed = { type: 'AT', speed: parseInt(spdMatch[1], 10) };
      } else if (altMatch) {
        const alt = parseInt(altMatch[1], 10);
        altitude = { type: 'AT', altitude: alt >= 1000 ? alt : alt * 100 };
      } else {
        set({ scratchpadError: 'INVALID FORMAT' });
        return;
      }

      state.updateWaypointConstraint(idx, altitude, speed);
      return;
    }

    const execUpdates: Partial<FMCState> = {};
    if (state.holdPending) {
      execUpdates.hold = state.holdPending;
      execUpdates.holdPending = null;
    }
    if (state.pendingRoute) {
      execUpdates.route = state.pendingRoute;
      execUpdates.pendingRoute = null;
    }
    if (state.pendingFlightPlan) {
      execUpdates.flightPlan = state.pendingFlightPlan;
      execUpdates.pendingFlightPlan = null;
    }

    if (state.execLit) {
      execUpdates.execLit = false;
      execUpdates.isModified = false;
      execUpdates.msgLight = false;
    }

    if (Object.keys(execUpdates).length > 0) {
      set(execUpdates);
    }
  },

  getDisplayData: () => {
    const state = get();
    if (state.mode === 'FAIL') {
      return {
        title: 'FAIL',
        pageIndicator: '',
        lines: [
          { text: '                        ', leftLabel: '', rightLabel: '', inverse: false },
          { text: '        FAIL            ', leftLabel: '', rightLabel: '', inverse: true, color: 'red' },
          { text: '                        ', leftLabel: '', rightLabel: '', inverse: false },
          { text: '                        ', leftLabel: '', rightLabel: '', inverse: false },
          { text: '                        ', leftLabel: '', rightLabel: '', inverse: false },
          { text: '                        ', leftLabel: '', rightLabel: '', inverse: false },
          { text: '                        ', leftLabel: '', rightLabel: '', inverse: false },
          { text: '                        ', leftLabel: '', rightLabel: '', inverse: false },
          { text: '                        ', leftLabel: '', rightLabel: '', inverse: false },
          { text: '                        ', leftLabel: '', rightLabel: '', inverse: false },
          { text: '                        ', leftLabel: '', rightLabel: '', inverse: false },
          { text: '                        ', leftLabel: '', rightLabel: '', inverse: false },
          { text: '                        ', leftLabel: '', rightLabel: '', inverse: false },
        ],
        lskActions: {},
      };
    }
    if (state.mode === 'OFF') {
      return {
        title: 'OFF',
        pageIndicator: '',
        lines: Array(13).fill({ text: '                        ', leftLabel: '', rightLabel: '', inverse: false }),
        lskActions: {},
      };
    }
    if (state.externalDisplayData && state.connectionMode === 'CONTROL') {
      return state.externalDisplayData;
    }
    if (state.aircraft === 'AIRBUS_A320') {
      const renderer = getAirbusPageRenderer(state.currentPage);
      if (renderer) return renderer(state);
    }
    const renderer = getPageRenderer(state.currentPage);
    return renderer ? renderer(state) : getPageRenderer('MENU')!(state);
  },

  setMode: (mode: FMCMode) => set({ mode }),
  setConnectionStatus: (status: ConnectionStatus) => set({ connectionStatus: status }),
  setConnectionMode: (mode: ConnectionMode) => set({ connectionMode: mode }),
  setConnectionDiagnostics: (diagnostics: Partial<ConnectionDiagnostics>) => set(diagnostics),
  setSimVariables: (variables: Record<string, number>) => set((state) => ({
    simVariables: { ...state.simVariables, ...variables },
  })),
  setAircraftState: (state: FMCState['aircraftState']) => set({ aircraftState: state }),
  setConnectedAircraft: (aircraft: string | null, capabilities?: string[] | null, aircraftType?: AircraftType | null) => set({
    connectedAircraft: aircraft,
    connectedCapabilities: capabilities ?? [],
    connectedAircraftType: aircraftType ?? null,
  }),
  setConnectedLastError: (error: string | null) => set({ lastError: error }),
  setExternalDisplayData: (data: DisplayData | null) => set({
    externalDisplayData: data,
    scratchpadError: data?.scratchpadError ?? null,
  }),
  setFailureMode: (mode, message) => set({ mode, failureMessage: message || (mode === 'FAIL' ? 'FMC FAILURE' : 'CDU OFF') }),
  clearFailureMode: () => set({ mode: 'ACTIVE', failureMessage: null }),

  loadFlightPlan: (data) => {
    set((state) => {
      const origin = data.origin || state.flightPlan.origin || state.route.origin;
      const destination = data.destination || state.flightPlan.destination || state.route.destination;
      const route = data.route || state.flightPlan.route || state.route.routeString;
      const parsed = route ? parseRouteString([origin, route, destination].filter(Boolean).join(' ')) : null;
      const waypoints = data.waypoints ?? parsed?.waypoints ?? state.flightPlan.waypoints;
      return {
        flightPlan: { ...state.flightPlan, ...data, origin, destination, route, waypoints },
        route: { ...state.route, origin, destination, routeString: route },
        legsPageCount: Math.max(1, Math.ceil(waypoints.length / 5)),
        msgLight: true,
      };
    });
  },

  resetState: () => set(defaultState),

  insertWaypoint: (index: number, ident: string) => {
    const state = get();
    const result = isValidWaypoint(ident.toUpperCase());
    if (!result.valid) { set({ scratchpadError: result.error }); return; }
    const waypoints = [...(state.pendingFlightPlan?.waypoints ?? state.flightPlan.waypoints)];
    const nextWaypoint = { ident: ident.toUpperCase(), discontinuity: false };
    if (waypoints[index]?.discontinuity) {
      waypoints[index] = nextWaypoint;
    } else {
      waypoints.splice(index, 0, nextWaypoint);
    }
    set({
      pendingFlightPlan: { ...(state.pendingFlightPlan ?? state.flightPlan), waypoints },
      isModified: true,
      execLit: true,
      scratchpad: '',
      scratchpadError: null,
    });
  },

  deleteWaypoint: (index: number) => {
    const state = get();
    const waypoints = [...(state.pendingFlightPlan?.waypoints ?? state.flightPlan.waypoints)];
    if (index >= 0 && index < waypoints.length) {
      waypoints.splice(index, 1);
      set({
        pendingFlightPlan: { ...(state.pendingFlightPlan ?? state.flightPlan), waypoints },
        isModified: true,
        execLit: true,
        deleteMode: false,
        scratchpad: '',
        scratchpadError: null,
      });
    }
  },

  updateWaypointConstraint: (index: number, altitude?: AltitudeConstraint, speed?: SpeedConstraint) => {
    const state = get();
    const waypoints = [...state.flightPlan.waypoints];
    if (index >= 0 && index < waypoints.length) {
      waypoints[index] = { ...waypoints[index], altitudeConstraint: altitude, speedConstraint: speed };
      set({
        flightPlan: { ...state.flightPlan, waypoints },
        isModified: true,
        execLit: true,
        editWaypointIndex: null,
        scratchpad: '',
        scratchpadError: null,
      });
    }
  },

  setAircraft: (type: AircraftType) => {
    const startPage = type === 'BOEING_737' ? 'IDENT' as PageType : 'INIT_A' as PageType;
    set({
      ...defaultState,
      aircraft: type,
      currentPage: startPage,
      pageHistory: [],
    });
  },

  setFixRef: (ident: string) => {
    const state = get();
    const fixEntries = ensureFixEntries(state.fixEntries, state.fix);
    fixEntries[0] = { ...fixEntries[0], refFix: ident.toUpperCase() };
    set({ fix: fixEntries[0], fixEntries });
  },

  setFixRadialDistance: (radial: number, distance: number) => {
    const state = get();
    const fixEntries = ensureFixEntries(state.fixEntries, state.fix);
    fixEntries[0] = { ...fixEntries[0], radial, distance };
    set({ fix: fixEntries[0], fixEntries });
  },

  setHoldFix: (ident: string) => {
    const state = get();
    const base = state.holdPending ?? state.hold;
    set({ holdPending: { ...base, fix: ident.toUpperCase() }, isModified: true, execLit: true, scratchpad: '', scratchpadError: null });
  },

  setInboundCourse: (crs: number) => {
    const state = get();
    const base = state.holdPending ?? state.hold;
    set({ holdPending: { ...base, inboundCourse: crs }, isModified: true, execLit: true, scratchpad: '', scratchpadError: null });
  },

  setLegTime: (time: number) => {
    const state = get();
    const base = state.holdPending ?? state.hold;
    set({ holdPending: { ...base, legTime: time }, isModified: true, execLit: true, scratchpad: '', scratchpadError: null });
  },

  setLegDist: (dist: number) => {
    const state = get();
    const base = state.holdPending ?? state.hold;
    set({ holdPending: { ...base, legDist: dist }, isModified: true, execLit: true, scratchpad: '', scratchpadError: null });
  },

  setHoldDirection: (dir: 'L' | 'R') => {
    const state = get();
    const base = state.holdPending ?? state.hold;
    set({ holdPending: { ...base, direction: dir }, isModified: true, execLit: true, scratchpad: '', scratchpadError: null });
  },

  // ---- Tutorial ----
  startTutorial: (scenarioName: string) => {
    const scenario = findTutorial(scenarioName);
    if (!scenario) { return; }
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
    const target = pageMap[firstStep.page] || firstStep?.page || 'IDENT';
    
    set({
      tutorialActive: true,
      tutorialScenario: scenarioName,
      tutorialStepIndex: 0,
      tutorialCompleted: false,
      tutorialHighlight: firstStep?.highlightField || null,
      tutorialErrors: 0,
      tutorialStartTime: Date.now(),
      tutorialHint: null,
      tutorialSkipAvailable: false,
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
      const elapsed = state.tutorialStartTime ? Date.now() - state.tutorialStartTime : 0;
      const metrics = {
        scenario: tutorialScenario,
        errors: state.tutorialErrors,
        timeMs: elapsed,
        completedAt: Date.now(),
      };
      try {
        const history = JSON.parse(localStorage.getItem('cdu-tutorial-metrics') || '[]');
        history.push(metrics);
        localStorage.setItem('cdu-tutorial-metrics', JSON.stringify(history.slice(-20)));
      } catch {
        devError('[Tutorial] Failed to save metrics');
      }
      set({
        tutorialActive: false,
        tutorialCompleted: true,
        tutorialHighlight: null,
        tutorialHint: null,
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
      tutorialErrors: 0,
      tutorialStartTime: null,
      tutorialHint: null,
      tutorialSkipAvailable: false,
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

  recordTutorialError: () => {
    const state = get();
    const newErrors = state.tutorialErrors + 1;
    set({
      tutorialErrors: newErrors,
      tutorialSkipAvailable: newErrors >= 3,
      tutorialHint: state.tutorialHint || 'Check the highlighted field and try again.',
    });
  },

  skipTutorialStep: () => {
    const state = get();
    if (!state.tutorialActive) return;
    get().advanceTutorial();
  },

  clearTutorialHint: () => set({ tutorialHint: null }),
}));
