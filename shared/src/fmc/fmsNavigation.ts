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
  const available = sensors.filter(s => s.available);
  
  if (available.some(s => s.source === 'LOC_GPS')) return 'LOC_GPS';
  if (available.some(s => s.source === 'GPS')) return 'GPS';
  if (available.some(s => s.source === 'DME_DME')) return 'DME_DME';
  if (available.some(s => s.source === 'VOR_DME')) return 'VOR_DME';
  if (available.some(s => s.source === 'LOC')) return 'LOC';
  
  return 'IRS';
}

/**
 * Calculates Actual Navigation Performance (ANP)
 */
export function calculateANP(sensors: NavSensor[], activeSource: NavSource): number {
  const activeSensor = sensors.find(s => s.source === activeSource);
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
