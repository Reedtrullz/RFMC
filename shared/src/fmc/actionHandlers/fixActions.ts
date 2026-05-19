import type { FMCState, FixEntry } from '../../types/fmc';
import { isValidWaypoint } from '../validation';
import type { FmcActionResult } from './actionResult';

function ensureFixEntries(entries: FixEntry[], legacy: FMCState['fix']): FixEntry[] {
  return [{ ...(entries[0] ?? legacy) }, { ...(entries[1] ?? { refFix: '', radial: 0, distance: 0 }) }];
}

export function handleFixAction(action: string, state: FMCState, scratchpad: string): FmcActionResult {
  switch (action) {
    case 'set_fix_ref':
    case 'set_fix_ref_0':
    case 'set_fix_ref_1':
      return handleSetFixRef(state, scratchpad, action);
    case 'set_fix_radial_distance':
    case 'set_fix_radial_distance_0':
    case 'set_fix_radial_distance_1':
      return handleSetFixRadialDistance(state, scratchpad, action);
    default:
      return { handled: false };
  }
}

function handleSetFixRef(state: FMCState, scratchpad: string, action: string): FmcActionResult {
  if (!scratchpad) return { handled: false };

  const result = isValidWaypoint(scratchpad.toUpperCase());
  if (!result.valid) {
    return {
      handled: true,
      failure: { code: 'INVALID_ENTRY' as const, text: result.error!, source: 'fixActions' },
    };
  }

  const entryIndex = action.endsWith('_1') ? 1 : 0;
  const fixEntries = ensureFixEntries(state.fixEntries, state.fix);
  fixEntries[entryIndex] = { ...fixEntries[entryIndex], refFix: scratchpad.toUpperCase() };

  const patch: Partial<FMCState> = { fixEntries };
  if (entryIndex === 0) patch.fix = fixEntries[0];

  return {
    handled: true,
    success: { clearScratchpad: true, patch },
  };
}

function handleSetFixRadialDistance(state: FMCState, scratchpad: string, action: string): FmcActionResult {
  if (!scratchpad) return { handled: false };

  const parts = scratchpad.split('/');
  if (parts.length !== 2) {
    return {
      handled: true,
      failure: { code: 'INVALID_FORMAT' as const, text: 'INVALID FORMAT', source: 'fixActions' },
    };
  }

  const radial = parseInt(parts[0], 10);
  if (isNaN(radial) || radial < 1 || radial > 360) {
    return {
      handled: true,
      failure: { code: 'OUT_OF_RANGE' as const, text: 'INVALID RADIAL', source: 'fixActions' },
    };
  }

  const distance = parseInt(parts[1], 10);
  if (isNaN(distance) || distance < 0 || distance > 999) {
    return {
      handled: true,
      failure: { code: 'OUT_OF_RANGE' as const, text: 'INVALID DISTANCE', source: 'fixActions' },
    };
  }

  const entryIndex = action.endsWith('_1') ? 1 : 0;
  const fixEntries = ensureFixEntries(state.fixEntries, state.fix);
  fixEntries[entryIndex] = { ...fixEntries[entryIndex], radial, distance };

  const patch: Partial<FMCState> = { fixEntries };
  if (entryIndex === 0) patch.fix = fixEntries[0];

  return {
    handled: true,
    success: { clearScratchpad: true, patch },
  };
}
