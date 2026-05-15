import { BaseRenderer, SCRATCHPAD_ROW } from './BaseRenderer';
import type { RendererDisplayData, RenderOptions } from './types';
import type { DisplayColor } from '@virtual-cdu/shared/fmc/displayColors';
import { buildCells } from '@virtual-cdu/shared/fmc/displayGrid';

// ─────────────────────────────────────────────────────────────────────────────
// NG LCD Renderer – clean, professional Boeing 737-800 LCD CDU aesthetic
// ─────────────────────────────────────────────────────────────────────────────

/** Maps the full DisplayColor union to physical hex for NG LCD mode. */
const LCD_PALETTE: Record<DisplayColor, string> = {
  white:   '#e8e8e8',
  green:   '#00d26a',
  amber:   '#ffb300',
  cyan:    '#00c8ff',
  magenta: '#ff6ec7',
  red:     '#ff4d4d',
  // Boeing-specific
  black:   '#000000',
  shaded:  '#b0b0b0',
  // Airbus-specific
  blue:    '#60a5fa',
};

const BACKGROUND    = '#000000';
const SCRATCHPAD_BG = '#0a0a0a';
const DIVIDER_COLOR = '#1a1a1a';
const ACTIVE_ROW_BG = 'rgba(255,179,0,0.07)';

/**
 * Normalises an LSK index from the 1–12 range to the 1–6 pair range.
 * Right-side LSKs 7–12 map to pairs 1–6.
 */
function normaliseLskPair(activeLsk: number): number {
  return activeLsk > 6 ? activeLsk - 6 : activeLsk;
}

export class NgLcdRenderer extends BaseRenderer {
  getName(): string { return 'NG LCD'; }

  render(
    data: RendererDisplayData,
    canvas: HTMLCanvasElement,
    _options?: RenderOptions
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cW = this.cssWidth(canvas);
    const cH = this.cssHeight(canvas);
    ctx.clearRect(0, 0, cW, cH);

    // ── 1. Background ────────────────────────────────────────────────────────
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, cW, cH);

    const activePair =
      data.activeLsk != null ? normaliseLskPair(data.activeLsk) : null;

    // ── 2. Page content rows (0–13) ──────────────────────────────────────────
    // Build the cell grid for efficient column-accurate rendering.
    const cells = buildCells(data.grid);
    const cols  = data.grid.columns;

    for (let rowIndex = 0; rowIndex < data.grid.rows; rowIndex++) {
      const y = this.rowTop(canvas, rowIndex);
      const h = this.rowHeight(canvas, rowIndex);
      const x = this.leftEdge(canvas);
      const w = this.rowWidth(canvas);

      // Active LSK row highlight (rows 1–12)
      if (activePair !== null && rowIndex > 0 && rowIndex < 13) {
        if (Math.ceil(rowIndex / 2) === activePair) {
          ctx.fillStyle = ACTIVE_ROW_BG;
          ctx.fillRect(x - 4, y, w + 8, h);
        }
      }

      // Subtle inter-row divider (skip first)
      if (rowIndex > 0) {
        ctx.strokeStyle = DIVIDER_COLOR;
        ctx.lineWidth   = 0.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w, y);
        ctx.stroke();
      }

      // Draw each cell in this row
      const charWidth = w / cols;
      for (let c = 0; c < cols; c++) {
        const cell = cells[rowIndex * cols + c];
        if (!cell || cell.char === ' ') continue;

        const color    = LCD_PALETTE[cell.color ?? 'white'];
        const cellX    = x + c * charWidth;
        const fontSize = this.fontSize(canvas, rowIndex, cell.size ?? 'normal');
        const font     = `${fontSize}px "B612 Mono", "Courier New", monospace`;

        if (cell.inverse) {
          // Inverse video: fill background with text colour, draw char in black
          ctx.fillStyle = color;
          ctx.fillRect(cellX, y + 1, charWidth, h - 2);
          ctx.fillStyle    = LCD_PALETTE.black;
          ctx.font         = font;
          ctx.textBaseline = 'middle';
          ctx.shadowBlur   = 0;
          ctx.fillText(cell.char, cellX, y + h / 2);
        } else {
          ctx.fillStyle    = color;
          ctx.font         = font;
          ctx.textBaseline = 'middle';

          // Slight glow for amber active fields
          if (cell.color === 'amber') {
            ctx.shadowColor = 'rgba(255,179,0,0.4)';
            ctx.shadowBlur  = 4;
          } else {
            ctx.shadowBlur = 0;
          }

          // Blinking: only draw on visible half of 1 Hz cycle
          if (cell.blink && Math.floor(Date.now() / 500) % 2 === 0) continue;

          ctx.fillText(cell.char, cellX, y + h / 2);
          ctx.shadowBlur = 0;
        }
      }
    }

    // ── 3. Scratchpad (separate row below page content) ───────────────────────
    this._drawScratchpad(ctx, canvas, data);
  }

  private _drawScratchpad(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    data: RendererDisplayData
  ): void {
    const rowIndex = SCRATCHPAD_ROW;
    const y = this.rowTop(canvas, rowIndex);
    const h = this.rowHeight(canvas, rowIndex);
    const x = this.leftEdge(canvas);
    const w = this.rowWidth(canvas);

    ctx.fillStyle = SCRATCHPAD_BG;
    ctx.fillRect(0, y, this.cssWidth(canvas), h);

    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(this.cssWidth(canvas), y);
    ctx.stroke();

    // Reconstruct scratchpad text from segments
    const text  = data.scratchpad.map(s => s.text).join('');
    const color = data.scratchpad.some(s => s.color === 'amber')
      ? LCD_PALETTE.amber
      : LCD_PALETTE.white;

    ctx.fillStyle    = color;
    ctx.font         = this.fontString(canvas, rowIndex, 'normal');
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y + h / 2, w);
  }
}
