import { FMCState } from '../types/fmc';
import { AutopilotState } from '../autopilot/autopilotTypes';
import { AirbusFMAState, PFDState } from './pfdTypes';

export function buildAirbusFMAState(autopilot: AutopilotState, fmc: FMCState): AirbusFMAState {
  const { truth, airbus: fcu } = autopilot;
  
  let autothrustMode: AirbusFMAState['autothrustMode'] = '';
  if (truth.thrustActive !== 'OFF') {
    autothrustMode = truth.thrustActive as any;
  }

  let verticalMode: AirbusFMAState['verticalMode'] = '';
  if (truth.verticalActive === 'VNAV_PTH') {
    verticalMode = (fmc.aircraftState?.verticalSpeedFpm || 0) >= 0 ? 'CLB' : 'DES';
  } else if (truth.verticalActive === 'ALT_HOLD') {
    verticalMode = 'ALT';
  } else if (truth.verticalActive === 'VS') {
    verticalMode = 'V/S';
  } else if (truth.verticalActive === 'OP_CLB') {
    verticalMode = 'OP CLB';
  } else if (truth.verticalActive === 'OP_DES') {
    verticalMode = 'OP DES';
  } else if (truth.verticalActive !== 'OFF') {
    verticalMode = truth.verticalActive as any;
  } else {
    verticalMode = 'ALT';
  }

  let lateralMode: AirbusFMAState['lateralMode'] = '';
  if (truth.lateralActive === 'NAV') lateralMode = 'NAV';
  else if (truth.lateralActive === 'HDG_SEL') lateralMode = 'HDG';
  else if (truth.lateralActive === 'LOC') lateralMode = 'LOC';
  else if (truth.lateralActive !== 'OFF') lateralMode = truth.lateralActive as any;
  else lateralMode = 'HDG';

  const armedModes: string[] = [];
  if (truth.lateralArmed) armedModes.push(truth.lateralArmed);
  if (truth.verticalArmed) armedModes.push(truth.verticalArmed);

  return {
    autothrustMode,
    verticalMode,
    lateralMode,
    armedModes,
    status: {
      ap1: fcu.ap1,
      ap2: fcu.ap2,
      fd1: fcu.fd1,
      fd2: fcu.fd2,
      athr: fcu.athr,
    },
    approachCapability: "" // Placeholder
  };
}

export function buildAirbusPFDState(state: FMCState): PFDState {
  const aircraft = state.aircraftState;
  return {
    heading: aircraft?.headingDeg || 0,
    altitude: aircraft?.altitudeFt || 0,
    speed: aircraft?.indicatedAirspeedKt || 0,
    verticalSpeed: aircraft?.verticalSpeedFpm || 0,
    pitch: aircraft?.pitchDeg || 0,
    bank: aircraft?.bankDeg || 0,
    speedTrend: (aircraft?.accelerationKtS || 0) * 10,
    targetSpeed: state.autopilot.airbus.speed,
    targetAltitude: state.autopilot.airbus.altitude,
    radioAltitude: (aircraft?.altitudeFt || 0) < 2500 ? (aircraft?.altitudeFt || 0) : null,
    fmaBoxes: {
      thrust: Date.now() - (state.autopilot.truth.lastModeChangeTimestamps?.thrust || 0) < 10000,
      lateral: Date.now() - (state.autopilot.truth.lastModeChangeTimestamps?.lateral || 0) < 10000,
      vertical: Date.now() - (state.autopilot.truth.lastModeChangeTimestamps?.vertical || 0) < 10000,
    },
    flightDirector: {
      visible: state.autopilot.airbus.fd1 || state.autopilot.airbus.fd2,
      pitch: 0,
      roll: 0
    }
  };
}
