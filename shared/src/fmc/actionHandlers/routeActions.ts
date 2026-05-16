import type { FMCState } from '../../types/fmc';
import { isValidICAO } from '../validation';
import type { FmcActionResult } from './actionResult';

export function handleSetFromTo(
  state: FMCState,
  scratchpad: string
): FmcActionResult {
  if (!scratchpad) return { handled: false };

  const parts = scratchpad.split('/');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return {
      handled: true,
      failure: { code: 'INVALID_FORMAT' as const, text: 'INVALID FORMAT', source: 'routeActions' },
    };
  }

  const from = parts[0].toUpperCase();
  const to = parts[1].toUpperCase();

  const fromResult = isValidICAO(from);
  const toResult = isValidICAO(to);
  if (!fromResult.valid || !toResult.valid) {
    return {
      handled: true,
      failure: { code: 'INVALID_FORMAT' as const, text: 'INVALID FORMAT', source: 'routeActions' },
    };
  }

  return {
    handled: true,
    success: {
      clearScratchpad: true,
      patch: {
        isModified: true,
        execLit: true,
        scratchpad: '' as any,
        scratchpadError: null as any,
        pendingRoute: {
          origin: from,
          destination: to,
          flightNumber: (state.pendingRoute ?? state.route)?.flightNumber ?? null as any,
        },
        pendingFlightPlan: {
          origin: from,
          destination: to,
          flightNumber: (state.pendingFlightPlan ?? state.flightPlan)?.flightNumber ?? '',
          route: '',
          waypoints: [],
        },
      },
      sideEffect: 'expand_active_route',
    },
  };
}
