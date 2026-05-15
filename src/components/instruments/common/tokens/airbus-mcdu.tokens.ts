import { CDUGeometryTokens } from './boeing-cdu.tokens';

export const AIRBUS_A320_MCDU_TOKENS: CDUGeometryTokens = {
  shell: {
    widthMm: 146,
    heightMm: 228,
    cornerRadiusMm: 4,
    bezelThicknessMm: 10,
  },
  screen: {
    widthMm: 116,
    heightMm: 86,
    rows: 14,
    cols: 24,
    rowHeightMm: 6.1,
    charWidthMm: 4.8,
    scratchpadHeightMm: 9,
    recessDepthMm: 4,
  },
  keypad: {
    keySizeMm: 11,
    keySpacingMm: 15,
    rows: 6,
    cols: 6,
  },
  annunciators: {
    sizeMm: { w: 15, h: 6 },
    spacingMm: 3,
  },
  lsk: {
    heightMm: 9,
    spacingMm: 14,
    insetMm: 6,
  },
};
