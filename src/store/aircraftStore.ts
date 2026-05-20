import { create } from 'zustand';
import type {
  AircraftType,
  AircraftState,
  IrsState,
  NavSource,
  NavSensor,
  NavigationPerformance,
  AltitudeConstraint,
  SpeedConstraint,
} from '@shared';

export interface BoeingAnnunciators {
  msg: boolean;
  exec: boolean;
  fail: boolean;
  ofst: boolean;
}

export interface AirbusAnnunciators {
  fm1: boolean;
  fm2: boolean;
  ind: boolean;
  rdy: boolean;
  fail: boolean;
  fm: boolean;
  mcduMenu: boolean;
}

export interface AircraftStore {
  aircraft: AircraftType;
  ident: { aircraftType: string; engRating: string; navDataVersion: string; opProgram: string };
  position: {
    refAirport: string;
    gate: string;
    lat: number;
    lon: number;
    irsState: IrsState;
    irsAlignmentProgress: number;
    irsTimeRemaining: number;
  };
  performance: {
    crzAlt: number;
    costIndex: number;
    zfw: number;
    fuel: number;
    cg: number;
    reserve: number;
    grossWeight: number;
  };
  takeoff: {
    runway: string;
    toMode: string;
    assumedTemp: number;
    v1: number;
    vr: number;
    v2: number;
    trim: number;
    oat: number;
    windDir: number;
    windSpeed: number;
    qnh: number;
  };
  landing: { runway: string; flaps: string; vref: number; ilsFrequency: string; course: number };

  aircraftState: AircraftState | null;
  navPerformance: NavigationPerformance;
  activeNavSource: NavSource;
  sensors: NavSensor[];
  radios: { vor1: string; vor2: string; adf1: string };

  signsOn: boolean;
  windowsLocked: boolean;

  boeingAnnunciators: BoeingAnnunciators;
  airbusAnnunciators: AirbusAnnunciators;

  setAircraft: (type: AircraftType) => void;
  setAircraftState: (state: AircraftState | null) => void;
  setIrsMode: (mode: IrsState) => void;
  toggleSigns: (playChime?: boolean) => void;
  toggleWindows: () => void;
  updateRadios: (update: Partial<AircraftStore['radios']>) => void;
  setBoeingAnnunciators: (update: Partial<BoeingAnnunciators>) => void;
  setAirbusAnnunciators: (update: Partial<AirbusAnnunciators>) => void;
}

export const useAircraftStore = create<AircraftStore>((set) => ({
  aircraft:
    (typeof window !== 'undefined' ? (localStorage.getItem('cdu-aircraft-type') as AircraftType) : null) ||
    'BOEING_737',
  ident: { aircraftType: '737-800', engRating: '26K', navDataVersion: 'FMC21A1', opProgram: '2247662-03' },
  position: {
    refAirport: '',
    gate: '',
    lat: 0,
    lon: 0,
    irsState: 'OFF',
    irsAlignmentProgress: 0,
    irsTimeRemaining: 600,
  },
  performance: { crzAlt: 0, costIndex: 0, zfw: 0, fuel: 0, cg: 0, reserve: 0, grossWeight: 0 },
  takeoff: {
    runway: '',
    toMode: 'TO',
    assumedTemp: 0,
    v1: 0,
    vr: 0,
    v2: 0,
    trim: 0,
    oat: 0,
    windDir: 0,
    windSpeed: 0,
    qnh: 0,
  },
  landing: { runway: '', flaps: '', vref: 0, ilsFrequency: '', course: 0 },

  aircraftState: null,
  navPerformance: {
    anp: 2.0,
    rnp: 2.0,
    anpNm: 2.0,
    rnpNm: 2.0,
    xteNm: 0,
    rnpManual: false,
    activeSource: 'IRS',
    phase: 'ENROUTE',
  },
  activeNavSource: 'IRS',
  sensors: [
    { source: 'GPS', available: true, positionErrorNm: 0.05 },
    { source: 'DME_DME', available: false, positionErrorNm: 0.15 },
    { source: 'IRS', available: true, positionErrorNm: 2.0 },
  ],
  radios: { vor1: '113.90', vor2: '115.70', adf1: '342' },

  signsOn: false,
  windowsLocked: false,

  boeingAnnunciators: { msg: false, exec: false, fail: false, ofst: false },
  airbusAnnunciators: { fm1: false, fm2: false, ind: false, rdy: false, fail: false, fm: false, mcduMenu: false },

  setAircraft: (type) => {
    set({ aircraft: type });
    if (typeof window !== 'undefined') {
      localStorage.setItem('cdu-aircraft-type', type);
    }
    // This will be synchronized with useFMCStore via subscription or direct call
  },
  setAircraftState: (state) => set({ aircraftState: state }),
  setIrsMode: (mode) => set((state) => ({ position: { ...state.position, irsState: mode } })),
  toggleSigns: () => set((state) => ({ signsOn: !state.signsOn })),
  toggleWindows: () => set((state) => ({ windowsLocked: !state.windowsLocked })),
  updateRadios: (update) => set((state) => ({ radios: { ...state.radios, ...update } })),
  setBoeingAnnunciators: (update) =>
    set((state) => ({ boeingAnnunciators: { ...state.boeingAnnunciators, ...update } })),
  setAirbusAnnunciators: (update) =>
    set((state) => ({ airbusAnnunciators: { ...state.airbusAnnunciators, ...update } })),
}));
