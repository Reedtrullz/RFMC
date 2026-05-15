export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface InstrumentGeometryProfile {
  outerWidthMm: number;
  outerHeightMm: number;
  screenRect: Rect;
  screwPositions: (Point & { rotation: number })[];
  bezelRadiusMm: number;
  recessDepthMm: number;
  labelPosition?: Point;
}

export const BOEING_CDU_GEOMETRY: InstrumentGeometryProfile = {
  outerWidthMm: 146,
  outerHeightMm: 228,
  screenRect: { x: 22, y: 15, width: 102, height: 78 },
  screwPositions: [
    { x: 12, y: 12, rotation: 12 },
    { x: 134, y: 12, rotation: -24 },
    { x: 12, y: 216, rotation: 47 },
    { x: 134, y: 216, rotation: -8 },
  ],
  bezelRadiusMm: 5,
  recessDepthMm: 8,
  labelPosition: { x: 20, y: 10 },
};

export const AIRBUS_MCDU_GEOMETRY: InstrumentGeometryProfile = {
  outerWidthMm: 146,
  outerHeightMm: 228,
  screenRect: { x: 15, y: 15, width: 116, height: 86 },
  screwPositions: [
    { x: 8, y: 8, rotation: 0 },
    { x: 138, y: 8, rotation: 90 },
    { x: 8, y: 220, rotation: 180 },
    { x: 138, y: 220, rotation: 270 },
  ],
  bezelRadiusMm: 2,
  recessDepthMm: 4,
};

export const BOEING_ND_GEOMETRY: InstrumentGeometryProfile = {
  outerWidthMm: 184,
  outerHeightMm: 184,
  screenRect: { x: 15, y: 15, width: 154, height: 154 },
  screwPositions: [
    { x: 8, y: 8, rotation: 45 },
    { x: 176, y: 8, rotation: -45 },
    { x: 8, y: 176, rotation: 135 },
    { x: 176, y: 176, rotation: -135 },
  ],
  bezelRadiusMm: 8,
  recessDepthMm: 12,
};

export const AIRBUS_ND_GEOMETRY: InstrumentGeometryProfile = {
  outerWidthMm: 184,
  outerHeightMm: 184,
  screenRect: { x: 13, y: 13, width: 158, height: 158 },
  screwPositions: [
    { x: 6, y: 6, rotation: 0 },
    { x: 178, y: 6, rotation: 90 },
    { x: 6, y: 178, rotation: 180 },
    { x: 178, y: 178, rotation: 270 },
  ],
  bezelRadiusMm: 4,
  recessDepthMm: 8,
};

export const BOEING_MCP_GEOMETRY: InstrumentGeometryProfile = {
  outerWidthMm: 470,
  outerHeightMm: 76,
  screenRect: { x: 10, y: 10, width: 450, height: 56 },
  screwPositions: [
    { x: 8, y: 8, rotation: 15 },
    { x: 462, y: 8, rotation: -20 },
    { x: 8, y: 68, rotation: 45 },
    { x: 462, y: 68, rotation: -30 },
    { x: 235, y: 8, rotation: 0 },
    { x: 235, y: 68, rotation: 180 },
  ],
  bezelRadiusMm: 3,
  recessDepthMm: 5,
};

export const AIRBUS_FCU_GEOMETRY: InstrumentGeometryProfile = {
  outerWidthMm: 255,
  outerHeightMm: 76,
  screenRect: { x: 8, y: 8, width: 239, height: 60 },
  screwPositions: [
    { x: 5, y: 5, rotation: 0 },
    { x: 250, y: 5, rotation: 90 },
    { x: 5, y: 71, rotation: 180 },
    { x: 250, y: 71, rotation: 270 },
  ],
  bezelRadiusMm: 2,
  recessDepthMm: 4,
};
