import type { NavSensor, NavSource, NavigationPerformance } from '../types/fmc';

/**
 * Default accuracy radius for different navigation sources (in NM)
 */
export const SENSOR_ACCURACY: Record<NavSource, number> = {
  GPS: 0.05,
  LOC_GPS: 0.03,
  DME_DME: 0.15,
  VOR_DME: 0.3,
  LOC: 0.1,
  IRS: 2.0, // Default drift is higher
};

/**
 * Selects the best available navigation source based on priority
 */
export function selectFmcPositionSource(sensors: NavSensor[]): NavSource {
  const available = sensors.filter((s) => s.available);

  if (available.some((s) => s.source === 'LOC_GPS')) return 'LOC_GPS';
  if (available.some((s) => s.source === 'GPS')) return 'GPS';
  if (available.some((s) => s.source === 'DME_DME')) return 'DME_DME';
  if (available.some((s) => s.source === 'VOR_DME')) return 'VOR_DME';
  if (available.some((s) => s.source === 'LOC')) return 'LOC';

  return 'IRS';
}

/**
 * Calculates Actual Navigation Performance (ANP)
 */
export function calculateANP(sensors: NavSensor[], activeSource: NavSource): number {
  const activeSensor = sensors.find((s) => s.source === activeSource);
  if (!activeSensor || !activeSensor.available) {
    return SENSOR_ACCURACY.IRS * 1.5; // Degraded IRS
  }

  // In a real system, ANP is a statistical 95% confidence radius.
  // For the trainer, we use the sensor's current error or its base accuracy.
  return Math.max(activeSensor.positionErrorNm, SENSOR_ACCURACY[activeSource]);
}

/**
 * Required Navigation Performance (RNP) defaults by flight phase
 */
export const DEFAULT_RNP: Record<NavigationPerformance['phase'], number> = {
  TAKEOFF: 1.0,
  ENROUTE: 2.0,
  OCEANIC: 10.0,
  TERMINAL: 1.0,
  APPROACH: 0.3,
};

/**
 * Calculates Ground Speed and Track based on wind triangle
 */
export function calculateGroundSpeedAndTrack(
  heading: number,
  tas: number,
  windDir: number,
  windSpeed: number,
): { gs: number; track: number } {
  // Convert to radians
  const hdgRad = (heading * Math.PI) / 180;
  const wDirRad = (windDir * Math.PI) / 180;

  // Wind components
  const w_u = windSpeed * Math.sin(wDirRad);
  const w_v = windSpeed * Math.cos(wDirRad);

  // Airspeed components
  const a_u = tas * Math.sin(hdgRad);
  const a_v = tas * Math.cos(hdgRad);

  // Ground speed components
  // In a simple model, we just add the wind to the airspeed vector
  // (Assuming the aircraft maintains heading, not track)
  const g_u = a_u - w_u;
  const g_v = a_v - w_v;

  const gs = Math.sqrt(g_u * g_u + g_v * g_v);
  let track = (Math.atan2(g_u, g_v) * 180) / Math.PI;
  if (track < 0) track += 360;

  return { gs, track };
}

/**
 * Adds realistic position drift for IRS-only navigation
 */
export function calculateIrsDrift(currentError: number, dtSeconds: number): number {
  // IRS typically drifts 1-2 NM per hour
  const driftRateNmPerSecond = 1.5 / 3600;
  return currentError + driftRateNmPerSecond * dtSeconds;
}
