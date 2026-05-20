import { create } from 'zustand';
import type {
  FMCState,
  AircraftState,
  PageType,
  DisplayData,
  CDUKey,
  LSKId,
  ConnectionMode,
  FMCMode,
  ConnectionStatus,
  TutorialScenario,
  AircraftType,
  AltitudeConstraint,
  SpeedConstraint,
  EFISState,
  RouteData,
  FlightPlan,
  FlightPlanWaypoint,
  AdapterCapabilities,
  AdapterHealth,
  BoeingMCPState,
  AirbusFCUState,
  AutopilotState,
  CockpitLayoutMode,
  PanelId,
  IrsState,
  NavSource,
  NavSensor,
  NavigationPerformance,
  FlightDeckAlert,
  FlightPhase,
  FmcMessage,
  MessageSeverity,
  AcarsMessage,
} from '@shared';
import {
  SCRATCHPAD_MAX,
  PAGE_LINES,
  PAGE_WIDTH,
  getPageRenderer,
  getAirbusPageRenderer,
  parseRouteString,
  getTutorialScenario,
  airbusTutorialScenarios,
  processBoeingMCPAction,
  expandRoute,
  getWaypoint,
  getAirport,
  TrainingScenario,
  TrainingStep,
  TrainingMistake,
  TrainingScore,
  TrainingScenarioEngine,
  ExpectedAction,
  boeingLessons,
  airbusLessons,
  progressManager,
  PhaseManager,
  LegSequencer,
  PerformanceEngine,
  AutoflightModeManager,
  AutoflightTruthState,
  LateralMode,
  VerticalMode,
  ThrustMode,
} from '@shared';
import { useAircraftStore } from './aircraftStore';
import { useAutopilotStore } from './autopilotStore';
import { useCockpitLayoutStore } from './cockpitLayoutStore';
import { useConnectionStore } from './connectionStore';
import {
  selectFmcPositionSource,
  calculateANP,
  DEFAULT_RNP,
  calculateGroundSpeedAndTrack,
  calculateIrsDrift,
  FmsRuntimeEngine,
  loadIntoCache,
  loadProceduresIntoCache,
  populateNavDb,
} from '@shared';
import { parseWaypointInput } from '@shared/fmc/waypointParser';
import { distanceNm } from '@shared/fmc/ndGeometry';
import { alertBus } from '../services/AlertBus';
import { AuralAlertService } from '../services/AuralAlertService';
import {
  fmcTypeChar,
  fmcClrKey,
  fmcDelKey,
  fmcClearBuffer,
  fmcPageChange,
  fmcExecClear,
  fmcPushMessage,
  applyFmcActionResult,
  applyDispatchResult,
  ZustandSet,
  ZustandGet,
  failScratchpad,
} from '@shared/fmc/fmcScratchpadAdapter';
import { getActiveDisplay, createInitialScratchpadState } from '@shared/fmc/scratchpadEngine';
import type { FmcActionResult } from '@shared/fmc/actionHandlers/actionResult';
import { dispatchLskAction } from '@shared/fmc/actionHandlers/lskDispatcher';
import { devLog, devError, devWarn } from '@shared';
import { getRecommendedHiddenPanels, getTrainingModeConfig } from '../config/trainingModes';
import { DisplayColor } from '@shared/fmc/displayColors';
import type { DisplaySemantic } from '@shared/types/fmc';

const BOEING_ACTION_MAP: Record<string, string> = {
  LNAV: 'lnav',
  VNAV: 'vnav',
  LVL_CHG: 'lvlChg',
  HDG_SEL: 'hdgSel',
  VOR_LOC: 'vorLoc',
  APP: 'app',
  ALT_HLD: 'altHold',
  VS: 'vs',
  N1: 'n1',
  SPEED: 'speedMode',
  cmdA: 'cmdA',
  cmdB: 'cmdB',
  cwsA: 'cwsA',
  cwsB: 'cwsB',
  SPD_MACH_TOGGLE: 'SPD_MACH_TOGGLE',
};

type InstrumentPanelId = Extract<PanelId, 'cdu' | 'nd' | 'pfd' | 'autoflight'>;

const defaultInstrumentZoom: Record<InstrumentPanelId, number> = {
  cdu: 1.35,
  nd: 1,
  pfd: 1,
  autoflight: 1,
};

const instrumentPanelIds: InstrumentPanelId[] = ['cdu', 'nd', 'pfd', 'autoflight'];

function isInstrumentPanelId(panelId: PanelId): panelId is InstrumentPanelId {
  return instrumentPanelIds.includes(panelId as InstrumentPanelId);
}

function clampInstrumentZoom(zoom: number): number {
  if (!Number.isFinite(zoom)) return 1;
  return Math.min(1.8, Math.max(0.72, Number(zoom.toFixed(2))));
}

function modeZoomDefaults(mode: CockpitLayoutMode): Record<InstrumentPanelId, number> {
  const config = getTrainingModeConfig(mode);
  return {
    ...defaultInstrumentZoom,
    ...Object.fromEntries(
      Object.entries(config.defaultZoom)
        .filter(([panelId]) => isInstrumentPanelId(panelId as PanelId))
        .map(([panelId, zoom]) => [panelId, clampInstrumentZoom(Number(zoom))]),
    ),
  } as Record<InstrumentPanelId, number>;
}

import { ScenarioEngine, GpwsEngine, TcasEngine } from '@shared';
export const scenarioEngine = new ScenarioEngine();
export const gpwsEngine = new GpwsEngine();
export const tcasEngine = new TcasEngine();

function findTutorial(scenarioName: string): TutorialScenario | undefined {
  return getTutorialScenario(scenarioName) || airbusTutorialScenarios.find((s) => s.name === scenarioName);
}

function isFixInActiveRoute(state: FMCState, ident: string): boolean {
  const flightPlan = state.pendingFlightPlan ?? state.flightPlan;
  const routeFixes = new Set(
    [flightPlan.origin, flightPlan.destination, ...flightPlan.waypoints.map((wp) => wp.ident)]
      .filter(Boolean)
      .map((fix) => fix.toUpperCase()),
  );

  return routeFixes.size === 0 || routeFixes.has(ident.toUpperCase());
}

function ensureFixEntries(entries: FMCState['fixEntries'], legacy: FMCState['fix']): FMCState['fixEntries'] {
  return [{ ...(entries[0] ?? legacy) }, { ...(entries[1] ?? { refFix: '', radial: 0, distance: 0 }) }];
}

function getTrainingHighlight(step: TrainingStep): string | null {
  if (step.highlightControl) return step.highlightControl;
  const action = step.expectedAction;
  if (!action) return null;
  switch (action.type) {
    case 'press_key':
      return action.key;
    case 'press_lsk':
      return `${action.side}${action.index}`;
    case 'set_mcp':
      const fieldMap: Record<string, string> = {
        fdLeft: 'FD_LEFT',
        speed: 'IAS_SEL',
        heading: 'HDG_SEL_BTN',
        altitude: 'ALT_SEL',
        cmdA: 'CMD_A',
        lnav: 'LNAV',
        vnav: 'VNAV',
        app: 'APP_MODE',
      };
      return fieldMap[action.field] || null;
    default:
      return null;
  }
}

// ---- Default initial state ----
function createDefaultEFIS(aircraft: AircraftType, side: 'L' | 'R'): EFISState {
  return {
    mode: aircraft === 'AIRBUS_A320' ? 'ARC' : 'MAP',
    range: 40,
    overlays: {
      wpt: true,
      arpt: true,
      sta: true,
      data: true,
      pos: false,
      terr: false,
      wxr: false,
      tfc: true,
      cstr: aircraft === 'AIRBUS_A320',
    },
    centered: false,
    side,
  };
}

const defaultState: FMCState &
  ConnectionDiagnostics &
  TutorialState &
  TrainingState & {
    brightness: number;
    cockpitLayoutMode: CockpitLayoutMode;
    hiddenPanels: PanelId[];
    pinnedPanels: PanelId[];
    focusedPanel: PanelId | null;
    instrumentZoom: Record<InstrumentPanelId, number>;
    highContrast: boolean;
    dbInitializationState: 'idle' | 'loading' | 'ready' | 'error';
    dbInitializationProgress: number;
  } = {
  dbInitializationState: 'idle' as const,
  dbInitializationProgress: 0,
  page: 'IDENT' as PageType,
  currentPage: 'IDENT' as PageType,
  pageHistory: [] as PageType[],
  scratchpad: '',
  scratchpadError: null as string | null,
  scratchpadState: createInitialScratchpadState(),
  demoMode: false,

  aircraft: 'BOEING_737' as AircraftType,
  ident: { aircraftType: '737-800', engRating: '26K', navDataVersion: 'FMC21A1', opProgram: '2247662-03' },
  position: {
    refAirport: '',
    gate: '',
    lat: 0,
    lon: 0,
    irsState: 'NAV' as IrsState,
    irsAlignmentProgress: 100,
    irsTimeRemaining: 0,
  },
  performance: { crzAlt: 0, costIndex: 0, zfw: 0, fuel: 0, cg: 0, reserve: 0, grossWeight: 0 },
  takeoff: {
    runway: '',
    toMode: 'TO',
    assumedTemp: 0,
    v1: 0,
    vr: 0,
    v2: 0,
    trim: 0,
    oat: 0,
    windDir: 0,
    windSpeed: 0,
    qnh: 0,
  },
  landing: { runway: '', flaps: '', vref: 0, ilsFrequency: '', course: 0 },
  radios: { vor1: '113.90', vor2: '115.70', adf1: '342' },
  signsOn: false,
  windowsLocked: false,

  mode: 'STANDBY' as FMCMode,
  connectionStatus: 'DISCONNECTED' as ConnectionStatus,
  connectionMode: 'STANDALONE' as ConnectionMode,
  connectedAircraft: null as string | null,
  connectedAircraftType: null as AircraftType | null,
  connectedCapabilities: null as string[] | null,
  structuredCapabilities: null as AdapterCapabilities | null,
  adapterHealth: null as AdapterHealth | null,
  lastError: null as string | null,
  simVariables: {} as Record<string, number>,

  autopilot: {
    boeing: {
      courseL: 0,
      courseR: 0,
      speed: 100,
      mach: null,
      heading: 0,
      altitude: 10000,
      verticalSpeed: 0,
      fdLeft: false,
      fdRight: false,
      autothrottleArm: false,
      n1: false,
      speedMode: false,
      lnav: false,
      vnav: false,
      lvlChg: false,
      hdgSel: false,
      vorLoc: false,
      app: false,
      altHold: false,
      vs: false,
      cmdA: false,
      cmdB: false,
      cwsA: false,
      cwsB: false,
    },
    airbus: {
      speed: 100,
      speedManaged: true,
      heading: 0,
      headingManaged: true,
      altitude: 10000,
      altitudeManaged: true,
      verticalSpeed: 0,
      fpa: 0,
      fd1: false,
      fd2: false,
      athr: false,
      ap1: false,
      ap2: false,
      loc: false,
      appr: false,
      exped: false,
      hdgTrkMode: 'HDG_VS' as const,
      metricAltitude: false,
      speedMachMode: 'SPD' as const,
    },
    truth: {
      lateralActive: 'OFF' as const,
      verticalActive: 'OFF' as const,
      thrustActive: 'OFF' as const,
      autopilotStatus: 'OFF' as const,
      lastModeChangeTimestamps: {
        thrust: 0,
        lateral: 0,
        vertical: 0,
      },
    },
  },

  cockpitMode: true,
  cockpitLayoutMode: 'fmc-focus' as CockpitLayoutMode,
  hiddenPanels: getRecommendedHiddenPanels('fmc-focus') as PanelId[],
  pinnedPanels: [] as PanelId[],
  focusedPanel: null as PanelId | null,
  instrumentZoom: { ...defaultInstrumentZoom },
  highContrast: false,
  brightness: 100,

  route: {
    origin: '',
    destination: '',
    flightNumber: '',
    routeString: '',
    companyRoute: '',
    sid: null,
    star: null,
    approach: null,
    coRoute: '',
    runway: '',
  },
  flightPlan: { origin: '', destination: '', flightNumber: '', route: '', waypoints: [] },

  pendingRoute: null as RouteData | null,
  pendingFlightPlan: null as FlightPlan | null,

  isModified: false,
  execLit: false,
  msgLight: false,

  failureMessage: null as string | null,
  externalDisplayData: null as DisplayData | null,

  // FMS Ecosystem state
  navPerformance: {
    anp: 2.0,
    rnp: 2.0,
    anpNm: 2.0,
    rnpNm: 2.0,
    rnpManual: false,
    activeSource: 'IRS',
    phase: 'ENROUTE',
  } as NavigationPerformance,
  activeNavSource: 'IRS' as NavSource,
  sensors: [
    { source: 'GPS', available: true, positionErrorNm: 0.05 },
    { source: 'DME_DME', available: false, positionErrorNm: 0.15 },
    { source: 'IRS', available: true, positionErrorNm: 2.0 },
  ] as NavSensor[],
  alerts: [] as FlightDeckAlert[],

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
  tutorialHintLevel: 0,
  tutorialHintTimer: null as number | null,
  tutorialConfidence: null as number | null,

  // New Training state
  trainingActive: false,
  trainingScenario: null as TrainingScenario | null,
  trainingEngine: null as TrainingScenarioEngine | null,
  trainingMistakes: [] as TrainingMistake[],
  trainingScore: null as TrainingScore | null,
  trainingStepIndex: 0,
  trainingCompleted: false,
  debriefMode: false,
  activeScenario: null as TrainingScenario | null,
  isReportVisible: false,

  hold: { fix: '', inboundCourse: 0, legTime: 1.0, legDist: 0, direction: 'R' as const },
  holdPending: null,
  fix: { refFix: '', radial: 0, distance: 0 },
  fixEntries: [
    { refFix: '', radial: 0, distance: 0 },
    { refFix: '', radial: 0, distance: 0 },
  ],

  legsPageIndex: 0,
  legsPageCount: 1,
  depArrSubPage: 'DEP' as const,
  rteSubPage: 0,
  takeoffRefPageIndex: 0,
  selectedPlanWaypointIndex: null,
  flightPathHistory: [] as { lat: number; lon: number; timestamp: number }[],

  atsu: {
    messages: [] as AcarsMessage[],
    pendingUplink: null,
  },

  deleteMode: false,
  editWaypointIndex: null as number | null,

  latency: 0,
  sessionStartTime: null as number | null,

  efisL: createDefaultEFIS('BOEING_737', 'L'),
  efisR: createDefaultEFIS('BOEING_737', 'R'),

  // New logic systems
  aircraftState: null as AircraftState | null,
  flightPhase: 'PREFLIGHT' as FlightPhase,
  scratchpadMessages: [] as FmcMessage[],
  posPageIndex: 0,
  trafficTargets: [],
  selectedMessageId: null as string | null,
  gpwsAlert: 'NONE',
  tcasAlert: false,
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
  setConnectedAircraft: (
    aircraft: string | null,
    capabilities?: string[] | null,
    aircraftType?: AircraftType | null,
  ) => void;
  setConnectedLastError: (error: string | null) => void;
  setExternalDisplayData: (data: DisplayData | null) => void;
  setFailureMode: (mode: 'FAIL' | 'OFF', message?: string) => void;
  clearFailureMode: () => void;
  setBrightness: (b: number) => void;
  initNavDb: () => Promise<void>;

  updateFlightPhase: () => void;
  receiveAtsuMessage: (from: string, text: string) => void;
  tick: (dtSeconds: number) => void;

  loadFlightPlan: (data: Partial<FMCState['flightPlan']> & { route: string; waypoints?: FlightPlanWaypoint[] }) => void;
  resetState: () => void;
  setAircraft: (type: AircraftType) => void;
  updateBoeingMCP: (update: Partial<BoeingMCPState>) => void;
  updateAirbusFCU: (update: Partial<AirbusFCUState>) => void;
  pressMCPButton: (action: string) => void;

  // Waypoint editing actions
  insertWaypoint: (index: number, ident: string) => void;
  deleteWaypoint: (index: number) => void;
  updateWaypointConstraint: (index: number, altitude?: AltitudeConstraint, speed?: SpeedConstraint) => void;

  // Plan review actions
  setSelectedPlanWaypoint: (index: number | null) => void;
  stepPlanForward: () => void;
  stepPlanBackward: () => void;
  resetPlanWaypoint: () => void;

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
  resetTutorialHints: () => void;
  setTutorialConfidence: (stars: number) => void;
  expandActiveRoute: () => void;
  setLatency: (ms: number) => void;
  setSessionStartTime: (time: number | null) => void;

  // Training actions
  startTraining: (scenarioId: string) => void;
  stopTraining: () => void;
  processTrainingAction: (action: ExpectedAction) => void;
  setDebriefMode: (active: boolean) => void;

  setNDMode: (side: 'L' | 'R', mode: string) => void;
  setNDRange: (side: 'L' | 'R', range: number) => void;
  toggleNDOverlay: (side: 'L' | 'R', key: keyof EFISState['overlays']) => void;
  toggleNDCenter: (side: 'L' | 'R') => void;

  setRteSubPage: (page: number) => void;
  setTakeoffRefPageIndex: (page: number) => void;
  setCockpitMode: (enabled: boolean) => void;
  setCockpitLayoutMode: (mode: CockpitLayoutMode) => void;
  setHiddenPanels: (panels: PanelId[]) => void;
  setPinnedPanels: (panels: PanelId[]) => void;
  setFocusedPanel: (panel: PanelId | null) => void;
  togglePanelHidden: (panelId: PanelId) => void;
  togglePanelPinned: (panelId: PanelId) => void;
  restoreRecommendedLayout: () => void;
  setInstrumentZoom: (panelId: InstrumentPanelId, zoom: number) => void;
  adjustInstrumentZoom: (panelId: InstrumentPanelId, delta: number) => void;
  resetInstrumentZoom: (panelId: InstrumentPanelId) => void;
  setHighContrast: (enabled: boolean) => void;
  toggleHighContrast: () => void;
  setDemoMode: (demo: boolean) => void;

  toggleSigns: (playChime?: boolean) => void;
  toggleWindows: () => void;

  setIrsMode: (mode: IrsState) => void;
  updateFmsEcosystem: () => void;
  clearAlert: (id: string) => void;

  highlightControl: (controlId: string) => void;

  // Message actions
  addMessage: (text: string, severity: MessageSeverity, type?: 1 | 2) => void;
  clearActiveMessage: () => void;
}

interface ConnectionDiagnostics {
  connectedAircraft: string | null;
  connectedAircraftType: AircraftType | null;
  connectedCapabilities: string[] | null;
  structuredCapabilities: AdapterCapabilities | null;
  adapterHealth: AdapterHealth | null;
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
  tutorialHintLevel: number; // 0=none, 1=glow, 2=tooltip, 3=arrow
  tutorialHintTimer: number | null;
  tutorialConfidence: number | null;
}

interface TrainingState {
  trainingActive: boolean;
  trainingScenario: TrainingScenario | null;
  trainingEngine: TrainingScenarioEngine | null;
  trainingMistakes: TrainingMistake[];
  trainingScore: TrainingScore | null;
  trainingStepIndex: number;
  trainingCompleted: boolean;
  debriefMode: boolean;
  activeScenario: TrainingScenario | null;
  isReportVisible: boolean;
}

export type FMCStore = FMCState &
  ConnectionDiagnostics &
  TutorialState &
  TrainingState &
  FMCActions & {
    brightness: number;
    cockpitLayoutMode: CockpitLayoutMode;
    hiddenPanels: PanelId[];
    pinnedPanels: PanelId[];
    focusedPanel: PanelId | null;
    instrumentZoom: Record<InstrumentPanelId, number>;
    highContrast: boolean;
    dbInitializationState: 'idle' | 'loading' | 'ready' | 'error';
    dbInitializationProgress: number;
  };

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
    FUEL_PRED: 'FUEL_PRED',
    SEC_FPLN: 'SEC_FPLN',
  };

  const mapped = keyMap[key] || key;
  if (mapped === step.expectedAction || step.expectedAction === key) {
    state.advanceTutorial();
  } else {
    // Check if the key is an alphanumeric/editing key
    const isAlphaNumeric =
      /^[A-Z0-9]$/.test(key) || ['DOT', 'SLASH', 'PLUS_MINUS', 'SPACE', 'CLR', 'DEL'].includes(key);

    // Only record an error if it's NOT an alphanumeric key.
    // Alphanumeric keys are usually intermediate scratchpad input.
    // Legitimate errors for these are caught in pressLSK when the user tries to submit.
    if (!isAlphaNumeric) {
      state.recordTutorialError();
    }
  }
}

function stageHoldField(state: FMCState, field: string, value: any): Partial<FMCState> {
  const base = state.holdPending ?? state.hold;
  return {
    holdPending: { ...base, [field]: value },
    isModified: true,
    execLit: true,
    scratchpad: '',
    scratchpadError: null,
  };
}

function stageFlightPlanChange(state: FMCState, waypoints: FlightPlanWaypoint[]): Partial<FMCState> {
  return {
    pendingFlightPlan: { ...state.flightPlan, waypoints },
    isModified: true,
    execLit: true,
    scratchpad: '',
    scratchpadError: null,
  };
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
      scratchpadState: { buffer: '', message: null, messageQueue: [], history: [] },
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
    const startTime = performance.now();
    devLog(`[FMC] pressKey: ${key}`);
    const { scratchpad, currentPage } = get();
    let handled = false;

    // Navigation keys
    if (key === 'INIT_REF') {
      get().setPage('POS_INIT');
      handled = true;
    } else if (key === 'RTE') {
      get().setPage('RTE');
      handled = true;
    } else if (key === 'CLB') {
      get().setPage('CLB');
      handled = true;
    } else if (key === 'CRZ') {
      get().setPage('CRZ');
      handled = true;
    } else if (key === 'DES') {
      get().setPage('DES');
      handled = true;
    } else if (key === 'DIR_INTC') {
      get().setPage('DIR_INTC');
      handled = true;
    } else if (key === 'LEGS') {
      get().setPage('LEGS');
      handled = true;
    } else if (key === 'DEP_ARR') {
      get().setPage('DEP_ARR');
      handled = true;
    } else if (key === 'HOLD') {
      get().setPage('HOLD');
      handled = true;
    } else if (key === 'PERF') {
      get().setPage('PERF_INIT');
      handled = true;
    } else if (key === 'PROG') {
      get().setPage('PROGRESS');
      handled = true;
    } else if (key === 'N1_LIMIT') {
      get().setPage('N1_LIMIT');
      handled = true;
    } else if (key === 'FIX') {
      get().setPage('FIX');
      handled = true;
    } else if (key === 'MENU') {
      get().setPage('MENU');
      handled = true;
    }
    // Airbus function keys
    else if (key === 'INIT_A') {
      get().setPage('INIT_A');
      handled = true;
    } else if (key === 'INIT_B') {
      get().setPage('INIT_B');
      handled = true;
    } else if (key === 'F_PLN') {
      get().setPage('F_PLN');
      handled = true;
    } else if (key === 'DATA_INDEX') {
      get().setPage('DATA_INDEX');
      handled = true;
    } else if (key === 'PERF_TAKEOFF') {
      get().setPage('PERF_TAKEOFF');
      handled = true;
    } else if (key === 'PROG_A') {
      get().setPage('PROG_A');
      handled = true;
    } else if (key === 'RAD_NAV') {
      get().setPage('RAD_NAV');
      handled = true;
    } else if (key === 'MCDU_MENU') {
      get().setPage('MCDU_MENU');
      handled = true;
    }

    // Clear
    else if (key === 'CLR') {
      if (scratchpad.length > 0) {
        fmcClrKey(set, get);
      } else if (get().isModified) {
        set({
          pendingRoute: null,
          pendingFlightPlan: null,
          holdPending: null,
          isModified: false,
          execLit: false,
        });
        fmcClearBuffer(set, get);
      }
      handled = true;
    } else if (key === 'DEL') {
      if (scratchpad.length > 0) {
        fmcDelKey(set, get);
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
      } else if (s.currentPage === 'F_PLN') {
        const flightPlan = s.isModified && s.pendingFlightPlan ? s.pendingFlightPlan : s.flightPlan;
        const totalPages = Math.max(1, Math.ceil(flightPlan.waypoints.length / 5));
        if (s.legsPageIndex < totalPages - 1) {
          const nextIndex = s.legsPageIndex + 1;
          const updates: Partial<FMCState> = { legsPageIndex: nextIndex };
          if (s.efisL?.mode === 'PLAN') updates.selectedPlanWaypointIndex = nextIndex * 5;
          set(updates);
        }
      } else if (s.currentPage === 'POS_INIT') {
        set({ posPageIndex: (s.posPageIndex + 1) % 3 });
      }
      handled = true;
    } else if (key === 'PREV_PAGE') {
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
      } else if (s.currentPage === 'F_PLN') {
        if (s.legsPageIndex > 0) {
          const nextIndex = s.legsPageIndex - 1;
          const perPage = 5;
          const nextUpdates: Partial<FMCState> = { legsPageIndex: nextIndex };
          if (s.efisL?.mode === 'PLAN') nextUpdates.selectedPlanWaypointIndex = nextIndex * 5;
          set(nextUpdates);
        }
      } else if (s.currentPage === 'POS_INIT') {
        set({ posPageIndex: (s.posPageIndex + 2) % 3 });
      }
      handled = true;
    }

    // Character input
    else if (scratchpad.length < SCRATCHPAD_MAX) {
      const charMap: Record<string, string> = {
        DOT: '.',
        PLUS_MINUS: '+/-',
        SLASH: '/',
        SPACE: ' ',
      };
      const char = charMap[key] || key;
      fmcTypeChar(set, get, char);
      handled = true;
    }

    // Training engine hook
    if (get().trainingActive) {
      get().processTrainingAction({ type: 'press_key', key });
    }

    // Clear message if CLR is pressed and scratchpad is empty
    if (key === 'CLR' && scratchpad.length === 0 && !get().scratchpadError) {
      get().clearActiveMessage();
    }

    // Alphanumeric keys clear advisory messages if scratchpad was empty
    if (scratchpad.length === 0 && (key.length === 1 || ['DOT', 'SLASH', 'PLUS_MINUS', 'SPACE'].includes(key))) {
      const activeMsg = get().scratchpadMessages[0];
      if (activeMsg && activeMsg.severity === 'ADVISORY') {
        get().clearActiveMessage();
      }
    }

    // Tutorial: advance if action matches expected (runs after all key handling)
    if (handled) {
      tryAdvanceIfMatch(get, key);
    }

    set({ latency: Math.round(performance.now() - startTime) });
  },

  pressLSK: (side: 'L' | 'R', index: number) => {
    const startTime = performance.now();
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

    // Training engine hook
    if (state.trainingActive) {
      const currentStep = state.trainingScenario?.steps[state.trainingStepIndex];
      const scratchpad = state.scratchpad.trim();
      if (currentStep?.expectedAction?.type === 'enter_scratchpad') {
        state.processTrainingAction({ type: 'enter_scratchpad', value: scratchpad });
      } else {
        state.processTrainingAction({ type: 'press_lsk', side, index });
      }
    }

    const scratchpad = state.scratchpad.trim();

    // Trigger background pre-loading of potential airports or waypoints from IndexedDB into NAV_CACHE
    if (scratchpad) {
      const idents: string[] = [];
      const upperScratchpad = scratchpad.toUpperCase();
      if (upperScratchpad.includes('-') || upperScratchpad.includes(' ') || upperScratchpad.includes('/')) {
        const matches = upperScratchpad.match(/[A-Z0-9]{3,5}/g);
        if (matches) idents.push(...matches);
      } else if (upperScratchpad.length >= 3 && upperScratchpad.length <= 5) {
        idents.push(upperScratchpad);
      }
      if (idents.length > 0) {
        idents.forEach((id) => {
          loadIntoCache(id).catch((err) => devError(`Error background loading ${id}:`, err));
        });
      }
    }

    const originArpt = state.pendingRoute?.origin ?? state.route.origin;
    const destArpt = state.pendingRoute?.destination ?? state.route.destination;
    if (originArpt) {
      loadProceduresIntoCache(originArpt).catch((err) => {
        devError('Failed to load arrival procedures', err);
        failScratchpad(set as ZustandSet, get as ZustandGet, 'PROC DATA UNAVAIL');
      });
    }
    if (destArpt) {
      loadProceduresIntoCache(destArpt).catch((err) => {
        devError('Failed to load destination procedures', err);
        failScratchpad(set as ZustandSet, get as ZustandGet, 'PROC DATA UNAVAIL');
      });
    }

    let handled = false;

    // Dispatch through typed central LSK dispatcher
    const dispatchResult = dispatchLskAction({ state, action, scratchpad });
    if (dispatchResult.handled) {
      handled = applyDispatchResult(set as ZustandSet, get as ZustandGet, dispatchResult);
    }

    // LEGS waypoint side effects — array mutations must stay in store
    if (state.currentPage === 'LEGS') {
      const wpMatch = action.match(/^(edit_wp|delete_wp|insert_wp)_(\d+)$/);
      if (wpMatch) {
        const wpAction = wpMatch[1];
        const wpIdx = parseInt(wpMatch[2], 10);
        if (wpAction === 'delete_wp' && state.deleteMode) {
          state.deleteWaypoint(wpIdx);
          handled = true;
        } else if (wpAction === 'edit_wp' && scratchpad) {
          state.insertWaypoint(wpIdx, scratchpad);
          handled = true;
        } else if (wpAction === 'delete_wp' && dispatchResult.sideEffects?.includes('delete_waypoint')) {
          state.deleteWaypoint(wpIdx);
          handled = true;
        }
      }
    }

    // Tutorial: advance on LSK press (check action matches expectedAction OR validate passes)
    const { tutorialActive } = get();
    if (tutorialActive) {
      const scenario = findTutorial(get().tutorialScenario || '');
      if (scenario) {
        const step = scenario.steps[get().tutorialStepIndex];
        if (step) {
          const actionMatches = !step.expectedAction || action === step.expectedAction || lskId === step.highlightField;
          const validatePasses = !step.validate || step.validate(scratchpad, get());
          if (actionMatches && validatePasses) {
            get().advanceTutorial();
          } else {
            get().recordTutorialError();
          }
        }
      }
    }
    set({ latency: Math.round(performance.now() - startTime) });
  },

  clearScratchpad: () => {
    set({ scratchpad: '', scratchpadError: null });
  },

  pressEXEC: () => {
    const startTime = performance.now();
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
        failScratchpad(set as ZustandSet, get as ZustandGet, 'INVALID FORMAT');
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
    const data = renderer ? renderer(state) : getPageRenderer('MENU')!(state);

    // Inject scratchpad or active message — prefer scratchpadState (new engine)
    const { scratchpad, scratchpadError, scratchpadMessages, scratchpadState } = state;
    const activeMsg = scratchpadMessages[0];

    let scratchpadText = ' ';
    let scratchpadColor: DisplayColor = state.aircraft === 'AIRBUS_A320' ? 'white' : 'green';
    let blink = false;
    let semantic: DisplaySemantic | undefined = undefined;

    if (scratchpadState) {
      scratchpadText = getActiveDisplay(scratchpadState);
      scratchpadColor = scratchpadState.message ? 'amber' : 'white';
    } else if (scratchpad) {
      scratchpadText = scratchpad;
      scratchpadColor = state.aircraft === 'AIRBUS_A320' ? 'amber' : 'white';
    }
    if (scratchpadText === ' ' && scratchpadError) {
      scratchpadText = scratchpadError;
      scratchpadColor = 'amber';
      blink = true;
      semantic = 'warning';
    }
    if (scratchpadText === ' ' && activeMsg) {
      scratchpadText = activeMsg.text;
      scratchpadColor = activeMsg.severity === 'ADVISORY' ? 'white' : 'amber';
      blink = activeMsg.severity === 'ALERT' || activeMsg.severity === 'IMPORTANT';
      semantic =
        activeMsg.severity === 'ALERT' ? 'warning' : activeMsg.severity === 'IMPORTANT' ? 'caution' : 'placeholder';
    }

    if (data.segments) {
      // For segment-based rendering, add/replace the last line (row 13)
      data.segments = data.segments.filter((s) => s.row !== 13);
      data.segments.push({
        row: 13,
        col: 0,
        text: scratchpadText.padEnd(24, ' '),
        color: scratchpadColor,
        size: 'normal',
        blink,
        semantic,
      });
    } else {
      // Legacy line-based rendering
      data.lines[13] = {
        text: scratchpadText,
        color: scratchpadColor,
        inverse: false,
        blinking: blink,
        semantic,
      };
    }

    return data;
  },

  setMode: (mode: FMCMode) => set({ mode }),
  setConnectionStatus: (status: ConnectionStatus) => set({ connectionStatus: status }),
  setConnectionMode: (mode: ConnectionMode) => set({ connectionMode: mode }),
  setConnectionDiagnostics: (diagnostics: Partial<ConnectionDiagnostics>) => set(diagnostics),
  setSimVariables: (variables: Record<string, number>) =>
    set((state) => ({
      simVariables: { ...state.simVariables, ...variables },
    })),
  setAircraftState: (state: FMCState['aircraftState']) => {
    set({ aircraftState: state });
    // Outward sync to AircraftStore
    useAircraftStore.getState().setAircraftState(state);

    // Sync incoming autopilot telemetry from SimConnect back to FMC autopilot stores
    if (state) {
      set((s) => {
        const truth = { ...s.autopilot.truth };
        const boeing = { ...s.autopilot.boeing };
        const airbus = { ...s.autopilot.airbus };

        if (state.apMaster !== undefined) {
          truth.autopilotStatus = state.apMaster ? (s.aircraft === 'AIRBUS_A320' ? 'AP1' : 'CMD_A') : 'OFF';
        }
        if (state.apLnavActive !== undefined) {
          truth.lateralActive = state.apLnavActive ? 'LNAV' : 'OFF';
          boeing.lnav = state.apLnavActive;
        }
        if (state.apVnavActive !== undefined) {
          truth.verticalActive = state.apVnavActive ? 'VNAV_PTH' : 'OFF';
          boeing.vnav = state.apVnavActive;
        }
        if (state.apHeadingActive !== undefined) {
          truth.lateralActive = state.apHeadingActive ? 'HDG_SEL' : 'OFF';
          boeing.hdgSel = state.apHeadingActive;
        }
        if (state.apAltitudeActive !== undefined) {
          truth.verticalActive = state.apAltitudeActive ? 'ALT_HOLD' : 'OFF';
          boeing.altHold = state.apAltitudeActive;
        }
        if (state.apTargetAltitude !== undefined) {
          boeing.altitude = state.apTargetAltitude;
        }

        return {
          autopilot: { boeing, airbus, truth },
        };
      });

      useAutopilotStore.setState({
        boeing: get().autopilot.boeing,
        airbus: get().autopilot.airbus,
        truth: get().autopilot.truth,
      });
    }

    get().updateFlightPhase();
  },

  addMessage: (text: string, severity: MessageSeverity, type?: 1 | 2) => {
    const { scratchpadMessages, aircraft } = get();
    const id = Math.random().toString(36).substring(7);
    const message: FmcMessage = { id, text, severity, timestamp: Date.now(), type };

    let newMessages = [...scratchpadMessages];
    if (aircraft === 'AIRBUS_A320') {
      if (type === 1) {
        newMessages = [message, ...newMessages.filter((m) => m.type !== 1)];
      } else {
        if (newMessages.length < 5) newMessages.push(message);
      }
    } else {
      const priority = { ALERT: 3, IMPORTANT: 2, ADVISORY: 1 };
      newMessages.push(message);
      newMessages.sort((a, b) => priority[b.severity] - priority[a.severity] || b.timestamp - a.timestamp);
    }
    set({ scratchpadMessages: newMessages, msgLight: true });
  },

  clearActiveMessage: () => {
    const { scratchpadMessages } = get();
    if (scratchpadMessages.length > 0) {
      set({ scratchpadMessages: scratchpadMessages.slice(1) });
    }
  },

  updateFlightPhase: () => {
    const state = get();
    const updates = FmsRuntimeEngine.tick(state, 0);
    if (updates.flightPhase) {
      set({ flightPhase: updates.flightPhase });
    }
  },
  receiveAtsuMessage: (from: string, text: string) => {
    const id = Math.random().toString(36).substring(7);
    const msg: AcarsMessage = {
      id,
      from,
      text,
      timestamp: Date.now(),
      read: false,
      type: 'AOC',
    };
    set((state) => ({
      atsu: {
        ...state.atsu,
        messages: [...state.atsu.messages, msg],
      },
      msgLight: true,
    }));
    get().addMessage(`ACARS MSG FROM ${from}`, 'IMPORTANT', 2);
  },
  tick: (dtSeconds: number) => {
    const state = get();
    const updates = FmsRuntimeEngine.tick(state, dtSeconds);
    if (Object.keys(updates).length > 0) {
      set(updates);
    }
  },
  setConnectedAircraft: (aircraft: string | null, capabilities?: string[] | null, aircraftType?: AircraftType | null) =>
    set({
      connectedAircraft: aircraft,
      connectedCapabilities: capabilities ?? [],
      connectedAircraftType: aircraftType ?? null,
    }),
  setConnectedLastError: (error: string | null) => set({ lastError: error }),
  setExternalDisplayData: (data: DisplayData | null) =>
    set({
      externalDisplayData: data,
      scratchpadError: data?.scratchpadError ?? null,
    }),
  setFailureMode: (mode, message) =>
    set({ mode, failureMessage: message || (mode === 'FAIL' ? 'FMC FAILURE' : 'CDU OFF') }),
  clearFailureMode: () => set({ mode: 'ACTIVE', failureMessage: null }),
  setBrightness: (b: number) => set({ brightness: b }),

  loadFlightPlan: (data) => {
    set((state) => {
      const origin = data.origin || state.flightPlan.origin || state.route.origin || '';
      const destination = data.destination || state.flightPlan.destination || state.route.destination || '';
      const route = data.route || state.flightPlan.route || state.route.routeString || '';
      const parsed = route ? parseRouteString([origin, route, destination].filter(Boolean).join(' ')) : null;

      // Merge SimBrief coordinates if available
      if (parsed && data.waypoints) {
        parsed.waypoints.forEach((pwp) => {
          const swp = data.waypoints?.find((w) => w.ident === pwp.ident);
          if (swp && swp.lat !== undefined && swp.lon !== undefined) {
            pwp.lat = swp.lat;
            pwp.lon = swp.lon;
            pwp.coordinateSource = swp.coordinateSource;
          }
        });
      }
      const waypoints = parsed?.waypoints ?? data.waypoints ?? state.flightPlan.waypoints;
      return {
        flightPlan: { ...state.flightPlan, ...data, origin, destination, route, waypoints },
        route: { ...state.route, origin, destination, routeString: route },
        legsPageCount: Math.max(1, Math.ceil(waypoints.length / 5)),
        msgLight: true,
      };
    });
  },

  resetState: () => set(defaultState),

  initNavDb: async () => {
    const state = get();
    if (state.dbInitializationState !== 'idle') return;

    set({ dbInitializationState: 'loading', dbInitializationProgress: 0 });
    try {
      await populateNavDb('/data/navdata.json', (progress) => {
        set({ dbInitializationProgress: progress });
      });
      set({ dbInitializationState: 'ready' });
    } catch (error) {
      devError('Failed to initialize NavDB:', error);
      set({ dbInitializationState: 'error' });
    }
  },

  setSelectedPlanWaypoint: (index) => set({ selectedPlanWaypointIndex: index }),

  stepPlanForward: () =>
    set((state) => {
      const flightPlan = state.pendingFlightPlan ?? state.flightPlan;
      if (flightPlan.waypoints.length === 0) return state;

      // Total points including origin and destination
      const totalPoints = (flightPlan.origin ? 1 : 0) + flightPlan.waypoints.length + (flightPlan.destination ? 1 : 0);
      const currentIndex = state.selectedPlanWaypointIndex ?? 0;
      const nextIndex = (currentIndex + 1) % totalPoints;

      return { selectedPlanWaypointIndex: nextIndex };
    }),

  stepPlanBackward: () =>
    set((state) => {
      const flightPlan = state.pendingFlightPlan ?? state.flightPlan;
      if (flightPlan.waypoints.length === 0) return state;

      const totalPoints = (flightPlan.origin ? 1 : 0) + flightPlan.waypoints.length + (flightPlan.destination ? 1 : 0);
      const currentIndex = state.selectedPlanWaypointIndex ?? 0;
      const nextIndex = (currentIndex - 1 + totalPoints) % totalPoints;

      return { selectedPlanWaypointIndex: nextIndex };
    }),

  resetPlanWaypoint: () => set({ selectedPlanWaypointIndex: null }),

  insertWaypoint: (index: number, ident: string) => {
    const state = get();
    const id = ident.toUpperCase();

    // 1. Try advanced waypoint parser (Lat/Long, PBD, etc)
    const parsed = parseWaypointInput(id, (wptId) => getWaypoint(wptId));

    let nextWaypoint: any = null;

    if (parsed) {
      nextWaypoint = {
        ident: parsed.ident,
        lat: parsed.lat,
        lon: parsed.lon,
        coordinateSource: 'manual',
        discontinuity: false,
      };
    } else {
      // 2. Standard database lookup
      const dbPoint = getWaypoint(id) || getAirport(id);
      if (!dbPoint) {
        failScratchpad(set as ZustandSet, get as ZustandGet, 'NOT IN DATABASE');
        return;
      }
      nextWaypoint = {
        ident: id,
        lat: dbPoint.lat,
        lon: dbPoint.lon,
        coordinateSource: 'navdb',
        discontinuity: false,
      };
    }

    const waypoints = [...(state.pendingFlightPlan?.waypoints ?? state.flightPlan.waypoints)];
    if (waypoints[index]?.discontinuity) {
      waypoints[index] = nextWaypoint;
    } else {
      waypoints.splice(index, 0, nextWaypoint);
    }
    set(stageFlightPlanChange(state, waypoints));
  },

  deleteWaypoint: (index: number) => {
    const state = get();
    const waypoints = [...(state.pendingFlightPlan?.waypoints ?? state.flightPlan.waypoints)];
    if (index >= 0 && index < waypoints.length) {
      waypoints.splice(index, 1);
      set({ ...stageFlightPlanChange(state, waypoints), deleteMode: false });
    }
  },

  updateWaypointConstraint: (index: number, altitude?: AltitudeConstraint, speed?: SpeedConstraint) => {
    const state = get();
    const waypoints = [...(state.pendingFlightPlan?.waypoints ?? state.flightPlan.waypoints)];
    if (index >= 0 && index < waypoints.length) {
      waypoints[index] = { ...waypoints[index], altitudeConstraint: altitude, speedConstraint: speed };
      set({ ...stageFlightPlanChange(state, waypoints), editWaypointIndex: null });
    }
  },

  setAircraft: (type: AircraftType) => {
    const state = get();
    // Outward sync to AircraftStore
    useAircraftStore.getState().setAircraft(type);

    const startPage = type === 'BOEING_737' ? ('IDENT' as PageType) : ('INIT_A' as PageType);
    set({
      ...defaultState,
      aircraft: type,
      demoMode: state.demoMode,
      dbInitializationState: state.dbInitializationState,
      currentPage: startPage,
      pageHistory: [],
      cockpitMode: state.cockpitMode,
      cockpitLayoutMode: state.cockpitLayoutMode,
      hiddenPanels: getRecommendedHiddenPanels(state.cockpitLayoutMode, state.pinnedPanels),
      pinnedPanels: state.pinnedPanels,
      instrumentZoom: { ...state.instrumentZoom },
      highContrast: state.highContrast,
      efisL: createDefaultEFIS(type, 'L'),
      efisR: createDefaultEFIS(type, 'R'),
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
    set({ ...stageHoldField(state, 'fix', ident.toUpperCase()) });
  },

  setInboundCourse: (crs: number) => {
    set(stageHoldField(get(), 'inboundCourse', crs));
  },

  setLegTime: (time: number) => {
    set(stageHoldField(get(), 'legTime', time));
  },

  setLegDist: (dist: number) => {
    set(stageHoldField(get(), 'legDist', dist));
  },

  setHoldDirection: (dir: 'L' | 'R') => {
    set(stageHoldField(get(), 'direction', dir));
  },

  // ---- Tutorial ----
  startTutorial: (scenarioName: string) => {
    const scenario = findTutorial(scenarioName);
    if (!scenario) {
      return;
    }
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
      tutorialHintLevel: 0,
      mode: 'TUTORIAL',
      scratchpad: '',
      scratchpadError: null,
      currentPage: target,
      pageHistory: [],
    });

    get().resetTutorialHints();
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
        let history: unknown[] = [];
        const raw = localStorage.getItem('cdu-tutorial-metrics');
        if (raw) {
          const parsed: unknown = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            history = parsed;
          }
        }
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
      tutorialHintLevel: 0,
      scratchpad: '',
      scratchpadError: null,
    });

    state.resetTutorialHints();

    // Lesson-aware layout automation
    if (nextStep.preferredLayout) {
      get().setCockpitLayoutMode(nextStep.preferredLayout);
    }
    if (nextStep.focusPanel) {
      set({ focusedPanel: nextStep.focusPanel });
    }
    if (nextStep.requiredPanels) {
      const { hiddenPanels } = get();
      const nextHidden = hiddenPanels.filter((p) => !nextStep.requiredPanels?.includes(p));
      if (nextHidden.length !== hiddenPanels.length) {
        set({ hiddenPanels: nextHidden });
      }
    }

    const currentStepPage = currentStep?.page;
    const nextStepPage = nextStep?.page;

    // Auto-navigate to next step's page only when the next step
    // is NOT a function key action (the user will press that key themselves).
    // Function keys: INIT_REF, RTE, DEP_ARR, PERF, PROG, LEGS, MENU
    // For those steps, the highlighted button both navigates and advances.
    // Airbus function keys: INIT_A, INIT_B, F-PLN, PERF TO, PROG A, DEP ARR A, MCDU MENU, RAD NAV
    const functionKeyActions = [
      'POS_INIT',
      'RTE',
      'DEP_ARR',
      'PERF_INIT',
      'PROGRESS',
      'LEGS',
      'MENU',
      'INIT_A',
      'INIT_B',
      'F_PLN',
      'PERF_TAKEOFF',
      'PROG_A',
      'DEP_ARR_A',
      'MCDU_MENU',
      'RAD_NAV',
    ];
    if (
      !functionKeyActions.includes(nextStep.expectedAction) &&
      currentPage === currentStepPage &&
      nextStepPage !== currentPage
    ) {
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
    const step = state.getCurrentTutorialStep();

    let hint = 'Check the highlighted field and try again.';
    if (step) {
      if (state.currentPage !== step.page) {
        hint = `Wrong page! Press the ${step.page} button to continue.`;
      } else if (step.highlightField) {
        const side = step.highlightField.startsWith('L') ? 'left' : step.highlightField.startsWith('R') ? 'right' : '';
        const num = step.highlightField.slice(1);
        if (side) {
          hint = `Press LSK ${step.highlightField} (the ${num}${num === '1' ? 'st' : num === '2' ? 'nd' : num === '3' ? 'rd' : 'th'} button on the ${side}).`;
        } else {
          hint = `Press the ${step.highlightField} key on the keypad.`;
        }
      }
    }

    set({
      tutorialErrors: newErrors,
      tutorialSkipAvailable: newErrors >= 3,
      tutorialHint: hint,
    });
  },

  skipTutorialStep: () => {
    const state = get();
    if (!state.tutorialActive) return;
    get().advanceTutorial();
  },

  resetTutorialHints: () => {
    const timer = get().tutorialHintTimer;
    if (timer) clearTimeout(timer);

    const newTimer = setTimeout(() => {
      const state = get();
      if (!state.tutorialActive) return;

      set((s) => ({ tutorialHintLevel: Math.min(s.tutorialHintLevel + 1, 3) }));
      get().resetTutorialHints();
    }, 15000); // 15 seconds per hint level

    set({ tutorialHintTimer: newTimer });
  },

  clearTutorialHint: () => set({ tutorialHint: null }),
  setTutorialConfidence: (stars: number) => set({ tutorialConfidence: stars }),
  expandActiveRoute: () => {
    const state = get();
    const route = state.pendingRoute ?? state.route;

    const expandedLegs = expandRoute(
      route.origin || '',
      route.destination || '',
      route.sid || undefined,
      route.star || undefined,
      route.approach || undefined,
      [], // Add enroute parsing later
      route.runway || undefined,
    );

    const waypoints = expandedLegs.map<FlightPlanWaypoint>((leg) => {
      const isUnresolved = leg.lat === undefined || leg.lon === undefined || isNaN(leg.lat) || isNaN(leg.lon);
      return {
        ident: leg.ident,
        lat: leg.lat,
        lon: leg.lon,
        coordinateSource: isUnresolved ? 'UNRESOLVED' : 'navdb',
        discontinuity: false,
      };
    });

    if (state.pendingRoute) {
      set({ pendingFlightPlan: { ...state.flightPlan, waypoints } });
    } else {
      set({ flightPlan: { ...state.flightPlan, waypoints } });
    }
  },

  setLatency: (ms: number) => set({ latency: ms }),
  setSessionStartTime: (time: number | null) => set({ sessionStartTime: time }),

  setNDMode: (side, mode) => {
    const key = side === 'L' ? 'efisL' : 'efisR';
    set({ [key]: { ...get()[key], mode } });
  },
  setNDRange: (side, range) => {
    const key = side === 'L' ? 'efisL' : 'efisR';
    set({ [key]: { ...get()[key], range } });
  },

  // ---- Training Curriculum ----
  startTraining: (scenarioId: string) => {
    const scenario = [...boeingLessons, ...airbusLessons].find((s) => s.id === scenarioId);
    if (!scenario) return;

    const engine = new TrainingScenarioEngine(scenario);
    const firstStep = engine.start();
    const highlight = firstStep ? getTrainingHighlight(firstStep) : null;

    // Setup initial state
    if (scenario.setup.page) {
      get().setPage(scenario.setup.page);
    }

    set({
      trainingActive: true,
      trainingScenario: scenario,
      trainingEngine: engine,
      trainingMistakes: [],
      trainingScore: null,
      trainingStepIndex: 0,
      trainingCompleted: false,
      tutorialActive: false, // Deactivate legacy tutorial
      tutorialHighlight: highlight,
      mode: 'TUTORIAL',
    });
  },

  stopTraining: () => {
    set({
      trainingActive: false,
      trainingScenario: null,
      trainingEngine: null,
      tutorialHighlight: null,
      mode: 'ACTIVE',
    });
  },

  setDebriefMode: (active: boolean) => set({ debriefMode: active }),

  processTrainingAction: (action: ExpectedAction) => {
    const { trainingActive, trainingEngine, trainingScenario } = get();
    if (!trainingActive || !trainingEngine || !trainingScenario) return;

    const result = trainingEngine.processAction(action, get() as unknown as Record<string, unknown>);

    if (result.success) {
      if (result.completed) {
        const summary = trainingEngine.getSummary();
        set({
          trainingCompleted: true,
          trainingActive: false,
          tutorialHighlight: null,
          trainingScore: summary.score,
        });
        progressManager.completeLesson(trainingScenario.id, summary.score.total);
      } else {
        const nextIndex = get().trainingStepIndex + 1;
        const nextStep = trainingScenario.steps[nextIndex];
        const highlight = nextStep ? getTrainingHighlight(nextStep) : null;
        set({
          trainingStepIndex: get().trainingStepIndex + 1,
          tutorialHighlight: highlight,
          tutorialHint: null,
        });
      }
    } else if (result.mistake) {
      set((state) => ({
        trainingMistakes: [...state.trainingMistakes, result.mistake!],
        tutorialHint: result.mistake!.description,
      }));
    }
  },
  toggleNDOverlay: (side, overlayKey) => {
    const key = side === 'L' ? 'efisL' : 'efisR';
    const efis = get()[key];
    set({
      [key]: {
        ...efis,
        overlays: { ...efis.overlays, [overlayKey]: !efis.overlays[overlayKey as keyof typeof efis.overlays] },
      },
    });
  },
  toggleNDCenter: (side: 'L' | 'R') => {
    const efisKey = side === 'L' ? 'efisL' : 'efisR';
    const efis = get()[efisKey];
    set({ [efisKey]: { ...efis, centered: !efis.centered } });
  },

  updateBoeingMCP: (update: Partial<BoeingMCPState>) => {
    set((state) => ({
      autopilot: {
        ...state.autopilot,
        boeing: { ...state.autopilot.boeing, ...update },
      },
    }));

    // Training hook
    if (get().trainingActive) {
      Object.entries(update).forEach(([field, value]) => {
        get().processTrainingAction({ type: 'set_mcp', field, value: value as string | number | boolean });
      });
    }
  },

  updateAirbusFCU: (update: Partial<AirbusFCUState>) => {
    const state = get();
    if (state.aircraft !== 'AIRBUS_A320') return;

    const validatedUpdate = { ...update };

    // Managed Navigation Interlock
    if (validatedUpdate.headingManaged) {
      const hasFpln = state.flightPlan.origin && state.flightPlan.destination;
      const irsAligned = state.position.irsState === 'NAV';

      if (!hasFpln || !irsAligned) {
        delete validatedUpdate.headingManaged;
        set({ scratchpad: !irsAligned ? 'IRS NOT ALIGNED' : 'F-PLN NOT READY', msgLight: true });
      }
    }

    set((state) => ({
      autopilot: {
        ...state.autopilot,
        airbus: { ...state.autopilot.airbus, ...validatedUpdate },
      },
    }));

    // Training hook
    if (get().trainingActive) {
      Object.entries(update).forEach(([field, value]) => {
        get().processTrainingAction({ type: 'set_mcp', field, value: value as string | number | boolean });
      });
    }
  },

  pressMCPButton: (action) => {
    const state = get();
    const { truth } = state.autopilot;

    // 1. Authoritative Mode Request Processing
    let request: Partial<AutoflightTruthState> = {};
    const isBoeing = state.aircraft === 'BOEING_737';

    if (isBoeing) {
      if (action === 'LNAV') request = { lateralActive: 'LNAV' };
      if (action === 'VNAV') request = { verticalActive: 'VNAV_PTH' };
      if (action === 'HDG_SEL') request = { lateralActive: 'HDG_SEL' };
      if (action === 'ALT_HLD') request = { verticalActive: 'ALT_HOLD' };
      if (action === 'VOR_LOC') request = { lateralActive: 'VOR_LOC' };
      if (action === 'APP') request = { lateralActive: 'APP', verticalActive: 'G_S' };
      if (action === 'N1') request = { thrustActive: 'N1' };
      if (action === 'SPEED') request = { thrustActive: 'SPEED' };
      if (action === 'cmdA') request = { autopilotStatus: truth.autopilotStatus === 'CMD_A' ? 'OFF' : 'CMD_A' };
      if (action === 'cmdB') request = { autopilotStatus: truth.autopilotStatus === 'CMD_B' ? 'OFF' : 'CMD_B' };
    } else {
      if (action === 'LOC') request = { lateralActive: 'LOC' };
      if (action === 'APPR') request = { lateralActive: 'APP', verticalActive: 'G_S' };
      if (action === 'EXPED') request = { verticalActive: 'OP_CLB' };
      if (action === 'AP1') request = { autopilotStatus: truth.autopilotStatus === 'AP1' ? 'OFF' : 'AP1' };
      if (action === 'AP2') request = { autopilotStatus: truth.autopilotStatus === 'AP2' ? 'OFF' : 'AP2' };
      if (action === 'ATHR') request = { thrustActive: truth.thrustActive === 'SPEED' ? 'OFF' : 'SPEED' };
      if (action === 'SPD_MANAGED') request = { thrustActive: 'SPEED' };
      if (action === 'SPD_SELECTED') request = { thrustActive: 'OFF' };
      if (action === 'HDG_MANAGED') request = { lateralActive: 'NAV' };
      if (action === 'HDG_SELECTED') request = { lateralActive: 'HDG' };
      if (action === 'ALT_MANAGED') request = { verticalActive: 'VNAV_PTH' }; // Airbus CLB/DES
      if (action === 'ALT_SELECTED') request = { verticalActive: 'OP_CLB' };
    }

    if (Object.keys(request).length > 0) {
      if (request.autopilotStatus === 'OFF' && truth.autopilotStatus !== 'OFF') {
        AuralAlertService.playCavalryCharge();
      }

      const { nextState, alert } = AutoflightModeManager.processModeRequest(request, truth, state);
      if (alert) {
        set({ scratchpad: alert, msgLight: true });
        AuralAlertService.playTripleClick();
        alertBus.addAlert({
          id: `afds-${Date.now()}`,
          text: alert,
          level: 'CAUTION',
          source: 'AFDS',
          clearable: true,
        });
      } else {
        set((s) => ({ autopilot: { ...s.autopilot, truth: nextState } }));
      }
    }

    // 2. Legacy UI Logic (Button Lights and Window state)
    if (isBoeing) {
      const normalizedAction = BOEING_ACTION_MAP[action] ?? action;
      const update = processBoeingMCPAction(
        state.autopilot.boeing,
        normalizedAction as keyof BoeingMCPState | 'SPD_INTERVENE' | 'ALT_INTERVENE' | 'SPD_MACH_TOGGLE',
      );
      state.updateBoeingMCP(update);
      return;
    }

    const airbus = state.autopilot.airbus;
    const airbusActions: Record<string, Partial<AirbusFCUState>> = {
      AP1: { ap1: !airbus.ap1 },
      AP2: { ap2: !airbus.ap2 },
      ATHR: { athr: !airbus.athr },
      LOC: { loc: !airbus.loc },
      APPR: { appr: !airbus.appr },
      EXPED: { exped: !airbus.exped },
      FD1: { fd1: !airbus.fd1 },
      FD2: { fd2: !airbus.fd2 },
    };

    const update = airbusActions[action];
    if (update) {
      state.updateAirbusFCU(update);
    }
  },

  setRteSubPage: (page: number) => set({ rteSubPage: page }),
  setTakeoffRefPageIndex: (page: number) => set({ takeoffRefPageIndex: page }),
  setCockpitMode: (enabled: boolean) => set({ cockpitMode: enabled }),
  setCockpitLayoutMode: (mode) => {
    const state = get();
    set({
      cockpitLayoutMode: mode,
      focusedPanel: null,
      hiddenPanels: getRecommendedHiddenPanels(mode, state.pinnedPanels),
      instrumentZoom: {
        ...state.instrumentZoom,
        ...modeZoomDefaults(mode),
      },
    });
  },
  setHiddenPanels: (panels) => {
    const visibleInstruments = instrumentPanelIds.filter((panelId) => !panels.includes(panelId));
    if (visibleInstruments.length === 0) {
      return;
    }
    set({ hiddenPanels: panels });
  },
  setPinnedPanels: (panels) => set({ pinnedPanels: panels }),
  setFocusedPanel: (panel) => set({ focusedPanel: panel }),
  togglePanelHidden: (panelId) => {
    const { hiddenPanels } = get();
    if (hiddenPanels.includes(panelId)) {
      set({ hiddenPanels: hiddenPanels.filter((p) => p !== panelId) });
    } else {
      const nextHidden = [...hiddenPanels, panelId];
      const visibleInstruments = instrumentPanelIds.filter((id) => !nextHidden.includes(id));
      if (visibleInstruments.length === 0) {
        return;
      }
      set({ hiddenPanels: nextHidden });
    }
  },
  togglePanelPinned: (panelId) => {
    const { pinnedPanels, hiddenPanels } = get();
    if (pinnedPanels.includes(panelId)) {
      set({ pinnedPanels: pinnedPanels.filter((p) => p !== panelId) });
    } else {
      set({
        pinnedPanels: [...pinnedPanels, panelId],
        hiddenPanels: hiddenPanels.filter((p) => p !== panelId),
      });
    }
  },
  restoreRecommendedLayout: () => {
    const state = get();
    const zoomDefaults = modeZoomDefaults(state.cockpitLayoutMode);
    set({
      hiddenPanels: getRecommendedHiddenPanels(state.cockpitLayoutMode, state.pinnedPanels),
      focusedPanel: null,
      trafficTargets: [],
      instrumentZoom: {
        ...state.instrumentZoom,
        ...zoomDefaults,
      },
    });
  },
  setInstrumentZoom: (panelId, zoom) => {
    set((state) => ({
      instrumentZoom: {
        ...state.instrumentZoom,
        [panelId]: clampInstrumentZoom(zoom),
      },
    }));
  },
  adjustInstrumentZoom: (panelId, delta) => {
    set((state) => ({
      instrumentZoom: {
        ...state.instrumentZoom,
        [panelId]: clampInstrumentZoom((state.instrumentZoom[panelId] ?? 1) + delta),
      },
    }));
  },
  resetInstrumentZoom: (panelId) => {
    const state = get();
    const defaultZoom = modeZoomDefaults(state.cockpitLayoutMode)[panelId] ?? defaultInstrumentZoom[panelId];
    set({
      instrumentZoom: {
        ...state.instrumentZoom,
        [panelId]: defaultZoom,
      },
    });
  },
  setDemoMode: (demo) => set({ demoMode: demo }),
  setHighContrast: (enabled) => set({ highContrast: enabled }),
  toggleHighContrast: () => set((state) => ({ highContrast: !state.highContrast })),
  toggleSigns: (playChime = true) => {
    set((state) => {
      const next = !state.signsOn;
      // We'll handle the sound in the component or via a side effect
      return { signsOn: next };
    });
  },

  toggleWindows: () => set((state) => ({ windowsLocked: !state.windowsLocked })),

  setIrsMode: (mode) => {
    set((state) => ({
      position: {
        ...state.position,
        irsState: mode,
        irsTimeRemaining:
          mode === 'ALIGNING' ? (state.demoMode ? 1 : 600) : mode === 'FAST_ALIGNING' ? (state.demoMode ? 1 : 30) : 0,
        irsAlignmentProgress: 0,
      },
    }));

    if (mode === 'OFF') {
      alertBus.addAlert({ id: 'irs-off', text: 'IRS OFF', level: 'ADVISORY', source: 'IRS', clearable: true });
    } else {
      alertBus.removeAlert('irs-off');
    }
  },

  clearAlert: (id) => {
    alertBus.removeAlert(id);
    set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) }));
  },

  updateFmsEcosystem: () => {
    const state = get();
    const { position, sensors, navPerformance } = state;
    const updates: Partial<FMCState> = {};

    // 1. IRS Alignment Logic
    if (position.irsState === 'ALIGNING' || position.irsState === 'FAST_ALIGNING') {
      if (position.irsTimeRemaining > 0) {
        const newTime = Math.max(0, position.irsTimeRemaining - 1);
        const total = position.irsState === 'ALIGNING' ? (state.demoMode ? 1 : 600) : state.demoMode ? 1 : 30;
        const progress = Math.round(((total - newTime) / total) * 100);

        updates.position = {
          ...position,
          irsTimeRemaining: newTime,
          irsAlignmentProgress: progress,
        };

        if (newTime === 0) {
          updates.position.irsState = 'NAV';
          updates.position.irsAlignmentProgress = 100;
        }
      }
    }

    // 2. Performance & Fuel Logic
    const fuelFlow = PerformanceEngine.calculateFuelFlow(state.flightPhase, state.aircraftState?.altitude || 0);
    const newFuel = PerformanceEngine.updateFuelState(state.performance.fuel, fuelFlow, 1);

    updates.performance = {
      ...state.performance,
      fuel: newFuel,
      grossWeight: (state.performance.zfw || 100000) + newFuel,
    };

    if (newFuel < 5000 && state.performance.fuel >= 5000) {
      alertBus.addAlert({ id: 'fuel-low', text: 'FUEL LOW', level: 'CAUTION', source: 'PERF', clearable: false });
    }

    // 3. Navigation Source & ANP Logic
    const activeSource = selectFmcPositionSource(sensors);
    const anp = calculateANP(sensors, activeSource);
    const rnp = DEFAULT_RNP[navPerformance.phase] || 2.0;

    // Simulate sensor drift if IRS is active
    const newSensors = sensors.map((s) => {
      if (s.source === 'IRS' && s.available) {
        return { ...s, positionErrorNm: calculateIrsDrift(s.positionErrorNm, 1) };
      }
      return s;
    });

    updates.sensors = newSensors;
    updates.activeNavSource = activeSource;
    updates.navPerformance = { ...navPerformance, anp, rnp, anpNm: anp, rnpNm: rnp };

    // 3. Dynamic Aircraft State (GS/Track)
    if (state.aircraftState) {
      const { heading, tas, indicatedAirspeedKt: prevIas } = state.aircraftState;
      const { windDir, windSpeed } = state.takeoff; // Using takeoff wind as ambient for now

      const { gs, track } = calculateGroundSpeedAndTrack(heading || 0, tas || 0, windDir || 0, windSpeed || 0);

      const currentIas = updates.aircraftState?.indicatedAirspeedKt ?? prevIas;
      const accel = (currentIas - prevIas) / 1; // 1 second tick

      updates.aircraftState = {
        ...state.aircraftState,
        gs: gs,
        track: track,
        accelerationKtS: accel,
      };

      // Record Flight Path for Debrief
      if (state.aircraftState.lat !== undefined && state.aircraftState.lon !== undefined) {
        const history = [
          ...state.flightPathHistory,
          { lat: state.aircraftState.lat, lon: state.aircraftState.lon, timestamp: Date.now() },
        ];
        updates.flightPathHistory = history.slice(-1000); // Keep last 1000 seconds

        // Leg Sequencing Logic
        const waypoints = state.flightPlan.waypoints;
        if (waypoints.length > 0 && state.flightPhase !== 'DONE') {
          const currentLeg = waypoints[0];
          const nextLeg = waypoints[1];
          const { sequence, reason } = LegSequencer.shouldSequence(currentLeg, nextLeg, state.aircraftState);

          if (sequence) {
            devLog(`Sequencing: ${reason}`);

            // Check restrictions for the leg we just finished
            const result = LegSequencer.checkRestrictions(currentLeg, state.aircraftState);
            if (!result.ok && state.activeScenario) {
              const mistake = { id: Date.now().toString(), text: result.message!, timestamp: Date.now() };
              AuralAlertService.playChime();
              set((s) => ({
                activeScenario: s.activeScenario
                  ? {
                      ...s.activeScenario,
                      mistakes: [...(s.activeScenario.mistakes || []), mistake],
                    }
                  : null,
              }));
            }

            const newWaypoints = waypoints.slice(1);
            updates.flightPlan = { ...state.flightPlan, waypoints: newWaypoints };

            // Auto-advance phase if appropriate
            if (newWaypoints.length === 0) {
              updates.flightPhase = 'DONE';
            }
          }
        }
      }

      // 5. Training Scenario Engine
      const { updates: scenarioUpdates, completedEvents } = scenarioEngine.update(state);
      if (Object.keys(scenarioUpdates).length > 0) {
        Object.assign(updates, scenarioUpdates);
      }
      if (completedEvents.length > 0) {
        set({ activeScenario: { ...scenarioEngine.getActiveScenario() } });
      }
    }

    // 5b. Active Training Lesson Auto-Verification
    if (state.trainingActive && state.trainingEngine && state.trainingScenario) {
      const currentStep = state.trainingScenario.steps[state.trainingStepIndex];
      if (currentStep?.stateValidation && currentStep.stateValidation.length > 0) {
        const isValid = state.trainingEngine.validateState(
          state as unknown as Record<string, unknown>,
          currentStep.stateValidation,
        );
        if (isValid) {
          get().processTrainingAction(currentStep.expectedAction);
        }
      }
    }

    // 4. Alerts
    if (anp > rnp) {
      alertBus.addAlert({ id: 'unable-rnp', text: 'UNABLE RNP', level: 'CAUTION', source: 'FMC', clearable: false });
    } else {
      alertBus.removeAlert('unable-rnp');
    }

    updates.alerts = alertBus.getAlerts();

    // 4. Tutorial Progression (State-based)
    if (state.tutorialActive && state.tutorialScenario) {
      const scenario = findTutorial(state.tutorialScenario);
      const step = scenario?.steps[state.tutorialStepIndex];
      if (step && state.currentPage === step.page && step.validate('', { ...state, ...updates })) {
        state.advanceTutorial();
      }
    }

    let apUpdates = AutoflightModeManager.tick(state.autopilot.truth, state);

    const isAirbus = state.aircraft === 'AIRBUS_A320';
    const targetAlt = isAirbus ? state.autopilot.airbus.altitude : state.autopilot.boeing.altitude;
    const currentAlt = state.aircraftState?.altitudeFt ?? state.aircraftState?.altitude ?? 0;
    const deltaH = targetAlt - currentAlt;
    const absDeltaH = Math.abs(deltaH);
    const activeVertical = apUpdates?.verticalActive ?? state.autopilot.truth.verticalActive;

    let altStarTriggered = false;
    if (
      activeVertical !== 'ALT*' &&
      activeVertical !== 'ALT_HOLD' &&
      activeVertical !== 'OFF' &&
      activeVertical !== 'G_S' &&
      state.autopilot.truth.autopilotStatus !== 'OFF' &&
      absDeltaH <= 400
    ) {
      apUpdates = {
        ...(apUpdates || {}),
        verticalActive: 'ALT*',
        vsEntry: state.aircraftState?.verticalSpeedFpm ?? state.aircraftState?.vs ?? 1000,
        lastModeChangeTimestamps: {
          ...(apUpdates?.lastModeChangeTimestamps ?? state.autopilot.truth.lastModeChangeTimestamps),
          vertical: Date.now(),
        },
      };
      altStarTriggered = true;
    }

    if (apUpdates || state.autopilot.truth.verticalActive === 'ALT*' || altStarTriggered) {
      const nextTruth = { ...state.autopilot.truth, ...apUpdates };
      let boeingUpdate = {};
      let airbusUpdate = {};

      if (nextTruth.verticalActive === 'ALT*') {
        const vsEntry =
          nextTruth.vsEntry !== undefined
            ? nextTruth.vsEntry
            : (state.aircraftState?.verticalSpeedFpm ?? state.aircraftState?.vs ?? 1000);
        if (absDeltaH <= 20) {
          apUpdates = {
            ...(apUpdates || {}),
            verticalActive: 'ALT_HOLD',
            vsEntry: undefined,
            lastModeChangeTimestamps: {
              ...(apUpdates?.lastModeChangeTimestamps ?? state.autopilot.truth.lastModeChangeTimestamps),
              vertical: Date.now(),
            },
          };
          if (isAirbus) {
            airbusUpdate = { verticalSpeed: 0 };
          } else {
            boeingUpdate = { verticalSpeed: 0, altHold: true, vs: false, vnav: false, lvlChg: false };
          }
        } else {
          const k = 0.005;
          const vsTarget = Math.round(vsEntry * (1 - Math.exp(-k * absDeltaH)));
          if (isAirbus) {
            airbusUpdate = { verticalSpeed: vsTarget };
          } else {
            boeingUpdate = { verticalSpeed: vsTarget };
          }
          apUpdates = {
            ...(apUpdates || {}),
            vsEntry: vsEntry,
          };
        }
      }

      updates.autopilot = {
        ...state.autopilot,
        truth: { ...state.autopilot.truth, ...apUpdates },
        boeing: { ...state.autopilot.boeing, ...boeingUpdate },
        airbus: { ...state.autopilot.airbus, ...airbusUpdate },
      };
    }

    // 6. GPWS Logic
    const gpwsResult = gpwsEngine.update(state, 1); // 1s tick
    updates.gpwsAlert = gpwsResult.alert;
    // (Aural alerts handled by useAuralAlerts hook)
    if (gpwsResult.callout) {
      AuralAlertService.playVoice(gpwsResult.callout.toString());
    }

    // 7. TCAS Logic
    const tcasResult = tcasEngine.update(state, 1);
    updates.tcasAlert = tcasResult.alert;
    // (Aural alerts handled by useAuralAlerts hook)
    updates.trafficTargets = tcasResult.targets;

    if (Object.keys(updates).length > 0) {
      set(updates);
    }
  },

  highlightControl: (controlId) => {
    set({
      tutorialHighlight: controlId,
      tutorialHintLevel: 2,
    });

    const clearHighlight = () => {
      if (get().tutorialHighlight === controlId) {
        set({
          tutorialHighlight: null,
          tutorialHintLevel: 0,
        });
      }
    };

    if (typeof window === 'undefined') {
      setTimeout(clearHighlight, 2500);
      return;
    }

    window.setTimeout(clearHighlight, 2500);
  },
}));

// Synchronize aircraft changes from AircraftStore to FMCStore
useAircraftStore.subscribe((state, prevState) => {
  if (state.aircraft !== prevState.aircraft) {
    useFMCStore.getState().setAircraft(state.aircraft);
  }
});

// Synchronize standalone cockpit autoflight state from AutopilotStore.
useAutopilotStore.subscribe((state) => {
  useFMCStore.setState({ autopilot: { boeing: state.boeing, airbus: state.airbus, truth: state.truth } });
});

// Synchronize cockpit layout from CockpitLayoutStore
useCockpitLayoutStore.subscribe((state) => {
  useFMCStore.setState({
    cockpitMode: state.cockpitMode,
    cockpitLayoutMode: state.cockpitLayoutMode,
    hiddenPanels: state.hiddenPanels,
    pinnedPanels: state.pinnedPanels,
    focusedPanel: state.focusedPanel,
    instrumentZoom: state.instrumentZoom,
    highContrast: state.highContrast,
    brightness: state.brightness,
  });
});

// Synchronize connection from ConnectionStore
useConnectionStore.subscribe((state) => {
  useFMCStore.setState({
    connectionStatus: state.connectionStatus,
    connectionMode: state.connectionMode,
    connectedAircraft: state.connectedAircraft,
    connectedAircraftType: state.connectedAircraftType,
    connectedCapabilities: state.connectedCapabilities,
    structuredCapabilities: state.structuredCapabilities,
    adapterHealth: state.adapterHealth,
    lastError: state.lastError,
    simVariables: state.simVariables,
    latency: state.latency,
    sessionStartTime: state.sessionStartTime,
  });
});

// Start the FMS Ecosystem tick (1Hz)
if (typeof window !== 'undefined') {
  setInterval(() => {
    useFMCStore.getState().updateFmsEcosystem();
  }, 1000);

  // Expose stores for E2E testing only in non-production builds
  if (import.meta.env.MODE !== 'production') {
    const win = window as unknown as E2EWindow;
    win.useFMCStore = useFMCStore;
    win.useAircraftStore = useAircraftStore;
    win.useAutopilotStore = useAutopilotStore;
    win.useConnectionStore = useConnectionStore;
    win.useCockpitLayoutStore = useCockpitLayoutStore;
  }

  interface E2EWindow extends Window {
    useFMCStore: typeof useFMCStore;
    useAircraftStore: typeof useAircraftStore;
    useAutopilotStore: typeof useAutopilotStore;
    useConnectionStore: typeof useConnectionStore;
    useCockpitLayoutStore: typeof useCockpitLayoutStore;
  }
}
