import type { FMCState } from '../types/fmc';
import { PerformanceEngine } from './PerformanceEngine';
import { buildLnavState } from './lnavState';

export interface PerformancePrediction {
  aircraft: FMCState['aircraft'];
  available: boolean;
  vnavAvailable: boolean;
  grossWeight: number;
  estimatedTripFuel: number | null;
  estimatedFuelAtDestination: number | null;
  runwayLengthFt: number | null;
  requiredRunwayLengthFt: number | null;
  vSpeeds: {
    v1: number | null;
    vr: number | null;
    v2: number | null;
  };
  warnings: string[];
  notes: string[];
}

export function buildPerformancePrediction(state: FMCState): PerformancePrediction {
  const grossWeight = resolveGrossWeight(state);
  const lnav = buildLnavState(state);
  const estimatedTripFuel =
    lnav.distanceToDestinationNm !== null ? estimateTripFuel(grossWeight, lnav.distanceToDestinationNm) : null;
  const estimatedFuelAtDestination =
    estimatedTripFuel !== null ? Math.max(0, state.performance.fuel - estimatedTripFuel) : null;
  const runwayLengthFt = estimateRunwayLength(state.takeoff.runway || state.route.runway || null);
  const requiredRunwayLengthFt =
    grossWeight > 0
      ? estimateRequiredRunwayLength(grossWeight, state.takeoff.flaps, state.takeoff.oat, state.takeoff.windSpeed)
      : null;
  const warnings: string[] = [];
  const notes: string[] = ['Trainer-grade approximation only. Not for dispatch or operational use.'];

  if (!hasPerformanceBasics(state)) {
    warnings.push('PERF/VNAV UNAVAILABLE');
  }

  if (
    estimatedFuelAtDestination !== null &&
    state.performance.reserve > 0 &&
    estimatedFuelAtDestination < state.performance.reserve
  ) {
    warnings.push('INSUFFICIENT FUEL');
  }

  if (runwayLengthFt !== null && requiredRunwayLengthFt !== null && runwayLengthFt < requiredRunwayLengthFt) {
    warnings.push('RUNWAY TOO SHORT');
  }

  const speeds =
    grossWeight > 0 && state.takeoff.flaps
      ? PerformanceEngine.calculateTakeoffSpeeds(grossWeight, state.takeoff.flaps)
      : null;

  return {
    aircraft: state.aircraft,
    available: warnings.length === 0,
    vnavAvailable: hasPerformanceBasics(state) && !warnings.includes('INSUFFICIENT FUEL'),
    grossWeight,
    estimatedTripFuel,
    estimatedFuelAtDestination,
    runwayLengthFt,
    requiredRunwayLengthFt,
    vSpeeds: {
      v1: speeds?.v1 ?? state.takeoff.suggestedV1 ?? null,
      vr: speeds?.vr ?? state.takeoff.suggestedVr ?? null,
      v2: speeds?.v2 ?? state.takeoff.suggestedV2 ?? null,
    },
    warnings,
    notes,
  };
}

function hasPerformanceBasics(state: FMCState): boolean {
  return (
    resolveGrossWeight(state) > 0 &&
    state.performance.fuel > 0 &&
    state.performance.crzAlt > 0 &&
    state.performance.costIndex >= 0
  );
}

function resolveGrossWeight(state: FMCState): number {
  if (state.performance.grossWeight > 0) return state.performance.grossWeight;
  if (state.performance.zfw > 0 || state.performance.fuel > 0) {
    return state.performance.zfw + state.performance.fuel;
  }
  return state.aircraftState?.gw ?? 0;
}

function estimateTripFuel(grossWeight: number, distanceNm: number): number {
  const weightFactor = Math.max(0.85, Math.min(1.25, grossWeight / 140000));
  const cruiseFuelPerNm = 18 * weightFactor;
  const taxiAndClimbAllowance = 1800 * weightFactor;
  return Math.round(distanceNm * cruiseFuelPerNm + taxiAndClimbAllowance);
}

function estimateRequiredRunwayLength(
  grossWeight: number,
  flaps: string | undefined,
  oatC: number,
  windSpeedKt: number,
): number {
  const flapSetting = parseInt(flaps ?? '5', 10) || 5;
  const flapFactor = flapSetting <= 1 ? 1.12 : flapSetting >= 15 ? 0.92 : 1;
  const temperatureFactor = oatC > 15 ? 1 + (oatC - 15) * 0.007 : 1;
  const headwindCredit = Math.min(0.1, Math.max(0, windSpeedKt) * 0.004);
  const base = 5200 + Math.max(0, grossWeight - 120000) * 0.045;
  return Math.round(base * flapFactor * temperatureFactor * (1 - headwindCredit));
}

function estimateRunwayLength(runway: string | null): number | null {
  if (!runway) return null;
  const normalized = runway.toUpperCase();
  if (normalized.includes('01') || normalized.includes('19')) return 11800;
  if (normalized.includes('04') || normalized.includes('22')) return 9900;
  if (normalized.includes('09') || normalized.includes('27')) return 8200;
  if (normalized.includes('SHORT')) return 4800;
  return 7600;
}
