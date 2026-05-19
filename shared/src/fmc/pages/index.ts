import type { FMCState, DisplayData, PageType } from '../../types/fmc';
import { renderIdentPage, renderPerfInitPage, renderThrustLimPage, renderMenuPage, renderNavDataPage } from './setup';
import { renderDepArrPage } from './route';
import { renderHoldPage, renderFixPage } from './navigation';
import { renderBoeingClimbGrid as renderClbPage } from './boeing/climb.grid';
import { renderBoeingCruiseGrid as renderCrzPage } from './boeing/cruise.grid';
import { renderBoeingDescentGrid as renderDesPage } from './boeing/descent.grid';
import { renderBoeingDirectGrid as renderDirIntcPage } from './boeing/direct.grid';
import { renderBoeingN1LimitGrid as renderN1LimitPage } from './boeing/n1limit.grid';
import { getAirbusPageRenderer } from './airbus';
import { renderBoeingIdentGrid } from './boeing/ident.grid';
import { renderBoeingPosInitGrid } from './boeing/posInit.grid';
import { renderBoeingRteGrid } from './boeing/route.grid';
import { renderBoeingLegsGrid } from './boeing/legs.grid';
import { renderBoeingTakeoffRefGrid } from './boeing/takeoffRef.grid';
import { renderBoeingProgressGrid } from './boeing/progress.grid';

export { renderIdentPage, renderPerfInitPage, renderThrustLimPage, renderMenuPage } from './setup';
export { renderDepArrPage } from './route';
export { renderHoldPage, renderFixPage } from './navigation';
export { renderClbPage, renderCrzPage, renderDesPage, renderDirIntcPage, renderN1LimitPage };
export { getAirbusPageRenderer } from './airbus';

export function getPageRenderer(page: PageType): ((state: FMCState) => DisplayData) | null {
  const renderers: Partial<Record<PageType, (state: FMCState) => DisplayData>> = {
    IDENT: renderBoeingIdentGrid,
    POS_INIT: renderBoeingPosInitGrid,
    RTE: renderBoeingRteGrid,
    DEP_ARR: renderDepArrPage,
    PERF_INIT: renderPerfInitPage,
    THRUST_LIM: renderThrustLimPage,
    TAKEOFF_REF: renderBoeingTakeoffRefGrid,
    LEGS: renderBoeingLegsGrid,
    PROGRESS: renderBoeingProgressGrid,
    HOLD: renderHoldPage,
    FIX: renderFixPage,
    MENU: renderMenuPage,
    TUTORIAL: renderMenuPage,
    CLB: renderClbPage,
    CRZ: renderCrzPage,
    DES: renderDesPage,
    DIR_INTC: renderDirIntcPage,
    NAV_DATA: renderNavDataPage,
    AC_STATUS: renderIdentPage,
    N1_LIMIT: renderN1LimitPage,
  };
  return renderers[page] || getAirbusPageRenderer(page);
}
