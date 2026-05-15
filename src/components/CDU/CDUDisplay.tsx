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
// DPR strategy (fix for Codex P1):
//   The canvas backing buffer is set to CSS-px dimensions (no DPR multiply).
//   We do NOT call ctx.scale(dpr, dpr).  Instead we rely on the browser’s
//   own CSS scaling to up-scale the canvas to the devicePixelRatio.  This
//   means `canvas.width === width` always and renderer geometry never needs
//   to account for DPR.  A future refactor may move to explicit DPR scaling
//   in a single place once a shared coordinate helper is introduced.
//
// Resize strategy (fix for Codex P2):
//   A single combined effect handles BOTH resize AND re-render, keyed on
//   [data, displayStyle, crtIntensity, wearIntensity, width, height].  This
//   guarantees a fresh frame is always drawn after a dimension change.
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

  // ── Single effect: resize canvas then immediately render a fresh frame ────
  // Codex P1: canvas dimensions are set in CSS px (no ctx.scale / no DPR
  //           multiply) so renderer geometry always works in one coordinate
  //           space.
  // Codex P2: width + height are included in the dependency array so that
  //           any dimension change immediately triggers a fresh render.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Resize backing buffer to CSS-pixel dimensions (no DPR multiply).
    // The browser’s CSS layout engine handles physical pixel mapping.
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width  = width;
      canvas.height = height;
    }

    // Render immediately after (potential) resize – never leave a blank canvas.
    const renderer = getRenderer(displayStyle);
    renderer.render(data, canvas, {
      intensity:     crtIntensity,
      wearIntensity: wearIntensity,
    });
  // Dimensions included so resize always re-draws (Codex P2).
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
          display: 'block',
          width:   `${width}px`,
          height:  `${height}px`,
        }}
      />
    </div>
  );
};

export default CDUDisplay;
