import { create } from 'zustand';
import type { FMCState, HoldEntry } from '@shared';
import { buildInitialFMCState } from '@shared/fmc/initialState';
import { processFMCKey }         from '@shared/fmc/keyProcessor';
import { buildDisplayData }      from '@shared/fmc/displayBuilder';

// ─────────────────────────────────────────────────────────────────────────────
// fmcStore – thin Zustand shell around the shared FMC engine
//
// HOLD EXEC promotion (Step 4 of CI-heal plan):
//   When pressExec is called and holdPending.fix is truthy, promote
//   holdPending → hold and clear holdPending so the ND model can find
//   state.hold.fix and render nd-hold-overlay.
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

    // Promote pending hold into committed hold so ND can render the overlay.
    if (state.holdPending?.fix) {
      const updates: Partial<FMCState> = {
        hold:        state.holdPending as HoldEntry,
        holdPending: null,
        isModified:  false,
        execLit:     false,
      };
      set(updates as Partial<FMCStore>);
      return;
    }

    // General modification commit path
    if (state.isModified) {
      set({ isModified: false, execLit: false } as Partial<FMCStore>);
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
