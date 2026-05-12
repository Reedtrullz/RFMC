import type { DisplayColor } from '../fmc/displayColors';
import type { DisplaySemantic } from '../fmc/displaySemantics';

// ============================================================
// Core FMC types shared between frontend and backend
// ============================================================

/** Aircraft variant */
export type AircraftType = 'BOEING_737' | 'AIRBUS_A320';

export interface EFISState {
  mode: string;           // 737: APP, VOR, MAP, PLN; A320: ROSE, ARC, PLAN
  range: number;          // 10, 20, 40, 80, 160, 320, 640
  overlays: {
    fix: boolean;
    hold: boolean;
    wpt: boolean;
    arpt: boolean;
    sta: boolean;
    data: boolean;
    pos: boolean;
    terr: boolean;
    wxr: boolean;
    tfc: boolean;
  };
  centered: boolean;      // 737 CTR toggle
  side: 'L' | 'R';
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
  | 'MCDU_MENU';

/** All possible FMC pages (Boeing + Airbus) */
export type PageType = BoeingPageType | AirbusPageType;

/** A single line on the CDU display */
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

/** Full CDU display data — what gets rendered on screen */
export interface DisplayData {
  /** 14 lines of display content */
  lines: DisplayLine[];
  /** Title line text (first line, usually inverse video) */
  title: string;
  /** Page indicator (e.g., "1/2") */
  pageIndicator?: string;
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
  altitudeConstraint?: AltitudeConstraint;
  speedConstraint?: SpeedConstraint;
  discontinuity: boolean;
  airway?: string;
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
  lat?: number;
  lon?: number;
}

export interface IdentData {
  aircraftType: string;
  engRating: string;
  navDataVersion: string;
  opProgram: string;
}

export interface RouteData {
  origin: string;
  destination: string;
  flightNumber: string;
  companyRoute: string;
  routeString: string;
  runway?: string;
  sid?: string;
  star?: string;
  approach?: string;
  alternate?: string;
  directTo?: string;
}

export interface FixEntry {
  refFix: string;
  radial: number;
  distance: number;
}

// ---- Tutorial Types ----

export interface TutorialStep {
  id: string;
  instruction: string;
  expectedAction: string;
  validate: (input: string) => boolean;
  page: PageType;
  highlightField?: string;
  role?: 'PF' | 'PM';
}

export interface TutorialScenario {
  name: string;
  description: string;
  steps: TutorialStep[];
  setup: () => (keyof FMCState)[];
  standardTimeMs?: number;
}

// ---- Full FMC State (for shared logic) ----

export interface FMCState {
  aircraft: AircraftType;
  currentPage: PageType;
  pageHistory: PageType[];
  scratchpad: string;
  scratchpadError: string | null;
  
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
  
  mode: FMCMode;
  connectionStatus: ConnectionStatus;
  connectionMode: ConnectionMode;
  connectedAircraft: string | null;
  connectedAircraftType: AircraftType | null;
  connectedCapabilities: string[] | null;
  lastError: string | null;
  simVariables: Record<string, number>;
  failureMessage: string | null;
  externalDisplayData: DisplayData | null;

  efisL: EFISState;
  efisR: EFISState;

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
  takeoffRefPageIndex: number;

  deleteMode: boolean;
  editWaypointIndex: number | null;

  aircraftState: {
    position?: { lat: number; lon: number };
    heading?: number;
    altitude?: number;
    speed?: number;
    verticalSpeed?: number;
  } | null;

  brightness: number;
  latency: number;
  sessionStartTime: number | null;
  radios: RadioData;

  // Tutorial state
  tutorialActive: boolean;
  tutorialCompleted: boolean;
  tutorialStepIndex: number;
  tutorialScenario: string | null;
  tutorialStartTime: number | null;
  tutorialErrors: number;
  tutorialHint: string | null;
  tutorialSkipAvailable: boolean;
  tutorialHighlight: string | null;
  tutorialConfidence: number | null;
}
