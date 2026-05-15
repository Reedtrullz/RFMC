export interface CDUGeometryTokens {
  shell: {
    widthMm: number;
    heightMm: number;
    cornerRadiusMm: number;
    bezelThicknessMm: number;
  };
  screen: {
    widthMm: number;
    heightMm: number;
    rows: number;
    cols: number;
    rowHeightMm: number;
    charWidthMm: number;
    scratchpadHeightMm: number;
    recessDepthMm: number;
  };
  keypad: {
    keySizeMm: number;
    keySpacingMm: number;
    rows: number;
    cols: number;
  };
  annunciators: {
    sizeMm: { w: number; h: number };
    spacingMm: number;
  };
  lsk: {
    heightMm: number;
    spacingMm: number;
    insetMm: number;
  };
}

export const BOEING_737_CDU_TOKENS: CDUGeometryTokens = {
  shell: {
    widthMm: 146,
    heightMm: 228,
    cornerRadiusMm: 6,
    bezelThicknessMm: 12,
  },
  screen: {
    widthMm: 102,
    heightMm: 78,
    rows: 14,
    cols: 24,
    rowHeightMm: 5.5,
    charWidthMm: 4.25, // Based on 102/24
    scratchpadHeightMm: 8,
    recessDepthMm: 8,
  },
  keypad: {
    keySizeMm: 12,
    keySpacingMm: 16,
    rows: 5,
    cols: 7,
  },
  annunciators: {
    sizeMm: { w: 18, h: 8 },
    spacingMm: 4,
  },
  lsk: {
    heightMm: 10,
    spacingMm: 12.5, // Total height for 6 LSKs is approx 75mm
    insetMm: 8,
  },
};
