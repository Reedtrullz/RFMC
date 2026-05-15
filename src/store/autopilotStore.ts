import { create } from 'zustand';
import type { BoeingMCPState, AirbusFCUState, AutopilotState } from '@shared';
import { processBoeingMCPAction } from '@shared';

export interface AutopilotStore {
  boeing: BoeingMCPState;
  airbus: AirbusFCUState;
  truth: AutopilotState['truth'];
  
  updateBoeing: (update: Partial<BoeingMCPState>) => void;
  updateAirbus: (update: Partial<AirbusFCUState>) => void;
  pressButton: (action: string) => void;
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

  updateBoeing: (update) => set(state => ({ boeing: { ...state.boeing, ...update } })),
  updateAirbus: (update) => set(state => ({ airbus: { ...state.airbus, ...update } })),

  pressButton: (action) => {
    // We need to know the aircraft type to process the action
    // In a real refactor, we might want to pass aircraft type or have separate stores
    // For now, we'll try to infer or just handle both
    const boeingUpdate = processBoeingMCPAction(get().boeing, action as any);
    if (Object.keys(boeingUpdate).length > 0) {
      set(state => ({ boeing: { ...state.boeing, ...boeingUpdate } }));
      return;
    }

    // Airbus logic
    const airbus = get().airbus;
    const airbusActions: Record<string, Partial<AirbusFCUState>> = {
      AP1: { ap1: !airbus.ap1 },
      AP2: { ap2: !airbus.ap2 },
      ATHR: { athr: !airbus.athr },
      LOC: { loc: !airbus.loc },
      APPR: { appr: !airbus.appr },
      EXPED: { exped: !airbus.exped },
      FD1: { fd1: !airbus.fd1 },
      FD2: { fd2: !airbus.fd2 },
    };

    const update = airbusActions[action];
    if (update) {
      set(state => ({ airbus: { ...state.airbus, ...update } }));
    }
  },
}));
