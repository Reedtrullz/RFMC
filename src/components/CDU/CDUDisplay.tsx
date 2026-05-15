import React, { useEffect, useRef } from 'react';
import { useDisplaySettings }        from '../../store/displaySettingsStore';
import { getRenderer }               from '../../renderers/rendererRegistry';
import { gridToPlainText }           from '@shared/fmc/displayGrid';
import type { RendererDisplayData, DisplaySegment } from '../../renderers/types';

// ─────────────────────────────────────────────────────────────────────────────
// CDUDisplay
//
// <canvas>-based CDU display component. Delegates all drawing to the active
// renderer resolved from the display settings Zustand store.
//
// DPR strategy:
//   1. Backing store = CSS-px × devicePixelRatio (sharp HiDPI pixels).
//   2. ctx.setTransform(dpr, …) maps CSS-logical coordinates → backing store.
//   3. CSS width/height keep the element in correct layout space.
//   4. BaseRenderer helpers divide canvas.width / canvas.height by dpr and
//      return CSS-logical px — no double-scaling on Retina / iPad.
//
// Blink strategy:
//   Blinking segments use Math.floor(Date.now() / 500) % 2 at draw time.
//   The main render effect fires only on data / settings changes, so without
//   a periodic trigger blink state would freeze on static data.
//   A separate 250 ms interval effect runs only when grid or scratchpad
//   contains at least one blink:true segment, re-invoking render() each tick.
//   It is torn down on cleanup so there is no timer leak.
//
// Accessibility:
//   A visually-hidden <div> sibling renders plain text via gridToPlainText()
//   so screen readers receive content equivalent to the existing grid renderer.
// ─────────────────────────────────────────────────────────────────────────────

interface CDUDisplayProps {
  data: RendererDisplayData;
  /** Logical (CSS) width in px. */
  width?:  number;
  /** Logical (CSS) height in px. */
  height?: number;
  className?: string;
}

export const CDUDisplay: React.FC<CDUDisplayProps> = ({
  data,
  width  = 480,
  height = 420,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { displayStyle, crtIntensity, wearIntensity } = useDisplaySettings();

  // ── Helper: invoke the active renderer on the current canvas ──────────────
  const doRender = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    getRenderer(displayStyle).render(data, canvas, {
      intensity:     crtIntensity,
      wearIntensity: wearIntensity,
    });
  }, [data, displayStyle, crtIntensity, wearIntensity]);

  // ── Effect 1: resize backing store + initial render ───────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr      = window.devicePixelRatio ?? 1;
    const backingW = Math.round(width  * dpr);
    const backingH = Math.round(height * dpr);

    const needsResize =
      canvas.width  !== backingW ||
      canvas.height !== backingH;

    if (needsResize) {
      canvas.width  = backingW;
      canvas.height = backingH;
      // Resizing the backing store resets the transform — re-apply DPR scale.
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    doRender();
  }, [doRender, width, height]);

  // ── Effect 2: blink repaint loop (only when blinking cells are present) ───
  //
  // Runs a 250 ms interval that re-renders the canvas so blinking cells
  // actually toggle. The interval is only active when needed and is torn down
  // on cleanup to avoid timer leaks.
  const hasBlinking =
    data.grid.segments.some((s: DisplaySegment) => s.blink) ||
    data.scratchpad.some((s: DisplaySegment) => s.blink);

  useEffect(() => {
    if (!hasBlinking) return;

    const id = window.setInterval(doRender, 250);
    return () => window.clearInterval(id);
  }, [hasBlinking, doRender]);

  // Plain-text representation for screen readers.
  const srText = gridToPlainText(data.grid);

  return (
    <div
      className={className}
      style={{
        width:    `${width}px`,
        height:   `${height}px`,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '6px',
        boxShadow: 'inset 0 0 18px rgba(0,0,0,0.8)',
      }}
    >
      {/* Visually-hidden text for assistive technology */}
      <div
        aria-label="CDU display"
        role="img"
        style={{
          position:  'absolute',
          width:     '1px',
          height:    '1px',
          padding:   0,
          margin:    '-1px',
          overflow:  'hidden',
          clip:      'rect(0,0,0,0)',
          whiteSpace:'pre',
          border:    0,
          fontFamily:'monospace',
        }}
      >
        {srText}
      </div>

      <canvas
        ref={canvasRef}
        aria-hidden
        style={{
          display: 'block',
          width:   `${width}px`,
          height:  `${height}px`,
        }}
      />
    </div>
  );
};

export default CDUDisplay;
