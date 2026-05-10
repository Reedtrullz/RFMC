export * from './types/fmc';
export * from './types/webSocket';

// FMC logic — shared between frontend and backend
export { PAGE_LINES, PAGE_WIDTH, SCRATCHPAD_MAX, LSK_COUNT } from './fmc/constants';
export { getPageRenderer } from './fmc/pages';
export { getAirbusPageRenderer } from './fmc/pages/airbus';
export { parseRouteString, greatCircleDistance } from './fmc/flightPlanParser';
export { parseSimBrief, parseSimBriefXML, parseSimBriefJSON } from './fmc/simbriefParser';
export { tutorialScenarios, getTutorialScenario } from './fmc/tutorialEngine';
export { airbusTutorialScenarios } from './fmc/tutorials/airbus-tutorials';
export { AIRBUS_KEYS, AIRBUS_FUNCTION_KEYS } from './fmc/airbusKeys';

