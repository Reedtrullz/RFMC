import type { FMCState } from '../types/fmc';
import { SCRATCHPAD_MAX } from './constants';

// ─────────────────────────────────────────────────────────────────────────────
// processFMCKey
//
// Pure function: given the current FMCState and a CDU key string, returns
// the Partial<FMCState> patch that should be merged into the store.
//
// This is the shared FMC key-processing engine. The Zustand store in
// src/store/fmcStore.ts calls this and applies the returned patch via set().
// ─────────────────────────────────────────────────────────────────────────────

export function processFMCKey(state: FMCState, key: string): Partial<FMCState> {
  const { scratchpad } = state;

  // ── Alphanumeric / punctuation input ──────────────────────────────────────
  const CHAR_MAP: Record<string, string> = {
    DOT: '.',
    PLUS_MINUS: '+/-',
    SLASH: '/',
    SPACE: ' ',
  };

  if (key.length === 1 || key in CHAR_MAP) {
    if (scratchpad.length < SCRATCHPAD_MAX) {
      const char = CHAR_MAP[key] ?? key;
      return { scratchpad: scratchpad + char, scratchpadError: null };
    }
    return {};
  }

  // ── CLR ──────────────────────────────────────────────────────────────────
  if (key === 'CLR') {
    if (scratchpad.length > 0) {
      return { scratchpad: scratchpad.slice(0, -1), scratchpadError: null };
    }
    // When scratchpad is empty CLR clears the active scratchpad message.
    if (state.scratchpadMessages.length > 0) {
      const [, ...rest] = state.scratchpadMessages;
      return { scratchpadMessages: rest };
    }
    return {};
  }

  // ── DEL ──────────────────────────────────────────────────────────────────
  if (key === 'DEL') {
    return { scratchpad: 'DELETE', scratchpadError: null };
  }

  // ── Page navigation keys ─────────────────────────────────────────────────
  const PAGE_MAP: Record<string, FMCState['currentPage']> = {
    INIT_REF: 'IDENT',
    RTE: 'RTE',
    CLB: 'CLB',
    CRZ: 'CRZ',
    DES: 'DES',
    DIR_INTC: 'DIR_INTC',
    LEGS: 'LEGS',
    DEP_ARR: 'DEP_ARR',
    HOLD: 'HOLD',
    PERF: 'TAKEOFF_REF',
    PROG: 'PROGRESS',
    N1_LIMIT: 'N1_LIMIT',
    FIX: 'FIX',
    MENU: 'MENU',
    // Airbus
    INIT_A: 'INIT_A',
    INIT_B: 'INIT_B',
    F_PLN: 'F_PLN',
    PERF_TAKEOFF: 'PERF_TAKEOFF',
    PROG_A: 'PROG_A',
    DEP_ARR_A: 'DEP_ARR_A',
    MCDU_MENU: 'MCDU_MENU',
    RAD_NAV: 'RAD_NAV',
    DATA_INDEX: 'DATA_INDEX',
    FUEL_PRED: 'FUEL_PRED',
    SEC_F_PLN: 'SEC_FPLN',
    ATC_COMM: 'ATSU',
    AIR_PORT: 'INIT_A',
  };

  if (key in PAGE_MAP) {
    const newPage = PAGE_MAP[key];
    return {
      currentPage: newPage,
      page: newPage,
      pageHistory: [...state.pageHistory, state.currentPage],
      scratchpad: '',
      scratchpadError: null,
    };
  }

  // ── NEXT_PAGE / PREV_PAGE ─────────────────────────────────────────────────
  if (key === 'NEXT_PAGE') {
    return { legsPageIndex: Math.min(state.legsPageIndex + 1, state.legsPageCount - 1) };
  }
  if (key === 'PREV_PAGE') {
    return { legsPageIndex: Math.max(state.legsPageIndex - 1, 0) };
  }

  // ── EXEC is handled separately in pressExec() ─────────────────────────────

  // Unrecognised key — no state change.
  return {};
}
