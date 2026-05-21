import { BaseRenderer, SCRATCHPAD_ROW } from './BaseRenderer';
import type { RendererDisplayData, RenderOptions } from './types';
import type { DisplayColor } from '@shared/fmc/displayColors';
import { buildCells } from '@shared/fmc/displayGrid';

// ─────────────────────────────────────────────────────────────────────────────
// Classic CRT Renderer – retro green-phosphor Boeing CDU aesthetic
//
// Effects controlled by RenderOptions:
//   • intensity         → overall CRT (persistence, vignette, base glow)
//   • wearIntensity     → glass haze
//   • bloomIntensity    → extra text glow strength (Phase 1 addition)
//   • scanlineIntensity → independent scanline control (Phase 1 addition)
// ─────────────────────────────────────────────────────────────────────────────

const SUPPORTS_OFFSCREEN = typeof OffscreenCanvas !== 'undefined';

function createPersistenceBuffer(width: number, height: number): OffscreenCanvas | HTMLCanvasElement {
  if (SUPPORTS_OFFSCREEN) return new OffscreenCanvas(width, height);
  const el = document.createElement('canvas');
  el.width = width;
  el.height = height;
  return el;
}

/** Maps the full DisplayColor union to CRT phosphor hex values. */
const CRT_PALETTE: Record<DisplayColor, string> = {
  white: '#c8ffb4',
  green: '#39ff14',
  amber: '#ffcc00',
  cyan: '#80ffff',
  magenta: '#ff80ff',
  red: '#ff4040',
  black: '#000300',
  shaded: '#a8f0a0',
  blue: '#80c0ff',
};

const CRT_BG = '#000300';
const SCRATCHPAD_BG = '#000500';

export class ClassicCrtRenderer extends BaseRenderer {
  private _prevFrame: OffscreenCanvas | HTMLCanvasElement | null = null;

  getName(): string {
    return 'Classic CRT';
  }

  render(data: RendererDisplayData, canvas: HTMLCanvasElement, options?: RenderOptions): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ── Phase 1: Granular intensity controls ────────────────────────────────
    const intensity = Math.max(0, Math.min(100, options?.intensity ?? 65));
    const wearIntensity = Math.max(0, Math.min(100, options?.wearIntensity ?? 35));
    const bloomIntensity = Math.max(0, Math.min(100, options?.bloomIntensity ?? 40));
    const scanlineIntensity = Math.max(0, Math.min(100, options?.scanlineIntensity ?? 25));

    const t = intensity / 100;
    const wearT = wearIntensity / 100;
    const bloomT = bloomIntensity / 100;
    const scanT = scanlineIntensity / 100;

    const cW = this.cssWidth(canvas);
    const cH = this.cssHeight(canvas);
    ctx.clearRect(0, 0, cW, cH);

    // ── 1. Background ────────────────────────────────────────────────────────
    ctx.fillStyle = CRT_BG;
    ctx.fillRect(0, 0, cW, cH);

    // ── 2. Phosphor persistence ───────────────────────────────────────────────
    if (t > 0 && this._prevFrame) {
      ctx.globalAlpha = 0.18 * t;
      ctx.drawImage(
        this._prevFrame as CanvasImageSource,
        0,
        0,
        this._prevFrame.width,
        this._prevFrame.height,
        0,
        0,
        cW,
        cH,
      );
      ctx.globalAlpha = 1;
    }

    // ── 3. Page content rows (0–13) ──────────────────────────────────────────
    const cells = buildCells(data.grid);
    const cols = data.grid.columns;

    for (let rowIndex = 0; rowIndex < data.grid.rows; rowIndex++) {
      const y = this.rowTop(canvas, rowIndex);
      const h = this.rowHeight(canvas, rowIndex);
      const x = this.leftEdge(canvas);
      const w = this.rowWidth(canvas);
      const charW = w / cols;

      for (let c = 0; c < cols; c++) {
        const cell = cells[rowIndex * cols + c];
        if (!cell || cell.char === ' ') continue;
        if (cell.blink && Math.floor(Date.now() / 500) % 2 === 0) continue;

        const hex = CRT_PALETTE[cell.color ?? 'green'];
        const glow = this._rgba(hex, 0.5 + 0.5 * t);
        const cellX = x + c * charW;
        const font = this.fontString(canvas, rowIndex, cell.size ?? 'normal');

        ctx.font = font;
        ctx.textBaseline = 'middle';

        if (cell.inverse) {
          ctx.fillStyle = hex;
          ctx.fillRect(cellX, y + 1, charW, h - 2);
          ctx.fillStyle = CRT_BG;
          ctx.shadowBlur = 0;
          ctx.fillText(cell.char, cellX, y + h / 2);
          continue;
        }

        // ── Phase 1 bloom enhancement ───────────────────────────────────────
        if (t > 0.1) {
          const baseBlur = Math.round(2 + 6 * t);
          const extraBloom = Math.round(4 * bloomT);
          ctx.shadowColor = glow;
          ctx.shadowBlur = baseBlur + extraBloom;
          ctx.fillStyle = hex;
          const passes = intensity >= 60 ? 3 : 2;
          for (let p = 0; p < passes; p++) ctx.fillText(cell.char, cellX, y + h / 2);
        }
        ctx.shadowBlur = 0;
        ctx.fillStyle = hex;
        ctx.fillText(cell.char, cellX, y + h / 2);
      }
    }

    // ── 4. Scratchpad (per-segment, below page rows) ──────────────────────────
    this._drawScratchpad(ctx, canvas, data, t, bloomT);

    // ── 5. Capture for persistence ────────────────────────────────────────────
    if (t > 0) this._captureFrame(canvas);

    // ── 6. Post-processing (scanlines now driven by scanT) ────────────────────
    if (intensity >= 10) this._drawScanlines(ctx, cW, cH, scanT);
    if (intensity >= 5) this._drawVignette(ctx, cW, cH, t);
    if (intensity >= 50) this._drawCurvatureDarken(ctx, cW, cH, t);
    if (wearIntensity >= 5) this._drawGlassHaze(ctx, cW, cH, wearT);
  }

  private _drawScratchpad(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    data: RendererDisplayData,
    t: number,
    bloomT: number,
  ): void {
    const rowIndex = SCRATCHPAD_ROW;
    const y = this.rowTop(canvas, rowIndex);
    const h = this.rowHeight(canvas, rowIndex);
    const x = this.leftEdge(canvas);
    const w = this.rowWidth(canvas);
    const cW = this.cssWidth(canvas);
    const cols = data.grid.columns;
    const charW = w / cols;

    ctx.fillStyle = SCRATCHPAD_BG;
    ctx.fillRect(0, y, cW, h);

    for (const segment of data.scratchpad) {
      const hex = CRT_PALETTE[segment.color ?? 'white'];
      const glow = this._rgba(hex, 0.6 + 0.4 * t);
      const startCol = segment.col ?? 0;
      const font = this.fontString(canvas, rowIndex, segment.size ?? 'normal');

      for (let i = 0; i < segment.text.length; i++) {
        const char = segment.text[i];
        if (char === ' ') continue;
        if (segment.blink && Math.floor(Date.now() / 500) % 2 === 0) continue;

        const cellX = x + (startCol + i) * charW;
        ctx.font = font;
        ctx.textBaseline = 'middle';

        if (segment.inverse) {
          ctx.fillStyle = hex;
          ctx.fillRect(cellX, y + 1, charW, h - 2);
          ctx.fillStyle = CRT_BG;
          ctx.shadowBlur = 0;
          ctx.fillText(char, cellX, y + h / 2);
        } else {
          if (t > 0.1) {
            const extraBloom = Math.round(4 * bloomT);
            ctx.shadowColor = glow;
            ctx.shadowBlur = Math.round(2 + 6 * t) + extraBloom;
            ctx.fillStyle = hex;
            const passes = t >= 0.6 ? 3 : 2;
            for (let p = 0; p < passes; p++) ctx.fillText(char, cellX, y + h / 2);
          }
          ctx.shadowBlur = 0;
          ctx.fillStyle = hex;
          ctx.fillText(char, cellX, y + h / 2);
        }
      }
    }
  }

  private _drawScanlines(ctx: CanvasRenderingContext2D, cW: number, cH: number, scanT: number): void {
    const alpha = 0.08 + 0.25 * scanT;
    const spacing = Math.max(2, Math.round(cH / 240));
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    for (let y = 0; y < cH; y += spacing * 2) ctx.fillRect(0, y, cW, spacing * 0.6);
  }

  private _drawVignette(ctx: CanvasRenderingContext2D, cW: number, cH: number, t: number): void {
    const cx = cW / 2,
      cy = cH / 2;
    const r = Math.sqrt(cx * cx + cy * cy) * 1.05;
    const g = ctx.createRadialGradient(cx, cy, r * 0.35, cx, cy, r);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.7, `rgba(0,0,0,${0.1 * t})`);
    g.addColorStop(1.0, `rgba(0,0,0,${0.55 * t})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, cW, cH);
  }

  private _drawCurvatureDarken(ctx: CanvasRenderingContext2D, cW: number, cH: number, t: number): void {
    if (t < 0.5) return;
    const alpha = 0.12 * ((t - 0.5) / 0.5);
    const corners: [number, number][] = [
      [0, 0],
      [cW, 0],
      [0, cH],
      [cW, cH],
    ];
    corners.forEach(([cx, cy]) => {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, cW * 0.45);
      g.addColorStop(0, `rgba(0,0,0,${alpha})`);
      g.addColorStop(0.5, `rgba(0,0,0,${alpha * 0.3})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cW, cH);
    });
  }

  private _drawGlassHaze(ctx: CanvasRenderingContext2D, cW: number, cH: number, w: number): void {
    ctx.fillStyle = `rgba(0,30,0,${0.12 * w})`;
    ctx.fillRect(0, 0, cW, cH);
  }

  private _captureFrame(canvas: HTMLCanvasElement): void {
    const bW = canvas.width,
      bH = canvas.height;
    if (!this._prevFrame || this._prevFrame.width !== bW || this._prevFrame.height !== bH) {
      this._prevFrame = createPersistenceBuffer(bW, bH);
    }
    const ctx = this._prevFrame.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, bW, bH);
      ctx.drawImage(canvas, 0, 0, bW, bH);
    }
  }

  private _rgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
}
