import type { PageType, FMCState } from '../../types/fmc';

/**
 * LSK page navigation action definitions.
 *
 * Maps LSK action names to their target page, sub-page state,
 * or key-press equivalent.
 */

export interface LskNavigationAction {
  action: string;
  targetPage?: PageType;
  pressKey?: string;
  setSubPage?: Partial<FMCState>;
  handled: true;
}

/**
 * All known LSK page navigation actions.
 * Returns the navigation target or null if not a navigation action.
 */
export function resolveLskNavigation(action: string): LskNavigationAction | null {
  const map: Record<string, LskNavigationAction> = {
    // Boeing LSK navigation
    pos_init: { action: 'pos_init', targetPage: 'POS_INIT', handled: true },
    perf_init: { action: 'perf_init', targetPage: 'PERF_INIT', handled: true },
    rte: { action: 'rte', targetPage: 'RTE', handled: true },
    dep_arr: { action: 'dep_arr', targetPage: 'DEP_ARR', handled: true },
    legs: { action: 'legs', targetPage: 'LEGS', handled: true },
    thrust_lim: { action: 'thrust_lim', targetPage: 'THRUST_LIM', handled: true },
    takeoff_ref: { action: 'takeoff_ref', targetPage: 'TAKEOFF_REF', handled: true },
    menu: { action: 'menu', targetPage: 'MENU', handled: true },
    ident: { action: 'ident', targetPage: 'IDENT', handled: true },
    nav_data: { action: 'nav_data', targetPage: 'NAV_DATA', handled: true },
    next_page: { action: 'next_page', pressKey: 'NEXT_PAGE', handled: true },
    prev_page: { action: 'prev_page', pressKey: 'PREV_PAGE', handled: true },
    dep_page: { action: 'dep_page', setSubPage: { depArrSubPage: 'DEP' as const }, handled: true },
    arr_page: { action: 'arr_page', setSubPage: { depArrSubPage: 'ARR' as const }, handled: true },
    atc: { action: 'atc', targetPage: 'MENU' as PageType, handled: true },

    // Airbus LSK navigation
    init_a: { action: 'init_a', targetPage: 'INIT_A', handled: true },
    init_b: { action: 'init_b', targetPage: 'INIT_B', handled: true },
    perf_to: { action: 'perf_to', targetPage: 'PERF_TAKEOFF', handled: true },
    perf_appr: { action: 'perf_appr', targetPage: 'PERF_APPR', handled: true },
    f_pln: { action: 'f_pln', targetPage: 'F_PLN', handled: true },
    fuel_pred: { action: 'fuel_pred', targetPage: 'FUEL_PRED', handled: true },
    sec_fpln: { action: 'sec_fpln', targetPage: 'SEC_FPLN', handled: true },
    rad_nav: { action: 'rad_nav', targetPage: 'RAD_NAV', handled: true },
    data_index: { action: 'data_index', targetPage: 'DATA_INDEX', handled: true },
    mcdu_menu: { action: 'mcdu_menu', targetPage: 'MCDU_MENU', handled: true },
    atsu: { action: 'atsu', targetPage: 'ATSU', handled: true },
    atsu_msgs: { action: 'atsu_msgs', targetPage: 'ATSU_MSGS', handled: true },
    fpln_dep_arr: { action: 'fpln_dep_arr', targetPage: 'DEP_ARR_A', handled: true },
    fpln_next: { action: 'fpln_next', pressKey: 'NEXT_PAGE', handled: true },
    fpln_prev: { action: 'fpln_prev', pressKey: 'PREV_PAGE', handled: true },
  };

  return map[action] ?? null;
}

/**
 * Check if this action is handled by the navigation dispatcher.
 */
export function isLskNavigationAction(action: string): boolean {
  return resolveLskNavigation(action) !== null;
}
