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
// Props:
//   data        – DisplayData snapshot produced by the active FMC page.
//   width/height – Logical canvas dimensions in CSS pixels (default: 480×420).
//                  The canvas is rendered at 2× devicePixelRatio for sharpness.
//   className   – Additional Tailwind / CSS class names for the wrapper div.
// ─────────────────────────────────────────────────────────────────────────────

interface CDUDisplayProps {
  data: DisplayData;
  /** Logical width in CSS px. */
  width?:  number;
  /** Logical height in CSS px. */
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

  // ── DPR-aware canvas sizing ───────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio ?? 1;
    canvas.width  = Math.round(width  * dpr);
    canvas.height = Math.round(height * dpr);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }, [width, height]);

  // ── Render frame on every data / settings change ──────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = getRenderer(displayStyle);
    renderer.render(data, canvas, {
      intensity:     crtIntensity,
      wearIntensity: wearIntensity,
    });
  }, [data, displayStyle, crtIntensity, wearIntensity]);

  return (
    <div
      className={className}
      style={{
        width:    `${width}px`,
        height:   `${height}px`,
        position: 'relative',
        overflow: 'hidden',
        // Rounded bezel corners
        borderRadius: '6px',
        // Very subtle inset shadow to give depth inside the bezel
        boxShadow: 'inset 0 0 18px rgba(0,0,0,0.8)',
      }}
      role="img"
      aria-label="CDU display"
    >
      <canvas
        ref={canvasRef}
        style={{
          // The canvas element itself fills the wrapper exactly at CSS size.
          // Physical resolution is set by the useEffect above.
          display:  'block',
          width:    `${width}px`,
          height:   `${height}px`,
        }}
      />
    </div>
  );
};

export default CDUDisplay;
