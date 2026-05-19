import type { AircraftType, FMCState, FlightPlanWaypoint, EFISState } from '../types/fmc';
import { projectGeoPointToND, ProjectedNDPoint, NDProjectionContext } from './ndProjection';
import { clipRouteSegment } from './ndClipping';
import { distanceNm, bearingDeg } from './ndGeometry';
import { getAllAirports, getAllWaypoints, getAirportCoordinates, getWaypointCoordinates } from './navDatabase';
import type {
  NDMapMode,
  NDRange,
  NDAnchorZones,
  NDRoutePoint,
  NDRouteSegment,
  NDFixOverlay,
  NDHoldOverlay,
  TCASTarget,
  WXRData,
  WXRPoint,
  VerticalProfilePoint,
  NavigationDisplayModel,
} from './ndTypes';

export function getAircraftPositionWithFallback(state: FMCState): { lat: number; lon: number } {
  if (state.aircraftState?.lat !== undefined && state.aircraftState?.lon !== undefined) {
    return { lat: state.aircraftState.lat, lon: state.aircraftState.lon };
  }
  const fallbackIcao =
    state.position.refAirport ||
    state.flightPlan.origin ||
    state.route.origin ||
    state.flightPlan.destination ||
    state.route.destination ||
    '';
  const fallbackCoords = fallbackIcao ? getAirportCoordinates(fallbackIcao) : null;
  if (fallbackCoords) {
    return { lat: fallbackCoords.lat, lon: fallbackCoords.lon };
  }
  return { lat: 52.3, lon: 4.7 };
}

export function buildNavigationDisplayModel(state: FMCState, efis?: EFISState): NavigationDisplayModel {
  const aircraftStyle = state.aircraft === 'AIRBUS_A320' ? 'airbus' : 'boeing';
  const resolvedEfis = efis || state.efisL || createDefaultEFIS(state.aircraft, 'L');
  const isCentered = isDisplayCentered(aircraftStyle, resolvedEfis.mode, resolvedEfis.centered);

  const activeRouteItems = buildRouteItems(state.flightPlan, state.route);
  const hasPending = state.isModified && !!state.pendingFlightPlan && !!state.pendingRoute;
  const pendingRouteItems = hasPending ? buildRouteItems(state.pendingFlightPlan!, state.pendingRoute!) : [];

  // Determine what drives the display logic (center, active waypoint, etc.)
  const primaryRouteItems = hasPending ? pendingRouteItems : activeRouteItems;
  const primaryRoute = hasPending ? state.pendingRoute! : state.route;
  const primaryActiveIndex = findActiveRouteIndex(primaryRouteItems, primaryRoute.directTo);

  // Projection based on mode
  const isPlanMode = resolvedEfis.mode === 'PLAN' || resolvedEfis.mode === 'PLN';

  const aircraftPos = getAircraftPositionWithFallback(state);
  const heading = state.aircraftState?.heading || 0;

  // For PLAN mode, we center on the active waypoint or a selected one
  const planIndex = state.selectedPlanWaypointIndex ?? primaryActiveIndex;
  const activeItem = primaryRouteItems[planIndex] || primaryRouteItems[primaryActiveIndex];
  const planCenter =
    isPlanMode && activeItem?.lat !== undefined && activeItem?.lon !== undefined
      ? { lat: activeItem.lat, lon: activeItem.lon }
      : aircraftPos;

  const projectionContext: NDProjectionContext = {
    style: aircraftStyle,
    mode: resolvedEfis.mode,
    rangeNm: resolvedEfis.range,
    heading,
    isCentered,
    aircraftPosition: aircraftPos,
    planCenter,
  };

  // Range gating logic
  const visibleOverlays = { ...resolvedEfis.overlays };
  if (aircraftStyle === 'boeing') {
    if (resolvedEfis.range > 40) visibleOverlays.wpt = false;
    if (resolvedEfis.range > 40) visibleOverlays.sta = false; // Simplified: only high-alt VORs at >40nm
  }

  const activeRouteData = processRoute(
    activeRouteItems,
    state.route.directTo,
    false,
    projectionContext,
    isPlanMode,
    isCentered,
    resolvedEfis,
    visibleOverlays,
  );
  const pendingRouteData = hasPending
    ? processRoute(
        pendingRouteItems,
        state.pendingRoute?.directTo,
        true,
        projectionContext,
        isPlanMode,
        isCentered,
        resolvedEfis,
        visibleOverlays,
      )
    : { points: [], segments: [] };

  const primaryPointsForOverlays = hasPending ? pendingRouteData.points : activeRouteData.points;
  const activePointForOverlays =
    primaryPointsForOverlays[primaryActiveIndex] || primaryPointsForOverlays.find((p) => !p.discontinuity);

  const fixOverlays = buildFixOverlays(state, primaryPointsForOverlays, activePointForOverlays);
  const anchorZones = buildAnchorZones(state, resolvedEfis, primaryActiveIndex, primaryRouteItems);

  return {
    aircraft: state.aircraft,
    style: aircraftStyle,
    mode: resolvedEfis.mode,
    range: resolvedEfis.range,
    origin: state.flightPlan.origin || state.route.origin || '',
    destination: state.flightPlan.destination || state.route.destination || '',
    procedureLabel: buildProcedureLabel(state),
    activeRoutePoints: activeRouteData.points,
    activeRouteSegments: activeRouteData.segments,
    pendingRoutePoints: pendingRouteData.points,
    pendingRouteSegments: pendingRouteData.segments,
    backgroundAirports: buildBackgroundPoints(
      state,
      resolvedEfis.overlays.arpt,
      'airport',
      projectionContext,
      activeRouteItems,
    ),
    backgroundWaypoints: buildBackgroundPoints(
      state,
      resolvedEfis.overlays.wpt || resolvedEfis.overlays.sta,
      'waypoint',
      projectionContext,
      activeRouteItems,
    ),
    fixOverlays,
    holdOverlay: buildHoldOverlay(state, primaryPointsForOverlays, activePointForOverlays),
    tcasTargets: buildTCASTargets(state, resolvedEfis, isCentered),
    wxrData: buildWXRData(state, resolvedEfis, isCentered, projectionContext),
    verticalProfilePoints: buildVerticalProfilePoints(state, primaryPointsForOverlays, primaryActiveIndex),
    anchorZones,
    overlays: visibleOverlays,
    isModified: state.isModified,
    centered: isCentered,
    heading: state.aircraftState?.heading || 0,
    track: state.aircraftState?.track || state.aircraftState?.heading || 0,
    selectedHeading:
      aircraftStyle === 'boeing' ? state.autopilot.boeing.heading : (state.autopilot.airbus.heading ?? null),
    lnavActive: state.autopilot.truth.lateralActive === 'LNAV' || state.autopilot.truth.lateralActive === 'NAV',
    selectedCourse: aircraftStyle === 'boeing' ? state.autopilot.boeing.courseL : null,
    irsState: state.position.irsState,
    navSource: state.activeNavSource,
    anpNm: state.navPerformance.anpNm,
    rnpNm: state.navPerformance.rnpNm,
    radios: state.radios,
    aircraftPosition: aircraftPos,
    aircraftAltitude: state.aircraftState?.altitude || 0,
  };
}

function buildProcedureLabel(state: FMCState): string {
  const route = state.isModified && state.pendingRoute ? state.pendingRoute : state.route;

  if (route.directTo) return `DIR ${route.directTo}`;

  const parts = [route.sid, route.star, route.approach, route.runway ? `RW${route.runway}` : ''].filter(Boolean);

  return parts.length ? parts.join(' / ') : 'NO PROC';
}

function isDisplayCentered(style: 'airbus' | 'boeing', mode: string, efisCentered: boolean): boolean {
  if (style === 'airbus') {
    return mode === 'PLAN' || mode.startsWith('ROSE');
  }
  return efisCentered || mode === 'PLN' || mode === 'APP' || mode === 'VOR';
}

function buildTCASTargets(state: FMCState, efis: EFISState, isCentered: boolean): TCASTarget[] {
  if (!efis.overlays.tfc) return [];
  const cy = isCentered ? 50 : 84;

  return (state.trafficTargets || []).map((t) => ({
    ...t,
    y: cy + (t.y - 50),
  }));
}

function buildWXRData(
  state: FMCState,
  efis: EFISState,
  isCentered: boolean,
  projectionContext: NDProjectionContext,
): WXRData | null {
  if (!efis.overlays.wxr) return null;

  const acPos = projectionContext.aircraftPosition;
  const rangeNm = projectionContext.rangeNm;

  // Proportional weather cell cluster placed relative to range and heading
  const cells: { dist: number; angleOffset: number; intensity: WXRPoint['intensity']; r: number }[] = [
    { dist: rangeNm * 0.38, angleOffset: 12, intensity: 'light', r: 5 },
    { dist: rangeNm * 0.46, angleOffset: 18, intensity: 'medium', r: 8 },
    { dist: rangeNm * 0.43, angleOffset: 15, intensity: 'heavy', r: 4 },
    { dist: rangeNm * 0.54, angleOffset: 24, intensity: 'medium', r: 6 },
  ];

  const points: WXRPoint[] = [];

  for (const c of cells) {
    const bearingRad = ((projectionContext.heading + c.angleOffset) * Math.PI) / 180;
    const lat = acPos.lat + (c.dist * Math.cos(bearingRad)) / 60;
    const lon = acPos.lon + (c.dist * Math.sin(bearingRad)) / (60 * Math.cos((acPos.lat * Math.PI) / 180));

    const p = projectGeoPointToND({ lat, lon }, projectionContext);
    if (p) {
      points.push({
        x: p.x,
        y: p.y,
        r: c.r,
        intensity: c.intensity,
      });
    }
  }

  return {
    intensity: 'medium',
    points,
  };
}

import { VerticalProfileEngine } from './VerticalProfileEngine';

function buildVerticalProfilePoints(
  state: FMCState,
  routePoints: NDRoutePoint[],
  activeIndex: number,
): VerticalProfilePoint[] {
  const acState = state.aircraftState;
  if (!acState || routePoints.length < 2 || activeIndex < 0) return [];

  const currentAlt = acState.altitude || 0;
  const targetAlt = state.performance.crzAlt || 30000; // Placeholder for real constraint

  // Only show T/D if we are above the next constraint or destination
  if (currentAlt < 5000) return [];

  // Find a target altitude (simplified: use 3000ft for destination)
  const destAlt = 3000;
  const distToTd = VerticalProfileEngine.computeTopOfDescent(currentAlt, destAlt);

  if (distToTd <= 0 || distToTd > 200) return [];

  // Find where on the route the T/D is
  // We'll place it 'distToTd' NM before the destination
  const destPoint = routePoints[routePoints.length - 1];
  if (!destPoint || destPoint.distanceNm === undefined) return [];

  const tdDistance = destPoint.distanceNm - distToTd;
  if (tdDistance < 0) return [];

  // Interpolate position (very simplified)
  // Real implementation would walk the segments
  const activePoint = routePoints[activeIndex];
  if (!activePoint || activePoint.distanceNm === undefined) return [];

  const totalDist = destPoint.distanceNm - (activePoint.distanceNm || 0);
  const ratio = (tdDistance - (activePoint.distanceNm || 0)) / (totalDist || 1);

  if (ratio < 0 || ratio > 1) return [];

  return [
    {
      label: 'T/D',
      x: activePoint.x + (destPoint.x - activePoint.x) * ratio,
      y: activePoint.y + (destPoint.y - activePoint.y) * ratio,
    },
  ];
}

function createDefaultEFIS(aircraft: AircraftType, side: 'L' | 'R'): EFISState {
  return {
    mode: aircraft === 'AIRBUS_A320' ? 'ARC' : 'MAP',
    range: 40,
    overlays: {
      wpt: true,
      arpt: true,
      sta: true,
      data: true,
      pos: false,
      terr: false,
      wxr: false,
      tfc: true,
      cstr: aircraft === 'AIRBUS_A320',
    },
    centered: false,
    side,
  };
}

interface RouteItem {
  ident: string;
  lat?: number;
  lon?: number;
  coordinateSource: 'navdb' | 'simbrief' | 'manual' | 'synthetic' | 'unknown' | 'UNRESOLVED';
  discontinuity: boolean;
  airport: boolean;
  navaid?: boolean;
  altitudeLabel: string | null;
  speedLabel: string | null;
}

function enrichRouteItemCoordinates(
  ident: string,
  kind: 'airport' | 'waypoint',
  existingLat?: number,
  existingLon?: number,
  existingSource?: RouteItem['coordinateSource'],
): {
  lat?: number;
  lon?: number;
  coordinateSource: RouteItem['coordinateSource'];
} {
  if (existingLat !== undefined && existingLon !== undefined) {
    return {
      lat: existingLat,
      lon: existingLon,
      coordinateSource: existingSource || 'simbrief',
    };
  }

  const dbPoint = getAirportCoordinates(ident) || getWaypointCoordinates(ident);

  if (dbPoint) {
    return {
      lat: dbPoint.lat,
      lon: dbPoint.lon,
      coordinateSource: 'navdb',
    };
  }

  return {
    lat: undefined,
    lon: undefined,
    coordinateSource: 'unknown',
  };
}

function buildRouteItems(flightPlan: FMCState['flightPlan'], route: FMCState['route']): RouteItem[] {
  const origin = flightPlan.origin || route.origin;
  const destination = flightPlan.destination || route.destination;
  const points: RouteItem[] = [];

  if (origin) {
    const enriched = enrichRouteItemCoordinates(origin, 'airport');
    points.push({
      ident: origin,
      ...enriched,
      discontinuity: false,
      airport: true,
      altitudeLabel: null,
      speedLabel: null,
    });
  }

  for (const waypoint of flightPlan.waypoints) {
    const enriched = enrichRouteItemCoordinates(
      waypoint.ident,
      isAirportWaypoint(waypoint, destination) ? 'airport' : 'waypoint',
      waypoint.lat,
      waypoint.lon,
      waypoint.coordinateSource,
    );

    points.push({
      ident: waypoint.ident,
      ...enriched,
      discontinuity: waypoint.discontinuity,
      airport: isAirportWaypoint(waypoint, destination),
      altitudeLabel: formatAltitudeConstraint(waypoint),
      speedLabel: formatSpeedConstraint(waypoint),
    });
  }

  if (destination && !points.some((point) => point.ident === destination)) {
    const enriched = enrichRouteItemCoordinates(destination, 'airport');
    points.push({
      ident: destination,
      ...enriched,
      discontinuity: false,
      airport: true,
      altitudeLabel: null,
      speedLabel: null,
    });
  }

  return points;
}

function isAirportWaypoint(waypoint: FlightPlanWaypoint, destination?: string | null): boolean {
  return waypoint.ident === destination || (/^[A-Z]{4}$/.test(waypoint.ident) && !waypoint.discontinuity);
}

function findActiveRouteIndex(routeItems: RouteItem[], directTo?: string): number {
  if (directTo) {
    const directIndex = routeItems.findIndex((item) => !item.discontinuity && item.ident === directTo);
    if (directIndex >= 0) return directIndex;
  }

  // Find first non-discontinuity waypoint that is not an airport (the real waypoints)
  const waypointIndex = routeItems.findIndex((item) => !item.discontinuity && !item.airport);
  if (waypointIndex >= 0) return waypointIndex;

  // Fallback to first non-discontinuity point (e.g. destination if no waypoints)
  const fallbackIndex = routeItems.findIndex((item, i) => i > 0 && !item.discontinuity);
  return fallbackIndex >= 0 ? fallbackIndex : 0;
}

function projectRoutePoint(
  item: RouteItem,
  index: number,
  total: number,
  isPlan: boolean,
  active: boolean,
  centered: boolean,
  projected: ProjectedNDPoint | null,
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
      relativeBearingDeg: projected.relativeBearingDeg,
    };
  }

  const progress = total <= 1 ? 0.5 : index / (total - 1);

  let x: number, y: number;
  // If we lack projection coordinates, use a simple synthetic fallback
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
  if (!constraint || waypoint.discontinuity) return null;

  const altitude = constraint.altitude.toString();
  switch (constraint.type) {
    case 'AT':
      return constraint.altitude >= 18000
        ? `FL${Math.round(constraint.altitude / 100)
            .toString()
            .padStart(3, '0')}`
        : altitude;
    case 'AT_OR_ABOVE':
      return `${altitude}A`;
    case 'AT_OR_BELOW':
      return `${altitude}B`;
    case 'BETWEEN':
      return `${altitude}B${constraint.altitude2 ?? ''}A`;
    default:
      return null;
  }
}

function formatSpeedConstraint(waypoint: FlightPlanWaypoint): string | null {
  const constraint = waypoint.speedConstraint;
  if (!constraint || waypoint.discontinuity) return null;

  switch (constraint.type) {
    case 'AT':
      return constraint.speed.toString();
    case 'AT_OR_ABOVE':
      return `${constraint.speed}A`;
    case 'AT_OR_BELOW':
      return `${constraint.speed}B`;
    default:
      return null;
  }
}

function buildFixOverlays(state: FMCState, routePoints: NDRoutePoint[], activePoint?: NDRoutePoint): NDFixOverlay[] {
  const entries = state.fixEntries.some((entry) => entry.refFix) ? state.fixEntries : [state.fix];
  return entries
    .filter((entry) => entry.refFix)
    .slice(0, 2)
    .map((entry, index) => {
      const point = routePoints.find((p) => p.label === entry.refFix) ?? activePoint;
      const x = point?.x ?? 58 + index * 8;
      const y = point?.y ?? 46 + index * 6;
      const radius = entry.distance * (40 / state.efisL.range); // Scale nm to screen units
      const angleRad = ((entry.radial - 180) * Math.PI) / 180;

      return {
        refFix: entry.refFix,
        radial: entry.radial,
        distance: entry.distance,
        x,
        y,
        radialX: x + Math.sin(angleRad) * radius * 2, // Arbitrary line length
        radialY: y - Math.cos(angleRad) * radius * 2,
        radius,
      };
    });
}

function buildHoldOverlay(
  state: FMCState,
  routePoints: NDRoutePoint[],
  activePoint?: NDRoutePoint,
): NDHoldOverlay | null {
  const hold = state.holdPending ?? state.hold;
  if (!hold.fix) return null;
  const point = routePoints.find((p) => p.label === hold.fix) ?? activePoint;
  return { ...hold, x: point?.x ?? 50, y: point?.y ?? 48, visible: true };
}

function buildAnchorZones(
  state: FMCState,
  efis: EFISState,
  activeIndex: number,
  routeItems: RouteItem[],
): NDAnchorZones {
  const aircraftState = state.aircraftState;
  const aircraftPos = getAircraftPositionWithFallback(state);
  const activeWP = routeItems[activeIndex];
  const gs = aircraftState?.gs ?? 0;

  let waypointBlock: NDAnchorZones['waypointBlock'] = null;
  if (activeWP && activeWP.lat !== undefined && activeWP.lon !== undefined) {
    const target = { lat: activeWP.lat, lon: activeWP.lon };
    const dist = distanceNm(aircraftPos, target);
    const brg = bearingDeg(aircraftPos, target);

    const eteMinutes = gs > 50 ? (dist / gs) * 60 : 0;
    const etaDate = new Date(Date.now() + eteMinutes * 60000);
    const etaStr = `${String(etaDate.getUTCHours()).padStart(2, '0')}:${String(etaDate.getUTCMinutes()).padStart(2, '0')}z`;
    const eteStr =
      eteMinutes > 60 ? `${Math.floor(eteMinutes / 60)}h${Math.round(eteMinutes % 60)}m` : `${Math.round(eteMinutes)}m`;

    waypointBlock = {
      ident: activeWP.ident,
      brg: Math.round(brg),
      dist: Math.round(dist * 10) / 10,
      eta: etaStr,
      ete: eteStr,
    };
  }

  return {
    speedBlock: { tas: aircraftState?.tas ?? 0, gs },
    windBlock: { dir: state.takeoff.windDir, speed: state.takeoff.windSpeed },
    waypointBlock,
    navaidBlocks: [],
    annunciations: state.isModified ? ['MOD'] : [],
  };
}

function processRoute(
  routeItems: RouteItem[],
  directTo: string | undefined,
  isModified: boolean,
  projectionContext: NDProjectionContext,
  isPlanMode: boolean,
  isCentered: boolean,
  efis: EFISState,
  visibleOverlays: EFISState['overlays'],
): { points: NDRoutePoint[]; segments: NDRouteSegment[] } {
  const activeIndex = findActiveRouteIndex(routeItems, directTo);

  const routePoints = routeItems.map((item, index) => {
    let projected: ProjectedNDPoint | null = null;
    if (item.lat !== undefined && item.lon !== undefined) {
      projected = projectGeoPointToND({ lat: item.lat, lon: item.lon }, projectionContext);
    }

    return projectRoutePoint(
      item,
      index,
      routeItems.length,
      isPlanMode,
      index === activeIndex && !isModified,
      isCentered,
      projected,
    );
  });

  const routeSegments = routePoints
    .slice(1)
    .map((point, index) => {
      const from = routePoints[index];
      const to = point;
      const hasDiscontinuity = from.discontinuity || to.discontinuity;

      const clipped = clipRouteSegment(from, to, isCentered);

      // A segment is active if it's on or after the path to the active waypoint
      const active = index >= activeIndex - 1;

      return {
        from,
        to,
        x1: clipped.x1,
        y1: clipped.y1,
        x2: clipped.x2,
        y2: clipped.y2,
        dashed: hasDiscontinuity || !active || isModified,
        active,
        modified: isModified,
        visible: clipped.visible && !hasDiscontinuity && from.visible && to.visible,
        clipped: clipped.clipped,
      };
    })
    .filter((s) => s.visible);

  // 1. Add aircraft-to-active segment if appropriate (not in PLAN mode)
  if (!isPlanMode && activeIndex >= 0) {
    const activePoint = routePoints[activeIndex];
    if (activePoint) {
      const cy = isCentered ? 50 : 84;
      const aircraftPoint: NDRoutePoint = {
        x: 50,
        y: cy,
        visible: true,
        clipped: false,
        active: true,
        discontinuity: false,
        airport: false,
        label: '',
        id: 'aircraft',
        altitudeLabel: null,
        speedLabel: null,
      };
      const clipped = clipRouteSegment(aircraftPoint, activePoint, isCentered);

      if (clipped.visible) {
        routeSegments.unshift({
          from: aircraftPoint,
          to: activePoint,
          x1: clipped.x1,
          y1: clipped.y1,
          x2: clipped.x2,
          y2: clipped.y2,
          dashed: isModified,
          active: true,
          modified: isModified,
          visible: true,
          clipped: clipped.clipped,
        });
      }
    }
  }

  return {
    points: routePoints.filter((p) => isPointVisible(p, efis, visibleOverlays)),
    segments: routeSegments,
  };
}

function buildBackgroundPoints(
  state: FMCState,
  enabled: boolean,
  type: 'airport' | 'waypoint',
  context: NDProjectionContext,
  activeRouteItems: RouteItem[],
): NDRoutePoint[] {
  if (!enabled) return [];

  const db = type === 'airport' ? getAllAirports() : getAllWaypoints();
  const activeIdents = new Set(activeRouteItems.map((item) => item.ident));
  const points: NDRoutePoint[] = [];

  const aircraftLat = context.aircraftPosition.lat;
  const aircraftLon = context.aircraftPosition.lon;
  const maxDistNm = context.rangeNm + 50;
  const maxDeltaLat = maxDistNm / 60;
  const cosLat = Math.cos((Math.max(-75, Math.min(75, aircraftLat)) * Math.PI) / 180);
  const maxDeltaLon = maxDistNm / (60 * Math.max(0.1, cosLat));

  Object.entries(db).forEach(([ident, pos], index) => {
    if (activeIdents.has(ident)) return;

    const dLat = Math.abs(pos.lat - aircraftLat);
    const dLon = Math.abs(pos.lon - aircraftLon);
    if (dLat > maxDeltaLat || dLon > maxDeltaLon) return;

    const projected = projectGeoPointToND(pos, context);
    if (projected && projected.visible) {
      points.push({
        id: `bg-${type}-${ident}-${index}`,
        label: ident,
        altitudeLabel: null,
        speedLabel: null,
        x: projected.x,
        y: projected.y,
        active: false,
        discontinuity: false,
        airport: type === 'airport',
        navaid: type === 'waypoint',
        visible: true,
        clipped: projected.clipped,
      });
    }
  });

  return points;
}
