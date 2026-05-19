import type { AirbusFCUState, AutoflightTruthState, BoeingMCPState } from './autopilotTypes';

export type DisplayWindowModel = {
  text: string;
  active: boolean;
  unit?: string;
  managed?: boolean;
};

export type BoeingMcpDisplayModel = {
  family: 'boeing';
  windows: {
    courseL: DisplayWindowModel;
    iasMach: DisplayWindowModel;
    heading: DisplayWindowModel;
    altitude: DisplayWindowModel;
    verticalSpeed: DisplayWindowModel;
    courseR: DisplayWindowModel;
  };
};

export type AirbusFcuDisplayModel = {
  family: 'airbus';
  windows: {
    speed: DisplayWindowModel;
    heading: DisplayWindowModel;
    altitude: DisplayWindowModel;
    verticalSpeed: DisplayWindowModel;
  };
  managed: {
    speed: boolean;
    heading: boolean;
    altitude: boolean;
  };
};

export function buildBoeingMcpDisplayModel(state: BoeingMCPState, truth: AutoflightTruthState): BoeingMcpDisplayModel {
  const iasMachActive = state.speed !== null || state.mach !== null;

  return {
    family: 'boeing',
    windows: {
      courseL: { text: formatDegrees(state.courseL), active: true },
      iasMach: {
        text:
          state.mach !== null ? `.${Math.round(state.mach * 100)}` : (state.speed?.toString() ?? '').padStart(3, ' '),
        active: iasMachActive,
        unit: state.mach !== null ? 'MACH' : 'SPD',
      },
      heading: { text: formatDegrees(state.heading), active: true },
      altitude: { text: formatAltitude(state.altitude), active: true },
      verticalSpeed: {
        text: truth.verticalActive !== 'VS' ? '' : formatVerticalSpeed(state.verticalSpeed),
        active: truth.verticalActive === 'VS',
      },
      courseR: { text: formatDegrees(state.courseR), active: true },
    },
  };
}

export function buildAirbusFcuDisplayModel(state: AirbusFCUState, truth: AutoflightTruthState): AirbusFcuDisplayModel {
  const speedManaged = isAirbusSpeedManaged(truth);
  const headingManaged = isAirbusHeadingManaged(truth);
  const altitudeManaged = isAirbusAltitudeManaged(truth);

  return {
    family: 'airbus',
    managed: {
      speed: speedManaged,
      heading: headingManaged,
      altitude: altitudeManaged,
    },
    windows: {
      speed: formatAirbusWindow('speed', state.speed, speedManaged),
      heading: formatAirbusWindow('heading', state.heading, headingManaged),
      altitude: formatAirbusWindow('altitude', state.altitude, altitudeManaged),
      verticalSpeed: formatAirbusWindow('vs', state.verticalSpeed, false),
    },
  };
}

export function formatDegrees(value: number): string {
  return Math.round(value).toString().padStart(3, '0');
}

export function formatAltitude(value: number): string {
  return Math.round(value).toString().padStart(5, '0');
}

export function formatVerticalSpeed(value: number | null): string {
  if (value === null) return '0000';
  if (value > 0) return `+${value}`;
  return value.toString();
}

function formatAirbusWindow(
  field: 'speed' | 'heading' | 'altitude' | 'vs',
  value: number | null,
  managed: boolean,
): DisplayWindowModel {
  if ((field === 'speed' || field === 'heading') && managed) {
    return { text: '---', active: true, managed: true };
  }

  if (field === 'altitude') {
    return {
      text: value?.toString().padStart(5, '0') ?? '00000',
      active: true,
      managed,
    };
  }

  if (field === 'vs') {
    return {
      text: value === null ? '-----' : value > 0 ? `+${value}` : value.toString(),
      active: value !== null,
      managed: false,
    };
  }

  return {
    text: value?.toString() ?? '',
    active: value !== null,
    managed,
  };
}

function isAirbusSpeedManaged(truth: AutoflightTruthState): boolean {
  return truth.thrustActive === 'SPEED' || truth.thrustActive === 'THR_CLB';
}

function isAirbusHeadingManaged(truth: AutoflightTruthState): boolean {
  return (
    truth.lateralActive === 'NAV' ||
    truth.lateralArmed === 'NAV' ||
    truth.lateralActive === 'LNAV' ||
    truth.lateralArmed === 'LNAV'
  );
}

function isAirbusAltitudeManaged(truth: AutoflightTruthState): boolean {
  return (
    truth.verticalActive === 'CLB' ||
    truth.verticalActive === 'DES' ||
    truth.verticalArmed === 'VNAV_PTH' ||
    truth.verticalActive === 'VNAV_PTH' ||
    truth.verticalActive === 'VNAV'
  );
}
