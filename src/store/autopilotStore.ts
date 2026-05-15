import { create } from 'zustand';
import type { BoeingMCPState, AirbusFCUState, AutopilotState } from '@shared';
import { processBoeingMCPAction } from '@shared';

export interface AutopilotStore {
  boeing: BoeingMCPState;
  airbus: AirbusFCUState;
  truth: AutopilotState['truth'];
  
  updateBoeingMCP: (update: Partial<BoeingMCPState>) => void;
  updateAirbusFCU: (update: Partial<AirbusFCUState>) => void;
  pressMCPButton: (action: string, aircraft: 'BOEING_737' | 'AIRBUS_A320') => void;
}

const defaultBoeingMCP: BoeingMCPState = {
  courseL: 0,
  courseR: 0,
  speed: 100,
  mach: null,
  heading: 0,
  altitude: 10000,
  verticalSpeed: 0,
  fdLeft: false,
  fdRight: false,
  autothrottleArm: false,
  n1: false,
  speedMode: false,
  lnav: false,
  vnav: false,
  lvlChg: false,
  hdgSel: false,
  vorLoc: false,
  app: false,
  altHold: false,
  vs: false,
  cmdA: false,
  cmdB: false,
  cwsA: false,
  cwsB: false,
};

const defaultAirbusFCU: AirbusFCUState = {
  speed: 100,
  speedManaged: true,
  heading: 0,
  headingManaged: true,
  altitude: 10000,
  altitudeManaged: true,
  verticalSpeed: 0,
  fpa: 0,
  fd1: false,
  fd2: false,
  athr: false,
  ap1: false,
  ap2: false,
  loc: false,
  appr: false,
  exped: false,
  hdgTrkMode: 'HDG_VS',
  metricAltitude: false,
  speedMachMode: 'SPD',
};

const defaultTruth: AutopilotState['truth'] = {
  lateralActive: 'OFF',
  verticalActive: 'OFF',
  thrustActive: 'OFF',
  autopilotStatus: 'OFF',
  lastModeChangeTimestamps: {
    thrust: 0,
    lateral: 0,
    vertical: 0,
  }
};

export const useAutopilotStore = create<AutopilotStore>((set, get) => ({
  boeing: defaultBoeingMCP,
  airbus: defaultAirbusFCU,
  truth: defaultTruth,

  updateBoeingMCP: (update) => set(state => ({ boeing: { ...state.boeing, ...update } })),
  
  updateAirbusFCU: (update) => set(state => ({ airbus: { ...state.airbus, ...update } })),

  pressMCPButton: (action, aircraft) => {
    if (aircraft === 'BOEING_737') {
      const newState = processBoeingMCPAction(get().boeing, action);
      set({ boeing: newState });
    } else {
      // Airbus FCU action processing placeholder
    }
  },
}));
