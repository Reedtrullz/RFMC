export * from './types/fmc';
export * from './types/cockpit';
export * from './types/webSocket';

// FMC logic — shared between frontend and backend
export { PAGE_LINES, PAGE_WIDTH, SCRATCHPAD_MAX, LSK_COUNT } from './fmc/constants';
export { getPageRenderer } from './fmc/pages';
export { getAirbusPageRenderer } from './fmc/pages/airbus';
export { parseRouteString, greatCircleDistance, isProcedure } from './fmc/flightPlanParser';
export { parseSimBrief, parseSimBriefXML, parseSimBriefJSON } from './fmc/simbriefParser';
export { buildNavigationDisplayModel } from './fmc/navigationDisplay';
export type {
  NavigationDisplayModel,
  NDMapMode,
  NDRange,
  NDFixOverlay,
  NDHoldOverlay,
  NDRoutePoint,
  NDRouteSegment,
} from './fmc/ndTypes';
export { tutorialScenarios, getTutorialScenario, calculateTutorialGrade, isStepComplete } from './fmc/tutorialEngine';
export {
  AIRPORTS,
  WAYPOINTS,
  AIRWAYS,
  SID_STARS,
  getAirport,
  getWaypoint,
  getAirway,
  getSidStar,
} from './fmc/airFMCData';
export {
  validateIcao,
  validateRouteFixture,
} from './fmc/navdataSchema';
export {
  inferAirbusSemantic,
  inferBoeingSemantic,
} from './fmc/pageLineSemantics';
export type {
  AirportRecord,
  NavdataCycle,
  ProcedureLeg,
  ProcedureLegType,
  ProcedureRecord,
  ProcedureTransition,
  ProcedureType,
  RunwayRecord,
  SimBriefRouteFixture,
} from './fmc/navdataSchema';
export { airbusTutorialScenarios } from './fmc/tutorials/airbus-tutorials';
export { AIRBUS_KEYS, AIRBUS_FUNCTION_KEYS } from './fmc/airbusKeys';
export {
  getColorClass,
  getColorHex,
  isValidColor,
  BOEING_DEFAULT_COLOR,
  AIRBUS_DEFAULT_COLOR,
  COLOR_CLASSES,
  COLOR_HEX,
} from './fmc/displayColors';
export type { DisplayColor, BoeingColor, AirbusColor } from './fmc/displayColors';
export {
  clampDisplayText,
  composeLegacyDisplayLine,
  displayDataToGrid,
  displayLineToSegments,
  scratchpadToGridSegment,
  seg,
  title,
  buildCells,
} from './fmc/displayGrid';
export type { DisplaySegment, DisplayTextSize, GridDisplayData, CellData } from './types/display';
export {
  AIRBUS_SEMANTIC_COLORS,
  BOEING_SEMANTIC_COLORS,
  getSemanticColor,
  withDisplaySemantic,
} from './fmc/displaySemantics';
export type { DisplaySemantic } from './fmc/displaySemantics';
export {
  isValidICAO,
  isValidWaypoint,
  isValidFlightNumber,
  isValidAltitude,
  isValidSpeed,
  isValidTemperature,
  isValidVSpeeds,
  isValidRunway,
  isValidWind,
  isValidFrequency,
  isValidADF,
} from './fmc/validation';
export type { ValidationResult } from './fmc/validation';
export {
  BOEING_737NG_AIRCRAFT_PROFILE,
  BOEING_737NG_DISPLAY_PROFILE,
} from './avionics/profiles';
export type {
  AdapterCapabilities,
  AdapterHealth,
  AdapterHealthState,
  AircraftFamily,
  AircraftProfile,
  ColourTokens,
  DisplayProfile,
  FlightPlanModel,
  InputProfile,
  LightingMode,
  LightingProfile,
  Point,
  Rect,
  ShellGeometry,
  TelemetryFrame,
} from './avionics/profiles';
export { devLog, devWarn, devError } from './logger';
export * from './autopilot/autopilotTypes';
export * from './autopilot/boeingMcpLogic';
export * from './pfd/pfdTypes';
export * from './pfd/boeingPfdModel';
export * from './pfd/airbusPfdModel';
export type {
  Airport,
  ArincLegType,
  ExpandedLeg,
  FixType,
  NavFix,
  Procedure,
  ProcedureType as NavProcedureType,
  ProcedureLeg as NavProcedureLeg,
  Runway,
} from './navdata/navdataTypes';
export * from './navdata/navdataStore';
export * from './navdata/routeExpansion';
export * from './navdata/procedureSelection';
export * from './navdata/constraints';
export * from './navdata/navdataValidation';
export * from './training/trainingTypes';
export * from './training/scenarioEngine';
export * from './training/scoring';
export * from './training/mistakes';
export * from './training/lessonProgress';
export * from './training/boeingLessons';
export * from './training/airbusLessons';
export * from './fmc/waypointParser';
export * from './fmc/fmsNavigation';
export * from './fmc/pageRenderer';
export * from './fmc/MessageService';
export * from './fmc/PhaseManager';
export * from './fmc/VerticalProfileEngine';
export * from './fmc/LegTypeEngine';
export * from './fmc/LegSequencer';
export * from './fmc/NavDatabaseService';
export * from './fmc/RealismManager';
export * from './training/DebriefSystem';
