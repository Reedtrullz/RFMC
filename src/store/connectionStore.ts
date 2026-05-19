import { create } from 'zustand';
import type {
  FMCMode,
  ConnectionStatus,
  ConnectionMode,
  AircraftType,
  AdapterCapabilities,
  AdapterHealth,
  DisplayData,
} from '@shared';

export interface ConnectionState {
  mode: FMCMode;
  connectionStatus: ConnectionStatus;
  connectionMode: ConnectionMode;
  connectedAircraft: string | null;
  connectedAircraftType: AircraftType | null;
  connectedCapabilities: string[] | null;
  structuredCapabilities: AdapterCapabilities | null;
  adapterHealth: AdapterHealth | null;
  lastError: string | null;
  simVariables: Record<string, number>;
  failureMessage: null | string;
  externalDisplayData: null | DisplayData;
  latency: number;
  sessionStartTime: number | null;
}

export interface ConnectionActions {
  setMode: (mode: FMCMode) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setConnectionMode: (mode: ConnectionMode) => void;
  setSimVariables: (variables: Record<string, number>) => void;
  setConnectedAircraft: (
    aircraft: string | null,
    capabilities?: string[] | null,
    aircraftType?: AircraftType | null,
  ) => void;
  setConnectedLastError: (error: string | null) => void;
  setExternalDisplayData: (data: DisplayData | null) => void;
  setFailureMode: (mode: 'FAIL' | 'OFF', message?: string) => void;
  clearFailureMode: () => void;
  setLatency: (ms: number) => void;
}

export type ConnectionStore = ConnectionState & ConnectionActions;

export const useConnectionStore = create<ConnectionStore>((set) => ({
  mode: 'STANDBY',
  connectionStatus: 'DISCONNECTED',
  connectionMode: 'STANDALONE',
  connectedAircraft: null,
  connectedAircraftType: null,
  connectedCapabilities: null,
  structuredCapabilities: null,
  adapterHealth: null,
  lastError: null,
  simVariables: {},
  failureMessage: null,
  externalDisplayData: null,
  latency: 0,
  sessionStartTime: null,

  setMode: (mode: FMCMode) => set({ mode }),
  setConnectionStatus: (status: ConnectionStatus) => set({ connectionStatus: status }),
  setConnectionMode: (mode: ConnectionMode) => set({ connectionMode: mode }),
  setSimVariables: (variables: Record<string, number>) => set({ simVariables: variables }),

  setConnectedAircraft: (
    aircraft: string | null,
    capabilities: string[] | null = null,
    aircraftType: AircraftType | null = null,
  ) => set({ connectedAircraft: aircraft, connectedCapabilities: capabilities, connectedAircraftType: aircraftType }),

  setConnectedLastError: (error: string | null) => set({ lastError: error }),
  setExternalDisplayData: (data: DisplayData | null) => set({ externalDisplayData: data }),

  setFailureMode: (mode: 'FAIL' | 'OFF', message?: string) =>
    set({ connectionStatus: mode === 'FAIL' ? 'ERROR' : 'DISCONNECTED', failureMessage: message || null }),

  clearFailureMode: () => set({ failureMessage: null }),
  setLatency: (ms: number) => set({ latency: ms }),
}));
