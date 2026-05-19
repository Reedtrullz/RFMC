import { NgLcdRenderer } from './NgLcdRenderer';
import { ClassicCrtRenderer } from './ClassicCrtRenderer';
import type { DisplayRenderer } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Renderer registry
//
// Singletons are intentional: renderers carry no FMC state, only optional
// internal render-pass state (e.g. phosphor persistence buffer in
// ClassicCrtRenderer). Creating one instance per style avoids re-allocating
// that buffer on every React render cycle.
// ─────────────────────────────────────────────────────────────────────────────

export const rendererMap: Record<string, DisplayRenderer> = {
  'ng-lcd': new NgLcdRenderer(),
  'classic-crt': new ClassicCrtRenderer(),
} as const;

export type DisplayStyle = keyof typeof rendererMap;

/**
 * Returns the renderer for the given style key.
 * Falls back to 'ng-lcd' if the key is unknown — this prevents a runtime
 * crash if a persisted settings value refers to a style that was later
 * renamed or removed.
 */
export function getRenderer(style: string): DisplayRenderer {
  return rendererMap[style] ?? rendererMap['ng-lcd'];
}
