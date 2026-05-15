import { BaseRenderer } from './BaseRenderer';
import type { DisplayData, DisplayLine, RenderOptions } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Classic CRT Renderer – retro green-phosphor Boeing CDU aesthetic
//
// Effects controlled by RenderOptions.intensity (0–100):
//   ① Green phosphor text with bloom glow
//   ② Horizontal scanlines
//   ③ Vignette
//   ④ Phosphor persistence (afterimage on change)
//   ⑤ Optional curvature distortion (at intensity >= 50)
//   ⑥ Subtle glass haze (wearIntensity)
// ─────────────────────────────────────────────────────────────────────────────

/** Maps semantic color roles to physical CRT phosphor hex values. */
const CRT_PALETTE: Record<NonNullable<DisplayLine['color']>, string> = {
  white:   '#c8ffb4',  // slightly warm white-green
  green:   '#39ff14',  // classic bright phosphor green
  amber:   '#ffcc00',  // amber – selected fields
  cyan:    '#80ffff',
  magenta: '#ff80ff',
  red:     '#ff4040',
};

const CRT_BG         = '#000300'; // near-black with a faint green cast
const SCRATCHPAD_BG  = '#000500';

export class ClassicCrtRenderer extends BaseRenderer {
  /** Offscreen canvas used to carry the previous frame for phosphor persistence. */
  private _prevFrame: OffscreenCanvas | null = null;

  getName(): string {
    return 'Classic CRT';
  }

  render(
    data: DisplayData,
    canvas: HTMLCanvasElement,
    options?: RenderOptions
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const intensity     = Math.max(0, Math.min(100, options?.intensity     ?? 65));
    const wearIntensity = Math.max(0, Math.min(100, options?.wearIntensity ?? 35));
    const t             = intensity / 100;  // normalised 0-1

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // ── 1. Background ────────────────────────────────────────────────────────
    ctx.fillStyle = CRT_BG;
    ctx.fillRect(0, 0, width, height);

    // ── 2. Phosphor persistence ──────────────────────────────────────────────
    if (t > 0 && this._prevFrame) {
      // Blend the previous frame at reduced opacity before drawing the new one.
      // This creates the characteristic phosphor afterimage.
      const persistAlpha = 0.18 * t;  // 0 → no afterimage, 1 → strong trail
      ctx.globalAlpha = persistAlpha;
      ctx.drawImage(this._prevFrame as unknown as CanvasImageSource, 0, 0);
      ctx.globalAlpha = 1;
    }

    // ── 3. Draw text rows ─────────────────────────────────────────────────────
    data.lines.forEach((line, rowIndex) => {
      if (rowIndex >= 14) return;

      const y    = this.rowTop(canvas, rowIndex);
      const h    = this.rowHeight(canvas, rowIndex);
      const x    = this.leftEdge(canvas);
      const w    = this.rowWidth(canvas);
      const size = line.size ?? (rowIndex % 2 === 1 ? 'small' : 'large');

      const hex  = CRT_PALETTE[line.color ?? 'white'];
      const glow = this._glowColorFromHex(hex, 0.5 + 0.5 * t);

      ctx.font         = this.fontString(canvas, rowIndex, size);
      ctx.textBaseline = 'middle';

      // Multi-pass glow (bloom effect)
      if (t > 0.1) {
        const blurRadius = Math.round(2 + 6 * t);
        ctx.shadowColor = glow;
        ctx.shadowBlur  = blurRadius;
        // Extra passes intensify the bloom
        const passes = intensity >= 60 ? 3 : 2;
        for (let p = 0; p < passes; p++) {
          ctx.fillStyle = hex;
          ctx.fillText(line.text, x, y + h / 2, w);
        }
      }

      // Crisp text pass on top
      ctx.shadowBlur = 0;
      ctx.fillStyle  = hex;
      ctx.fillText(line.text, x, y + h / 2, w);
    });

    // ── 4. Scratch-pad ───────────────────────────────────────────────────────
    this._drawScratchpad(ctx, canvas, data, t);

    // ── 5. Capture frame for persistence ─────────────────────────────────────
    if (t > 0) {
      this._captureFrame(canvas);
    }

    // ── 6. Scanlines ─────────────────────────────────────────────────────────
    if (intensity >= 10) {
      this._drawScanlines(ctx, canvas, t);
    }

    // ── 7. Vignette ──────────────────────────────────────────────────────────
    if (intensity >= 5) {
      this._drawVignette(ctx, canvas, t);
    }

    // ── 8. CRT curvature (barrel distortion simulation via corner darken) ────
    if (intensity >= 50) {
      this._drawCurvatureDarken(ctx, canvas, t);
    }

    // ── 9. Glass wear / haze ─────────────────────────────────────────────────
    if (wearIntensity >= 5) {
      this._drawGlassHaze(ctx, canvas, wearIntensity / 100);
    }
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private _drawScratchpad(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    data: DisplayData,
    t: number
  ): void {
    const rowIndex = 13;
    const y   = this.rowTop(canvas, rowIndex);
    const h   = this.rowHeight(canvas, rowIndex);
    const x   = this.leftEdge(canvas);
    const w   = this.rowWidth(canvas);

    ctx.fillStyle = SCRATCHPAD_BG;
    ctx.fillRect(0, y, canvas.width, h);

    const text  = data.message ?? data.scratchpad;
    const hex   = data.message ? CRT_PALETTE.amber : CRT_PALETTE.white;
    const glow  = this._glowColorFromHex(hex, 0.6 + 0.4 * t);

    ctx.font         = this.fontString(canvas, rowIndex, 'large');
    ctx.textBaseline = 'middle';
    ctx.shadowColor  = glow;
    ctx.shadowBlur   = Math.round(2 + 6 * t);
    ctx.fillStyle    = hex;
    ctx.fillText(text, x, y + h / 2, w);
    ctx.shadowBlur   = 0;
  }

  /**
   * Draws horizontal scanlines at every other pixel row.
   * Opacity scales with intensity.
   */
  private _drawScanlines(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    t: number
  ): void {
    const alpha       = 0.08 + 0.22 * t;  // 0.08 subtle → 0.30 strong
    const lineSpacing = Math.max(2, Math.round(canvas.height / 240));

    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    for (let y = 0; y < canvas.height; y += lineSpacing * 2) {
      ctx.fillRect(0, y, canvas.width, lineSpacing);
    }
  }

  /** Radial vignette that darkens the corners and edges. */
  private _drawVignette(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    t: number
  ): void {
    const { width, height } = canvas;
    const cx = width  / 2;
    const cy = height / 2;
    const r  = Math.sqrt(cx * cx + cy * cy) * 1.05;

    const gradient = ctx.createRadialGradient(cx, cy, r * 0.35, cx, cy, r);
    gradient.addColorStop(0,   'rgba(0,0,0,0)');
    gradient.addColorStop(0.7, `rgba(0,0,0,${0.1 * t})`);
    gradient.addColorStop(1.0, `rgba(0,0,0,${0.55 * t})`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  /**
   * Simulates CRT barrel curvature by darkening corners with a sharp
   * corner-focused gradient — a lightweight substitute for actual mesh
   * distortion which would require WebGL.
   */
  private _drawCurvatureDarken(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    t: number
  ): void {
    if (t < 0.5) return;
    const { width, height } = canvas;
    const alpha = 0.12 * ((t - 0.5) / 0.5);

    // Four corner gradients
    const corners: Array<[number, number]> = [
      [0, 0], [width, 0], [0, height], [width, height],
    ];
    corners.forEach(([cx, cy]) => {
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, width * 0.45);
      grad.addColorStop(0,   `rgba(0,0,0,${alpha})`);
      grad.addColorStop(0.5, `rgba(0,0,0,${alpha * 0.3})`);
      grad.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    });
  }

  /** Subtle static haze simulating aged CRT glass. */
  private _drawGlassHaze(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    w: number
  ): void {
    // A faint greenish tint over the whole display
    ctx.fillStyle = `rgba(0,30,0,${0.04 * w})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  /** Copies the current canvas into the persistence offscreen buffer. */
  private _captureFrame(canvas: HTMLCanvasElement): void {
    if (
      !this._prevFrame ||
      this._prevFrame.width  !== canvas.width ||
      this._prevFrame.height !== canvas.height
    ) {
      this._prevFrame = new OffscreenCanvas(canvas.width, canvas.height);
    }
    const pCtx = this._prevFrame.getContext('2d') as OffscreenCanvasRenderingContext2D | null;
    if (pCtx) {
      pCtx.clearRect(0, 0, canvas.width, canvas.height);
      pCtx.drawImage(canvas, 0, 0);
    }
  }

  /**
   * Converts a hex colour string to an rgba glow colour.
   * @param hex    – '#rrggbb' format
   * @param alpha  – desired alpha (0-1)
   */
  private _glowColorFromHex(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha.toFixed(2)})`;
  }
}
