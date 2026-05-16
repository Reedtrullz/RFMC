import type { CockpitLayoutMode } from '@shared';
import type { PanelId } from '../workspace/panelTypes';
import type { InstrumentTarget } from '../layout/instrumentDimensions';

export type CockpitSlot =
  | 'cduslot'
  | 'ndslot'
  | 'mcpslot'
  | 'pfdslot';

export interface SlotPlacement {
  panel: PanelId;
  area: CockpitSlot;
  preferredScale?: number;
  minScale?: number;
  maxScale?: number;
}

export interface CockpitLayoutPreset {
  id: CockpitLayoutMode;
  stageClass: string;
  gridAreas: string;
  gridColumns: string;
  gridRows: string;
  slots: SlotPlacement[];
}

export const cockpitLayoutPresets: Record<string, CockpitLayoutPreset> = {
  'fmc-focus': {
    id: 'fmc-focus',
    stageClass: 'cockpit-stage--fmc-focus',
    gridAreas: '"sidebar cdu cdu tray"',
    gridColumns: '220px minmax(480px, 680px) 1fr 60px',
    gridRows: '1fr',
    slots: [
      { panel: 'cdu', area: 'cduslot', preferredScale: 1.3, minScale: 0.9, maxScale: 1.5 },
    ],
  },
  navigation: {
    id: 'navigation',
    stageClass: 'cockpit-stage--navigation',
    gridAreas: '"ndslot cduslot"',
    gridColumns: 'minmax(420px, 1fr) minmax(400px, 540px)',
    gridRows: '1fr',
    slots: [
      { panel: 'nd', area: 'ndslot', preferredScale: 1.0, minScale: 0.8, maxScale: 1.2 },
      { panel: 'cdu', area: 'cduslot', preferredScale: 1.1, minScale: 0.85, maxScale: 1.3 },
    ],
  },
  automation: {
    id: 'automation',
    stageClass: 'cockpit-stage--automation',
    gridAreas: '"mcpslot mcpslot"\n"pfdslot ndslot"',
    gridColumns: '1fr 1fr',
    gridRows: '160px 1fr',
    slots: [
      { panel: 'autoflight', area: 'mcpslot', preferredScale: 1.0, minScale: 0.7, maxScale: 1.1 },
      { panel: 'pfd', area: 'pfdslot', preferredScale: 1.0, minScale: 0.8, maxScale: 1.2 },
      { panel: 'nd', area: 'ndslot', preferredScale: 1.0, minScale: 0.8, maxScale: 1.2 },
    ],
  },
  approach: {
    id: 'approach',
    stageClass: 'cockpit-stage--approach',
    gridAreas: '"mcpslot mcpslot"\n"pfdslot ndslot"',
    gridColumns: '1fr 1fr',
    gridRows: '140px 1fr',
    slots: [
      { panel: 'autoflight', area: 'mcpslot', preferredScale: 0.85, minScale: 0.6, maxScale: 1.0 },
      { panel: 'pfd', area: 'pfdslot', preferredScale: 1.05, minScale: 0.85, maxScale: 1.3 },
      { panel: 'nd', area: 'ndslot', preferredScale: 1.05, minScale: 0.85, maxScale: 1.3 },
    ],
  },
  'full-deck': {
    id: 'full-deck',
    stageClass: 'cockpit-stage--full-deck',
    gridAreas: '"mcpslot mcpslot"\n"pfdslot ndslot"\n"cduslot cduslot"',
    gridColumns: '1fr 1fr',
    gridRows: '140px 1fr 340px',
    slots: [
      { panel: 'autoflight', area: 'mcpslot', preferredScale: 0.75, minScale: 0.5, maxScale: 0.9 },
      { panel: 'pfd', area: 'pfdslot', preferredScale: 0.85, minScale: 0.6, maxScale: 1.05 },
      { panel: 'nd', area: 'ndslot', preferredScale: 0.85, minScale: 0.6, maxScale: 1.05 },
      { panel: 'cdu', area: 'cduslot', preferredScale: 0.9, minScale: 0.65, maxScale: 1.1 },
    ],
  },
  'free-practice': {
    id: 'free-practice',
    stageClass: 'cockpit-stage--free-practice',
    gridAreas: '"left right"',
    gridColumns: '1fr 1fr',
    gridRows: '1fr',
    slots: [],
  },
};
