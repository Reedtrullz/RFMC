export type BoeingFMAState = {
  autothrottleMode: 'ARM' | 'N1' | 'MCP SPD' | 'THR HLD' | 'RETARD' | '';
  rollMode: 'LNAV' | 'HDG SEL' | 'VOR/LOC' | 'ROLLOUT' | '';
  pitchMode: 'VNAV SPD' | 'VNAV PTH' | 'LVL CHG' | 'ALT HOLD' | 'G/S' | 'V/S' | '';
  armedRollMode: 'VOR/LOC' | 'APP' | '';
  armedPitchMode: 'G/S' | 'VNAV' | '';
  apStatus: 'CMD A' | 'CMD B' | 'CWS A' | 'CWS B' | 'FD' | '';
};

export type AirbusFMAState = {
  autothrustMode: 'SPEED' | 'MACH' | 'THR CLB' | 'THR IDLE' | 'RETARD' | '';
  verticalMode: 'CLB' | 'DES' | 'ALT' | 'ALT*' | 'OP CLB' | 'OP DES' | 'V/S' | 'FPA' | 'G/S' | '';
  lateralMode: 'NAV' | 'HDG' | 'LOC' | 'APP NAV' | '';
  armedModes: string[];
  status: {
    ap1: boolean;
    ap2: boolean;
    fd1: boolean;
    fd2: boolean;
    athr: boolean;
  };
  approachCapability: 'CAT1' | 'CAT2' | 'CAT3 SINGLE' | 'CAT3 DUAL' | '';
};

export type PFDState = {
  heading: number;
  altitude: number;
  speed: number;
  verticalSpeed: number;
  pitch: number;
  bank: number;
  radioAltitude: number | null;
  speedTrend: number;
  targetSpeed: number | null;
  targetAltitude: number | null;
  targetHeading: number | null;
  targetVerticalSpeed: number | null;
  managedSpeed?: boolean;
  managedHeading?: boolean;
  managedAltitude?: boolean;
  flightDirector: {
    visible: boolean;
    pitch: number;
    roll: number;
  };
  failureFlags?: {
    attitude: boolean;
    airData: boolean;
    navigation: boolean;
  };
  fmaBoxes?: {
    thrust?: boolean;
    lateral?: boolean;
    vertical?: boolean;
  };
  alertText?: string;
  alertLevel?: 'WARNING' | 'CAUTION';
};

export type PFDModel = {
  aircraft: 'BOEING_737' | 'AIRBUS_A320';
  pfd: PFDState;
  boeingFma?: BoeingFMAState;
  airbusFma?: AirbusFMAState;
};
