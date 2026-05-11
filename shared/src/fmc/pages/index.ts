import type { FMCState, DisplayData, PageType } from '../../types/fmc';
import { renderIdentPage, renderPosInitPage, renderPerfInitPage, renderThrustLimPage, renderTakeoffRefPage, renderMenuPage } from './setup';
import { renderRtePage, renderDepArrPage } from './route';
import { renderLegsPage, renderProgressPage, renderHoldPage, renderFixPage } from './navigation';
import { renderClbPage } from './climb';
import { renderCrzPage } from './cruise';
import { renderDesPage } from './descent';
import { renderDirIntcPage } from './direct';
import { renderN1LimitPage } from './n1limit';
import { getAirbusPageRenderer } from './airbus';

export { renderIdentPage, renderPosInitPage, renderPerfInitPage, renderThrustLimPage, renderTakeoffRefPage, renderMenuPage } from './setup';
export { renderRtePage, renderDepArrPage } from './route';
export { renderLegsPage, renderProgressPage, renderHoldPage, renderFixPage } from './navigation';
export { renderClbPage } from './climb';
export { renderCrzPage } from './cruise';
export { renderDesPage } from './descent';
export { renderDirIntcPage } from './direct';
export { renderN1LimitPage } from './n1limit';
export { getAirbusPageRenderer } from './airbus';

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
    CLB: renderClbPage,
    CRZ: renderCrzPage,
    DES: renderDesPage,
    DIR_INTC: renderDirIntcPage,
    N1_LIMIT: renderN1LimitPage,
  };
  return renderers[page] || getAirbusPageRenderer(page);
}
