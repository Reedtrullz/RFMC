import { FMCState } from '../types/fmc';
import { AutopilotState } from '../autopilot/autopilotTypes';
import { BoeingFMAState, PFDState } from './pfdTypes';

export function buildBoeingFMAState(autopilot: AutopilotState, fmc: FMCState): BoeingFMAState {
  const { truth, boeing: mcp } = autopilot;

  let autothrottleMode: BoeingFMAState['autothrottleMode'] = '';
  if (truth.thrustActive !== 'OFF') {
    autothrottleMode =
      truth.thrustActive === 'SPEED' ? 'MCP SPD' : (truth.thrustActive as BoeingFMAState['autothrottleMode']);
  } else if (mcp.autothrottleArm) {
    autothrottleMode = 'ARM';
  }

  let rollMode: BoeingFMAState['rollMode'] = '';
  if (truth.lateralActive === 'HDG_SEL') rollMode = 'HDG SEL';
  else if (truth.lateralActive === 'VOR_LOC') rollMode = 'VOR/LOC';
  else if (truth.lateralActive === 'LOC') rollMode = 'VOR/LOC';
  else if (truth.lateralActive === 'APP') rollMode = 'VOR/LOC';
  else if (truth.lateralActive === 'LNAV') rollMode = 'LNAV';

  let pitchMode: BoeingFMAState['pitchMode'] = '';
  if (truth.verticalActive === 'VNAV_PTH') pitchMode = 'VNAV PTH';
  else if (truth.verticalActive === 'ALT_HOLD') pitchMode = 'ALT HOLD';
  else if (truth.verticalActive === 'LVL_CHG') pitchMode = 'LVL CHG';
  else if (truth.verticalActive === 'VS') pitchMode = 'V/S';
  else if (truth.verticalActive === 'G_S') pitchMode = 'G/S';

  let apStatus: BoeingFMAState['apStatus'] = '';
  if (truth.autopilotStatus !== 'OFF') {
    const status = truth.autopilotStatus.replace('_', ' ');
    apStatus = status as BoeingFMAState['apStatus'];
  } else if (mcp.fdLeft || mcp.fdRight) {
    apStatus = 'FD';
  }

  return {
    autothrottleMode,
    rollMode,
    pitchMode,
    armedRollMode:
      truth.lateralArmed === 'VOR_LOC'
        ? 'VOR/LOC'
        : truth.lateralArmed === 'LOC'
          ? 'VOR/LOC'
          : truth.lateralArmed === 'APP'
            ? 'APP'
            : '',
    armedPitchMode: truth.verticalArmed === 'G_S' ? 'G/S' : truth.verticalArmed === 'VNAV_PTH' ? 'VNAV' : '',
    apStatus,
  };
}

export function buildBoeingPFDState(state: FMCState): PFDState {
  const aircraft = state.aircraftState;
  return {
    heading: aircraft?.headingDeg || 0,
    altitude: aircraft?.altitudeFt || 0,
    speed: aircraft?.indicatedAirspeedKt || 0,
    verticalSpeed: aircraft?.verticalSpeedFpm || 0,
    pitch: aircraft?.pitchDeg || 0,
    bank: aircraft?.bankDeg || 0,
    speedTrend: (aircraft?.accelerationKtS || 0) * 10,
    targetSpeed: state.autopilot.boeing.speed,
    targetAltitude: state.autopilot.boeing.altitude,
    targetHeading: state.autopilot.boeing.heading,
    targetVerticalSpeed: state.autopilot.boeing.verticalSpeed,
    radioAltitude: (aircraft?.altitudeFt || 0) < 2500 ? aircraft?.altitudeFt || 0 : null,
    failureFlags: {
      attitude: state.position.irsState === 'OFF',
      airData: false,
      navigation: state.position.irsState === 'OFF',
    },
    fmaBoxes: {
      thrust: Date.now() - (state.autopilot.truth.lastModeChangeTimestamps?.thrust || 0) < 10000,
      lateral: Date.now() - (state.autopilot.truth.lastModeChangeTimestamps?.lateral || 0) < 10000,
      vertical: Date.now() - (state.autopilot.truth.lastModeChangeTimestamps?.vertical || 0) < 10000,
    },
    flightDirector: {
      visible: state.autopilot.boeing.fdLeft || state.autopilot.boeing.fdRight,
      pitch: 0,
      roll: 0,
    },
    alertText: state.gpwsAlert !== 'NONE' ? state.gpwsAlert.replace('_', ' ') : state.tcasAlert ? 'TRAFFIC' : undefined,
    alertLevel: state.gpwsAlert === 'PULL_UP' || state.gpwsAlert === 'TERRAIN' ? 'WARNING' : 'CAUTION',
  };
}
