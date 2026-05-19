import type { AircraftType, EFISState, NDMapMode } from '../types/fmc';
export type { NDMapMode };

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
  relativeBearingDeg?: number;
}

export interface NDRouteSegment {
  from: NDRoutePoint;
  to: NDRoutePoint;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  dashed: boolean;
  active: boolean;
  modified: boolean;
  visible: boolean;
  clipped: boolean;
  arcPath?: string; // SVG path data for curved segments
}

export interface NDFixOverlay {
  refFix: string;
  ident?: string;
  radial: number;
  distance: number;
  x: number;
  y: number;
  refX?: number;
  refY?: number;
  radialX: number;
  radialY: number;
  radius: number;
}

export interface NDHoldOverlay {
  fix: string;
  inboundCourse: number;
  legTime: number;
  legDist: number;
  direction: 'L' | 'R';
  x: number;
  y: number;
  visible: boolean;
  isPending?: boolean;
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

export interface WXRPoint {
  x: number;
  y: number;
  r: number;
  intensity: 'light' | 'medium' | 'heavy';
}

export interface WXRData {
  intensity: 'none' | 'light' | 'medium' | 'heavy';
  points: WXRPoint[];
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
  activeRoutePoints: NDRoutePoint[];
  activeRouteSegments: NDRouteSegment[];
  pendingRoutePoints: NDRoutePoint[];
  pendingRouteSegments: NDRouteSegment[];
  backgroundAirports: NDRoutePoint[];
  backgroundWaypoints: NDRoutePoint[];
  fixOverlays: NDFixOverlay[];
  holdOverlay: NDHoldOverlay | null;
  tcasTargets: TCASTarget[];
  wxrData: WXRData | null;
  verticalProfilePoints: VerticalProfilePoint[];
  anchorZones: NDAnchorZones;
  overlays: EFISState['overlays'];
  isModified: boolean;
  centered: boolean;
  heading: number;
  track: number;
  selectedHeading: number | null;
  lnavActive: boolean;
  selectedCourse: number | null;
  irsState: string;
  navSource: string;
  anpNm: number;
  rnpNm: number;
  radios?: {
    vor1: string;
    vor2: string;
    adf1: string;
  };
  aircraftPosition: { lat: number; lon: number };
  aircraftAltitude: number;
}
