import type { ScratchpadState, ScratchpadMessage } from './scratchpadEngine';
import {
  createInitialScratchpadState,
  typeChar,
  deleteChar,
  clearBuffer,
  clearMessage,
  pushMessage,
  getActiveDisplay,
  clearScratchpadForPageChange,
  clearScratchpadForExec,
  invalidEntryMessage,
} from './scratchpadEngine';
import type { FMCState } from '../types/fmc';
import type { FmcActionSuccess, FmcActionResult } from './actionHandlers/actionResult';
import type { DispatchLskActionResult } from './actionHandlers/lskDispatcher';

export type ZustandSet = (partial: Partial<FMCState> | ((state: FMCState) => Partial<FMCState>)) => void;
export type ZustandGet = () => FMCState;

interface ExtendedDispatchSuccess extends FmcActionSuccess {
  targetPage?: string;
  pressKey?: string;
  subPage?: Partial<FMCState>;
}

interface StoreMethods {
  setPage: (page: string) => void;
  pressKey: (key: string) => void;
  expandActiveRoute: () => void;
  stepPlanForward: () => void;
  addMessage?: (text: string, type: string) => void;
}

function getSp(get: ZustandGet): ScratchpadState {
  const existing = get().scratchpadState;
  const currentScratchpad = get().scratchpad ?? '';
  if (!existing) return { ...createInitialScratchpadState(), buffer: currentScratchpad };
  const engineDisplay = getActiveDisplay(existing);
  if (engineDisplay !== currentScratchpad && existing.message === null) {
    return { ...existing, buffer: currentScratchpad };
  }
  return existing;
}

export function fmcTypeChar(set: ZustandSet, get: ZustandGet, char: string): void {
  const next = typeChar(getSp(get), char);
  set({
    scratchpadState: next,
    scratchpad: getActiveDisplay(next),
    scratchpadError: null,
  });
}

export function fmcDeleteChar(set: ZustandSet, get: ZustandGet): void {
  const next = deleteChar(getSp(get));
  set({
    scratchpadState: next,
    scratchpad: getActiveDisplay(next),
    scratchpadError: null,
  });
}

export function fmcClearBuffer(set: ZustandSet, get: ZustandGet): void {
  const next = clearBuffer(getSp(get));
  set({
    scratchpadState: next,
    scratchpad: getActiveDisplay(next),
    scratchpadError: null,
  });
}

export function fmcClearMessage(set: ZustandSet, get: ZustandGet, messageId: string): void {
  const next = clearMessage(getSp(get), messageId);
  set({
    scratchpadState: next,
    scratchpad: getActiveDisplay(next),
  });
}

export function fmcPushMessage(set: ZustandSet, get: ZustandGet, message: ScratchpadMessage): void {
  const next = pushMessage(getSp(get), message);
  set({
    scratchpadState: next,
    scratchpad: getActiveDisplay(next),
    scratchpadError: message.text,
  });
}

export function fmcPageChange(set: ZustandSet, get: ZustandGet): void {
  const next = clearScratchpadForPageChange(getSp(get));
  set({
    scratchpadState: next,
    scratchpad: getActiveDisplay(next),
    scratchpadError: null,
  });
}

export function fmcExecClear(set: ZustandSet, get: ZustandGet): void {
  const next = clearScratchpadForExec(getSp(get));
  set({
    scratchpadState: next,
    scratchpad: getActiveDisplay(next),
  });
}

export function fmcAcceptEntry(set: ZustandSet, get: ZustandGet): void {
  const next = clearBuffer(getSp(get));
  set({
    scratchpadState: next,
    scratchpad: getActiveDisplay(next),
    scratchpadError: null,
  });
}

export function fmcClrKey(set: ZustandSet, get: ZustandGet): void {
  const state = getSp(get);
  if (state.message) {
    fmcClearMessage(set, get, state.message.id);
  } else if (state.buffer.length > 0) {
    fmcDeleteChar(set, get);
  }
}

export function fmcDelKey(set: ZustandSet, get: ZustandGet): void {
  fmcDeleteChar(set, get);
}

// ─────────────────────────────────────────────────────────────────────────────
// applyFmcActionResult — canonical bridge between handler results and store
// ─────────────────────────────────────────────────────────────────────────────

/** Transitional: scratchpadError is display compatibility only.
 *  New code must use scratchpadState / scratchpadEngine. */
export function applyFmcActionResult(
  set: ZustandSet,
  get: ZustandGet,
  result: FmcActionResult,
): { shouldReturn: boolean } {
  if (!result.handled) return { shouldReturn: false };

  if (result.failure) {
    const msg = invalidEntryMessage();
    msg.text = result.failure.text;
    fmcPushMessage(set, get, msg);
    set({ scratchpadError: result.failure.text } as Partial<FMCState>);
    return { shouldReturn: true };
  }

  if (result.success) {
    if (result.success.clearScratchpad) set({ scratchpad: '', scratchpadError: null } as Partial<FMCState>);
    if (result.success.patch) set(result.success.patch);
    return { shouldReturn: false };
  }

  return { shouldReturn: false };
}

export function failScratchpad(set: ZustandSet, get: ZustandGet, text: string): void {
  const msg = invalidEntryMessage();
  msg.text = text;
  fmcPushMessage(set, get, msg);
  set({ scratchpadError: text } as Partial<FMCState>);
}

export function applyDispatchResult(set: ZustandSet, get: ZustandGet, result: DispatchLskActionResult): boolean {
  const success = result.success as ExtendedDispatchSuccess | undefined;
  const store = get() as FMCState & StoreMethods;

  if (success?.targetPage) {
    store.setPage(success.targetPage);
    return true;
  }
  if (success?.pressKey) {
    store.pressKey(success.pressKey);
    return true;
  }
  if (success?.subPage) {
    set(success.subPage);
    return true;
  }

  const ar = applyFmcActionResult(set, get, result);
  if (ar.shouldReturn) return true;

  // Side effects
  for (const effect of result.sideEffects || []) {
    if (effect === 'expand_active_route') store.expandActiveRoute();
    if (effect === 'step_plan') {
      store.stepPlanForward();
      return true;
    }
    if (effect === 'print_message') setTimeout(() => set({ scratchpad: 'PRINT COMPLETE' } as Partial<FMCState>), 1500);
    if (effect === 'atsu_uplink_received') {
      store.addMessage?.('RTE UPLINK', 'IMPORTANT');
    }
  }

  // scratchpadMessage in success
  if (success?.scratchpadMessage) {
    set({ scratchpadError: success.scratchpadMessage, scratchpad: '', msgLight: true } as Partial<FMCState>);
  }

  return true;
}
