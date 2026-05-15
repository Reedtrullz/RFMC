import type { DisplayData, DisplayLine, RenderOptions } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Layout constants shared by all renderers
// ─────────────────────────────────────────────────────────────────────────────

/** Total columns on a Boeing 737 CDU display. */
export const CDU_COLS = 24;
/** Total display rows (title + 6 label/data pairs + scratch-pad). */
export const CDU_ROWS = 14;

/** Vertical distribution of the 14 rows inside the canvas (0-based). */
export const ROW_WEIGHTS = [
  // row 0: page title / header  (slightly taller)
  1.3,
  // rows 1–12: alternating label (small) and data (large) rows
  0.8, 1.0, 0.8, 1.0, 0.8, 1.0, 0.8, 1.0, 0.8, 1.0, 0.8, 1.0,
  // row 13: scratch-pad
  1.0,
];

const WEIGHT_SUM = ROW_WEIGHTS.reduce((a, b) => a + b, 0);

/** Horizontal padding inside the canvas (fraction of canvas width). */
export const H_PAD_FRACTION = 0.025;
/** Vertical padding inside the canvas (fraction of canvas height). */
export const V_PAD_FRACTION = 0.02;

// ─────────────────────────────────────────────────────────────────────────────
// BaseRenderer
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Abstract base renderer.
 *
 * Provides shared geometry helpers that concrete renderers use when drawing
 * rows and characters.  The abstract `render()` method must be implemented by
 * each subclass.
 */
export abstract class BaseRenderer {
  // ── Geometry ───────────────────────────────────────────────────────────────

  /** Returns the pixel Y coordinate of the top edge of `rowIndex` (0-based). */
  protected rowTop(canvas: HTMLCanvasElement, rowIndex: number): number {
    const vPad = canvas.height * V_PAD_FRACTION;
    const usableH = canvas.height - vPad * 2;
    let y = vPad;
    for (let i = 0; i < rowIndex; i++) {
      y += (ROW_WEIGHTS[i] / WEIGHT_SUM) * usableH;
    }
    return y;
  }

  /** Returns the pixel height of `rowIndex`. */
  protected rowHeight(canvas: HTMLCanvasElement, rowIndex: number): number {
    const vPad = canvas.height * V_PAD_FRACTION;
    const usableH = canvas.height - vPad * 2;
    return (ROW_WEIGHTS[rowIndex] / WEIGHT_SUM) * usableH;
  }

  /** Returns the pixel X of the left content edge. */
  protected leftEdge(canvas: HTMLCanvasElement): number {
    return canvas.width * H_PAD_FRACTION;
  }

  /** Returns the usable pixel width of a row. */
  protected rowWidth(canvas: HTMLCanvasElement): number {
    return canvas.width * (1 - H_PAD_FRACTION * 2);
  }

  /**
   * Resolves the font-size in pixels for a row.
   * "large" rows get ~70 % of their pixel height, "small" rows ~55 %.
   */
  protected fontSize(
    canvas: HTMLCanvasElement,
    rowIndex: number,
    size: DisplayLine['size']
  ): number {
    const h = this.rowHeight(canvas, rowIndex);
    return Math.round(h * (size === 'small' ? 0.55 : 0.70));
  }

  /**
   * Builds a Canvas font string.
   * Subclasses may override to inject their preferred typeface.
   */
  protected fontString(
    canvas: HTMLCanvasElement,
    rowIndex: number,
    size: DisplayLine['size'],
    fontFamily = '"B612 Mono", "Courier New", monospace'
  ): string {
    return `${this.fontSize(canvas, rowIndex, size)}px ${fontFamily}`;
  }

  // ── Abstract contract ──────────────────────────────────────────────────────

  abstract render(
    data: DisplayData,
    canvas: HTMLCanvasElement,
    options?: RenderOptions
  ): void;

  abstract getName(): string;
}
