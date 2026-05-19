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
  },
};

const BOEING_ACTION_MAP: Record<string, string> = {
  LNAV: 'lnav',
  VNAV: 'vnav',
  LVL_CHG: 'lvlChg',
  HDG_SEL: 'hdgSel',
  VOR_LOC: 'vorLoc',
  APP: 'app',
  ALT_HLD: 'altHold',
  VS: 'vs',
  N1: 'n1',
  SPEED: 'speedMode',
  cmdA: 'cmdA',
  cmdB: 'cmdB',
  cwsA: 'cwsA',
  cwsB: 'cwsB',
  SPD_MACH_TOGGLE: 'SPD_MACH_TOGGLE',
};

export const useAutopilotStore = create<AutopilotStore>((set, get) => ({
  boeing: defaultBoeingMCP,
  airbus: defaultAirbusFCU,
  truth: defaultTruth,

  updateBoeing: (update) => set((state) => ({ boeing: { ...state.boeing, ...update } })),
  updateAirbus: (update) => set((state) => ({ airbus: { ...state.airbus, ...update } })),

  pressButton: (action) => {
    const normalizedAction = BOEING_ACTION_MAP[action] ?? action;

    const boeingUpdate = processBoeingMCPAction(
      get().boeing,
      normalizedAction as keyof BoeingMCPState | 'SPD_INTERVENE' | 'ALT_INTERVENE' | 'SPD_MACH_TOGGLE',
    );
    if (Object.keys(boeingUpdate).length > 0) {
      set((state) => ({
        boeing: { ...state.boeing, ...boeingUpdate },
        truth: {
          ...state.truth,
          ...truthUpdateForBoeingAction(action, state.truth),
        },
      }));
      return;
    }

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
      SPD_MANAGED: { speedManaged: true },
      SPD_SELECTED: { speedManaged: false },
      HDG_MANAGED: { headingManaged: true },
      HDG_SELECTED: { headingManaged: false },
      ALT_MANAGED: { altitudeManaged: true },
      ALT_SELECTED: { altitudeManaged: false },
    };

    const update = airbusActions[action];
    if (update) {
      set((state) => ({
        airbus: { ...state.airbus, ...update },
        truth: {
          ...state.truth,
          ...truthUpdateForAirbusAction(action, state.truth),
        },
      }));
    }
  },
}));

function truthUpdateForBoeingAction(action: string, truth: AutopilotState['truth']): Partial<AutopilotState['truth']> {
  if (action === 'LNAV') return { lateralActive: truth.lateralActive === 'LNAV' ? 'OFF' : 'LNAV' };
  if (action === 'VNAV') return { verticalActive: truth.verticalActive === 'VNAV_PTH' ? 'OFF' : 'VNAV_PTH' };
  if (action === 'HDG_SEL') return { lateralActive: truth.lateralActive === 'HDG_SEL' ? 'OFF' : 'HDG_SEL' };
  if (action === 'VOR_LOC') return { lateralActive: truth.lateralActive === 'VOR_LOC' ? 'OFF' : 'VOR_LOC' };
  if (action === 'APP') {
    const active = truth.lateralActive === 'APP' || truth.verticalActive === 'G_S';
    return active
      ? { lateralActive: 'OFF', verticalActive: 'OFF' }
      : { lateralActive: 'APP', lateralArmed: 'APP', verticalActive: 'G_S', verticalArmed: 'G_S' };
  }
  if (action === 'ALT_HLD') return { verticalActive: truth.verticalActive === 'ALT_HOLD' ? 'OFF' : 'ALT_HOLD' };
  if (action === 'LVL_CHG') return { verticalActive: truth.verticalActive === 'LVL_CHG' ? 'OFF' : 'LVL_CHG' };
  if (action === 'VS') return { verticalActive: truth.verticalActive === 'VS' ? 'OFF' : 'VS' };
  if (action === 'N1') return { thrustActive: truth.thrustActive === 'N1' ? 'OFF' : 'N1' };
  if (action === 'SPEED') return { thrustActive: truth.thrustActive === 'SPEED' ? 'OFF' : 'SPEED' };
  if (action === 'cmdA') return { autopilotStatus: truth.autopilotStatus === 'CMD_A' ? 'OFF' : 'CMD_A' };
  if (action === 'cmdB') return { autopilotStatus: truth.autopilotStatus === 'CMD_B' ? 'OFF' : 'CMD_B' };
  if (action === 'cwsA') return { autopilotStatus: truth.autopilotStatus === 'CWS_A' ? 'OFF' : 'CWS_A' };
  if (action === 'cwsB') return { autopilotStatus: truth.autopilotStatus === 'CWS_B' ? 'OFF' : 'CWS_B' };
  return {};
}

function truthUpdateForAirbusAction(action: string, truth: AutopilotState['truth']): Partial<AutopilotState['truth']> {
  if (action === 'AP1') return { autopilotStatus: truth.autopilotStatus === 'AP1' ? 'OFF' : 'AP1' };
  if (action === 'AP2') return { autopilotStatus: truth.autopilotStatus === 'AP2' ? 'OFF' : 'AP2' };
  if (action === 'ATHR') return { thrustActive: truth.thrustActive === 'SPEED' ? 'OFF' : 'SPEED' };
  if (action === 'LOC') return { lateralActive: truth.lateralActive === 'LOC' ? 'OFF' : 'LOC' };
  if (action === 'APPR') {
    const active = truth.lateralActive === 'APP' || truth.verticalActive === 'G_S';
    return active
      ? { lateralActive: 'OFF', verticalActive: 'OFF' }
      : { lateralActive: 'APP', lateralArmed: 'LOC', verticalActive: 'G_S', verticalArmed: 'G_S' };
  }
  if (action === 'EXPED') return { verticalActive: truth.verticalActive === 'OP_CLB' ? 'OFF' : 'OP_CLB' };
  if (action === 'SPD_MANAGED') return { thrustActive: 'SPEED' };
  if (action === 'SPD_SELECTED') return { thrustActive: 'OFF' };
  if (action === 'HDG_MANAGED') return { lateralActive: 'NAV' };
  if (action === 'HDG_SELECTED') return { lateralActive: 'HDG_SEL' };
  if (action === 'ALT_MANAGED') return { verticalActive: 'VNAV_PTH' };
  if (action === 'ALT_SELECTED') return { verticalActive: 'OP_CLB' };
  return {};
}
