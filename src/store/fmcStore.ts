import { create } from 'zustand';
import type { FMCState, HoldEntry } from '@shared';
import { buildInitialFMCState } from '@shared/fmc/initialState';
import { processFMCKey }         from '@shared/fmc/keyProcessor';
import { buildDisplayData }      from '@shared/fmc/displayBuilder';

// ─────────────────────────────────────────────────────────────────────────────
// fmcStore – thin Zustand shell around the shared FMC engine
//
// EXEC lifecycle: pressExec promotes all pending changes (hold, route,
// flightPlan) into active state and clears isModified/execLit in a single
// atomic update so the display and ND model see consistent state.
// ─────────────────────────────────────────────────────────────────────────────

interface FMCStoreActions {
  pressKey:     (key: string) => void;
  pressExec:    () => void;
  setMode:      (mode: string) => void;
  setDemoMode:  (demo: boolean) => void;
  resetState:   () => void;
}

export type FMCStore = FMCState & FMCStoreActions;

export const fmcStore = create<FMCStore>((set, get) => ({
  ...buildInitialFMCState(),

  pressKey: (key: string) => {
    const next = processFMCKey(get() as FMCState, key);
    set(next as Partial<FMCStore>);
  },

  pressExec: () => {
    const state = get() as FMCState;
    const updates: Partial<FMCState> = {};

    if (state.holdPending?.fix) {
      updates.hold = state.holdPending as HoldEntry;
      updates.holdPending = null;
    }
    if (state.pendingRoute) {
      updates.route = { ...state.pendingRoute };
      updates.pendingRoute = null;
    }
    if (state.pendingFlightPlan) {
      updates.flightPlan = { ...state.pendingFlightPlan };
      updates.pendingFlightPlan = null;
    }
    if (state.isModified) {
      updates.isModified = false;
      updates.execLit = false;
    }

    if (Object.keys(updates).length > 0) {
      set(updates as Partial<FMCStore>);
    }
  },

  setMode: (mode: string) => {
    set({ mode } as Partial<FMCStore>);
  },

  setDemoMode: (demo: boolean) => {
    set({ demoMode: demo } as Partial<FMCStore>);
  },

  resetState: () => {
    set(buildInitialFMCState() as Partial<FMCStore>);
  },
}));
