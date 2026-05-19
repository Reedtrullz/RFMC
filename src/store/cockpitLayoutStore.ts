import { create } from 'zustand';
import type { CockpitLayoutMode, PanelId, EFISState, TCASTarget, NDMapMode } from '@shared';
import { getRecommendedHiddenPanels, getTrainingModeConfig } from '../config/trainingModes';

export type InstrumentPanelId = Extract<PanelId, 'cdu' | 'nd' | 'pfd' | 'autoflight'>;

const defaultInstrumentZoom: Record<InstrumentPanelId, number> = {
  cdu: 1.35,
  nd: 1.45,
  pfd: 1.45,
  autoflight: 1.45,
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

export interface CockpitLayoutState {
  cockpitMode: boolean;
  cockpitLayoutMode: CockpitLayoutMode;
  hiddenPanels: PanelId[];
  pinnedPanels: PanelId[];
  focusedPanel: PanelId | null;
  instrumentZoom: Record<InstrumentPanelId, number>;
  highContrast: boolean;
  brightness: number;
  showKeyboardHelp: boolean;
  efisL: EFISState;
  efisR: EFISState;
  trafficTargets: TCASTarget[];
}

export interface CockpitLayoutActions {
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
  setBrightness: (b: number) => void;
  toggleKeyboardHelp: () => void;
  setEFISMode: (side: 'L' | 'R', mode: NDMapMode) => void;
  setEFISRange: (side: 'L' | 'R', range: number) => void;
}

export type CockpitLayoutStore = CockpitLayoutState & CockpitLayoutActions;

export const useCockpitLayoutStore = create<CockpitLayoutStore>((set, get) => ({
  cockpitMode: true,
  cockpitLayoutMode: 'fmc-focus' as CockpitLayoutMode,
  hiddenPanels: getRecommendedHiddenPanels('fmc-focus'),
  pinnedPanels: [],
  focusedPanel: null,
  instrumentZoom: { ...defaultInstrumentZoom },
  highContrast: false,
  brightness: 100,
  showKeyboardHelp: false,
  efisL: {
    mode: 'MAP',
    range: 40,
    overlays: {
      wpt: false,
      arpt: false,
      sta: false,
      data: false,
      pos: false,
      terr: false,
      wxr: false,
      tfc: false,
      cstr: false,
    },
    centered: true,
    side: 'L',
  },
  efisR: {
    mode: 'MAP',
    range: 40,
    overlays: {
      wpt: false,
      arpt: false,
      sta: false,
      data: false,
      pos: false,
      terr: false,
      wxr: false,
      tfc: false,
      cstr: false,
    },
    centered: true,
    side: 'R',
  },
  trafficTargets: [],

  setCockpitMode: (enabled: boolean) => set({ cockpitMode: enabled }),

  setCockpitLayoutMode: (mode: CockpitLayoutMode) => {
    const config = getTrainingModeConfig(mode);
    set({
      cockpitLayoutMode: mode,
      hiddenPanels: getRecommendedHiddenPanels(mode, get().pinnedPanels),
      instrumentZoom: modeZoomDefaults(mode),
    });
  },

  setHiddenPanels: (panels: PanelId[]) => set({ hiddenPanels: panels }),
  setPinnedPanels: (panels: PanelId[]) => set({ pinnedPanels: panels }),
  setFocusedPanel: (panel: PanelId | null) => set({ focusedPanel: panel }),

  togglePanelHidden: (panelId: PanelId) => {
    const { hiddenPanels } = get();
    if (hiddenPanels.includes(panelId)) {
      set({ hiddenPanels: hiddenPanels.filter((p) => p !== panelId) });
    } else {
      set({ hiddenPanels: [...hiddenPanels, panelId] });
    }
  },

  togglePanelPinned: (panelId: PanelId) => {
    const { pinnedPanels } = get();
    if (pinnedPanels.includes(panelId)) {
      set({ pinnedPanels: pinnedPanels.filter((p) => p !== panelId) });
    } else {
      set({ pinnedPanels: [...pinnedPanels, panelId] });
    }
  },

  restoreRecommendedLayout: () => {
    const { cockpitLayoutMode, pinnedPanels } = get();
    set({
      hiddenPanels: getRecommendedHiddenPanels(cockpitLayoutMode, pinnedPanels),
      instrumentZoom: modeZoomDefaults(cockpitLayoutMode),
    });
  },

  setInstrumentZoom: (panelId: InstrumentPanelId, zoom: number) => {
    set((state) => ({
      instrumentZoom: {
        ...state.instrumentZoom,
        [panelId]: clampInstrumentZoom(zoom),
      },
    }));
  },

  adjustInstrumentZoom: (panelId: InstrumentPanelId, delta: number) => {
    const current = get().instrumentZoom[panelId] ?? 1;
    get().setInstrumentZoom(panelId, current + delta);
  },

  resetInstrumentZoom: (panelId: InstrumentPanelId) => {
    const { cockpitLayoutMode } = get();
    const defaults = modeZoomDefaults(cockpitLayoutMode);
    get().setInstrumentZoom(panelId, defaults[panelId]);
  },

  setHighContrast: (enabled: boolean) => set({ highContrast: enabled }),
  toggleHighContrast: () => set((state) => ({ highContrast: !state.highContrast })),
  setBrightness: (b: number) => set({ brightness: Math.min(100, Math.max(0, b)) }),
  toggleKeyboardHelp: () => set((state) => ({ showKeyboardHelp: !state.showKeyboardHelp })),
  setEFISMode: (side, mode) =>
    set(
      (state) =>
        ({
          [side === 'L' ? 'efisL' : 'efisR']: { ...state[side === 'L' ? 'efisL' : 'efisR'], mode },
        }) as any,
    ),
  setEFISRange: (side, range) =>
    set(
      (state) =>
        ({
          [side === 'L' ? 'efisL' : 'efisR']: { ...state[side === 'L' ? 'efisL' : 'efisR'], range },
        }) as any,
    ),
}));

// ─── Dev/test window exposure ─────────────────────────────────────────────────
// Exposes the store on window in non-production builds so Playwright helpers
// (dismissWelcome, ensureTrainingMode) can read cockpitMode without races.
if (typeof window !== 'undefined' && import.meta.env.MODE !== 'production') {
  (window as any).useCockpitLayoutStore = useCockpitLayoutStore;
}
