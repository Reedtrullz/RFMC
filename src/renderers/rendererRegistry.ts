import { NgLcdRenderer }      from './NgLcdRenderer';
import { ClassicCrtRenderer } from './ClassicCrtRenderer';
import type { DisplayRenderer } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Renderer registry
//
// Add new renderer implementations here.  The key becomes the display-style
// identifier stored in Zustand and used by CDUDisplay.tsx.
// ─────────────────────────────────────────────────────────────────────────────

/** All registered display style keys. */
export type DisplayStyle = 'ng-lcd' | 'classic-crt';

/** Map of style key → singleton renderer instance. */
export const rendererMap: Record<DisplayStyle, DisplayRenderer> = {
  'ng-lcd':      new NgLcdRenderer(),
  'classic-crt': new ClassicCrtRenderer(),
} as const;

/**
 * Returns the renderer for the given style key.
 * Falls back to 'ng-lcd' if an unknown key is passed (defensive guard).
 */
export function getRenderer(style: DisplayStyle): DisplayRenderer {
  return rendererMap[style] ?? rendererMap['ng-lcd'];
}
