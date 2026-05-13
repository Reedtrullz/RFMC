import { AutopilotState } from '../autopilot/autopilotTypes';

export function buildBoeingFMAState(autopilot: AutopilotState, fmc: FMCState): BoeingFMAState {
  const { truth, boeing: mcp } = autopilot;

  let autothrottleMode: BoeingFMAState['autothrottleMode'] = '';
  if (truth.thrustActive !== 'OFF') {
    autothrottleMode = truth.thrustActive === 'SPEED' ? 'MCP SPD' : truth.thrustActive;
  } else if (mcp.autothrottleArm) {
    autothrottleMode = 'ARM';
  }

  let rollMode: BoeingFMAState['rollMode'] = '';
  if (truth.lateralActive !== 'OFF') {
    rollMode = truth.lateralActive;
  }

  let pitchMode: BoeingFMAState['pitchMode'] = '';
  if (truth.verticalActive !== 'OFF') {
    pitchMode = truth.verticalActive;
  }

  let apStatus: BoeingFMAState['apStatus'] = '';
  if (truth.autopilotStatus !== 'OFF') {
    apStatus = truth.autopilotStatus.replace('_', ' ');
  } else if (mcp.fdLeft || mcp.fdRight) {
    apStatus = 'FD';
  }

  return {
    autothrottleMode,
    rollMode,
    pitchMode,
    armedRollMode: truth.lateralArmed || '',
    armedPitchMode: truth.verticalArmed || '',
    apStatus
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
    radioAltitude: (aircraft?.altitudeFt || 0) < 2500 ? (aircraft?.altitudeFt || 0) : null,
    flightDirector: {
      visible: state.autopilot.boeing.fdLeft || state.autopilot.boeing.fdRight,
      pitch: 0,
      roll: 0
    }
  };
}
