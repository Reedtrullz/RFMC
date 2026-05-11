import type { AircraftType, FMCState, FlightPlanWaypoint } from '../types/fmc';

export type NDMapMode = 'MAP' | 'PLAN';
export type NDRange = 10 | 20 | 40 | 80 | 160 | 320;

export interface NDOverlaySettings {
  fix: boolean;
  hold: boolean;
  wpt: boolean;
  arpt: boolean;
}

export interface NavigationDisplaySettings {
  mode: NDMapMode;
  range: NDRange;
  overlays: NDOverlaySettings;
}

export interface NDRoutePoint {
  id: string;
  label: string;
  x: number;
  y: number;
  active: boolean;
  discontinuity: boolean;
  airport: boolean;
}

export interface NDRouteSegment {
  from: NDRoutePoint;
  to: NDRoutePoint;
  dashed: boolean;
}

export interface NDFixOverlay {
  refFix: string;
  radial: number;
  distance: number;
  x: number;
  y: number;
}

export interface NDHoldOverlay {
  fix: string;
  inboundCourse: number;
  legTime: number;
  legDist: number;
  direction: 'L' | 'R';
  x: number;
  y: number;
}

export interface NavigationDisplayModel {
  aircraft: AircraftType;
  style: 'boeing' | 'airbus';
  mode: NDMapMode;
  range: NDRange;
  origin: string;
  destination: string;
  procedureLabel: string;
  routePoints: NDRoutePoint[];
  routeSegments: NDRouteSegment[];
  fixOverlay: NDFixOverlay | null;
  holdOverlay: NDHoldOverlay | null;
  overlays: NDOverlaySettings;
}

const DEFAULT_SETTINGS: NavigationDisplaySettings = {
  mode: 'MAP',
  range: 40,
  overlays: { fix: true, hold: true, wpt: true, arpt: true },
};

export function buildNavigationDisplayModel(
  state: FMCState,
  settings: Partial<NavigationDisplaySettings> = {}
): NavigationDisplayModel {
  const resolved = {
    ...DEFAULT_SETTINGS,
    ...settings,
    overlays: { ...DEFAULT_SETTINGS.overlays, ...settings.overlays },
  };
  const routeItems = buildRouteItems(state);
  const routePoints = routeItems.map((item, index) => projectRoutePoint(item, index, routeItems.length, resolved.mode));
  const routeSegments = routePoints.slice(1).map((point, index) => ({
    from: routePoints[index],
    to: point,
    dashed: routePoints[index].discontinuity || point.discontinuity,
  }));
  const activePoint = routePoints.find(point => !point.discontinuity && !point.airport) ?? routePoints.find(point => !point.discontinuity);

  return {
    aircraft: state.aircraft,
    style: state.aircraft === 'AIRBUS_A320' ? 'airbus' : 'boeing',
    mode: resolved.mode,
    range: resolved.range,
    origin: state.flightPlan.origin || state.route.origin || '',
    destination: state.flightPlan.destination || state.route.destination || '',
    procedureLabel: formatProcedureLabel(state),
    routePoints,
    routeSegments,
    fixOverlay: resolved.overlays.fix ? buildFixOverlay(state, routePoints, activePoint) : null,
    holdOverlay: resolved.overlays.hold ? buildHoldOverlay(state, routePoints, activePoint) : null,
    overlays: resolved.overlays,
  };
}

interface RouteItem {
  ident: string;
  discontinuity: boolean;
  airport: boolean;
}

function buildRouteItems(state: FMCState): RouteItem[] {
  const origin = state.flightPlan.origin || state.route.origin;
  const destination = state.flightPlan.destination || state.route.destination;
  const points: RouteItem[] = [];

  if (origin) points.push({ ident: origin, discontinuity: false, airport: true });
  for (const waypoint of state.flightPlan.waypoints) {
    points.push({
      ident: waypoint.ident,
      discontinuity: waypoint.discontinuity,
      airport: isAirportWaypoint(waypoint, destination),
    });
  }
  if (destination && !points.some(point => point.ident === destination)) {
    points.push({ ident: destination, discontinuity: false, airport: true });
  }

  return points;
}

function isAirportWaypoint(waypoint: FlightPlanWaypoint, destination: string): boolean {
  return waypoint.ident === destination || (/^[A-Z]{4}$/.test(waypoint.ident) && !waypoint.discontinuity);
}

function projectRoutePoint(item: RouteItem, index: number, total: number, mode: NDMapMode): NDRoutePoint {
  if (total <= 1) {
    return { id: `${item.ident}-${index}`, label: item.ident, x: 50, y: 58, active: false, discontinuity: item.discontinuity, airport: item.airport };
  }

  const progress = index / (total - 1);
  const x = mode === 'PLAN' ? 16 + progress * 68 : 50 + (progress - 0.5) * 64;
  const y = mode === 'PLAN'
    ? 78 - progress * 58 + Math.sin(index * 1.7) * 6
    : 84 - progress * 66 + Math.sin(index * 1.4) * 8;

  return {
    id: `${item.ident}-${index}`,
    label: item.discontinuity ? 'DISCO' : item.ident,
    x: clamp(Math.round(x * 10) / 10, 8, 92),
    y: clamp(Math.round(y * 10) / 10, 10, 88),
    active: index === 1 && !item.discontinuity,
    discontinuity: item.discontinuity,
    airport: item.airport,
  };
}

function buildFixOverlay(state: FMCState, routePoints: NDRoutePoint[], fallback?: NDRoutePoint): NDFixOverlay | null {
  if (!state.fix.refFix) return null;
  const point = routePoints.find(routePoint => routePoint.label === state.fix.refFix) ?? fallback;
  return {
    refFix: state.fix.refFix,
    radial: state.fix.radial,
    distance: state.fix.distance,
    x: point?.x ?? 58,
    y: point?.y ?? 46,
  };
}

function buildHoldOverlay(state: FMCState, routePoints: NDRoutePoint[], fallback?: NDRoutePoint): NDHoldOverlay | null {
  const hold = state.holdPending ?? state.hold;
  if (!hold.fix) return null;
  const point = routePoints.find(routePoint => routePoint.label === hold.fix) ?? fallback;
  return {
    ...hold,
    x: point?.x ?? 50,
    y: point?.y ?? 48,
  };
}

function formatProcedureLabel(state: FMCState): string {
  const parts = [
    state.route.sid,
    state.route.star,
    state.route.approach,
    state.route.runway ? `RW${state.route.runway}` : '',
  ].filter(Boolean);
  return parts.length ? parts.join(' / ') : 'NO PROC';
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
