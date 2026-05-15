// ─────────────────────────────────────────────────────────────────────────────
// displayBuilderTypes
//
// Minimal re-export of RendererDisplayData so displayBuilder.ts can reference
// it without a circular dependency on src/renderers/types.ts (which lives in
// the frontend workspace and must not be imported from shared/).
// ─────────────────────────────────────────────────────────────────────────────

import type { GridDisplayData, DisplaySegment } from '../types/display';

export interface RendererDisplayData {
  grid: GridDisplayData;
  scratchpad: DisplaySegment[];
  activeLsk?: number;
}
