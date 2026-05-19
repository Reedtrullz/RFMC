import type { AircraftType, ConnectionStatus, FlightPlan } from '../types/fmc';
import type { DisplayColor } from '../fmc/displayColors';
import type { DisplaySemantic } from '../fmc/displaySemantics';

export type AircraftFamily = '737ng' | '737max' | 'a320';
export type LightingMode = 'day' | 'dusk' | 'night' | 'dim-night';
export type AdapterHealthState = ConnectionStatus | 'DEGRADED' | 'STALE';

export interface ShellGeometry {
  width: number;
  height: number;
  displayAperture: Rect;
  keyMatrixBounds: Rect;
  functionKeyBounds: Rect;
  leftLskCenters: Point[];
  rightLskCenters: Point[];
  screwCenters: Point[];
  units: 'normalized';
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface ColourTokens {
  semantic: Record<DisplaySemantic, DisplayColor>;
  shell: {
    bezel: string;
    keycap: string;
    glass: string;
    screw: string;
  };
}

export interface LightingProfile {
  mode: LightingMode;
  displayBrightness: number;
  reflectionOpacity: number;
  vignetteOpacity: number;
  keyBacklight: number;
}

export interface InputProfile {
  minTouchTargetPx: number;
  keyPressDepthPx: number;
  repeatDelayMs: number;
  repeatIntervalMs: number;
}

export interface DisplayProfile {
  id: string;
  family: AircraftFamily;
  aircraftType: AircraftType;
  shell: ShellGeometry;
  textGrid: { cols: 24; rows: 14 };
  colours: ColourTokens;
  lighting: Record<LightingMode, LightingProfile>;
  typography: {
    fontFamily: string;
    cellAspectRatio: number;
  };
  inputs: InputProfile;
}

export interface AircraftProfile {
  id: string;
  label: string;
  family: AircraftFamily;
  aircraftType: AircraftType;
  display: DisplayProfile;
  navdataPolicy: 'demo-fixture' | 'airac-aware' | 'licensed-current-cycle';
  certificationClaim: 'none';
  limitations: string[];
}

export interface AdapterCapabilities {
  instruments: Array<'CDU' | 'MCDU' | 'ND' | 'PFD'>;
  commands: Array<'keyPress' | 'lskPress' | 'brightness' | 'modeSelect' | 'rangeSelect'>;
  data: Array<'display' | 'telemetry' | 'flightPlan' | 'navCycle' | 'adapterVersion'>;
  replay: boolean;
}

export interface AdapterHealth {
  state: AdapterHealthState;
  adapterName: string;
  simulatorVersion?: string;
  addonVersion?: string;
  profileVersion: string;
  navCycle?: string;
  lastError?: string | null;
  latencyMs?: number;
  lostFrameCount?: number;
  sourceTimestamp?: number;
}

export interface TelemetryFrame {
  sourceTimestamp: number;
  position?: { lat: number; lon: number };
  attitude?: { pitch: number; roll: number; heading: number; track?: number };
  airData?: { altitudeFt: number; indicatedAirspeedKt: number; verticalSpeedFpm?: number };
  autopilot?: {
    lateralMode?: string;
    verticalMode?: string;
    autothrottleMode?: string;
    selectedHeading?: number;
    selectedAltitudeFt?: number;
    selectedSpeedKt?: number;
  };
}

export interface FlightPlanModel extends FlightPlan {
  navCycle?: string;
  source: 'demo' | 'simbrief' | 'simulator' | 'navdata';
  validationWarnings: string[];
}

const boeingShell: ShellGeometry = {
  width: 1,
  height: 1,
  displayAperture: { x: 0.2, y: 0.08, width: 0.6, height: 0.39 },
  functionKeyBounds: { x: 0.08, y: 0.5, width: 0.84, height: 0.12 },
  keyMatrixBounds: { x: 0.09, y: 0.64, width: 0.82, height: 0.28 },
  leftLskCenters: [0.14, 0.19, 0.24, 0.29, 0.34, 0.39].map((y) => ({ x: 0.12, y })),
  rightLskCenters: [0.14, 0.19, 0.24, 0.29, 0.34, 0.39].map((y) => ({ x: 0.88, y })),
  screwCenters: [
    { x: 0.04, y: 0.04 },
    { x: 0.96, y: 0.04 },
    { x: 0.04, y: 0.96 },
    { x: 0.96, y: 0.96 },
  ],
  units: 'normalized',
};

export const BOEING_737NG_DISPLAY_PROFILE: DisplayProfile = {
  id: 'boeing-737ng-cdu-v1',
  family: '737ng',
  aircraftType: 'BOEING_737',
  shell: boeingShell,
  textGrid: { cols: 24, rows: 14 },
  colours: {
    semantic: {
      title: 'cyan',
      label: 'white',
      activeData: 'green',
      inactiveData: 'white',
      modified: 'shaded',
      guidance: 'magenta',
      warning: 'red',
      caution: 'amber',
      placeholder: 'white',
      scratchpad: 'white',
      inverse: 'white',
      titleBackground: 'cyan',
      pageIndicator: 'white',
    },
    shell: {
      bezel: '#171717',
      keycap: '#262626',
      glass: '#0a0a0a',
      screw: '#3a3a3a',
    },
  },
  lighting: {
    day: { mode: 'day', displayBrightness: 100, reflectionOpacity: 0.04, vignetteOpacity: 0.05, keyBacklight: 0.8 },
    dusk: { mode: 'dusk', displayBrightness: 80, reflectionOpacity: 0.03, vignetteOpacity: 0.06, keyBacklight: 0.7 },
    night: { mode: 'night', displayBrightness: 45, reflectionOpacity: 0.01, vignetteOpacity: 0.08, keyBacklight: 0.45 },
    'dim-night': {
      mode: 'dim-night',
      displayBrightness: 25,
      reflectionOpacity: 0,
      vignetteOpacity: 0.08,
      keyBacklight: 0.3,
    },
  },
  typography: {
    fontFamily: 'B612 Mono',
    cellAspectRatio: 0.62,
  },
  inputs: {
    minTouchTargetPx: 44,
    keyPressDepthPx: 2,
    repeatDelayMs: 450,
    repeatIntervalMs: 90,
  },
};

export const BOEING_737NG_AIRCRAFT_PROFILE: AircraftProfile = {
  id: 'boeing-737ng-v1',
  label: 'Boeing 737 NG CDU trainer',
  family: '737ng',
  aircraftType: 'BOEING_737',
  display: BOEING_737NG_DISPLAY_PROFILE,
  navdataPolicy: 'demo-fixture',
  certificationClaim: 'none',
  limitations: [
    'Procedural trainer only; not certified and not for real-world operations.',
    'Visual geometry is measured against local reference fiducials as they are added.',
    'Live PMDG validation requires Windows, MSFS, and PMDG hardware/software setup.',
  ],
};
