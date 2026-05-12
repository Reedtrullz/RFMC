export type InstrumentTarget =
  | 'boeingCdu'
  | 'airbusMcdu'
  | 'boeingNd'
  | 'boeingPfd'
  | 'boeingMcp';

export interface InstrumentDimensions {
  idealWidth: number;
  idealHeight: number;
  minReadableWidth: number;
  maxWidth: number;
}

export const instrumentDimensions: Record<InstrumentTarget, InstrumentDimensions> = {
  boeingCdu: {
    idealWidth: 540,
    idealHeight: 780,
    minReadableWidth: 430,
    maxWidth: 620,
  },
  airbusMcdu: {
    idealWidth: 520,
    idealHeight: 800,
    minReadableWidth: 430,
    maxWidth: 600,
  },
  boeingNd: {
    idealWidth: 520,
    idealHeight: 560,
    minReadableWidth: 400,
    maxWidth: 620,
  },
  boeingPfd: {
    idealWidth: 450,
    idealHeight: 560,
    minReadableWidth: 360,
    maxWidth: 560,
  },
  boeingMcp: {
    idealWidth: 1200,
    idealHeight: 240,
    minReadableWidth: 850,
    maxWidth: 1360,
  },
};
