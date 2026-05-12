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
    idealWidth: 520,
    idealHeight: 760,
    minReadableWidth: 420,
    maxWidth: 620,
  },
  airbusMcdu: {
    idealWidth: 500,
    idealHeight: 780,
    minReadableWidth: 420,
    maxWidth: 600,
  },
  boeingNd: {
    idealWidth: 500,
    idealHeight: 560,
    minReadableWidth: 360,
    maxWidth: 620,
  },
  boeingPfd: {
    idealWidth: 430,
    idealHeight: 560,
    minReadableWidth: 340,
    maxWidth: 560,
  },
  boeingMcp: {
    idealWidth: 1360,
    idealHeight: 240,
    minReadableWidth: 850,
    maxWidth: 1360,
  },
};
