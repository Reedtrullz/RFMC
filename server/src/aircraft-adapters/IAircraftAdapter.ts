import type {
  AircraftType,
  ConnectionStatus,
  AircraftState as SharedAircraftState,
  RadioData,
} from '@virtual-cdu/shared';

/**
 * Generic aircraft adapter interface for reading/writing CDU state.
 * Each supported aircraft implements this interface.
 */

/** Raw CDU display data returned by the aircraft */
export interface CDUDisplayData {
  /** 24 x 24 character screen buffer (raw) */
  lines: string[];
  /** Page title */
  title: string;
  /** Brightness level from 0.0 to 1.0 */
  brightness: number;
}

/** Aircraft dynamic state (position, heading, speed, etc.) */
export interface AdapterAircraftState extends SharedAircraftState {
  radios?: RadioData;
}

export interface IAircraftAdapter {
  /** Human-readable name for logging and UI */
  readonly name: string;

  /** Aircraft type identifier (Boeing or Airbus) */
  readonly aircraftType: AircraftType;

  /** Available data capabilities from this adapter (e.g. 'position', 'heading', 'speed', 'display') */
  readonly capabilities: string[];

  /** Current connection status */
  connectionStatus: ConnectionStatus;

  /** Last error message, or null if no error */
  lastError: string | null;

  /** Whether the adapter is currently connected (convenience alias for connectionStatus === 'CONNECTED') */
  isConnected: boolean;

  /** Try to connect/discover this aircraft in MSFS */
  connect(): Promise<boolean>;

  /** Disconnect from aircraft */
  disconnect(): Promise<void>;

  /** Poll the current CDU display data */
  readDisplay(): Promise<CDUDisplayData>;

  /** Send a CDU keypress to the aircraft */
  sendKeypress(key: string): Promise<void>;

  /** Send a Line Select Key press (L1-L6, R1-R6) */
  sendLSK(side: 'L' | 'R', index: number): Promise<void>;

  /** Read the current aircraft state (position, heading, speed, etc.) */
  readAircraftState(): Promise<AdapterAircraftState>;
}
