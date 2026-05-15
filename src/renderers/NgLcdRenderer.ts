import { BaseRenderer, SCRATCHPAD_ROW } from './BaseRenderer';
import type { RendererDisplayData, RenderOptions } from './types';
import type { DisplayColor } from '@shared/fmc/displayColors';
import { buildCells } from '@shared/fmc/displayGrid';

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
  black:   '#000000',
  shaded:  '#b0b0b0',
  blue:    '#60a5fa',
};

const BACKGROUND    = '#000000';
const SCRATCHPAD_BG = '#0a0a0a';
const DIVIDER_COLOR = '#1a1a1a';
const ACTIVE_ROW_BG = 'rgba(255,179,0,0.07)';

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
    const cells = buildCells(data.grid);
    const cols  = data.grid.columns;

    for (let rowIndex = 0; rowIndex < data.grid.rows; rowIndex++) {
      const y     = this.rowTop(canvas, rowIndex);
      const h     = this.rowHeight(canvas, rowIndex);
      const x     = this.leftEdge(canvas);
      const w     = this.rowWidth(canvas);
      const charW = w / cols;

      if (activePair !== null && rowIndex > 0 && rowIndex < 13) {
        if (Math.ceil(rowIndex / 2) === activePair) {
          ctx.fillStyle = ACTIVE_ROW_BG;
          ctx.fillRect(x - 4, y, w + 8, h);
        }
      }

      if (rowIndex > 0) {
        ctx.strokeStyle = DIVIDER_COLOR;
        ctx.lineWidth   = 0.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w, y);
        ctx.stroke();
      }

      for (let c = 0; c < cols; c++) {
        const cell = cells[rowIndex * cols + c];
        if (!cell || cell.char === ' ') continue;

        if (cell.blink && Math.floor(Date.now() / 500) % 2 === 0) continue;

        const color = LCD_PALETTE[cell.color ?? 'white'];
        const cellX = x + c * charW;
        const font  = this.fontString(canvas, rowIndex, cell.size ?? 'normal');

        if (cell.inverse) {
          ctx.fillStyle    = color;
          ctx.fillRect(cellX, y + 1, charW, h - 2);
          ctx.fillStyle    = LCD_PALETTE.black;
          ctx.font         = font;
          ctx.textBaseline = 'middle';
          ctx.shadowBlur   = 0;
          ctx.fillText(cell.char, cellX, y + h / 2);
        } else {
          ctx.fillStyle    = color;
          ctx.font         = font;
          ctx.textBaseline = 'middle';
          if (cell.color === 'amber') {
            ctx.shadowColor = 'rgba(255,179,0,0.4)';
            ctx.shadowBlur  = 4;
          } else {
            ctx.shadowBlur = 0;
          }
          ctx.fillText(cell.char, cellX, y + h / 2);
          ctx.shadowBlur = 0;
        }
      }
    }

    // ── 3. Scratchpad (separate row, drawn per-segment) ───────────────────────
    this._drawScratchpad(ctx, canvas, data);
  }

  private _drawScratchpad(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    data: RendererDisplayData
  ): void {
    const rowIndex = SCRATCHPAD_ROW;
    const y     = this.rowTop(canvas, rowIndex);
    const h     = this.rowHeight(canvas, rowIndex);
    const x     = this.leftEdge(canvas);
    const w     = this.rowWidth(canvas);
    const cW    = this.cssWidth(canvas);
    const cols  = data.grid.columns;
    const charW = w / cols;

    // Background + top border
    ctx.fillStyle = SCRATCHPAD_BG;
    ctx.fillRect(0, y, cW, h);
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(cW, y);
    ctx.stroke();

    // Draw each scratchpad segment character-by-character to preserve
    // color, size, inverse video, and blink per segment.
    for (const segment of data.scratchpad) {
      const color   = LCD_PALETTE[segment.color ?? 'white'];
      const startCol = segment.col ?? 0;
      const font     = this.fontString(canvas, rowIndex, segment.size ?? 'normal');

      for (let i = 0; i < segment.text.length; i++) {
        const char = segment.text[i];
        if (char === ' ') continue;
        if (segment.blink && Math.floor(Date.now() / 500) % 2 === 0) continue;

        const cellX = x + (startCol + i) * charW;

        if (segment.inverse) {
          ctx.fillStyle    = color;
          ctx.fillRect(cellX, y + 1, charW, h - 2);
          ctx.fillStyle    = LCD_PALETTE.black;
          ctx.font         = font;
          ctx.textBaseline = 'middle';
          ctx.shadowBlur   = 0;
          ctx.fillText(char, cellX, y + h / 2);
        } else {
          ctx.fillStyle    = color;
          ctx.font         = font;
          ctx.textBaseline = 'middle';
          if (segment.color === 'amber') {
            ctx.shadowColor = 'rgba(255,179,0,0.4)';
            ctx.shadowBlur  = 4;
          } else {
            ctx.shadowBlur = 0;
          }
          ctx.fillText(char, cellX, y + h / 2);
          ctx.shadowBlur = 0;
        }
      }
    }
  }
}
