import type { FMCState } from '../../types/fmc';

export type FmcActionFailureCode =
  | 'INVALID_ENTRY'
  | 'INVALID_FORMAT'
  | 'OUT_OF_RANGE'
  | 'NOT_IN_DATABASE'
  | 'NOT_IN_ROUTE'
  | 'NOT_IN_ALIGN_MODE'
  | 'VERIFY_POSITION'
  | 'V_SPEEDS_DELETED'
  | 'ROUTE_DISCONTINUITY'
  | 'PERF_VNAV_UNAVAILABLE'
  | 'INSUFFICIENT_FUEL'
  | 'UNABLE_NEXT_ALT'
  | 'DRAG_REQUIRED';

export interface FmcActionFailure {
  code: FmcActionFailureCode;
  text: string;
  source: string;
}

export interface FmcActionSuccess {
  patch?: Partial<FMCState>;
  clearScratchpad?: boolean;
  scratchpadMessage?: string;
  sideEffect?: string;
  /** Navigate to a specific page. Consumed by fmcScratchpadAdapter. */
  targetPage?: string;
}

export interface FmcActionResult {
  handled: boolean;
  success?: FmcActionSuccess;
  failure?: FmcActionFailure;
}

export function getPatch(result: FmcActionResult): Partial<FMCState> {
  if (!result.success?.patch) {
    throw new Error('Expected a successful FmcActionResult with a patch');
  }
  return result.success.patch;
}
