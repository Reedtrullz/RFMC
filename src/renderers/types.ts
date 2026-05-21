// ─────────────────────────────────────────────────────────────────────────────
// Renderer public API types
//
// IMPORTANT: The display data contract is RendererDisplayData, NOT DisplayData.
// DisplayData already exists in @virtual-cdu/shared/types/fmc and must not be
// shadowed here. Renderers consume the richer GridDisplayData model so that
// inverse video, per-character colour, blinking, black/shaded/blue and exact
// column placement are all preserved.
// ─────────────────────────────────────────────────────────────────────────────

import type { GridDisplayData, DisplaySegment } from '@virtual-cdu/shared';

export type { GridDisplayData, DisplaySegment };

/**
 * Complete data snapshot for one renderer frame.
 *
 * – `grid`      : 14 page-content rows as positioned segments (title + 6
 *                 label/data pairs). Built by displayDataToGrid() in @shared.
 * – `scratchpad`: Scratchpad row segments drawn BELOW the 14 page rows.
 *                 Kept separate to match the real Boeing CDU hardware layout
 *                 (14 display rows + 1 separate scratchpad row).
 * – `activeLsk` : Optional 1-based active LSK index.
 *                 1–6  = left LSKs L1–L6
 *                 7–12 = right LSKs R1–R6
 */
export interface RendererDisplayData {
  /** 14 CDU page rows as a grid of positioned segments. */
  grid: GridDisplayData;
  /** Scratchpad / entry buffer drawn below the 14 page rows. */
  scratchpad: DisplaySegment[];
  /** Optional 1-based active LSK index (1–12). */
  activeLsk?: number;
}

/** Per-call rendering tuning knobs. */
export interface RenderOptions {
  /**
   * Overall CRT effect intensity [0–100].
   * 0 = no post-processing effects, 100 = maximum scanlines / glow / vignette.
   * Ignored by NgLcdRenderer.
   */
  intensity?: number;
  /**
   * Simulated physical wear intensity [0–100].
   * Controls subtle glass haze and phosphor burn-in simulation.
   * Ignored by NgLcdRenderer.
   */
  wearIntensity?: number;
  /**
   * Extra bloom / glow intensity for text [0–100].
   * Allows independent control of text halo strength.
   */
  bloomIntensity?: number;
  /**
   * Independent scanline strength [0–100].
   * Allows fine control over scanline density and opacity.
   */
  scanlineIntensity?: number;
}

/**
 * Contract every display renderer must satisfy.
 *
 * Implementations must be stateless with respect to FMC logic — they only
 * consume RendererDisplayData and draw. The phosphor-persistence offscreen
 * canvas used by ClassicCrtRenderer is internal state of that renderer and
 * does not violate this rule.
 */
export interface DisplayRenderer {
  /**
   * Render a complete display frame onto `canvas`.
   * Called on every React render that produces new RendererDisplayData.
   */
  render(data: RendererDisplayData, canvas: HTMLCanvasElement, options?: RenderOptions): void;

  /** Human-readable name shown in the settings UI. */
  getName(): string;
}
