import React, { useEffect, useRef } from 'react';
import { useDisplaySettings }       from '../../store/displaySettingsStore';
import { getRenderer }              from '../../renderers/rendererRegistry';
import type { DisplayData }         from '../../renderers/types';

// ─────────────────────────────────────────────────────────────────────────────
// CDUDisplay
//
// A <canvas>-based CDU display component that delegates all drawing to the
// active renderer resolved from the display settings store.
//
// DPR strategy (Codex P2 fix):
//   The standard HiDPI canvas pattern is used:
//     1. Set backing-store size to CSS-px × devicePixelRatio (sharp pixels).
//     2. Scale the 2D context by dpr so that renderer code writes in CSS-px
//        coordinates (no renderer changes required).
//     3. Set CSS width/height to the original CSS-px values so the element
//        occupies the correct layout space.
//   This produces crisp text on Retina/iPad while keeping renderer geometry
//   completely DPR-agnostic.
//
//   IMPORTANT: renderers must read canvas geometry via BaseRenderer helpers
//   (rowTop, rowHeight, leftEdge, rowWidth) which all operate on canvas.width
//   / canvas.height.  After ctx.scale(dpr, dpr) the context transforms those
//   CSS-space values to backing-store pixels automatically.
//
// Resize strategy:
//   A single combined effect handles resize AND re-render, keyed on all six
//   dependencies, so dimension changes always produce a fresh frame.
// ─────────────────────────────────────────────────────────────────────────────

interface CDUDisplayProps {
  data: DisplayData;
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

  // ── Single effect: resize → scale context → render ──────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio ?? 1;
    const backingW = Math.round(width  * dpr);
    const backingH = Math.round(height * dpr);

    // Only resize the backing store when dimensions actually change to avoid
    // wiping a perfectly valid bitmap on every unrelated state update.
    const needsResize =
      canvas.width  !== backingW ||
      canvas.height !== backingH;

    if (needsResize) {
      canvas.width  = backingW;
      canvas.height = backingH;
    }

    // Apply DPR scale so renderers can write in CSS-px coordinates.
    // Must be re-applied whenever the context is reset (i.e. after a resize).
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (needsResize) {
      // Resizing the backing store resets the transform – re-apply scale.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // Render immediately – never leave a blank or stale canvas.
    const renderer = getRenderer(displayStyle);
    renderer.render(data, canvas, {
      intensity:     crtIntensity,
      wearIntensity: wearIntensity,
    });
  }, [data, displayStyle, crtIntensity, wearIntensity, width, height]);

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
      role="img"
      aria-label="CDU display"
    >
      <canvas
        ref={canvasRef}
        style={{
          // CSS dimensions keep the element in correct layout space.
          // The backing store is larger by ×dpr for crisp rendering.
          display: 'block',
          width:   `${width}px`,
          height:  `${height}px`,
        }}
      />
    </div>
  );
};

export default CDUDisplay;
