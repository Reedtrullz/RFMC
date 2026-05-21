import { BaseRenderer, SCRATCHPAD_ROW } from './BaseRenderer';
import type { RendererDisplayData, RenderOptions } from './types';
import type { DisplayColor } from '@shared/fmc/displayColors';
import { buildCells } from '@shared/fmc/displayGrid';

// ─────────────────────────────────────────────────────────────────────────────
// NG LCD Renderer – clean, professional Boeing 737-800 LCD CDU aesthetic
// ─────────────────────────────────────────────────────────────────────────────

/** Maps the full DisplayColor union to physical hex for NG LCD mode. */
const LCD_PALETTE: Record<DisplayColor, string> = {
  white: '#e8e8e8',
  green: '#00d26a',
  amber: '#ffb300',
  cyan: '#00c8ff',
  magenta: '#ff6ec7',
  red: '#ff4d4d',
  black: '#000000',
  shaded: '#b0b0b0',
  blue: '#60a5fa',
};

const BACKGROUND = '#000000';
const SCRATCHPAD_BG = '#0a0a0a';
const DIVIDER_COLOR = '#1a1a1a';
const ACTIVE_ROW_BG = 'rgba(255,179,0,0.07)';

function normaliseLskPair(activeLsk: number): number {
  return activeLsk > 6 ? activeLsk - 6 : activeLsk;
}

export class NgLcdRenderer extends BaseRenderer {
  getName(): string {
    return 'NG LCD';
  }

  render(data: RendererDisplayData, canvas: HTMLCanvasElement, options?: RenderOptions): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const crtIntensity = Math.max(0, Math.min(100, options?.intensity ?? 65));
    const bloomIntensity = Math.max(0, Math.min(100, options?.bloomIntensity ?? 40));
    const scanlineIntensity = Math.max(0, Math.min(100, options?.scanlineIntensity ?? 25));
    const crtT = crtIntensity / 100;
    const bloomT = bloomIntensity / 100;
    const scanT = scanlineIntensity / 100;

    const cW = this.cssWidth(canvas);
    const cH = this.cssHeight(canvas);
    ctx.clearRect(0, 0, cW, cH);

    // ── 1. Background ────────────────────────────────────────────────────────
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, cW, cH);

    const activePair = data.activeLsk != null ? normaliseLskPair(data.activeLsk) : null;

    // ── 2. Page content rows (0–13) ──────────────────────────────────────────
    const cells = buildCells(data.grid);
    const cols = data.grid.columns;

    for (let rowIndex = 0; rowIndex < data.grid.rows; rowIndex++) {
      const y = this.rowTop(canvas, rowIndex);
      const h = this.rowHeight(canvas, rowIndex);
      const x = this.leftEdge(canvas);
      const w = this.rowWidth(canvas);
      const charW = w / cols;

      if (activePair !== null && rowIndex > 0 && rowIndex < 13) {
        if (Math.ceil(rowIndex / 2) === activePair) {
          ctx.fillStyle = ACTIVE_ROW_BG;
          ctx.fillRect(x - 4, y, w + 8, h);
        }
      }

      if (rowIndex > 0) {
        ctx.strokeStyle = DIVIDER_COLOR;
        ctx.lineWidth = 0.5;
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
        const font = this.fontString(canvas, rowIndex, cell.size ?? 'normal');

        if (cell.inverse) {
          ctx.fillStyle = color;
          ctx.fillRect(cellX, y + 1, charW, h - 2);
          ctx.fillStyle = LCD_PALETTE.black;
          ctx.font = font;
          ctx.textBaseline = 'middle';
          ctx.shadowBlur = 0;
          ctx.fillText(cell.char, cellX, y + h / 2);
        } else {
          ctx.fillStyle = color;
          ctx.font = font;
          ctx.textBaseline = 'middle';
          if (bloomT > 0.02 && cell.color !== 'black') {
            ctx.shadowColor = this._rgba(color, 0.22 + bloomT * 0.55);
            ctx.shadowBlur = (cell.color === 'amber' ? 4 : 2) + bloomT * 10;
            if (bloomT > 0.65 || crtT > 0.75) {
              ctx.fillText(cell.char, cellX, y + h / 2);
            }
          } else {
            ctx.shadowBlur = 0;
          }
          ctx.fillText(cell.char, cellX, y + h / 2);
          ctx.shadowBlur = 0;
        }
      }
    }

    // ── 3. Scratchpad (separate row, drawn per-segment) ───────────────────────
    this._drawScratchpad(ctx, canvas, data, bloomT, crtT);
    this._drawPostProcess(ctx, cW, cH, crtT, scanT);
  }

  private _drawScratchpad(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    data: RendererDisplayData,
    bloomT: number,
    crtT: number,
  ): void {
    const rowIndex = SCRATCHPAD_ROW;
    const y = this.rowTop(canvas, rowIndex);
    const h = this.rowHeight(canvas, rowIndex);
    const x = this.leftEdge(canvas);
    const w = this.rowWidth(canvas);
    const cW = this.cssWidth(canvas);
    const cols = data.grid.columns;
    const charW = w / cols;

    // Background + top border
    ctx.fillStyle = SCRATCHPAD_BG;
    ctx.fillRect(0, y, cW, h);
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(cW, y);
    ctx.stroke();

    // Draw each scratchpad segment character-by-character to preserve
    // color, size, inverse video, and blink per segment.
    for (const segment of data.scratchpad) {
      const color = LCD_PALETTE[segment.color ?? 'white'];
      const startCol = segment.col ?? 0;
      const font = this.fontString(canvas, rowIndex, segment.size ?? 'normal');

      for (let i = 0; i < segment.text.length; i++) {
        const char = segment.text[i];
        if (char === ' ') continue;
        if (segment.blink && Math.floor(Date.now() / 500) % 2 === 0) continue;

        const cellX = x + (startCol + i) * charW;

        if (segment.inverse) {
          ctx.fillStyle = color;
          ctx.fillRect(cellX, y + 1, charW, h - 2);
          ctx.fillStyle = LCD_PALETTE.black;
          ctx.font = font;
          ctx.textBaseline = 'middle';
          ctx.shadowBlur = 0;
          ctx.fillText(char, cellX, y + h / 2);
        } else {
          ctx.fillStyle = color;
          ctx.font = font;
          ctx.textBaseline = 'middle';
          if (bloomT > 0.02 && segment.color !== 'black') {
            ctx.shadowColor = this._rgba(color, 0.22 + bloomT * 0.55);
            ctx.shadowBlur = (segment.color === 'amber' ? 4 : 2) + bloomT * 10;
            if (bloomT > 0.65 || crtT > 0.75) {
              ctx.fillText(char, cellX, y + h / 2);
            }
          } else {
            ctx.shadowBlur = 0;
          }
          ctx.fillText(char, cellX, y + h / 2);
          ctx.shadowBlur = 0;
        }
      }
    }
  }

  private _drawPostProcess(ctx: CanvasRenderingContext2D, cW: number, cH: number, crtT: number, scanT: number): void {
    if (scanT > 0.01) {
      const alpha = 0.02 + scanT * 0.2;
      const gap = scanT > 0.65 ? 3 : 4;
      ctx.fillStyle = `rgba(0,0,0,${alpha})`;
      for (let y = 0; y < cH; y += gap) ctx.fillRect(0, y, cW, 1);
    }

    if (crtT > 0.01) {
      const glow = ctx.createRadialGradient(cW * 0.5, cH * 0.45, 0, cW * 0.5, cH * 0.45, cW * 0.72);
      glow.addColorStop(0, `rgba(57,255,20,${0.05 * crtT})`);
      glow.addColorStop(0.45, `rgba(57,255,20,${0.025 * crtT})`);
      glow.addColorStop(1, 'rgba(57,255,20,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, cW, cH);

      const vignette = ctx.createRadialGradient(cW * 0.5, cH * 0.48, cW * 0.2, cW * 0.5, cH * 0.48, cW * 0.72);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(0.75, `rgba(0,0,0,${0.12 * crtT})`);
      vignette.addColorStop(1, `rgba(0,0,0,${0.42 * crtT})`);
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, cW, cH);
    }
  }

  private _rgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
}
