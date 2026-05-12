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
};

export type AutopilotState = {
  boeing: BoeingMCPState;
  airbus: AirbusFCUState;
};

export type FMAState = {
  atMode: string;
  rollMode: string;
  pitchMode: string;
  status: string;
};
