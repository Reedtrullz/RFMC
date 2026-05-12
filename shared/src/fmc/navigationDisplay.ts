import type { AircraftType, FMCState, FlightPlanWaypoint, EFISState } from '../types/fmc';
import { projectGeoPointToND, ProjectedNDPoint } from './ndProjection';
import { distanceNm, bearingDeg } from './ndGeometry';

export type NDMapMode = 
  | 'MAP' | 'PLN' | 'APP' | 'VOR' // Boeing
  | 'ROSE_NAV' | 'ARC' | 'PLAN' | 'ROSE_ILS' | 'ROSE_VOR'; // Airbus

export type NDRange = 5 | 10 | 20 | 40 | 80 | 160 | 320 | 640;

export interface NDAnchorZones {
  speedBlock: { tas: number; gs: number };
  windBlock: { dir: number; speed: number };
  waypointBlock: { ident: string; brg: number; dist: number; eta: string; ete: string } | null;
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
  visible: boolean;
  clipped: boolean;
  distanceNm?: number;
  bearingDeg?: number;
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

export interface TCASTarget {
  id: string;
  ident?: string;
  x: number;
  y: number;
  relativeAltitude: number; // hundreds of feet, e.g., +12, -05
  trend: 'climb' | 'descend' | 'level';
  threatLevel: 'other' | 'proximate' | 'traffic' | 'resolution';
}

export interface WXRData {
  intensity: 'none' | 'light' | 'medium' | 'heavy';
  points: Array<{ x: number; y: number; r: number }>;
}

export interface VerticalProfilePoint {
  label: string; // T/C, T/D, S/C, etc.
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
  tcasTargets: TCASTarget[];
  wxrData: WXRData | null;
  verticalProfilePoints: VerticalProfilePoint[];
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
  const isCentered = isDisplayCentered(aircraftStyle, resolvedEfis.mode, resolvedEfis.centered);

  const routeItems = buildRouteItems(state);
  const activeIndex = findActiveRouteIndex(routeItems, state.route.directTo);
  
  // Projection based on mode
  const isPlanMode = resolvedEfis.mode === 'PLAN' || resolvedEfis.mode === 'PLN';
  
  const aircraftPos = state.aircraftState?.position || { lat: 52.3, lon: 4.7 }; // Default EHAM
  const heading = state.aircraftState?.heading || 0;

  // For PLAN mode, we center on the active waypoint or a selected one
  const activeItem = routeItems[activeIndex];
  const planCenter = (isPlanMode && activeItem?.lat !== undefined && activeItem?.lon !== undefined)
    ? { lat: activeItem.lat, lon: activeItem.lon }
    : aircraftPos;

  const routePoints = routeItems.map((item, index) => {
    let projected: ProjectedNDPoint | null = null;
    if (item.lat !== undefined && item.lon !== undefined) {
      projected = projectGeoPointToND(
        { lat: item.lat, lon: item.lon },
        aircraftPos,
        heading,
        resolvedEfis.range,
        isPlanMode,
        isCentered,
        planCenter
      );
    }
    
    // Fallback to synthetic projection if no lat/lon or projection failed
    return projectRoutePoint(item, index, routeItems.length, isPlanMode, index === activeIndex, isCentered, projected);
  });

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

  const fixOverlays = buildFixOverlays(state, routePoints, activePoint);
  const anchorZones = buildAnchorZones(state, resolvedEfis, activeIndex, routeItems);

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
    holdOverlay: buildHoldOverlay(state, routePoints, activePoint),
    tcasTargets: buildTCASTargets(state, resolvedEfis, isCentered),
    wxrData: buildWXRData(state, resolvedEfis, isCentered),
    verticalProfilePoints: buildVerticalProfilePoints(state, routePoints, activeIndex),
    anchorZones,
    overlays: visibleOverlays,
    isModified: state.isModified,
    centered: isCentered,
  };
}

function isDisplayCentered(style: 'airbus' | 'boeing', mode: string, efisCentered: boolean): boolean {
  if (style === 'airbus') {
    return mode === 'PLAN' || mode.startsWith('ROSE');
  }
  return efisCentered || mode === 'PLN' || mode === 'APP' || mode === 'VOR';
}

function buildTCASTargets(state: FMCState, efis: EFISState, isCentered: boolean): TCASTarget[] {
  if (!state.demoMode && !state.tutorialActive) return [];
  if (!efis.overlays.tfc) return [];
  const cy = isCentered ? 50 : 84;
  return [
    { id: 'T1', x: 45, y: cy - 25, relativeAltitude: 12, trend: 'climb', threatLevel: 'proximate' },
    { id: 'T2', x: 65, y: cy - 15, relativeAltitude: -5, trend: 'descend', threatLevel: 'traffic' },
    { id: 'T3', x: 50, y: cy - 45, relativeAltitude: 0, trend: 'level', threatLevel: 'other' },
  ];
}

function buildWXRData(state: FMCState, efis: EFISState, isCentered: boolean): WXRData | null {
  if (!state.demoMode && !state.tutorialActive) return null;
  if (!efis.overlays.wxr) return null;
  const cy = isCentered ? 50 : 84;
  return {
    intensity: 'medium',
    points: [
      { x: 30, y: cy - 40, r: 8 },
      { x: 35, y: cy - 45, r: 10 },
      { x: 40, y: cy - 38, r: 6 },
    ]
  };
}

function buildVerticalProfilePoints(state: FMCState, routePoints: NDRoutePoint[], activeIndex: number): VerticalProfilePoint[] {
  if (!state.demoMode && !state.tutorialActive) return [];
  if (routePoints.length < 2 || activeIndex < 0) return [];
  const activePoint = routePoints[activeIndex];
  const nextPoint = routePoints[activeIndex + 1];
  
  if (!nextPoint) return [];

  // Mock a T/D halfway between active and next point
  return [
    {
      label: 'T/D',
      x: (activePoint.x + nextPoint.x) / 2,
      y: (activePoint.y + nextPoint.y) / 2
    }
  ];
}

function createDefaultEFIS(aircraft: AircraftType, side: 'L' | 'R'): EFISState {
  return {
    mode: aircraft === 'AIRBUS_A320' ? 'ARC' : 'MAP',
    range: 40,
    overlays: {
      wpt: true, arpt: true, sta: true, 
      data: true, pos: false, terr: false, wxr: false, tfc: true,
      cstr: aircraft === 'AIRBUS_A320'
    },
    centered: false,
    side,
  };
}

interface RouteItem {
  ident: string;
  lat?: number;
  lon?: number;
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
      lat: waypoint.lat,
      lon: waypoint.lon,
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

function projectRoutePoint(
  item: RouteItem, 
  index: number, 
  total: number, 
  isPlan: boolean, 
  active: boolean, 
  centered: boolean,
  projected: ProjectedNDPoint | null
): NDRoutePoint {
  if (projected) {
    return {
      id: `${item.ident}-${index}`,
      label: item.discontinuity ? 'DISCO' : item.ident,
      altitudeLabel: item.discontinuity ? null : item.altitudeLabel,
      speedLabel: item.discontinuity ? null : item.speedLabel,
      x: projected.x,
      y: projected.y,
      active,
      discontinuity: item.discontinuity,
      airport: item.airport,
      navaid: item.navaid,
      visible: projected.visible,
      clipped: projected.clipped,
      distanceNm: projected.distanceNm,
      bearingDeg: projected.bearingDeg,
    };
  }

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
    visible: true,
    clipped: false,
  };
}

function isPointVisible(point: NDRoutePoint, efis: EFISState, visibleOverlays: EFISState['overlays']): boolean {
  if (!point.visible) return false;
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

function buildAnchorZones(state: FMCState, efis: EFISState, activeIndex: number, routeItems: RouteItem[]): NDAnchorZones {
  const aircraftState = state.aircraftState;
  const aircraftPos = aircraftState?.position || { lat: 52.3, lon: 4.7 };
  const activeWP = routeItems[activeIndex];
  const gs = aircraftState?.speed ?? 0;

  let waypointBlock: NDAnchorZones['waypointBlock'] = null;
  if (activeWP && activeWP.lat !== undefined && activeWP.lon !== undefined) {
    const target = { lat: activeWP.lat, lon: activeWP.lon };
    const dist = distanceNm(aircraftPos, target);
    const brg = bearingDeg(aircraftPos, target);
    
    const eteMinutes = gs > 50 ? (dist / gs) * 60 : 0;
    const etaDate = new Date(Date.now() + eteMinutes * 60000);
    const etaStr = `${String(etaDate.getUTCHours()).padStart(2, '0')}:${String(etaDate.getUTCMinutes()).padStart(2, '0')}z`;
    const eteStr = eteMinutes > 60 
      ? `${Math.floor(eteMinutes / 60)}h${Math.round(eteMinutes % 60)}m`
      : `${Math.round(eteMinutes)}m`;

    waypointBlock = {
      ident: activeWP.ident,
      brg: Math.round(brg),
      dist: Math.round(dist * 10) / 10,
      eta: etaStr,
      ete: eteStr
    };
  }

  return {
    speedBlock: { tas: aircraftState?.speed ?? 0, gs },
    windBlock: { dir: state.takeoff.windDir, speed: state.takeoff.windSpeed },
    waypointBlock,
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
