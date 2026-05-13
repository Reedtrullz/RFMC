import type { DisplayColor } from '../fmc/displayColors';
import type { DisplaySemantic } from '../fmc/displaySemantics';
import type { NDMapMode } from '../fmc/ndTypes';
import type { TrainingScenario, TrainingMistake, TrainingScore } from '../training/trainingTypes';
import type { TrainingScenarioEngine } from '../training/scenarioEngine';

// ============================================================
// Core FMC types shared between frontend and backend
// ============================================================

/** Aircraft variant */
export type AircraftType = 'BOEING_737' | 'AIRBUS_A320';

export interface EFISState {
  mode: NDMapMode;           // 737: APP, VOR, MAP, PLN; A320: ROSE, ARC, PLAN
  range: number;          // 10, 20, 40, 80, 160, 320, 640
  overlays: {
    wpt: boolean;
    arpt: boolean;
    sta: boolean;
    data: boolean;
    pos: boolean;
    terr: boolean;
    wxr: boolean;
    tfc: boolean;
    cstr: boolean;
  };
  centered: boolean;      // 737 CTR toggle
  side: 'L' | 'R';
}

export type IrsState =
  | 'OFF'
  | 'ALIGNING'
  | 'NAV'
  | 'ATT'
  | 'ALIGN_INTERRUPTED'
  | 'FAST_ALIGNING'
  | 'FAULT';

export type NavSource = 'GPS' | 'DME_DME' | 'VOR_DME' | 'LOC' | 'IRS' | 'LOC_GPS';

export interface NavSensor {
  source: NavSource;
  available: boolean;
  positionErrorNm: number;
  tunedStation?: string;
}

export interface NavigationPerformance {
  anpNm: number;
  anp: number;
  rnp: number;
  rnpManual: boolean;
  activeSource: NavSource;
  rnpNm: number;
  phase: 'TAKEOFF' | 'ENROUTE' | 'OCEANIC' | 'TERMINAL' | 'APPROACH';
}

export type AlertLevel = 'WARNING' | 'CAUTION' | 'ADVISORY' | 'STATUS';

export interface FlightDeckAlert {
  id: string;
  text: string;
  level: AlertLevel;
  source: 'FMC' | 'IRS' | 'AFDS' | 'EICAS' | 'NAV' | 'PERF';
  timestamp: number;
  clearable: boolean;
}

/** All possible Boeing 737 CDU pages */
export type BoeingPageType =
  | 'IDENT'
  | 'POS_INIT'
  | 'RTE'
  | 'DEP_ARR'
  | 'PERF_INIT'
  | 'THRUST_LIM'
  | 'TAKEOFF_REF'
  | 'LEGS'
  | 'PROGRESS'
  | 'HOLD'
  | 'FIX'
  | 'MENU'
  | 'TUTORIAL'
  | 'CLB'
  | 'CRZ'
  | 'DES'
  | 'DIR_INTC'
  | 'NAV_DATA'
  | 'N1_LIMIT';

/** All possible Airbus A320 MCDU pages */
export type AirbusPageType =
  | 'INIT_A'
  | 'INIT_B'
  | 'F_PLN'
  | 'DEP_ARR_A'
  | 'PERF_TAKEOFF'
  | 'PERF_APPR'
  | 'FUEL_PRED'
  | 'SEC_FPLN'
  | 'RAD_NAV'
  | 'PROG_A'
  | 'DATA_INDEX'
  | 'MCDU_MENU'
  | 'AC_STATUS'
  | 'ATSU'
  | 'ATSU_MSGS';

/** All possible FMC pages (Boeing + Airbus) */
export type PageType = BoeingPageType | AirbusPageType;

export type FlightPhase =
  | 'PREFLIGHT'
  | 'TAXI'
  | 'TAKEOFF'
  | 'CLIMB'
  | 'CRUISE'
  | 'DESCENT'
  | 'APPROACH'
  | 'GO_AROUND'
  | 'DONE';

export type MessageSeverity = 'ADVISORY' | 'IMPORTANT' | 'ALERT';

export interface FmcMessage {
  id: string;
  text: string;
  severity: MessageSeverity;
  color: 'white' | 'amber';
  timestamp: number;
  type?: 1 | 2; // Airbus Type I or II
}

export type McduColor = 'white' | 'blue' | 'green' | 'amber' | 'magenta' | 'yellow';
export type McduFont = 'small' | 'large';

export interface McduToken {
  text: string;
  color: McduColor;
  font: McduFont;
  align?: 'left' | 'right' | 'center';
}

export interface McduLine {
  left?: McduToken[];
  right?: McduToken[];
  center?: McduToken[];
}

export interface McduPage {
  title: string;
  lines: McduLine[]; // Strictly 14 lines in the renderer
}

/** A single line on the CDU display (Legacy - to be migrated) */
export interface DisplayLine {
  text: string;
  leftLabel?: string;
  rightLabel?: string;
  inverse?: boolean;
  small?: boolean;
  blinking?: boolean;
  color?: DisplayColor;
  semantic?: DisplaySemantic;
}

import type { DisplaySegment } from './display';
export type { DisplaySegment };

/** Full CDU display data — what gets rendered on screen */
export interface DisplayData {
  /** 14 lines of display content */
  lines: DisplayLine[];
  /** Title line text (first line, usually inverse video) */
  title: string;
  /** Page indicator (e.g., "1/2") */
  pageIndicator?: string;
  /** Optional explicit character segments for true grid rendering */
  segments?: DisplaySegment[];
  /** LSK handler identifiers — which actions are available on each LSK */
  lskActions: Record<string, string | null>;
  lskLabels?: Record<string, string>;
  /** Error message for the scratchpad (e.g., "NOT SUPPORTED") */
  scratchpadError?: string | null;
}

/** A Line Select Key identifier */
export type LSKId = 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6' | 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6';

/** A CDU keyboard key */
export type CDUKey =
  | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J'
  | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T'
  | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z'
  | 'DOT' | 'PLUS_MINUS' | 'SLASH' | 'SPACE'
  | 'CLR' | 'DEL' | 'EXEC'
  | 'NEXT_PAGE' | 'PREV_PAGE'
  | 'INIT_REF' | 'RTE' | 'CLB' | 'CRZ' | 'DES' | 'DIR_INTC' | 'LEGS'
  | 'DEP_ARR' | 'HOLD' | 'PERF' | 'PROG' | 'N1_LIMIT' | 'FIX' | 'MENU'
  | 'INIT_A' | 'INIT_B' | 'F_PLN' | 'PERF_TAKEOFF' | 'PROG_A' | 'DEP_ARR_A' | 'MCDU_MENU' | 'RAD_NAV' | 'DATA_INDEX'
  | 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6'
  | 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6';

/** Connection mode */
export type ConnectionMode = 'STANDALONE' | 'SYNC' | 'CONTROL';

/** FMC operating mode */
export type FMCMode = 'STANDBY' | 'ACTIVE' | 'TUTORIAL' | 'FAIL' | 'OFF';

/** Connection status */
export type ConnectionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

// ---- Flight Plan Types ----

export type AltitudeConstraintType = 'AT' | 'AT_OR_ABOVE' | 'AT_OR_BELOW' | 'BETWEEN';

export interface AltitudeConstraint {
  type: AltitudeConstraintType;
  altitude: number;       // feet
  altitude2?: number;     // for BETWEEN
}

export type SpeedConstraintType = 'AT' | 'AT_OR_ABOVE' | 'AT_OR_BELOW';

export interface SpeedConstraint {
  type: SpeedConstraintType;
  speed: number;          // knots
}

export interface FlightPlanWaypoint {
  ident: string;
  lat?: number;
  lon?: number;
  coordinateSource?: 'navdb' | 'simbrief' | 'manual' | 'synthetic' | 'unknown';
  altitudeConstraint?: AltitudeConstraint;
  speedConstraint?: SpeedConstraint;
  discontinuity: boolean;
  airway?: string;
  legType?: string; // ARINC 424 Leg Type (e.g., TF, DF, IF)
}

export interface FlightPlan {
  origin: string;
  destination: string;
  flightNumber: string;
  route: string;
  waypoints: FlightPlanWaypoint[];
  alternate?: string;
}

// ---- Performance Data ----

export interface TakeoffData {
  runway: string;
  toMode: string;
  assumedTemp: number;
  v1: number;
  vr: number;
  v2: number;
  suggestedV1?: number;
  suggestedVr?: number;
  suggestedV2?: number;
  trim: number;
  oat: number;
  windDir: number;
  windSpeed: number;
  qnh: number;
  flaps?: string;
  flexTemp?: number;
}

export interface LandingData {
  runway: string;
  flaps: string;
  vref: number;
  ilsFrequency: string;
  course: number;
}

export interface RadioData {
  vor1: string;
  vor2: string;
  adf1: string;
}

export interface PerformanceData {
  crzAlt: number;
  costIndex: number;
  zfw: number;
  fuel: number;
  cg: number;
  reserve: number;
  grossWeight: number;
  clbWindDir?: number;
  clbWindSpeed?: number;
  crzWindDir?: number;
  crzWindSpeed?: number;
  desWindDir?: number;
  desWindSpeed?: number;
  isaDev?: number;
}

export interface PositionData {
  refAirport: string;
  gate: string;
  lat: number;
  lon: number;
  irsState: IrsState;
  irsAlignmentProgress: number; // 0-100
  irsTimeRemaining: number;     // seconds
}

export interface IdentData {
  aircraftType: string;
  engRating: string;
  navDataVersion: string;
  opProgram: string;
}

export interface RouteData {
  origin: string | null;
  destination: string | null;
  flightNumber: string | null;
  routeString?: string;
  companyRoute?: string;
  sid?: string | null;
  star?: string | null;
  approach?: string | null;
  coRoute?: string | null;
  runway?: string | null;
  alternate?: string;
  directTo?: string;
}

export interface FixEntry {
  refFix: string;
  radial: number;
  distance: number;
}

// ---- Tutorial Types ----

import type { PanelId, CockpitLayoutMode } from './cockpit';

export interface TutorialStep {
  id: string;
  instruction: string;
  expectedAction: string;
  validate: (input: string, state: FMCState) => boolean;
  page: PageType;
  highlightField?: string;
  role?: 'PF' | 'PM';
  requiredPanels?: PanelId[];
  preferredLayout?: CockpitLayoutMode;
  focusPanel?: PanelId;
}

export interface TutorialScenario {
  name: string;
  description: string;
  steps: TutorialStep[];
  setup: () => (keyof FMCState)[];
  standardTimeMs?: number;
}

// ---- Full FMC State (for shared logic) ----

import type { AutopilotState } from '../autopilot/autopilotTypes';

export interface FMCState {
  aircraft: AircraftType;
  mode: FMCMode;
  page: PageType;
  
  autopilot: AutopilotState;
  
  efisL: EFISState;
  efisR: EFISState;

  currentPage: PageType;
  pageHistory: PageType[];
  scratchpad: string;
  scratchpadError: string | null;
  demoMode: boolean;
  
  ident: IdentData;
  position: PositionData;
  performance: PerformanceData;
  takeoff: TakeoffData;
  landing: LandingData;
  route: RouteData;
  flightPlan: FlightPlan;
  
  pendingRoute: RouteData | null;
  pendingFlightPlan: FlightPlan | null;
  
  isModified: boolean;
  execLit: boolean;
  msgLight: boolean;
  
  connectionStatus: ConnectionStatus;
  connectionMode: ConnectionMode;
  connectedAircraft: string | null;
  connectedAircraftType: AircraftType | null;
  connectedCapabilities: string[] | null;
  lastError: string | null;
  simVariables: Record<string, number>;
  failureMessage: string | null;
  externalDisplayData: DisplayData | null;
  airbusFmgc?: AirbusFmgcState;

  // New FMS Ecosystem fields
  navPerformance: NavigationPerformance;
  
  // Training state
  trainingActive: boolean;
  trainingScenario: TrainingScenario | null;
  trainingEngine: TrainingScenarioEngine | null;
  trainingMistakes: TrainingMistake[];
  trainingScore: TrainingScore | null;
  trainingStepIndex: number;
  trainingCompleted: boolean;
  activeScenario: any | null;
  flightPathHistory: { lat: number; lon: number; timestamp: number }[];
  debriefMode: boolean;
  isReportVisible: boolean;
  tutorialHintLevel: number;
  tutorialHintTimer: any;


  activeNavSource: NavSource;
  sensors: NavSensor[];
  alerts: FlightDeckAlert[];
  
  signsOn: boolean;
  windowsLocked: boolean;

  hold: {
    fix: string;
    inboundCourse: number;
    legTime: number;
    legDist: number;
    direction: 'L' | 'R';
  };
  holdPending: {
    fix: string;
    inboundCourse: number;
    legTime: number;
    legDist: number;
    direction: 'L' | 'R';
  } | null;

  // FIX page state
  fix: {
    refFix: string;
    radial: number;
    distance: number;
  };
  fixEntries: FixEntry[];

  // Multi-page state
  legsPageIndex: number;
  legsPageCount: number;
  depArrSubPage: 'DEP' | 'ARR';
  rteSubPage: number;
  posPageIndex: number;
  takeoffRefPageIndex: number;

  deleteMode: boolean;
  editWaypointIndex: number | null;

  aircraftState: AircraftState | null;

  brightness: number;
  cockpitMode: boolean;
  latency: number;
  sessionStartTime: number | null;
  radios: RadioData;

  // Tutorial state
  tutorialActive: boolean;
  tutorialCompleted: boolean;
  tutorialStepIndex: number;
  selectedPlanWaypointIndex: number | null;
  tutorialScenario: string | null;
  tutorialStartTime: number | null;
  tutorialErrors: number;
  tutorialHint: string | null;
  tutorialSkipAvailable: boolean;
  tutorialHighlight: string | null;
  tutorialConfidence: number | null;

  // ATSU / ACARS State
  atsu: {
    messages: AcarsMessage[];
    pendingUplink: FlightPlan | null;
  };

  // New logic systems
  flightPhase: FlightPhase;
  scratchpadMessages: FmcMessage[];
  
  // Cockpit Layout State
  cockpitLayoutMode: CockpitLayoutMode;
  hiddenPanels: PanelId[];
  pinnedPanels: PanelId[];
  focusedPanel: PanelId | null;
}

export interface AcarsMessage {
  id: string;
  from: string;
  text: string;
  timestamp: number;
  read: boolean;
  type: 'AOC' | 'ATC' | 'WEATHER';
}

export interface AirbusFmgcState {
  fm1Healthy: boolean;
  fm2Healthy: boolean;
  mode: 'DUAL' | 'SINGLE_1' | 'SINGLE_2' | 'INDEPENDENT';
  leftMcduSource: 'FMGC1' | 'FMGC2' | 'ATSU' | 'CFDS';
  rightMcduSource: 'FMGC1' | 'FMGC2' | 'ATSU' | 'CFDS';
  temporaryFlightPlan?: FlightPlan;
  secondaryFlightPlan?: FlightPlan;
}

export interface AircraftTelemetry {
  lat: number;
  lon: number;
  headingDeg: number;
  trackDeg: number;
  altitudeFt: number;
  indicatedAirspeedKt: number;
  trueAirspeedKt?: number;
  groundSpeedKt?: number;
  verticalSpeedFpm: number;
  pitchDeg?: number;
  bankDeg?: number;
  radioAltitudeFt?: number;
}

export interface AircraftState extends AircraftTelemetry {
  // Compatibility fields
  altitude: number;
  heading: number;
  ias: number;
  tas: number;
  vs: number;
  gs: number;
  track: number;
  
  fuelTotal: number;
  gw: number;
  accelerationKtS?: number;
  selectedHeading?: number;
}
