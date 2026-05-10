// ============================================================
// Core FMC types shared between frontend and backend
// ============================================================

/** Aircraft variant */
export type AircraftType = 'BOEING_737' | 'AIRBUS_A320';

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
  | 'TUTORIAL';

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
  /** Text content (max 24 chars) */
  text: string;
  /** Optional small left-side label (e.g., arrow, line number) */
  leftLabel?: string;
  /** Optional small right-side label */
  rightLabel?: string;
  /** True for inverse video (green bg, black text) */
  inverse?: boolean;
  /** True for smaller font on this line (used for LEGS page details) */
  small?: boolean;
  /** True if this line should blink */
  blinking?: boolean;
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
  | 'INIT_REF' | 'RTE' | 'DEP_ARR' | 'LEGS'
  | 'PERF' | 'PROG' | 'MENU'
  | 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6'
  | 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6';

/** Connection mode */
export type ConnectionMode = 'STANDALONE' | 'SYNC' | 'CONTROL';

/** FMC operating mode */
export type FMCMode = 'STANDBY' | 'ACTIVE' | 'TUTORIAL';

/** Connection status */
export type ConnectionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

// ---- Flight Plan Types ----

export type AltitudeConstraintType = 'AT' | 'AT_OR_ABOVE' | 'AT_OR_BELOW' | 'BETWEEN';

export interface AltitudeConstraint {
  type: AltitudeConstraintType;
  altitude: number;       // feet
  altitude2?: number;     // for BETWEEN
}

export interface SpeedConstraint {
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

export interface PerformanceData {
  crzAlt: number;
  costIndex: number;
  zfw: number;
  fuel: number;
  cg: number;
  reserve: number;
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
}

// ---- Tutorial Types ----

export interface TutorialStep {
  id: string;
  instruction: string;
  expectedAction: string;
  validate: (input: string) => boolean;
  page: PageType;
  highlightField?: string;
}

export interface TutorialScenario {
  name: string;
  description: string;
  steps: TutorialStep[];
  setup: () => (keyof FMCState)[];
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
  route: RouteData;
  flightPlan: FlightPlan;
  
  isModified: boolean;
  execLit: boolean;
  msgLight: boolean;
  
  mode: FMCMode;
  connectionStatus: ConnectionStatus;
  connectionMode: ConnectionMode;
  
  // Multi-page state
  legsPageIndex: number;
  legsPageCount: number;
  depArrSubPage: 'DEP' | 'ARR';
  rteSubPage: number;
}
