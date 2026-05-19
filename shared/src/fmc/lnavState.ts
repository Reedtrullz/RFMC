import type { AircraftState, FlightPlanWaypoint, FMCState } from '../types/fmc';
import { bearingDeg, distanceNm } from './ndGeometry';

export interface LnavWaypointSummary {
  ident: string;
  index: number;
  lat?: number;
  lon?: number;
}

export interface LnavState {
  activeLegIndex: number | null;
  activeWaypoint: LnavWaypointSummary | null;
  nextWaypoint: LnavWaypointSummary | null;
  destination: LnavWaypointSummary | null;
  directToActive: boolean;
  stoppedAtDiscontinuity: boolean;
  routeComplete: boolean;
  bearingToActiveDeg: number | null;
  distanceToActiveNm: number | null;
  distanceToDestinationNm: number | null;
  sequenceBlockedReason: string | null;
}

export function buildLnavState(state: FMCState): LnavState {
  const waypoints = state.flightPlan.waypoints;
  const destination = findDestination(waypoints, state.flightPlan.destination || state.route.destination || null);
  const currentLegIndex = findFirstActiveIndex(waypoints) ?? 0;
  const directToIndex = findDirectToIndex(waypoints, state.route.directTo, currentLegIndex);
  const firstDiscontinuityIndex = waypoints.findIndex((waypoint) => waypoint.discontinuity);
  const activeLegIndex = directToIndex ?? findFirstActiveIndex(waypoints);
  const activeWaypoint = activeLegIndex === null ? null : toSummary(waypoints[activeLegIndex], activeLegIndex);
  const nextWaypoint =
    activeLegIndex === null ? null : findNextWaypoint(waypoints, activeLegIndex, directToIndex !== null);
  const stoppedAtDiscontinuity = isSequencingStoppedByDiscontinuity(
    waypoints,
    activeLegIndex,
    directToIndex,
    firstDiscontinuityIndex,
  );
  const aircraftPosition = getAircraftPosition(state.aircraftState);
  const bearingToActiveDeg =
    aircraftPosition && activeWaypoint?.lat !== undefined && activeWaypoint.lon !== undefined
      ? Math.round(bearingDeg(aircraftPosition, { lat: activeWaypoint.lat, lon: activeWaypoint.lon }))
      : null;
  const distanceToActiveNm =
    aircraftPosition && activeWaypoint?.lat !== undefined && activeWaypoint.lon !== undefined
      ? roundNm(distanceNm(aircraftPosition, { lat: activeWaypoint.lat, lon: activeWaypoint.lon }))
      : null;
  const distanceToDestinationNm =
    aircraftPosition && activeLegIndex !== null
      ? calculateDistanceToDestinationNm(aircraftPosition, waypoints, activeLegIndex, directToIndex !== null)
      : null;

  return {
    activeLegIndex,
    activeWaypoint,
    nextWaypoint,
    destination,
    directToActive: directToIndex !== null,
    stoppedAtDiscontinuity,
    routeComplete:
      activeLegIndex === null ||
      (activeLegIndex === waypoints.length - 1 && distanceToActiveNm !== null && distanceToActiveNm < 0.2),
    bearingToActiveDeg,
    distanceToActiveNm,
    distanceToDestinationNm,
    sequenceBlockedReason: stoppedAtDiscontinuity ? 'ROUTE DISCONTINUITY' : null,
  };
}

function findDirectToIndex(waypoints: FlightPlanWaypoint[], directTo?: string, currentLegIndex = 0): number | null {
  if (!directTo) return null;
  const normalizedDirectTo = directTo.toUpperCase();
  for (let i = currentLegIndex; i < waypoints.length; i++) {
    const waypoint = waypoints[i];
    if (!waypoint.discontinuity && waypoint.ident.toUpperCase() === normalizedDirectTo) {
      return i;
    }
  }
  return null;
}

function findFirstActiveIndex(waypoints: FlightPlanWaypoint[]): number | null {
  if (waypoints.length === 0) return null;
  if (waypoints[0]?.discontinuity) return null;
  const index = waypoints.findIndex((waypoint) => !waypoint.discontinuity);
  return index >= 0 ? index : null;
}

function findNextWaypoint(
  waypoints: FlightPlanWaypoint[],
  activeIndex: number,
  directToActive: boolean,
): LnavWaypointSummary | null {
  for (let index = activeIndex + 1; index < waypoints.length; index += 1) {
    const waypoint = waypoints[index];
    if (waypoint.discontinuity && !directToActive) return null;
    if (!waypoint.discontinuity) return toSummary(waypoint, index);
  }
  return null;
}

function findDestination(waypoints: FlightPlanWaypoint[], destinationIdent: string | null): LnavWaypointSummary | null {
  if (waypoints.length === 0) return null;
  if (destinationIdent) {
    const normalizedDestination = destinationIdent.toUpperCase();
    const index = waypoints.findIndex(
      (waypoint) => !waypoint.discontinuity && waypoint.ident.toUpperCase() === normalizedDestination,
    );
    if (index >= 0) return toSummary(waypoints[index], index);
  }

  for (let index = waypoints.length - 1; index >= 0; index -= 1) {
    if (!waypoints[index].discontinuity) return toSummary(waypoints[index], index);
  }
  return null;
}

function isSequencingStoppedByDiscontinuity(
  waypoints: FlightPlanWaypoint[],
  activeIndex: number | null,
  directToIndex: number | null,
  firstDiscontinuityIndex: number,
): boolean {
  if (firstDiscontinuityIndex < 0) return false;
  if (activeIndex === null) return true;
  if (directToIndex !== null) return false;
  return firstDiscontinuityIndex >= activeIndex;
}

function calculateDistanceToDestinationNm(
  aircraftPosition: { lat: number; lon: number },
  waypoints: FlightPlanWaypoint[],
  activeIndex: number,
  directToActive: boolean,
): number | null {
  const active = waypoints[activeIndex];
  if (!active || active.discontinuity || active.lat === undefined || active.lon === undefined) {
    return null;
  }

  let total = distanceNm(aircraftPosition, { lat: active.lat, lon: active.lon });
  let previous = active;

  for (let index = activeIndex + 1; index < waypoints.length; index += 1) {
    const current = waypoints[index];
    if (current.discontinuity && !directToActive) break;
    if (current.discontinuity) continue;
    if (
      previous.lat === undefined ||
      previous.lon === undefined ||
      current.lat === undefined ||
      current.lon === undefined
    ) {
      return null;
    }
    total += distanceNm({ lat: previous.lat, lon: previous.lon }, { lat: current.lat, lon: current.lon });
    previous = current;
  }

  return roundNm(total);
}

function getAircraftPosition(aircraftState: AircraftState | null): { lat: number; lon: number } | null {
  if (!aircraftState || aircraftState.lat === undefined || aircraftState.lon === undefined) {
    return null;
  }
  return { lat: aircraftState.lat, lon: aircraftState.lon };
}

function toSummary(waypoint: FlightPlanWaypoint, index: number): LnavWaypointSummary {
  return {
    ident: waypoint.ident,
    index,
    lat: waypoint.lat,
    lon: waypoint.lon,
  };
}

function roundNm(value: number): number {
  return Math.round(value * 10) / 10;
}
