// ============================================================
// Core foundational types — zero dependencies
//
// These types are shared across the entire codebase and must
// not import from any other project modules to avoid circular
// dependencies.
// ============================================================

/** Aircraft variant */
export type AircraftType = 'BOEING_737' | 'AIRBUS_A320';

/** All possible Boeing 737 CDU pages */
export type BoeingPageType =
  | 'IDENT'
  | 'POS_INIT'
  | 'RTE'
  | 'DEP_ARR'
  | 'PERF_INIT'
  | 'THRUST_LIM'
  | 'TAKEOFF_REF'
  | 'LEGS'
  | 'PROGRESS'
  | 'HOLD'
  | 'FIX'
  | 'MENU'
  | 'TUTORIAL'
  | 'CLB'
  | 'CRZ'
  | 'DES'
  | 'DIR_INTC'
  | 'NAV_DATA'
  | 'N1_LIMIT';

/** All possible Airbus A320 MCDU pages */
export type AirbusPageType =
  | 'INIT_A'
  | 'INIT_B'
  | 'F_PLN'
  | 'DEP_ARR_A'
  | 'PERF_TAKEOFF'
  | 'PERF_APPR'
  | 'FUEL_PRED'
  | 'SEC_FPLN'
  | 'RAD_NAV'
  | 'PROG_A'
  | 'DATA_INDEX'
  | 'MCDU_MENU'
  | 'AC_STATUS'
  | 'ATSU'
  | 'ATSU_MSGS'
  | 'ATSU_MSG_DETAIL';

/** All possible FMC pages (Boeing + Airbus) */
export type PageType = BoeingPageType | AirbusPageType;
