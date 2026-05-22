import { create } from 'zustand';
import type { CockpitLayoutMode, PanelId, EFISState, TCASTarget, NDMapMode } from '@shared';
import { getRecommendedHiddenPanels, getTrainingModeConfig } from '../config/trainingModes';

export type InstrumentPanelId = Extract<PanelId, 'cdu' | 'nd' | 'pfd' | 'autoflight' | 'eicas'>;

const defaultInstrumentZoom: Record<InstrumentPanelId, number> = {
  cdu: 1.35,
  nd: 1.45,
  pfd: 1.45,
  autoflight: 1.45,
  eicas: 1.45,
};

const instrumentPanelIds: InstrumentPanelId[] = ['cdu', 'nd', 'pfd', 'autoflight', 'eicas'];

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
  soundMuted: boolean;
  soundVolume: number;
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
  setSoundMuted: (muted: boolean) => void;
  setSoundVolume: (volume: number) => void;
  toggleKeyboardHelp: () => void;
  setEFISMode: (side: 'L' | 'R', mode: NDMapMode) => void;
  setEFISRange: (side: 'L' | 'R', range: number) => void;
}

export type CockpitLayoutStore = CockpitLayoutState & CockpitLayoutActions;

function getStoredJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const val = localStorage.getItem(key);
  if (val === null) return fallback;
  try {
    return JSON.parse(val) as T;
  } catch {
    return fallback;
  }
}

function getStoredNumber(key: string, fallback: number): number {
  if (typeof window === 'undefined') return fallback;
  const val = localStorage.getItem(key);
  if (val === null) return fallback;
  const num = Number(val);
  return Number.isFinite(num) ? num : fallback;
}

function getStoredString<T extends string>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const val = localStorage.getItem(key);
  return (val as T) || fallback;
}

export const useCockpitLayoutStore = create<CockpitLayoutStore>((set, get) => ({
  cockpitMode: getStoredJSON('cdu-cockpit-mode', true),
  cockpitLayoutMode: getStoredString('cdu-cockpit-layout-mode', 'fmc-focus' as CockpitLayoutMode),
  pinnedPanels: getStoredJSON('cdu-pinned-panels', []),
  hiddenPanels: getStoredJSON('cdu-hidden-panels', getRecommendedHiddenPanels('fmc-focus')),
  focusedPanel: null,
  instrumentZoom: getStoredJSON('cdu-instrument-zoom', { ...defaultInstrumentZoom }),
  highContrast: getStoredJSON('cdu-high-contrast', false),
  brightness: getStoredNumber('cdu-brightness', 100),
  showKeyboardHelp: false,
  soundMuted: getStoredJSON('cdu-sound-muted', getStoredJSON('cdu-muted', false)),
  soundVolume: getStoredNumber('cdu-sound-volume', 80),
  efisL: getStoredJSON('cdu-efis-l', {
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
  }),
  efisR: getStoredJSON('cdu-efis-r', {
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
  }),
  trafficTargets: [],

  setCockpitMode: (enabled: boolean) => {
    set({ cockpitMode: enabled });
    if (typeof window !== 'undefined') {
      localStorage.setItem('cdu-cockpit-mode', JSON.stringify(enabled));
    }
  },

  setCockpitLayoutMode: (mode: CockpitLayoutMode) => {
    const config = getTrainingModeConfig(mode);
    const hidden = getRecommendedHiddenPanels(mode, get().pinnedPanels);
    const zoom = modeZoomDefaults(mode);
    set({
      cockpitLayoutMode: mode,
      hiddenPanels: hidden,
      instrumentZoom: zoom,
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('cdu-cockpit-layout-mode', mode);
      localStorage.setItem('cdu-hidden-panels', JSON.stringify(hidden));
      localStorage.setItem('cdu-instrument-zoom', JSON.stringify(zoom));
    }
  },

  setHiddenPanels: (panels: PanelId[]) => {
    set({ hiddenPanels: panels });
    if (typeof window !== 'undefined') {
      localStorage.setItem('cdu-hidden-panels', JSON.stringify(panels));
    }
  },

  setPinnedPanels: (panels: PanelId[]) => {
    set({ pinnedPanels: panels });
    if (typeof window !== 'undefined') {
      localStorage.setItem('cdu-pinned-panels', JSON.stringify(panels));
    }
  },

  setFocusedPanel: (panel: PanelId | null) => set({ focusedPanel: panel }),

  togglePanelHidden: (panelId: PanelId) => {
    const { hiddenPanels } = get();
    const updated = hiddenPanels.includes(panelId)
      ? hiddenPanels.filter((p) => p !== panelId)
      : [...hiddenPanels, panelId];
    set({ hiddenPanels: updated });
    if (typeof window !== 'undefined') {
      localStorage.setItem('cdu-hidden-panels', JSON.stringify(updated));
    }
  },

  togglePanelPinned: (panelId: PanelId) => {
    const { pinnedPanels } = get();
    const updated = pinnedPanels.includes(panelId)
      ? pinnedPanels.filter((p) => p !== panelId)
      : [...pinnedPanels, panelId];
    set({ pinnedPanels: updated });
    if (typeof window !== 'undefined') {
      localStorage.setItem('cdu-pinned-panels', JSON.stringify(updated));
    }
  },

  restoreRecommendedLayout: () => {
    const { cockpitLayoutMode, pinnedPanels } = get();
    const hidden = getRecommendedHiddenPanels(cockpitLayoutMode, pinnedPanels);
    const zoom = modeZoomDefaults(cockpitLayoutMode);
    set({
      hiddenPanels: hidden,
      instrumentZoom: zoom,
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('cdu-hidden-panels', JSON.stringify(hidden));
      localStorage.setItem('cdu-instrument-zoom', JSON.stringify(zoom));
    }
  },

  setInstrumentZoom: (panelId: InstrumentPanelId, zoom: number) => {
    set((state) => {
      const updated = {
        ...state.instrumentZoom,
        [panelId]: clampInstrumentZoom(zoom),
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('cdu-instrument-zoom', JSON.stringify(updated));
      }
      return { instrumentZoom: updated };
    });
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

  setHighContrast: (enabled: boolean) => {
    set({ highContrast: enabled });
    if (typeof window !== 'undefined') {
      localStorage.setItem('cdu-high-contrast', JSON.stringify(enabled));
    }
  },

  toggleHighContrast: () => {
    set((state) => {
      const updated = !state.highContrast;
      if (typeof window !== 'undefined') {
        localStorage.setItem('cdu-high-contrast', JSON.stringify(updated));
      }
      return { highContrast: updated };
    });
  },

  setBrightness: (b: number) => {
    const val = Math.min(100, Math.max(0, b));
    set({ brightness: val });
    if (typeof window !== 'undefined') {
      localStorage.setItem('cdu-brightness', String(val));
    }
  },

  setSoundMuted: (muted: boolean) => {
    set({ soundMuted: muted });
    if (typeof window !== 'undefined') {
      localStorage.setItem('cdu-sound-muted', JSON.stringify(muted));
      localStorage.setItem('cdu-muted', JSON.stringify(muted)); // keep in sync
    }
  },

  setSoundVolume: (volume: number) => {
    const val = Math.min(100, Math.max(0, volume));
    set({ soundVolume: val });
    if (typeof window !== 'undefined') {
      localStorage.setItem('cdu-sound-volume', String(val));
    }
  },

  toggleKeyboardHelp: () => set((state) => ({ showKeyboardHelp: !state.showKeyboardHelp })),

  setEFISMode: (side, mode) => {
    set((state) => {
      const key = side === 'L' ? 'efisL' : 'efisR';
      const updated = { ...state[key], mode };
      if (typeof window !== 'undefined') {
        localStorage.setItem(`cdu-${key.toLowerCase()}`, JSON.stringify(updated));
      }
      return { [key]: updated } as Partial<CockpitLayoutState>;
    });
  },

  setEFISRange: (side, range) => {
    set((state) => {
      const key = side === 'L' ? 'efisL' : 'efisR';
      const updated = { ...state[key], range };
      if (typeof window !== 'undefined') {
        localStorage.setItem(`cdu-${key.toLowerCase()}`, JSON.stringify(updated));
      }
      return { [key]: updated } as Partial<CockpitLayoutState>;
    });
  },
}));

// ─── Dev/test window exposure ─────────────────────────────────────────────────
// Exposes the store on window in non-production builds so Playwright helpers
// (dismissWelcome, ensureTrainingMode) can read cockpitMode without races.
declare global {
  interface Window {
    useCockpitLayoutStore?: typeof useCockpitLayoutStore;
  }
}

if (typeof window !== 'undefined' && import.meta.env.MODE !== 'production') {
  window.useCockpitLayoutStore = useCockpitLayoutStore;
}
