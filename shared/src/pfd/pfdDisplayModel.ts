import type { FMCState } from '../types/fmc';
import type { PFDModel } from './pfdTypes';
import { buildAirbusFMAState, buildAirbusPFDState } from './airbusPfdModel';
import { buildBoeingFMAState, buildBoeingPFDState } from './boeingPfdModel';

export interface BuildPfdDisplayModelInput {
  fmcState: FMCState;
}

export function buildPfdDisplayModel({ fmcState }: BuildPfdDisplayModelInput): PFDModel {
  if (fmcState.aircraft === 'AIRBUS_A320') {
    return {
      aircraft: 'AIRBUS_A320',
      pfd: buildAirbusPFDState(fmcState),
      airbusFma: buildAirbusFMAState(fmcState.autopilot, fmcState),
    };
  }

  return {
    aircraft: 'BOEING_737',
    pfd: buildBoeingPFDState(fmcState),
    boeingFma: buildBoeingFMAState(fmcState.autopilot, fmcState),
  };
}
