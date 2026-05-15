import type { FMCState } from '../types/fmc';
import type { DisplayData } from '../types/fmc';
import { displayDataToGrid, scratchpadToGridSegment } from './displayGrid';
import { getPageRenderer } from './pages/index';
import type { DisplayColor } from '../fmc/displayColors';
import type { RendererDisplayData } from './displayBuilderTypes';

// ─────────────────────────────────────────────────────────────────────────────
// buildDisplayData
//
// Derives a RendererDisplayData snapshot from the current FMCState.
// Called by CDUDisplay (via the Zustand store selector) to feed the canvas
// renderer without coupling the renderer to Zustand directly.
// ─────────────────────────────────────────────────────────────────────────────

export function buildDisplayData(state: FMCState): RendererDisplayData {
  // Determine the legacy DisplayData from the shared page renderer.
  const aircraft = state.aircraft ?? 'BOEING_737';
  const renderer = getPageRenderer(state.currentPage);
  const legacyData: DisplayData = renderer
    ? renderer(state as any)
    : {
        title: state.currentPage,
        lines: [],
        lskActions: {},
      };

  // Convert to the richer GridDisplayData model used by canvas renderers.
  const grid = displayDataToGrid(legacyData);

    // Build scratchpad segments.
    const spText =
      state.scratchpadError ?? state.scratchpad;
    let color: DisplayColor = state.scratchpadError != null ? 'amber' : 'white';
    const scratchpad = spText
      ? [scratchpadToGridSegment(spText, { color })]
      : [];

  return { grid, scratchpad };
}

export type { RendererDisplayData };
