import type { CockpitLayoutMode, PanelId } from '@shared';

export type LayoutPresetId =
  | 'singleInstrumentFocus'
  | 'twoPanelTraining'
  | 'threePanelTraining'
  | 'fullDeck'
  | 'mobileSwipeDeck';

export type OverlayId = 'instructor' | 'checklist' | 'connection' | 'settings';

export type TrainingModeConfig = {
  id: CockpitLayoutMode;
  label: string;
  purpose: string;
  aircraft: 'b737' | 'a320' | 'both';
  visiblePanels: PanelId[];
  minimumRequiredPanels: PanelId[];
  primaryPanel: PanelId;
  layoutPreset: LayoutPresetId;
  defaultZoom: Partial<Record<PanelId, number>>;
  defaultOverlays: OverlayId[];
  beginnerHint: string;
  practiceTask: string;
  lookAt: string;
};

export const allPanelIds: PanelId[] = [
  'cdu',
  'nd',
  'pfd',
  'autoflight',
  'instructor',
  'checklist',
  'connection',
  'settings',
  'eicas',
];

export const trainingModes: TrainingModeConfig[] = [
  {
    id: 'fmc-focus',
    label: 'Preflight FMC Setup',
    purpose: 'Work close-up in the CDU or MCDU without other cockpit panels competing for attention.',
    aircraft: 'both',
    visiblePanels: ['cdu', 'instructor'],
    minimumRequiredPanels: ['cdu'],
    primaryPanel: 'cdu',
    layoutPreset: 'singleInstrumentFocus',
    defaultZoom: { cdu: 1.75 },
    defaultOverlays: ['instructor'],
    beginnerHint: 'Use this mode for preflight setup, route entry, performance data, and page familiarization.',
    practiceTask: 'Enter route and performance fields through the scratchpad and line select keys.',
    lookAt: 'Watch the scratchpad, EXEC light, and left/right line select prompts.',
  },
  {
    id: 'navigation',
    label: 'Route Verification',
    purpose: 'Practice route, LEGS, FIX, HOLD, and DIR TO workflows with the ND visible beside the CDU/MCDU.',
    aircraft: 'both',
    visiblePanels: ['nd', 'cdu', 'instructor'],
    minimumRequiredPanels: ['nd', 'cdu'],
    primaryPanel: 'nd',
    layoutPreset: 'twoPanelTraining',
    defaultZoom: { nd: 1.38, cdu: 1.38 },
    defaultOverlays: ['instructor'],
    beginnerHint: 'Use this mode when the lesson asks you to verify route geometry or waypoint changes.',
    practiceTask: 'Enter or modify a route, then verify the route line and active waypoint on the ND.',
    lookAt: 'Compare CDU/MCDU route pages with the ND route line, range rings, and waypoint labels.',
  },
  {
    id: 'automation',
    label: 'MCP/FCU Mode Training',
    purpose: 'Learn MCP/FCU mode selection and verify the result on the PFD/FMA and ND.',
    aircraft: 'both',
    visiblePanels: ['autoflight', 'pfd', 'nd', 'instructor'],
    minimumRequiredPanels: ['autoflight', 'pfd'],
    primaryPanel: 'autoflight',
    layoutPreset: 'threePanelTraining',
    defaultZoom: { autoflight: 1.4, pfd: 1.32, nd: 1.32 },
    defaultOverlays: ['instructor'],
    beginnerHint: 'Use this mode for LNAV/VNAV, selected heading, selected altitude, AP, and approach-mode drills.',
    practiceTask: 'Change an automation mode and confirm the FMA/ND response.',
    lookAt: 'Watch MCP/FCU annunciators, FMA labels, heading bug, selected altitude, and route tracking.',
  },
  {
    id: 'approach',
    label: 'Approach Setup & Monitoring',
    purpose: 'Monitor approach setup with PFD/FMA and ND first, while keeping automation controls available.',
    aircraft: 'both',
    visiblePanels: ['pfd', 'nd', 'autoflight', 'checklist'],
    minimumRequiredPanels: ['pfd', 'nd'],
    primaryPanel: 'pfd',
    layoutPreset: 'threePanelTraining',
    defaultZoom: { pfd: 1.42, nd: 1.42, autoflight: 1.35 },
    defaultOverlays: ['checklist'],
    beginnerHint: 'Use this mode when configuring or monitoring an approach.',
    practiceTask: 'Verify approach data, arm approach modes, and monitor lateral/vertical guidance.',
    lookAt: 'Watch the FMA, localizer/approach cues, ND route, and MCP/FCU mode controls.',
  },
  {
    id: 'full-deck',
    label: 'Flight Deck Scan',
    purpose:
      'Show every primary cockpit tool. CDU sits alongside PFD/ND on the main panel for quick cross-checks. EICAS is minimizable in the pedestal.',
    aircraft: 'both',
    visiblePanels: ['autoflight', 'pfd', 'nd', 'cdu', 'eicas'],
    minimumRequiredPanels: ['autoflight', 'pfd', 'nd', 'cdu'],
    primaryPanel: 'autoflight',
    layoutPreset: 'fullDeck',
    defaultZoom: { autoflight: 1.28, pfd: 1.28, nd: 1.28, cdu: 1.28, eicas: 1.28 },
    defaultOverlays: [],
    beginnerHint:
      'MCP sits above. PFD, ND, and CDU share the main panel row. Toggle EICAS via the PANELS toolbar — it appears in the pedestal below.',
    practiceTask: 'Cross-check setup across CDU/MCDU, MCP/FCU, PFD, and ND. Toggle EICAS on/off as needed.',
    lookAt: 'Scan MCP/FCU at the top, PFD/ND/CDU across the middle, and EICAS in the pedestal when enabled.',
  },
  {
    id: 'free-practice',
    label: 'Custom Practice',
    purpose: 'Freely choose visible panels for instrument practice outside a guided lesson.',
    aircraft: 'both',
    visiblePanels: ['cdu', 'nd', 'pfd', 'autoflight', 'eicas'],
    minimumRequiredPanels: ['pfd', 'nd'],
    primaryPanel: 'pfd',
    layoutPreset: 'fullDeck',
    defaultZoom: { pfd: 1, nd: 1, cdu: 1, autoflight: 1, eicas: 1 },
    defaultOverlays: [],
    beginnerHint: 'Use this mode when you want direct panel practice without lesson-driven panel changes.',
    practiceTask: 'Enable only the instruments you want to practice.',
    lookAt: 'Use the Panels toolbar and focus controls to shape your workspace.',
  },
];

export function getTrainingModeConfig(mode: CockpitLayoutMode): TrainingModeConfig {
  return trainingModes.find((item) => item.id === mode) ?? trainingModes[0];
}

export function getRecommendedHiddenPanels(mode: CockpitLayoutMode, pinnedPanels: PanelId[] = []): PanelId[] {
  const config = getTrainingModeConfig(mode);
  const visible = new Set<PanelId>([...config.visiblePanels, ...pinnedPanels]);
  return allPanelIds.filter((panel) => !visible.has(panel));
}

export function validateVisiblePanels(mode: CockpitLayoutMode, hiddenPanels: PanelId[]) {
  const config = getTrainingModeConfig(mode);
  const hidden = new Set(hiddenPanels);
  const missingRequired = config.minimumRequiredPanels.filter((panel) => hidden.has(panel));
  const visibleRequired = config.minimumRequiredPanels.filter((panel) => !hidden.has(panel));

  return {
    valid: missingRequired.length === 0 && visibleRequired.length > 0,
    missingRequired,
    visibleRequired,
    primaryPanelHidden: hidden.has(config.primaryPanel),
  };
}
