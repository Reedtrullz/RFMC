import { AutopilotState } from '../autopilot/autopilotTypes';

export function buildAirbusFMAState(autopilot: AutopilotState, fmc: FMCState): AirbusFMAState {
  const { truth, airbus: fcu } = autopilot;
  
  let autothrustMode: AirbusFMAState['autothrustMode'] = '';
  if (truth.thrustActive !== 'OFF') {
    autothrustMode = truth.thrustActive;
  }

  let verticalMode: AirbusFMAState['verticalMode'] = '';
  if (truth.verticalActive !== 'OFF') {
    verticalMode = truth.verticalActive === 'VNAV_PTH' ? (fmc.aircraftState?.verticalSpeedFpm! >= 0 ? 'CLB' : 'DES') : truth.verticalActive;
  } else {
    verticalMode = 'ALT';
  }

  let lateralMode: AirbusFMAState['lateralMode'] = '';
  if (truth.lateralActive !== 'OFF') {
    lateralMode = truth.lateralActive;
  } else {
    lateralMode = 'HDG';
  }

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
    approachCapability: "NONE" // Placeholder for now
  };
}

export function buildAirbusPFDState(state: FMCState): PFDState {
  const aircraft = state.aircraftState;
  return {
    heading: aircraft?.headingDeg || 0,
    altitude: aircraft?.altitudeFt || 0,
    speed: aircraft?.indicatedAirspeedKt || 0,
    verticalSpeed: aircraft?.verticalSpeedFpm || 0,
    pitch: 0,
    bank: 0,
    radioAltitude: (aircraft?.altitude || 0) < 2500 ? (aircraft?.altitude || 0) : null,
    flightDirector: {
      visible: state.autopilot.airbus.fd1 || state.autopilot.airbus.fd2,
      pitch: 0,
      roll: 0
    }
  };
}
