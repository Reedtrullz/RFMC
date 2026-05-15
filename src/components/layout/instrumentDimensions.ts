export type InstrumentTarget =
  | 'boeingCdu'
  | 'airbusMcdu'
  | 'boeingNd'
  | 'airbusNd'
  | 'boeingPfd'
  | 'airbusPfd'
  | 'boeingMcp'
  | 'airbusFcu';

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
  airbusNd: {
    idealWidth: 540,
    idealHeight: 540,
    minReadableWidth: 400,
    maxWidth: 650,
  },
  boeingPfd: {
    idealWidth: 450,
    idealHeight: 560,
    minReadableWidth: 360,
    maxWidth: 560,
  },
  airbusPfd: {
    idealWidth: 540,
    idealHeight: 540,
    minReadableWidth: 400,
    maxWidth: 650,
  },
  boeingMcp: {
    idealWidth: 1760,
    idealHeight: 300,
    minReadableWidth: 1180,
    maxWidth: 1760,
  },
  airbusFcu: {
    idealWidth: 1000,
    idealHeight: 180,
    minReadableWidth: 800,
    maxWidth: 1200,
  },
};
