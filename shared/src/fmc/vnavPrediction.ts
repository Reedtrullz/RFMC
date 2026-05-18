import type { FlightPlanWaypoint, FMCState } from '../types/fmc';
import { distanceNm } from './ndGeometry';
import { buildLnavState } from './lnavState';
import { buildPerformancePrediction } from './performancePrediction';
import { VerticalProfileEngine } from './VerticalProfileEngine';

export type VnavPhase = 'climb' | 'cruise' | 'descent' | 'unavailable';

export interface VnavConstraintPrediction {
  ident: string;
  index: number;
  altitudeFt: number;
  type: string;
  distanceNm: number;
  feasible: boolean;
  requiredVerticalSpeedFpm: number | null;
}

export interface VnavPrediction {
  available: boolean;
  phase: VnavPhase;
  currentAltitudeFt: number | null;
  cruiseAltitudeFt: number | null;
  topOfClimbDistanceNm: number | null;
  topOfDescentDistanceNm: number | null;
  nextConstraint: VnavConstraintPrediction | null;
  pathDeviationFt: number | null;
  isRequiredVsActive: boolean;
  targetVnavAltitude: number | null;
  pathMessages: string[];
  notes: string[];
}

const CLIMB_FPM_LIMIT = 2500;
const DESCENT_FPM_LIMIT = 2600;
const DESCENT_PROFILE_FT_PER_NM = 6076.1 * Math.tan(3 * Math.PI / 180);
const TRAINER_NOTE = 'Trainer-grade approximation only. Not for dispatch or operational use.';

export function buildVnavPrediction(state: FMCState): VnavPrediction {
  const performance = buildPerformancePrediction(state);
  const lnav = buildLnavState(state);
  const currentAltitudeFt = getCurrentAltitudeFt(state);
  const cruiseAltitudeFt = state.performance.crzAlt > 0 ? state.performance.crzAlt : null;
  const groundSpeedKt = Math.max(160, state.aircraftState?.gs ?? state.aircraftState?.tas ?? 420);
  const pathMessages: string[] = [];

  if (!performance.vnavAvailable || currentAltitudeFt === null || cruiseAltitudeFt === null) {
    return {
      available: false,
      phase: 'unavailable',
      currentAltitudeFt,
      cruiseAltitudeFt,
      topOfClimbDistanceNm: null,
      topOfDescentDistanceNm: null,
      nextConstraint: null,
      pathDeviationFt: null,
      isRequiredVsActive: false,
      targetVnavAltitude: null,
      pathMessages: ['PERF/VNAV UNAVAILABLE'],
      notes: [TRAINER_NOTE],
    };
  }

  const phase = inferPhase(currentAltitudeFt, cruiseAltitudeFt, lnav.distanceToDestinationNm);
  const nextConstraint = predictNextConstraint(state, lnav.activeLegIndex, currentAltitudeFt, groundSpeedKt);
  const distanceToDestinationNm = lnav.distanceToDestinationNm;
  const topOfClimbDistanceNm = currentAltitudeFt < cruiseAltitudeFt - 1000
    ? roundNm((cruiseAltitudeFt - currentAltitudeFt) / DESCENT_PROFILE_FT_PER_NM)
    : null;
  const topOfDescentDistanceNm = distanceToDestinationNm !== null && currentAltitudeFt <= cruiseAltitudeFt + 1000
    ? Math.max(0, roundNm(distanceToDestinationNm - (cruiseAltitudeFt / DESCENT_PROFILE_FT_PER_NM)))
    : null;

  let pathDeviationFt: number | null = null;
  let isRequiredVsActive = false;
  let targetVnavAltitude: number | null = null;

  if (phase === 'descent') {
    if (nextConstraint) {
      targetVnavAltitude = nextConstraint.altitudeFt;
      pathDeviationFt = VerticalProfileEngine.calculatePathDeviation(
        currentAltitudeFt,
        nextConstraint.altitudeFt,
        nextConstraint.distanceNm
      );
      isRequiredVsActive = true;
    } else if (distanceToDestinationNm !== null) {
      targetVnavAltitude = 0;
      pathDeviationFt = VerticalProfileEngine.calculatePathDeviation(
        currentAltitudeFt,
        0,
        distanceToDestinationNm
      );
      isRequiredVsActive = true;
    }
  } else if (phase === 'cruise') {
    targetVnavAltitude = cruiseAltitudeFt;
    pathDeviationFt = currentAltitudeFt - cruiseAltitudeFt;
    isRequiredVsActive = false;
  } else if (phase === 'climb') {
    targetVnavAltitude = cruiseAltitudeFt;
    pathDeviationFt = null;
    isRequiredVsActive = false;
  }

  if (nextConstraint && !nextConstraint.feasible) {
    pathMessages.push(nextConstraint.altitudeFt > currentAltitudeFt ? 'UNABLE NEXT ALT' : 'DRAG REQUIRED');
  }

  if (lnav.stoppedAtDiscontinuity) {
    pathMessages.push('VNAV PATH INTERRUPTED BY DISCONTINUITY');
  }

  return {
    available: pathMessages.length === 0,
    phase,
    currentAltitudeFt,
    cruiseAltitudeFt,
    topOfClimbDistanceNm,
    topOfDescentDistanceNm,
    nextConstraint,
    pathDeviationFt,
    isRequiredVsActive,
    targetVnavAltitude,
    pathMessages,
    notes: [TRAINER_NOTE],
  };
}

function inferPhase(
  currentAltitudeFt: number,
  cruiseAltitudeFt: number,
  distanceToDestinationNm: number | null,
): VnavPhase {
  if (currentAltitudeFt < cruiseAltitudeFt - 1500) return 'climb';
  if (distanceToDestinationNm !== null && distanceToDestinationNm < cruiseAltitudeFt / DESCENT_PROFILE_FT_PER_NM) {
    return 'descent';
  }
  return 'cruise';
}

function predictNextConstraint(
  state: FMCState,
  activeLegIndex: number | null,
  currentAltitudeFt: number,
  groundSpeedKt: number,
): VnavConstraintPrediction | null {
  if (activeLegIndex === null || !state.aircraftState) return null;

  for (let index = activeLegIndex; index < state.flightPlan.waypoints.length; index += 1) {
    const waypoint = state.flightPlan.waypoints[index];
    if (waypoint.discontinuity) return null;
    if (!waypoint.altitudeConstraint) continue;

    const constraintAltitudeFt = resolveConstraintAltitudeFt(waypoint, currentAltitudeFt);
    const distanceToConstraintNm = distanceToWaypointIndex(state, activeLegIndex, index);
    if (distanceToConstraintNm === null || distanceToConstraintNm <= 0) return null;

    const requiredVerticalSpeedFpm = Math.round(
      ((constraintAltitudeFt - currentAltitudeFt) / distanceToConstraintNm) * (groundSpeedKt / 60),
    );
    const feasible = requiredVerticalSpeedFpm >= 0
      ? requiredVerticalSpeedFpm <= CLIMB_FPM_LIMIT
      : Math.abs(requiredVerticalSpeedFpm) <= DESCENT_FPM_LIMIT;

    return {
      ident: waypoint.ident,
      index,
      altitudeFt: constraintAltitudeFt,
      type: waypoint.altitudeConstraint.type,
      distanceNm: roundNm(distanceToConstraintNm),
      feasible,
      requiredVerticalSpeedFpm,
    };
  }

  return null;
}

function resolveConstraintAltitudeFt(waypoint: FlightPlanWaypoint, currentAltitudeFt: number): number {
  const constraint = waypoint.altitudeConstraint;
  if (!constraint) return currentAltitudeFt;
  if (constraint.type === 'BETWEEN' && constraint.altitude2 !== undefined) {
    return currentAltitudeFt <= constraint.altitude ? constraint.altitude : constraint.altitude2;
  }
  return constraint.altitude;
}

function distanceToWaypointIndex(
  state: FMCState,
  activeLegIndex: number,
  targetIndex: number,
): number | null {
  const aircraftPosition = state.aircraftState?.lat !== undefined && state.aircraftState?.lon !== undefined
    ? { lat: state.aircraftState.lat, lon: state.aircraftState.lon }
    : null;
  const active = state.flightPlan.waypoints[activeLegIndex];
  if (!aircraftPosition || !active || active.lat === undefined || active.lon === undefined) return null;

  let total = distanceNm(aircraftPosition, { lat: active.lat, lon: active.lon });
  let previous = active;

  for (let index = activeLegIndex + 1; index <= targetIndex; index += 1) {
    const waypoint = state.flightPlan.waypoints[index];
    if (!waypoint || waypoint.discontinuity) return null;
    if (
      previous.lat === undefined ||
      previous.lon === undefined ||
      waypoint.lat === undefined ||
      waypoint.lon === undefined
    ) {
      return null;
    }
    total += distanceNm(
      { lat: previous.lat, lon: previous.lon },
      { lat: waypoint.lat, lon: waypoint.lon },
    );
    previous = waypoint;
  }

  return total;
}

function getCurrentAltitudeFt(state: FMCState): number | null {
  return state.aircraftState?.altitudeFt ?? state.aircraftState?.altitude ?? null;
}

function roundNm(value: number): number {
  return Math.round(value * 10) / 10;
}
