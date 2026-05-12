import type { AircraftType, ConnectionStatus } from '@shared';
import type { AircraftState, CDUDisplayData, IAircraftAdapter } from './IAircraftAdapter';

interface MockSimConnectOptions {
  aircraftType?: AircraftType;
  name?: string;
  latencyMs?: number;
  failConnect?: boolean;
}

const DEFAULT_DISPLAY: CDUDisplayData = {
  title: 'MOCK CDU',
  brightness: 1,
  lines: [
    '      MOCK CDU          ',
    '                        ',
    '  SIMCONNECT HARNESS    ',
    '                        ',
    '  READY                 ',
    '                        ',
    '                        ',
    '                        ',
    '                        ',
    '                        ',
    '                        ',
    '                        ',
    '                        ',
    '                        ',
  ],
};

export class MockSimConnectAdapter implements IAircraftAdapter {
  readonly name: string;
  readonly aircraftType: AircraftType;
  readonly capabilities = ['keyInput', 'displayReadback', 'scratchpadReadback', 'aircraftState', 'latencySimulation'];

  connectionStatus: ConnectionStatus = 'DISCONNECTED';
  lastError: string | null = null;

  private latencyMs: number;
  private failConnect: boolean;
  private display: CDUDisplayData = DEFAULT_DISPLAY;
  private keypresses: string[] = [];

  constructor(options: MockSimConnectOptions = {}) {
    this.aircraftType = options.aircraftType ?? 'BOEING_737';
    this.name = options.name ?? 'Mock SimConnect Adapter';
    this.latencyMs = options.latencyMs ?? 0;
    this.failConnect = options.failConnect ?? false;
  }

  get isConnected(): boolean {
    return this.connectionStatus === 'CONNECTED';
  }

  get recordedKeypresses(): readonly string[] {
    return this.keypresses;
  }

  async connect(): Promise<boolean> {
    this.connectionStatus = 'CONNECTING';
    await this.delay();
    if (this.failConnect) {
      this.connectionStatus = 'ERROR';
      this.lastError = 'MOCK CONNECT FAILURE';
      return false;
    }
    this.connectionStatus = 'CONNECTED';
    this.lastError = null;
    return true;
  }

  async disconnect(): Promise<void> {
    await this.delay();
    this.connectionStatus = 'DISCONNECTED';
  }

  async readDisplay(): Promise<CDUDisplayData> {
    this.ensureConnected();
    await this.delay();
    return this.display;
  }

  async sendKeypress(key: string): Promise<void> {
    this.ensureConnected();
    await this.delay();
    this.keypresses.push(key);
    this.display = {
      ...this.display,
      title: `KEY ${key}`,
      lines: [
        `KEY ${key}`.padEnd(24, ' '),
        `COUNT ${this.keypresses.length}`.padEnd(24, ' '),
        ...this.display.lines.slice(2),
      ],
    };
  }

  async sendLSK(side: 'L' | 'R', index: number): Promise<void> {
    await this.sendKeypress(`${side}${index}`);
  }

  async readAircraftState(): Promise<AircraftState> {
    this.ensureConnected();
    await this.delay();
    return {
      position: { lat: 40.6413, lon: -73.7781 },
      heading: 270,
      altitude: 12000,
      speed: 280,
      verticalSpeed: 0,
      radios: {
        vor1: '113.90',
        vor2: '115.70',
        adf1: '342',
      },
    };
  }

  setDisplay(display: CDUDisplayData): void {
    this.display = display;
  }

  setLatency(latencyMs: number): void {
    this.latencyMs = Math.max(0, latencyMs);
  }

  setConnectFailure(failConnect: boolean): void {
    this.failConnect = failConnect;
  }

  private ensureConnected(): void {
    if (!this.isConnected) {
      this.lastError = 'MOCK ADAPTER NOT CONNECTED';
      throw new Error(this.lastError);
    }
  }

  private delay(): Promise<void> {
    if (this.latencyMs <= 0) return Promise.resolve();
    return new Promise(resolve => setTimeout(resolve, this.latencyMs));
  }
}
