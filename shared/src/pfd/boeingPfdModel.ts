import { BoeingMCPState } from '../autopilot/autopilotTypes';
import { BoeingFMAState, PFDState } from './pfdTypes';
import { FMCState } from '../types/fmc';

export function buildBoeingFMAState(mcp: BoeingMCPState, fmc: FMCState): BoeingFMAState {
  let autothrottleMode: BoeingFMAState['autothrottleMode'] = '';
  if (mcp.autothrottleArm) {
    if (mcp.mach !== null) autothrottleMode = 'MCP SPD'; // Simplified
    else if (mcp.speedMode) autothrottleMode = 'MCP SPD';
    else if (mcp.n1) autothrottleMode = 'N1';
    else autothrottleMode = 'ARM';
  }

  let rollMode: BoeingFMAState['rollMode'] = '';
  if (mcp.lnav) rollMode = 'LNAV';
  else if (mcp.hdgSel) rollMode = 'HDG SEL';
  else if (mcp.vorLoc) rollMode = 'VOR/LOC';

  let pitchMode: BoeingFMAState['pitchMode'] = '';
  if (mcp.vnav) {
    pitchMode = mcp.altHold ? 'VNAV PTH' : 'VNAV SPD';
  } else if (mcp.altHold) {
    pitchMode = 'ALT HOLD';
  } else if (mcp.vs) {
    pitchMode = 'V/S';
  } else if (mcp.lvlChg) {
    pitchMode = 'LVL CHG';
  }

  let apStatus: BoeingFMAState['apStatus'] = '';
  if (mcp.cmdA) apStatus = 'CMD A';
  else if (mcp.cmdB) apStatus = 'CMD B';
  else if (mcp.cwsA) apStatus = 'CWS A';
  else if (mcp.cwsB) apStatus = 'CWS B';
  else if (mcp.fdLeft || mcp.fdRight) apStatus = 'FD';

  return {
    autothrottleMode,
    rollMode,
    pitchMode,
    armedRollMode: mcp.app && !mcp.vorLoc ? 'VOR/LOC' : '',
    armedPitchMode: mcp.app && !pitchMode.includes('G/S') ? 'G/S' : '',
    apStatus
  };
}

export function buildBoeingPFDState(state: FMCState): PFDState {
  const aircraft = state.aircraftState;
  return {
    heading: aircraft?.heading || 0,
    altitude: aircraft?.altitude || 0,
    speed: aircraft?.speed || 0,
    verticalSpeed: aircraft?.verticalSpeed || 0,
    pitch: 0, // Mock for now
    bank: 0, // Mock for now
    radioAltitude: (aircraft?.altitude || 0) < 2500 ? (aircraft?.altitude || 0) : null,
    flightDirector: {
      visible: state.autopilot.boeing.fdLeft || state.autopilot.boeing.fdRight,
      pitch: 0,
      roll: 0
    }
  };
}
