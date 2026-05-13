import { AirbusFCUState } from '../autopilot/autopilotTypes';
import { AirbusFMAState, PFDState } from './pfdTypes';
import { FMCState } from '../types/fmc';

export function buildAirbusFMAState(fcu: AirbusFCUState, fmc: FMCState): AirbusFMAState {
  let autothrustMode: AirbusFMAState['autothrustMode'] = '';
  if (fcu.athr) {
    if (fcu.speedManaged) autothrustMode = 'SPEED'; // Simplified
    else autothrustMode = 'SPEED';
  }

  let verticalMode: AirbusFMAState['verticalMode'] = '';
  if (fcu.altitudeManaged) {
    verticalMode = fmc.aircraftState?.verticalSpeed! > 0 ? 'CLB' : 'DES';
  } else if (fcu.verticalSpeed !== null) {
    verticalMode = 'V/S';
  } else if (fcu.fpa !== null) {
    verticalMode = 'FPA';
  } else {
    verticalMode = 'ALT';
  }

  let lateralMode: AirbusFMAState['lateralMode'] = '';
  if (fcu.headingManaged) {
    lateralMode = 'NAV';
  } else {
    lateralMode = 'HDG';
  }

  const armedModes: string[] = [];
  if (fcu.loc && !fcu.headingManaged) armedModes.push('LOC');
  if (fcu.appr && !fcu.altitudeManaged) armedModes.push('G/S');

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
    }
  };
}

export function buildAirbusPFDState(state: FMCState): PFDState {
  const aircraft = state.aircraftState;
  return {
    heading: aircraft?.heading || 0,
    altitude: aircraft?.altitude || 0,
    speed: aircraft?.speed || 0,
    verticalSpeed: aircraft?.verticalSpeed || 0,
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
