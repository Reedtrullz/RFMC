export type BoeingMCPState = {
  courseL: number;
  courseR: number;
  speed: number | null;
  mach: number | null;
  heading: number;
  altitude: number;
  verticalSpeed: number | null;

  fdLeft: boolean;
  fdRight: boolean;
  autothrottleArm: boolean;

  n1: boolean;
  speedMode: boolean;
  lnav: boolean;
  vnav: boolean;
  lvlChg: boolean;
  hdgSel: boolean;
  vorLoc: boolean;
  app: boolean;
  altHold: boolean;
  vs: boolean;

  cmdA: boolean;
  cmdB: boolean;
  cwsA: boolean;
  cwsB: boolean;
};

export type AirbusFCUState = {
  speed: number | null;
  speedManaged: boolean;

  heading: number | null;
  headingManaged: boolean;

  altitude: number;
  altitudeManaged: boolean;

  verticalSpeed: number | null;
  fpa: number | null;

  fd1: boolean;
  fd2: boolean;
  athr: boolean;
  ap1: boolean;
  ap2: boolean;

  loc: boolean;
  appr: boolean;
  exped: boolean;

  hdgTrkMode: 'HDG_VS' | 'TRK_FPA';
  metricAltitude: boolean;
  speedMachMode: 'SPD' | 'MACH';
};

export type AutopilotState = {
  boeing: BoeingMCPState;
  airbus: AirbusFCUState;
  truth: AutoflightTruthState;
};

export type LateralMode = 'HDG_SEL' | 'LNAV' | 'VOR_LOC' | 'LOC' | 'APP' | 'NAV' | 'ROLL' | 'HDG' | 'OFF';
export type VerticalMode =
  | 'ALT_HOLD'
  | 'VNAV_PTH'
  | 'LVL_CHG'
  | 'VS'
  | 'G_S'
  | 'CLB'
  | 'DES'
  | 'OP_CLB'
  | 'OP_DES'
  | 'VNAV'
  | 'OFF'
  | 'ALT*';
export type ThrustMode = 'N1' | 'SPEED' | 'THR_CLB' | 'IDLE' | 'MAN_TOGA' | 'MAN_FLEX' | 'RETARD' | 'OFF';

export interface AutoflightTruthState {
  lateralActive: LateralMode;
  lateralArmed?: LateralMode;
  verticalActive: VerticalMode;
  verticalArmed?: VerticalMode;
  thrustActive: ThrustMode;
  autopilotStatus: 'OFF' | 'CMD_A' | 'CMD_B' | 'CMD_AB' | 'CWS_A' | 'CWS_B' | 'AP1' | 'AP2' | 'AP1_AP2';
  lastModeChangeTimestamps: {
    thrust: number;
    lateral: number;
    vertical: number;
  };
  vsEntry?: number;
}

export type FMAState = {
  thrust: ThrustMode;
  lateral: LateralMode;
  vertical: VerticalMode;
  approachCapability: 'CAT1' | 'CAT2' | 'CAT3 SINGLE' | 'CAT3 DUAL' | 'NONE';
  armedLateral?: LateralMode;
  armedVertical?: VerticalMode;
};
