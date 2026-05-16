import type { FMCState } from '../../types/fmc';
import { isValidICAO } from '../validation';

export type RouteActionResult = {
  handled: boolean;
  patch?: Partial<FMCState>;
  scratchpadError?: string;
  sideEffect?: 'expand_active_route' | null;
};

export function handleSetFromTo(
  state: FMCState,
  scratchpad: string
): RouteActionResult {
  if (!scratchpad) return { handled: false };

  const [origin, dest] = scratchpad.split('/');
  if (!origin || !dest) {
    return { handled: true, scratchpadError: 'INVALID FORMAT' };
  }

  const oRes = isValidICAO(origin.toUpperCase());
  const dRes = isValidICAO(dest.toUpperCase());
  if (!oRes.valid || !dRes.valid) {
    return { handled: true, scratchpadError: 'INVALID FORMAT' };
  }

  return {
    handled: true,
    sideEffect: 'expand_active_route',
    patch: {
      pendingRoute: {
        ...state.route,
        origin: origin.toUpperCase(),
        destination: dest.toUpperCase(),
      },
      pendingFlightPlan: {
        ...state.flightPlan,
        origin: origin.toUpperCase(),
        destination: dest.toUpperCase(),
      },
      isModified: true,
      execLit: true,
      scratchpad: '',
    },
  };
}
