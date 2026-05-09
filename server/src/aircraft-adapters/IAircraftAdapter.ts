/**
 * Generic aircraft adapter interface for reading/writing CDU state.
 * Each supported aircraft implements this interface.
 */

export interface CDUDisplayData {
  lines: string[];        // 24 x 24 character screen buffer (raw)
  title: string;
  brightness: number;     // 0.0 - 1.0
}

export interface IAircraftAdapter {
  /** Human-readable name for logging and UI */
  readonly name: string;

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

  /** Whether the adapter is currently connected */
  isConnected: boolean;
}
