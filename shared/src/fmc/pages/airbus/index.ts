import type { FMCState, DisplayData, PageType } from '../../../types/fmc';
import { renderAtsuMenu, renderAtsuMessages, renderAtsuMessageDetail } from './atsu';
import { renderProgGrid } from './prog.grid';
import { renderRadNavGrid } from './radNav.grid';
import { renderFuelPredGrid } from './fuelPred.grid';
import { renderSecFplnGrid } from './secFpln.grid';
import { renderDataIndexGrid } from './dataIndex.grid';
import { renderMcduMenuGrid } from './mcduMenu.grid';
import { renderDepArrA320Grid } from './depArr.grid';
import { renderFplnGrid } from './fpln.grid';
import { renderInitAGrid } from './initA.grid';
import { renderInitBGrid } from './initB.grid';
import { renderPerfTakeoffGrid } from './perfTakeoff.grid';
import { renderPerfApprGrid } from './perfAppr.grid';

import { fmt, inv, blank } from './formatting';
export { fmt, inv, blank };

const AIRBUS_PAGES: readonly string[] = [
  'INIT_A',
  'INIT_B',
  'F_PLN',
  'DEP_ARR_A',
  'PERF_TAKEOFF',
  'PERF_APPR',
  'FUEL_PRED',
  'SEC_FPLN',
  'RAD_NAV',
  'PROG_A',
  'DATA_INDEX',
  'MCDU_MENU',
  'ATSU',
  'ATSU_MSGS',
  'ATSU_MSG_DETAIL',
];

export function getAirbusPageRenderer(page: PageType): ((state: FMCState) => DisplayData) | null {
  if (!AIRBUS_PAGES.includes(page)) return null;
  const renderers: Partial<Record<PageType, (state: FMCState) => DisplayData>> = {
    INIT_A: renderInitAGrid,
    INIT_B: renderInitBGrid,
    F_PLN: renderFplnGrid,
    DEP_ARR_A: renderDepArrA320Grid,
    PERF_TAKEOFF: renderPerfTakeoffGrid,
    PERF_APPR: renderPerfApprGrid,
    FUEL_PRED: renderFuelPredGrid,
    SEC_FPLN: renderSecFplnGrid,
    RAD_NAV: renderRadNavGrid,
    PROG_A: renderProgGrid,
    DATA_INDEX: renderDataIndexGrid,
    MCDU_MENU: renderMcduMenuGrid,
    ATSU: renderAtsuMenu,
    ATSU_MSGS: renderAtsuMessages,
    ATSU_MSG_DETAIL: renderAtsuMessageDetail,
  };
  return renderers[page] || null;
}
