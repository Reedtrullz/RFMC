export * from './types/fmc';
export * from './types/webSocket';

// FMC logic — shared between frontend and backend
export { PAGE_LINES, PAGE_WIDTH, SCRATCHPAD_MAX, LSK_COUNT } from './fmc/constants';
export { getPageRenderer } from './fmc/pages';
export { getAirbusPageRenderer } from './fmc/pages/airbus';
export { parseRouteString, greatCircleDistance } from './fmc/flightPlanParser';
export { parseSimBrief, parseSimBriefXML, parseSimBriefJSON } from './fmc/simbriefParser';
export { tutorialScenarios, getTutorialScenario } from './fmc/tutorialEngine';
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
} from './fmc/validation';
export type { ValidationResult } from './fmc/validation';
export { devLog, devWarn, devError } from './logger';
