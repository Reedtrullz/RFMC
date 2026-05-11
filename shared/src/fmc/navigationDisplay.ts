import type { AircraftType, FMCState, FlightPlanWaypoint, EFISState } from '../types/fmc';

export type NDMapMode = 'MAP' | 'PLAN' | 'APP' | 'VOR' | 'ROSE' | 'ARC';
export type NDRange = 5 | 10 | 20 | 40 | 80 | 160 | 320 | 640;

export interface NDAnchorZones {
  speedBlock: { tas: number; gs: number };
  windBlock: { dir: number; speed: number };
  waypointBlock: { ident: string; brg: number; dist: number; eta: string } | null;
  navaidBlocks: Array<{ ident: string; freq: string; dist: number; vor: boolean }>;
  annunciations: string[];
}

export interface NDRoutePoint {
  id: string;
  label: string;
  altitudeLabel: string | null;
  speedLabel: string | null;
  x: number;
  y: number;
  active: boolean;
  discontinuity: boolean;
  airport: boolean;
  navaid?: boolean;
}

export interface NDRouteSegment {
  from: NDRoutePoint;
  to: NDRoutePoint;
  dashed: boolean;
  active: boolean;
  modified: boolean;
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
  mode: string;
  range: number;
  origin: string;
  destination: string;
  procedureLabel: string;
  routePoints: NDRoutePoint[];
  routeSegments: NDRouteSegment[];
  fixOverlays: NDFixOverlay[];
  holdOverlay: NDHoldOverlay | null;
  anchorZones: NDAnchorZones;
  overlays: EFISState['overlays'];
  isModified: boolean;
  centered: boolean;
}

export function buildNavigationDisplayModel(
  state: FMCState,
  efis?: EFISState
): NavigationDisplayModel {
  const aircraftStyle = state.aircraft === 'AIRBUS_A320' ? 'airbus' : 'boeing';
  const resolvedEfis = efis || createDefaultEFIS(state.aircraft, 'L');

  const routeItems = buildRouteItems(state);
  const activeIndex = findActiveRouteIndex(routeItems, state.route.directTo);
  
  // Projection based on mode
  const isPlanMode = resolvedEfis.mode === 'PLAN';
  const routePoints = routeItems.map((item, index) => 
    projectRoutePoint(item, index, routeItems.length, isPlanMode, index === activeIndex, resolvedEfis.centered)
  );

  const routeSegments = routePoints.slice(1).map((point, index) => ({
    from: routePoints[index],
    to: point,
    dashed: routePoints[index].discontinuity || point.discontinuity,
    active: point.active && !state.isModified,
    modified: state.isModified && (point.active || index >= activeIndex),
  }));

  const activePoint = routePoints[activeIndex] || routePoints.find(p => !p.discontinuity);
  
  // Range gating logic
  const visibleOverlays = { ...resolvedEfis.overlays };
  if (aircraftStyle === 'boeing') {
    if (resolvedEfis.range > 40) visibleOverlays.wpt = false;
    if (resolvedEfis.range > 40) visibleOverlays.sta = false; // Simplified: only high-alt VORs at >40nm
  }

  const fixOverlays = visibleOverlays.fix ? buildFixOverlays(state, routePoints, activePoint) : [];
  const anchorZones = buildAnchorZones(state, resolvedEfis);

  return {
    aircraft: state.aircraft,
    style: aircraftStyle,
    mode: resolvedEfis.mode,
    range: resolvedEfis.range,
    origin: state.flightPlan.origin || state.route.origin || '',
    destination: state.flightPlan.destination || state.route.destination || '',
    procedureLabel: formatProcedureLabel(state),
    routePoints: routePoints.filter(p => isPointVisible(p, resolvedEfis, visibleOverlays)),
    routeSegments,
    fixOverlays,
    holdOverlay: visibleOverlays.hold ? buildHoldOverlay(state, routePoints, activePoint) : null,
    anchorZones,
    overlays: visibleOverlays,
    isModified: state.isModified,
    centered: resolvedEfis.centered,
  };
}

function createDefaultEFIS(aircraft: AircraftType, side: 'L' | 'R'): EFISState {
  return {
    mode: aircraft === 'AIRBUS_A320' ? 'ARC' : 'MAP',
    range: 40,
    overlays: {
      fix: true, hold: true, wpt: true, arpt: true, sta: true, 
      data: false, pos: false, terr: false, wxr: false, tfc: true
    },
    centered: false,
    side,
  };
}

interface RouteItem {
  ident: string;
  discontinuity: boolean;
  airport: boolean;
  navaid?: boolean;
  altitudeLabel: string | null;
  speedLabel: string | null;
}

function buildRouteItems(state: FMCState): RouteItem[] {
  const flightPlan = state.isModified && state.pendingFlightPlan ? state.pendingFlightPlan : state.flightPlan;
  const route = state.isModified && state.pendingRoute ? state.pendingRoute : state.route;
  const origin = flightPlan.origin || route.origin;
  const destination = flightPlan.destination || route.destination;
  const points: RouteItem[] = [];

  if (origin) points.push({ ident: origin, discontinuity: false, airport: true, altitudeLabel: null, speedLabel: null });
  for (const waypoint of flightPlan.waypoints) {
    points.push({
      ident: waypoint.ident,
      discontinuity: waypoint.discontinuity,
      airport: isAirportWaypoint(waypoint, destination),
      altitudeLabel: formatAltitudeConstraint(waypoint),
      speedLabel: formatSpeedConstraint(waypoint),
    });
  }
  if (destination && !points.some(point => point.ident === destination)) {
    points.push({ ident: destination, discontinuity: false, airport: true, altitudeLabel: null, speedLabel: null });
  }

  return points;
}

function isAirportWaypoint(waypoint: FlightPlanWaypoint, destination: string): boolean {
  return waypoint.ident === destination || (/^[A-Z]{4}$/.test(waypoint.ident) && !waypoint.discontinuity);
}

function findActiveRouteIndex(routeItems: RouteItem[], directTo?: string): number {
  if (directTo) {
    const directIndex = routeItems.findIndex(item => !item.discontinuity && item.ident === directTo);
    if (directIndex >= 0) return directIndex;
  }
  return routeItems.findIndex(item => !item.discontinuity && !item.airport);
}

function projectRoutePoint(item: RouteItem, index: number, total: number, isPlan: boolean, active: boolean, centered: boolean): NDRoutePoint {
  const progress = total <= 1 ? 0.5 : index / (total - 1);
  
  let x: number, y: number;
  if (isPlan) {
    x = 16 + progress * 68;
    y = 50 - Math.sin(index * 1.5) * 5; // Fake path for PLAN mode
  } else {
    const baseY = centered ? 50 : 84;
    x = 50 + (progress - 0.5) * 70;
    y = baseY - progress * 66 + Math.sin(index * 1.4) * 8;
  }

  return {
    id: `${item.ident}-${index}`,
    label: item.discontinuity ? 'DISCO' : item.ident,
    altitudeLabel: item.discontinuity ? null : item.altitudeLabel,
    speedLabel: item.discontinuity ? null : item.speedLabel,
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10,
    active,
    discontinuity: item.discontinuity,
    airport: item.airport,
    navaid: item.navaid,
  };
}

function isPointVisible(point: NDRoutePoint, efis: EFISState, visibleOverlays: EFISState['overlays']): boolean {
  if (point.active || !point.navaid) return true; // Flight plan waypoints always visible
  if (point.airport && !visibleOverlays.arpt) return false;
  if (point.navaid && !visibleOverlays.sta) return false;
  return true;
}

function formatAltitudeConstraint(waypoint: FlightPlanWaypoint): string | null {
  const constraint = waypoint.altitudeConstraint;
  if (!constraint) return null;
  const altitude = formatAltitude(constraint.altitude);
  switch (constraint.type) {
    case 'AT_OR_ABOVE': return `${altitude}A`;
    case 'AT_OR_BELOW': return `${altitude}B`;
    case 'BETWEEN': return constraint.altitude2 ? `${altitude}/${formatAltitude(constraint.altitude2)}` : altitude;
    default: return altitude;
  }
}

function formatSpeedConstraint(waypoint: FlightPlanWaypoint): string | null {
  const constraint = waypoint.speedConstraint;
  if (!constraint) return null;
  const suffix = constraint.type === 'AT_OR_ABOVE' ? 'A' : constraint.type === 'AT_OR_BELOW' ? 'B' : '';
  return `${constraint.speed}${suffix}`;
}

function formatAltitude(altitude: number): string {
  return altitude >= 18000 && altitude % 100 === 0 ? `FL${String(Math.round(altitude / 100)).padStart(3, '0')}` : String(altitude);
}

function buildFixOverlays(state: FMCState, routePoints: NDRoutePoint[], activePoint?: NDRoutePoint): NDFixOverlay[] {
  const entries = state.fixEntries.some(entry => entry.refFix) ? state.fixEntries : [state.fix];
  return entries
    .filter(entry => entry.refFix)
    .slice(0, 2)
    .map((entry, index) => {
      const point = routePoints.find(p => p.label === entry.refFix) ?? activePoint;
      return {
        refFix: entry.refFix, radial: entry.radial, distance: entry.distance,
        x: point?.x ?? 58 + index * 8,
        y: point?.y ?? 46 + index * 6,
      };
    });
}

function buildHoldOverlay(state: FMCState, routePoints: NDRoutePoint[], activePoint?: NDRoutePoint): NDHoldOverlay | null {
  const hold = state.holdPending ?? state.hold;
  if (!hold.fix) return null;
  const point = routePoints.find(p => p.label === hold.fix) ?? activePoint;
  return { ...hold, x: point?.x ?? 50, y: point?.y ?? 48 };
}

function buildAnchorZones(state: FMCState, efis: EFISState): NDAnchorZones {
  const aircraftState = state.aircraftState;
  const activeWP = (state.isModified ? state.pendingFlightPlan : state.flightPlan)?.waypoints[0];

  return {
    speedBlock: { tas: aircraftState?.speed ?? 0, gs: (aircraftState?.speed ?? 0) + 5 },
    windBlock: { dir: state.takeoff.windDir, speed: state.takeoff.windSpeed },
    waypointBlock: activeWP ? {
      ident: activeWP.ident,
      brg: 342,
      dist: 12.4,
      eta: '12:45z'
    } : null,
    navaidBlocks: [],
    annunciations: state.isModified ? ['MOD'] : [],
  };
}

function formatProcedureLabel(state: FMCState): string {
  const route = state.isModified && state.pendingRoute ? state.pendingRoute : state.route;
  const parts = [
    route.directTo ? `DIR ${route.directTo}` : '',
    route.sid, route.star, route.approach,
    route.runway ? `RW${route.runway}` : '',
  ].filter(Boolean);
  return parts.length ? parts.join(' / ') : 'NO PROC';
}
