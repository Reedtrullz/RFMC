import { create } from 'zustand';
import type { DisplayStyle } from '../renderers/rendererRegistry';

// ─────────────────────────────────────────────────────────────────────────────
// Display Settings Zustand store
//
// Extended for Visual Realism Pass — always-visible hardware controls.
// Preserves all existing behavior while adding granular bloom and scanline knobs.
// ─────────────────────────────────────────────────────────────────────────────

export interface DisplaySettings {
  displayStyle: DisplayStyle;
  crtIntensity: number; // Overall CRT (persistence, vignette, base effects)
  wearIntensity: number; // Glass haze / physical wear
  bloomIntensity: number; // Extra text glow / bloom strength
  scanlineIntensity: number; // Independent scanline density/strength

  setDisplayStyle: (style: DisplayStyle) => void;
  setCrtIntensity: (value: number) => void;
  setWearIntensity: (value: number) => void;
  setBloomIntensity: (value: number) => void;
  setScanlineIntensity: (value: number) => void;

  /** Reset all realism sliders to sensible defaults */
  resetRealism: () => void;
}

export const useDisplaySettings = create<DisplaySettings>((set) => ({
  displayStyle: 'ng-lcd',
  crtIntensity: 65,
  wearIntensity: 35,
  bloomIntensity: 40,
  scanlineIntensity: 25,

  setDisplayStyle: (style) => set({ displayStyle: style }),
  setCrtIntensity: (value) => set({ crtIntensity: Math.max(0, Math.min(100, value)) }),
  setWearIntensity: (value) => set({ wearIntensity: Math.max(0, Math.min(100, value)) }),
  setBloomIntensity: (value) => set({ bloomIntensity: Math.max(0, Math.min(100, value)) }),
  setScanlineIntensity: (value) => set({ scanlineIntensity: Math.max(0, Math.min(100, value)) }),

  resetRealism: () =>
    set({
      crtIntensity: 65,
      wearIntensity: 35,
      bloomIntensity: 40,
      scanlineIntensity: 25,
    }),
}));

// Re-export the type so consumers can import it from the store file directly.
export type { DisplayStyle };
