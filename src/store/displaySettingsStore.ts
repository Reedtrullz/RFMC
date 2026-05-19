import { create } from 'zustand';
import type { DisplayStyle } from '../renderers/rendererRegistry';

// ─────────────────────────────────────────────────────────────────────────────
// Display Settings Zustand store
//
// Manages the active visual style and CRT effect sliders.
// Per project rules: no localStorage/sessionStorage – state is in-memory only.
// ─────────────────────────────────────────────────────────────────────────────

interface DisplaySettings {
  /** Currently active display style (renderer key). */
  displayStyle: DisplayStyle;

  /**
   * Overall CRT post-processing intensity [0–100].
   * Controls glow, scanlines, vignette, and phosphor persistence strength.
   * Has no effect in 'ng-lcd' mode.
   */
  crtIntensity: number;

  /**
   * Simulated physical wear intensity [0–100].
   * Controls glass haze and phosphor burn-in simulation.
   * Has no effect in 'ng-lcd' mode.
   */
  wearIntensity: number;

  // ── Actions ────────────────────────────────────────────────────────────────

  /** Switch the active display style. */
  setDisplayStyle: (style: DisplayStyle) => void;

  /** Update the CRT intensity slider (clamped to 0-100). */
  setCrtIntensity: (value: number) => void;

  /** Update the wear intensity slider (clamped to 0-100). */
  setWearIntensity: (value: number) => void;
}

export const useDisplaySettings = create<DisplaySettings>((set) => ({
  displayStyle: 'ng-lcd',
  crtIntensity: 65,
  wearIntensity: 35,

  setDisplayStyle: (style) => set({ displayStyle: style }),
  setCrtIntensity: (value) => set({ crtIntensity: Math.max(0, Math.min(100, value)) }),
  setWearIntensity: (value) => set({ wearIntensity: Math.max(0, Math.min(100, value)) }),
}));

// Re-export the type so consumers can import it from the store file directly.
export type { DisplayStyle };
