import { BaseRenderer } from './BaseRenderer';
import type { DisplayData, DisplayLine, RenderOptions } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// NG LCD Renderer – clean, professional Boeing 737-800 LCD CDU aesthetic
// ─────────────────────────────────────────────────────────────────────────────

/** Maps semantic color roles to physical hex values for NG LCD mode. */
const LCD_PALETTE: Record<NonNullable<DisplayLine['color']>, string> = {
  white:   '#e8e8e8',
  green:   '#00d26a',
  amber:   '#ffb300',
  cyan:    '#00c8ff',
  magenta: '#ff6ec7',
  red:     '#ff4d4d',
};

const BACKGROUND    = '#000000';
const SCRATCHPAD_BG = '#0a0a0a';
const DIVIDER_COLOR = '#1a1a1a';
const ACTIVE_ROW_BG = 'rgba(255,179,0,0.07)';

/**
 * Maps activeLskIndex (1-12) to the corresponding display row index (1-12).
 *
 * Boeing 737 CDU layout:
 *   Left  LSKs 1–6 → display rows 2, 4, 6, 8, 10, 12  (odd pair index * 2)
 *   Right LSKs 7–12 → same display rows as their left counterparts
 *                     (right LSK n corresponds to left LSK n-6)
 *
 * Codex P2 fix: previously `Math.ceil(rowIndex / 2)` was compared directly
 * against activeLskIndex, so values 7–12 never matched any row and right-side
 * LSKs were never highlighted.  We now normalise the index to the 1–6 range
 * before comparison.
 *
 * @returns the 1-based LSK pair number (1–6), regardless of side.
 */
function normaliseLskIndex(activeLskIndex: number): number {
  // Right-side LSKs are encoded as 7–12; map them to 1–6.
  return activeLskIndex > 6 ? activeLskIndex - 6 : activeLskIndex;
}

export class NgLcdRenderer extends BaseRenderer {
  getName(): string {
    return 'NG LCD';
  }

  render(
    data: DisplayData,
    canvas: HTMLCanvasElement,
    _options?: RenderOptions
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // ── 1. Background ────────────────────────────────────────────────────────
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, width, height);

    // Pre-compute the normalised active LSK pair index (1-6) once per frame.
    const activePair =
      data.activeLskIndex != null
        ? normaliseLskIndex(data.activeLskIndex)
        : null;

    // ── 2. Lines ─────────────────────────────────────────────────────────────
    data.lines.forEach((line, rowIndex) => {
      if (rowIndex >= 14) return; // guard

      const y    = this.rowTop(canvas, rowIndex);
      const h    = this.rowHeight(canvas, rowIndex);
      const x    = this.leftEdge(canvas);
      const w    = this.rowWidth(canvas);
      const size = line.size ?? (rowIndex % 2 === 1 ? 'small' : 'large');

      // Active LSK row highlight – works for both left and right LSKs.
      // Row indices 1–12 are label/data rows; the pair index for row i is
      // Math.ceil(i / 2), which ranges 1–6 and now matches normaliseLskIndex().
      if (activePair !== null && rowIndex > 0 && rowIndex < 13) {
        if (Math.ceil(rowIndex / 2) === activePair) {
          ctx.fillStyle = ACTIVE_ROW_BG;
          ctx.fillRect(x - 4, y, w + 8, h);
        }
      }

      // Subtle inter-row divider (skip first and last rows)
      if (rowIndex > 0 && rowIndex < 13) {
        ctx.strokeStyle = DIVIDER_COLOR;
        ctx.lineWidth   = 0.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w, y);
        ctx.stroke();
      }

      // Text
      const color = LCD_PALETTE[line.color ?? 'white'];
      ctx.fillStyle    = color;
      ctx.font         = this.fontString(canvas, rowIndex, size);
      ctx.textBaseline = 'middle';

      // Slight glow for amber (active) fields only
      if (line.color === 'amber') {
        ctx.shadowColor = 'rgba(255,179,0,0.4)';
        ctx.shadowBlur  = 4;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.fillText(line.text, x, y + h / 2, w);
      ctx.shadowBlur = 0;
    });

    // ── 3. Scratch-pad ───────────────────────────────────────────────────────
    this._drawScratchpad(ctx, canvas, data);
  }

  private _drawScratchpad(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    data: DisplayData
  ): void {
    const rowIndex = 13;
    const y = this.rowTop(canvas, rowIndex);
    const h = this.rowHeight(canvas, rowIndex);
    const x = this.leftEdge(canvas);
    const w = this.rowWidth(canvas);

    ctx.fillStyle = SCRATCHPAD_BG;
    ctx.fillRect(0, y, canvas.width, h);

    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();

    const text  = data.message ?? data.scratchpad;
    const color = data.message ? LCD_PALETTE.amber : LCD_PALETTE.white;
    ctx.fillStyle    = color;
    ctx.font         = this.fontString(canvas, rowIndex, 'large');
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y + h / 2, w);
  }
}
