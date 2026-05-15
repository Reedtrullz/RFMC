import React, { useEffect, useRef } from 'react';
import { useDisplaySettings }        from '../../store/displaySettingsStore';
import { getRenderer }               from '../../renderers/rendererRegistry';
import { gridToPlainText }           from '@virtual-cdu/shared/fmc/displayGrid';
import type { RendererDisplayData }  from '../../renderers/types';

// ─────────────────────────────────────────────────────────────────────────────
// CDUDisplay
//
// <canvas>-based CDU display component. Delegates all drawing to the active
// renderer resolved from the display settings Zustand store.
//
// DPR strategy:
//   1. Backing store = CSS-px × devicePixelRatio (sharp HiDPI pixels).
//   2. ctx.setTransform(dpr, …) maps CSS-logical coordinates → backing store.
//   3. CSS width/height are the original CSS-px values (correct layout size).
//   4. BaseRenderer helpers (rowTop, rowHeight, …) divide canvas.width /
//      canvas.height by dpr and return CSS-logical px, so there is no
//      double-scaling on Retina / iPad.
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
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Re-apply DPR scale after any backing-store resize (resize resets transform).
    if (needsResize) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    getRenderer(displayStyle).render(data, canvas, {
      intensity:     crtIntensity,
      wearIntensity: wearIntensity,
    });
  }, [data, displayStyle, crtIntensity, wearIntensity, width, height]);

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
      {/* Visually-hidden text representation for assistive technology */}
      <div
        aria-label="CDU display"
        role="img"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'pre',
          border: 0,
          fontFamily: 'monospace',
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
