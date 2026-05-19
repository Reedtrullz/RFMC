import type { RendererDisplayData, RenderOptions, DisplaySegment } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Layout constants shared by all renderers
// ─────────────────────────────────────────────────────────────────────────────

/** Total columns on a Boeing 737 CDU display. */
export const CDU_COLS = 24;
/** Total display rows (title + 6 label/data pairs). Scratchpad is separate. */
export const CDU_ROWS = 14;
/** The scratchpad occupies one additional virtual row below CDU_ROWS. */
export const SCRATCHPAD_ROW = 14;

/**
 * Vertical weight distribution for CDU_ROWS + 1 scratchpad slot (index 14).
 * The scratchpad gets the same weight as a data row so the overall display
 * proportions remain correct even though it is drawn separately.
 */
export const ROW_WEIGHTS = [
  // row 0: page title / header (slightly taller)
  1.3,
  // rows 1–12: alternating label (small) and data (large) rows
  0.8, 1.0, 0.8, 1.0, 0.8, 1.0, 0.8, 1.0, 0.8, 1.0, 0.8, 1.0,
  // row 13: last data row
  1.0,
  // row 14 (SCRATCHPAD_ROW): separate scratchpad slot
  1.0,
] as const;

const WEIGHT_SUM = ROW_WEIGHTS.reduce((a, b) => a + b, 0);

/** Horizontal padding inside the canvas (fraction of CSS-logical width). */
export const H_PAD_FRACTION = 0.025;
/** Vertical padding inside the canvas (fraction of CSS-logical height). */
export const V_PAD_FRACTION = 0.02;

// ─────────────────────────────────────────────────────────────────────────────
// BaseRenderer
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Abstract base renderer.
 *
 * All geometry helpers operate in **CSS logical pixels** (i.e. they divide
 * canvas.width / canvas.height by devicePixelRatio). CDUDisplay applies
 * ctx.setTransform(dpr, 0, 0, dpr, 0, 0) before calling render(), so the
 * context automatically maps those CSS-px values to the HiDPI backing store.
 * This ensures crisp Retina / iPad rendering without double-scaling.
 */
export abstract class BaseRenderer {
  /** Returns the device pixel ratio, clamped to ≥ 1 to avoid divide-by-zero. */
  protected dpr(): number {
    return Math.max(1, window.devicePixelRatio ?? 1);
  }

  /** CSS-logical width of the canvas. */
  protected cssWidth(canvas: HTMLCanvasElement): number {
    return canvas.width / this.dpr();
  }

  /** CSS-logical height of the canvas. */
  protected cssHeight(canvas: HTMLCanvasElement): number {
    return canvas.height / this.dpr();
  }

  // ── Geometry (all values in CSS logical px) ────────────────────────────────

  /** Y coordinate of the top edge of `rowIndex` (0-based; 14 = scratchpad). */
  protected rowTop(canvas: HTMLCanvasElement, rowIndex: number): number {
    const h = this.cssHeight(canvas);
    const vPad = h * V_PAD_FRACTION;
    const usable = h - vPad * 2;
    let y = vPad;
    for (let i = 0; i < rowIndex; i++) {
      y += (ROW_WEIGHTS[i] / WEIGHT_SUM) * usable;
    }
    return y;
  }

  /** Pixel height of `rowIndex` (CSS logical px). */
  protected rowHeight(canvas: HTMLCanvasElement, rowIndex: number): number {
    const h = this.cssHeight(canvas);
    const vPad = h * V_PAD_FRACTION;
    const usable = h - vPad * 2;
    return (ROW_WEIGHTS[rowIndex] / WEIGHT_SUM) * usable;
  }

  /** X coordinate of the left content edge (CSS logical px). */
  protected leftEdge(canvas: HTMLCanvasElement): number {
    return this.cssWidth(canvas) * H_PAD_FRACTION;
  }

  /** Usable width of a row (CSS logical px). */
  protected rowWidth(canvas: HTMLCanvasElement): number {
    return this.cssWidth(canvas) * (1 - H_PAD_FRACTION * 2);
  }

  /**
   * Font size in CSS logical px for a given row and size variant.
   * 'small' rows (label rows) get ~55 % of the row height;
   * 'normal'/'large' rows get ~70 %.
   */
  protected fontSize(canvas: HTMLCanvasElement, rowIndex: number, size: DisplaySegment['size']): number {
    const h = this.rowHeight(canvas, rowIndex);
    return Math.round(h * (size === 'small' ? 0.55 : 0.7));
  }

  /**
   * Builds a Canvas font string in CSS logical pixels.
   * Subclasses may override to inject their preferred typeface.
   */
  protected fontString(
    canvas: HTMLCanvasElement,
    rowIndex: number,
    size: DisplaySegment['size'],
    fontFamily = '"B612 Mono", "Courier New", monospace',
  ): string {
    return `${this.fontSize(canvas, rowIndex, size)}px ${fontFamily}`;
  }

  // ── Abstract contract ──────────────────────────────────────────────────────

  abstract render(data: RendererDisplayData, canvas: HTMLCanvasElement, options?: RenderOptions): void;

  abstract getName(): string;
}
