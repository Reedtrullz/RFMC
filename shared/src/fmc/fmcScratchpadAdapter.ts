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
} from './scratchpadEngine';
import type { FMCState } from '../types/fmc';

type ZustandSet = (partial: Partial<FMCState> | ((state: FMCState) => Partial<FMCState>)) => void;
type ZustandGet = () => FMCState;

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
