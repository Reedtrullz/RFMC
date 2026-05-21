import React, { useEffect, useRef } from 'react';
import { useDisplaySettings } from '../../store/displaySettingsStore';
import { getRenderer } from '../../renderers/rendererRegistry';
import { gridToPlainText } from '@shared/fmc/displayGrid';
import type { RendererDisplayData, DisplaySegment } from '../../renderers/types';

// ─────────────────────────────────────────────────────────────────────────────
// CDUDisplay
//
// <canvas>-based CDU display component. Delegates all drawing to the active
// renderer resolved from the display settings Zustand store.
//
// Updated for Visual Realism Pass — Phase 1:
//   • Now forwards bloomIntensity and scanlineIntensity to renderer
//   • HardwareRealismControls should be rendered in the parent layout
//     (CockpitMode or CDU wrapper) below or beside this component.
// ─────────────────────────────────────────────────────────────────────────────

interface CDUDisplayProps {
  data: RendererDisplayData;
  /** Logical (CSS) width in px. */
  width?: number;
  /** Logical (CSS) height in px. */
  height?: number;
  className?: string;
}

export const CDUDisplay: React.FC<CDUDisplayProps> = ({ data, width = 480, height = 420, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { displayStyle, crtIntensity, wearIntensity, bloomIntensity, scanlineIntensity } = useDisplaySettings();

  // ── Helper: invoke the active renderer on the current canvas ──────────────
  const doRender = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    getRenderer(displayStyle).render(data, canvas, {
      intensity: crtIntensity,
      wearIntensity,
      bloomIntensity,
      scanlineIntensity,
    });
  }, [data, displayStyle, crtIntensity, wearIntensity, bloomIntensity, scanlineIntensity]);

  // ── Effect 1: resize backing store + initial render ───────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio ?? 1;
    const backingW = Math.round(width * dpr);
    const backingH = Math.round(height * dpr);

    const needsResize = canvas.width !== backingW || canvas.height !== backingH;

    if (needsResize) {
      canvas.width = backingW;
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
    data.grid.segments.some((s: DisplaySegment) => s.blink) || data.scratchpad.some((s: DisplaySegment) => s.blink);

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
        width: `${width}px`,
        height: `${height}px`,
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
          width: `${width}px`,
          height: `${height}px`,
        }}
      />
    </div>
  );
};

export default CDUDisplay;
