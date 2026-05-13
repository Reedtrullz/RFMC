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
