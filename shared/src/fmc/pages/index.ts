import type { FMCState, DisplayData, PageType } from '../../types/fmc';
import { renderIdentPage, renderPosInitPage, renderPerfInitPage, renderThrustLimPage, renderTakeoffRefPage, renderMenuPage } from './setup';
import { renderRtePage, renderDepArrPage } from './route';
import { renderLegsPage, renderProgressPage, renderHoldPage, renderFixPage } from './navigation';

export { renderIdentPage, renderPosInitPage, renderPerfInitPage, renderThrustLimPage, renderTakeoffRefPage, renderMenuPage } from './setup';
export { renderRtePage, renderDepArrPage } from './route';
export { renderLegsPage, renderProgressPage, renderHoldPage, renderFixPage } from './navigation';

/**
 * Map a page type to its render function.
 */
export function getPageRenderer(page: PageType): ((state: FMCState) => DisplayData) | null {
  const renderers: Partial<Record<PageType, (state: FMCState) => DisplayData>> = {
    IDENT: renderIdentPage,
    POS_INIT: renderPosInitPage,
    RTE: renderRtePage,
    DEP_ARR: renderDepArrPage,
    PERF_INIT: renderPerfInitPage,
    THRUST_LIM: renderThrustLimPage,
    TAKEOFF_REF: renderTakeoffRefPage,
    LEGS: renderLegsPage,
    PROGRESS: renderProgressPage,
    HOLD: renderHoldPage,
    FIX: renderFixPage,
    MENU: renderMenuPage,
    TUTORIAL: renderMenuPage,
  };
  return renderers[page] || null;
}
