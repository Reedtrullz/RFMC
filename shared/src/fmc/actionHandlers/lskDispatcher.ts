import type { FMCState } from '../../types/fmc';
import type { FmcActionResult, FmcActionSuccess } from './actionResult';
import { resolveLskNavigation } from './navigationActions';
import { handleSpecialLskAction } from './specialActions';
import { handleSetFromTo, handleRouteAction } from './routeActions';
import { handleRadioLskAction } from './radioActions';
import { handleLegWpAction } from './legActions';
import { handlePerformanceAction } from './performanceActions';
import { handleTakeoffAction } from './takeoffActions';
import { handleProcedureAction } from './procedureActions';
import { handleLandingAction } from './landingActions';
import { handleFixAction } from './fixActions';
import { handleHoldAction } from './holdActions';
import { handleIrsAction } from './irsActions';
import { handleAirbusAction } from './airbusActions';
import { handlePositionAction } from './positionActions';
import { handleWindAction } from './windActions';
import { handleAtsuAction } from './atsuActions';

export type FmcSideEffect = 'expand_active_route' | 'step_plan' | 'print_message' | null;

export interface DispatchLskActionInput {
  state: FMCState;
  action: string;
  scratchpad: string;
}

export interface DispatchLskActionResult extends FmcActionResult {
  sideEffects?: string[];
}

/** Central LSK action dispatcher. Call in handler priority order. */
export function dispatchLskAction(input: DispatchLskActionInput): DispatchLskActionResult {
  const { state, action, scratchpad } = input;

  // 1. Page navigation
  const nav = resolveLskNavigation(action);
  if (nav) {
    return {
      handled: true,
      success: {
        targetPage: nav.targetPage,
        pressKey: nav.pressKey,
        subPage: nav.setSubPage,
      } as FmcActionSuccess & { targetPage?: string; pressKey?: string; subPage?: number },
    };
  }

  // 2. Special actions
  const special = handleSpecialLskAction(action, state, scratchpad);
  if (special.handled) {
    const sideEffects: string[] = [];
    if (special.sideEffect) sideEffects.push(special.sideEffect);
    return { ...special, sideEffects };
  }

  // 3. Route actions (from-to + full route)
  if (action === 'set_from_to') {
    const ft = handleSetFromTo(state, scratchpad);
    if (ft.handled) {
      const sideEffects: string[] = [];
      if (ft.success?.sideEffect === 'expand_active_route') sideEffects.push('expand_active_route');
      return { ...ft, sideEffects };
    }
  }
  const route = handleRouteAction(action, state, scratchpad);
  if (route.handled) {
    const sideEffects: string[] = [];
    if (route.success?.sideEffect === 'expand_active_route') sideEffects.push('expand_active_route');
    return { ...route, sideEffects };
  }

  // 4. Radio
  const radio = handleRadioLskAction(action, state, scratchpad);
  if (radio.handled) return radio;

  // 5. LEGS
  if (state.currentPage === 'LEGS') {
    const leg = handleLegWpAction(action, state, scratchpad) as FmcActionResult & { sideEffect?: string };
    if (leg.handled) {
      const sideEffects: string[] = [];
      if (leg.sideEffect) sideEffects.push(leg.sideEffect);
      return { ...leg, sideEffects };
    }
  }

  // 6. Performance
  const perf = handlePerformanceAction(action, state, scratchpad);
  if (perf.handled) return perf;

  // 7. Wind actions (CLB/CRZ/DES wind, ISA DEV, takeoff wind)
  const wind = handleWindAction(action, state, scratchpad);
  if (wind.handled) return wind;

  // 8. Takeoff
  const to = handleTakeoffAction(action, state, scratchpad);
  if (to.handled) return to;

  // 9. Procedure
  const proc = handleProcedureAction(action, state, scratchpad);
  if (proc.handled) {
    const sideEffects: string[] = [];
    if (proc.success?.sideEffect === 'expand_active_route') sideEffects.push('expand_active_route');
    return { ...proc, sideEffects };
  }

  // 10. Landing
  const land = handleLandingAction(action, state, scratchpad);
  if (land.handled) return land;

  // 11. FIX
  const fix = handleFixAction(action, state, scratchpad);
  if (fix.handled) return fix;

  // 12. HOLD
  const hold = handleHoldAction(action, state, scratchpad);
  if (hold.handled) return hold;

  // 13. IRS
  const irs = handleIrsAction(action, state, scratchpad);
  if (irs.handled) return irs;

  // 14. Airbus
  const ab = handleAirbusAction(action, state, scratchpad);
  if (ab.handled) return ab;

  // 15. Position (REF AIRPORT, GATE)
  const pos = handlePositionAction(action, state, scratchpad);
  if (pos.handled) return pos;

  // 16. ATSU (uplink, messages, load route, view message)
  const atsu = handleAtsuAction(action, state, scratchpad);
  if (atsu.handled) return atsu;

  return { handled: false };
}
