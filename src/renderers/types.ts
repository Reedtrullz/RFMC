// ─────────────────────────────────────────────────────────────────────────────
// Renderer public API types
// All renderers consume DisplayData and write to a HTMLCanvasElement.
// ─────────────────────────────────────────────────────────────────────────────

/** A single display line as produced by FMC page logic. */
export interface DisplayLine {
  /** Raw text content (padded to column width by the page layer). */
  text: string;
  /**
   * Semantic color role.  Renderers map these to their physical palette.
   * – 'white'  → labels / prompts
   * – 'green'  → data values
   * – 'amber'  → selected / active field
   * – 'cyan'   → A320 MCDU secondary data
   * – 'magenta'→ A320 MCDU constraints
   * – 'red'    → warnings / errors
   * Defaults to 'white' when omitted.
   */
  color?: 'white' | 'green' | 'amber' | 'cyan' | 'magenta' | 'red';
  /**
   * Font size modifier.
   * – 'large'  → title / header rows (same height, wider glyph)
   * – 'small'  → label rows above LSK data (half-height)
   * Defaults to 'large' when omitted.
   */
  size?: 'large' | 'small';
}

/** Complete data snapshot for one display frame. */
export interface DisplayData {
  /** Up to 14 lines (6 LSK pairs × label+data, plus header and title). */
  lines: DisplayLine[];
  /** Scratch-pad / entry buffer shown at the bottom of the display. */
  scratchpad: string;
  /** Optional status / error message overlaid on the scratch-pad. */
  message?: string;
  /** Page identifier shown in the title bar (e.g. 'INIT REF'). */
  pageTitle?: string;
  /** Optional 1-based active LSK row index (1-6 left, 7-12 right). */
  activeLskIndex?: number;
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
}

/**
 * Contract every display renderer must satisfy.
 *
 * Implementations must be stateless with respect to FMC logic – they only
 * consume DisplayData and draw.  The phosphor-persistence offscreen canvas
 * used by ClassicCrtRenderer is internal state of that renderer and does not
 * violate this rule.
 */
export interface DisplayRenderer {
  /**
   * Render a complete display frame onto `canvas`.
   * Called on every React render that produces new DisplayData.
   */
  render(
    data: DisplayData,
    canvas: HTMLCanvasElement,
    options?: RenderOptions
  ): void;

  /** Human-readable name shown in the settings UI. */
  getName(): string;
}
