import type { DisplayColor } from '../fmc/displayColors';
export { DisplayColor };

// DisplaySemantic moved here to break circular dep: types/fmc.ts ↔ displaySemantics.ts
export type DisplaySemantic =
  | 'title'
  | 'label'
  | 'activeData'
  | 'inactiveData'
  | 'modified'
  | 'guidance'
  | 'warning'
  | 'caution'
  | 'placeholder'
  | 'scratchpad'
  | 'inverse'
  | 'titleBackground'
  | 'pageIndicator';

// Core types (zero-dependency module) — imported to break training cycle
import type { AircraftType, BoeingPageType, AirbusPageType, PageType } from './core';
export type { AircraftType, BoeingPageType, AirbusPageType, PageType };

import type { TrainingScenario, TrainingMistake, TrainingScore } from '../training/trainingTypes';
import type { TrainingScenarioEngine } from '../training/scenarioEngine';
import type { ScratchpadState } from '../fmc/scratchpadEngine';

export interface TCASTarget {
  id: string;
  ident?: string;
  x: number;
  y: number;
  relativeAltitude: number;
  trend: 'climb' | 'descend' | 'level';
  threatLevel: 'other' | 'proximate' | 'traffic' | 'resolution';
}

// ============================================================
// Core FMC types shared between frontend and backend
// ============================================================

// NDMapMode moved here to break circular dep: types/fmc.ts ↔ ndTypes.ts
export type NDMapMode =
  | 'MAP'
  | 'PLN'
  | 'APP'
  | 'VOR' // Boeing
  | 'ROSE_NAV'
  | 'ARC'
  | 'PLAN'
  | 'ROSE_ILS'
  | 'ROSE_VOR'; // Airbus

export interface EFISState {
  mode: NDMapMode; // 737: APP, VOR, MAP, PLN; A320: ROSE, ARC, PLAN
  range: number; // 10, 20, 40, 80, 160, 320, 640
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
  centered: boolean; // 737 CTR toggle
  side: 'L' | 'R';
  tcasMode?: 'ABOVE' | 'BELOW' | 'NORMAL';
}

export type IrsState = 'OFF' | 'ALIGNING' | 'NAV' | 'ATT' | 'ALIGN_INTERRUPTED' | 'FAST_ALIGNING' | 'FAULT';

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
  rnpNm: number;
  rnp: number;
  rnpManual: boolean;
  activeSource: NavSource;
  phase: 'TAKEOFF' | 'ENROUTE' | 'OCEANIC' | 'TERMINAL' | 'APPROACH';
  xteNm: number;
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
  timestamp: number;
  aircraft?: 'boeing' | 'airbus';
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

// DisplaySegment moved here to break circular dep (was in types/display.ts)
export interface DisplaySegment {
  row: number;
  col: number;
  text: string;
  size?: 'small' | 'normal';
  color?: DisplayColor;
  inverse?: boolean;
  blink?: boolean;
  semantic?: DisplaySemantic;
}

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
  /** Legacy push message — prefixed scratchpad display string */
  fmcPushMessage?: string | null;
}

/** A Line Select Key identifier */
export type LSKId = 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6' | 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6';

/** A CDU keyboard key */
export type CDUKey =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z'
  | 'DOT'
  | 'PLUS_MINUS'
  | 'SLASH'
  | 'SPACE'
  | 'CLR'
  | 'DEL'
  | 'EXEC'
  | 'NEXT_PAGE'
  | 'PREV_PAGE'
  | 'INIT_REF'
  | 'RTE'
  | 'CLB'
  | 'CRZ'
  | 'DES'
  | 'DIR_INTC'
  | 'LEGS'
  | 'DEP_ARR'
  | 'HOLD'
  | 'PERF'
  | 'PROG'
  | 'N1_LIMIT'
  | 'FIX'
  | 'MENU'
  | 'INIT_A'
  | 'INIT_B'
  | 'F_PLN'
  | 'PERF_TAKEOFF'
  | 'PROG_A'
  | 'DEP_ARR_A'
  | 'MCDU_MENU'
  | 'RAD_NAV'
  | 'DATA_INDEX'
  | 'FUEL_PRED'
  | 'SEC_F_PLN'
  | 'ATC_COMM'
  | 'AIR_PORT'
  | 'OVFY'
  | 'L1'
  | 'L2'
  | 'L3'
  | 'L4'
  | 'L5'
  | 'L6'
  | 'R1'
  | 'R2'
  | 'R3'
  | 'R4'
  | 'R5'
  | 'R6';

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
  altitude: number; // feet
  altitude2?: number; // for BETWEEN
}

export type SpeedConstraintType = 'AT' | 'AT_OR_ABOVE' | 'AT_OR_BELOW';

export interface SpeedConstraint {
  type: SpeedConstraintType;
  speed: number; // knots
}

export interface FlightPlanWaypoint {
  ident: string;
  lat?: number;
  lon?: number;
  coordinateSource?: 'navdb' | 'simbrief' | 'manual' | 'synthetic' | 'unknown' | 'UNRESOLVED';
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
  qnh?: number;
  temp?: number;
  windDir?: number;
  windSpeed?: number;
  mda?: number;
  dh?: number;
  ldgConf?: 'FULL' | 'CONF3';
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
  irsTimeRemaining: number; // seconds
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
  subPage?: number;
  highlightField?: string;
  highlightControl?: string;
  hint?: string;
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

/**
 * Named type for the hold entry sub-object stored in FMCState.
 * Exported so fmcStore and other consumers can reference it without
 * repeating the structural type inline.
 */
export interface HoldEntry {
  fix: string;
  inboundCourse: number;
  legTime: number;
  legDist: number;
  direction: 'L' | 'R';
}

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
  fmcPushMessage?: string | null; // transitional — display compat, use scratchpadState instead
  scratchpadState?: ScratchpadState; // canonical scratchpad engine state (transitional — will become required)
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

  hold: HoldEntry;
  holdPending: HoldEntry | null;

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
  trafficTargets: TCASTarget[];
  selectedMessageId: string | null;
  gpwsAlert: string;
  tcasAlert: boolean;
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
  apMaster?: boolean;
  apLnavActive?: boolean;
  apVnavActive?: boolean;
  apHeadingActive?: boolean;
  apAltitudeActive?: boolean;
  apTargetAltitude?: number;

  // Approach / NAV radio state
  approachArmed?: boolean; // Pilot has armed approach mode
  hasLoc?: boolean; // Localizer signal captured
  hasGs?: boolean; // Glideslope signal captured
  locDeviation?: number; // Localizer deviation in dots (-2 to +2)
  gsDeviation?: number; // Glideslope deviation in dots (-2 to +2)

  // Configuration state (needed by GPWS)
  gearDown?: boolean; // Landing gear down
  flapsPosition?: number; // Flaps deployment in degrees
}
