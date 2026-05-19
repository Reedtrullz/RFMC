import { FMCState } from '../types/fmc';
import { AutopilotState } from '../autopilot/autopilotTypes';
import { AirbusFMAState, PFDState } from './pfdTypes';

export function buildAirbusFMAState(autopilot: AutopilotState, fmc: FMCState): AirbusFMAState {
  const { truth, airbus: fcu } = autopilot;

  let autothrustMode: AirbusFMAState['autothrustMode'] = '';
  if (truth.thrustActive !== 'OFF') {
    autothrustMode = truth.thrustActive as AirbusFMAState['autothrustMode'];
  }

  let verticalMode: AirbusFMAState['verticalMode'] = '';
  if (truth.verticalActive === 'VNAV_PTH') {
    verticalMode = (fmc.aircraftState?.verticalSpeedFpm || 0) >= 0 ? 'CLB' : 'DES';
  } else if (truth.verticalActive === 'ALT_HOLD') {
    verticalMode = 'ALT';
  } else if (truth.verticalActive === 'VS') {
    verticalMode = 'V/S';
  } else if (truth.verticalActive === 'G_S') {
    verticalMode = 'G/S';
  } else if (truth.verticalActive === 'OP_CLB') {
    verticalMode = 'OP CLB';
  } else if (truth.verticalActive === 'OP_DES') {
    verticalMode = 'OP DES';
  } else if (truth.verticalActive !== 'OFF') {
    verticalMode = truth.verticalActive as AirbusFMAState['verticalMode'];
  } else {
    verticalMode = 'ALT';
  }

  let lateralMode: AirbusFMAState['lateralMode'] = '';
  if (truth.lateralActive === 'NAV') lateralMode = 'NAV';
  else if (truth.lateralActive === 'HDG_SEL') lateralMode = 'HDG';
  else if (truth.lateralActive === 'LOC') lateralMode = 'LOC';
  else if (truth.lateralActive === 'APP') lateralMode = 'APP NAV';
  else if (truth.lateralActive !== 'OFF') lateralMode = truth.lateralActive as AirbusFMAState['lateralMode'];
  else lateralMode = 'HDG';

  const armedModes: string[] = [];
  if (truth.lateralArmed && truth.lateralArmed !== 'OFF') {
    armedModes.push(truth.lateralArmed === 'HDG_SEL' ? 'HDG' : truth.lateralArmed);
  }
  if (truth.verticalArmed && truth.verticalArmed !== 'OFF') {
    armedModes.push(truth.verticalArmed === 'G_S' ? 'G/S' : truth.verticalArmed);
  }

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
    approachCapability: '', // Placeholder
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
    targetSpeed: state.autopilot.airbus.speedManaged ? null : state.autopilot.airbus.speed,
    targetAltitude: state.autopilot.airbus.altitude,
    targetHeading: state.autopilot.airbus.headingManaged ? null : state.autopilot.airbus.heading,
    targetVerticalSpeed: state.autopilot.airbus.verticalSpeed,
    managedSpeed: state.autopilot.airbus.speedManaged,
    managedHeading: state.autopilot.airbus.headingManaged,
    managedAltitude: state.autopilot.airbus.altitudeManaged,
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
      visible: state.autopilot.airbus.fd1 || state.autopilot.airbus.fd2,
      pitch: 0,
      roll: 0,
    },
    alertText: state.gpwsAlert !== 'NONE' ? state.gpwsAlert.replace('_', ' ') : state.tcasAlert ? 'TRAFFIC' : undefined,
    alertLevel: state.gpwsAlert === 'PULL_UP' || state.gpwsAlert === 'TERRAIN' ? 'WARNING' : 'CAUTION',
  };
}
