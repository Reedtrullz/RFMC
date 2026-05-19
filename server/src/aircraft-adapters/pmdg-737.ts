/**
 * PMDG 737 adapter - reads CDU display via SimConnect L: variables.
 *
 * PMDG 737 exposes the CDU screen as:
 *   L:PMDG_CDU_Screen_1_Row_X_Col_Y for each character position
 *   L:PMDG_CDU_Screen_1_Title for the title
 *
 * Falls back to mock data when MSFS/SimConnect is unavailable.
 */

import { open, Protocol, SimConnectConstants, SimConnectDataType, SimConnectPeriod, EventFlag } from 'node-simconnect';
import type { SimConnectConnection } from 'node-simconnect';
import type { IAircraftAdapter, CDUDisplayData, AdapterAircraftState } from './IAircraftAdapter';
import type { AircraftType, ConnectionStatus } from '@virtual-cdu/shared';
import { devLog, devError, devWarn } from '@virtual-cdu/shared';

export type PMDGVariant = '737-600' | '737-700' | '737-800' | '737-900';

interface SimState {
  lat: number;
  lon: number;
  headingDeg: number;
  trackDeg: number;
  altitudeFt: number;
  indicatedAirspeedKt: number;
  trueAirspeedKt: number;
  groundSpeedKt: number;
  verticalSpeedFpm: number;
  pitchDeg: number;
  bankDeg: number;
  apMaster: boolean;
  apLnavActive: boolean;
  apVnavActive: boolean;
  apHeadingActive: boolean;
  apAltitudeActive: boolean;
  apTargetAltitude: number;
  fuelTotal: number;
  gw: number;
  altitude: number;
  heading: number;
  ias: number;
  tas: number;
  gs: number;
  vs: number;
  track: number;
  radios?: {
    vor1: string;
    vor2: string;
    adf1: string;
  };
}

const PMDG_KEY_MAP: Record<string, string> = {
  '0': 'PMDG_CDU_1_BTN_0',
  '1': 'PMDG_CDU_1_BTN_1',
  '2': 'PMDG_CDU_1_BTN_2',
  '3': 'PMDG_CDU_1_BTN_3',
  '4': 'PMDG_CDU_1_BTN_4',
  '5': 'PMDG_CDU_1_BTN_5',
  '6': 'PMDG_CDU_1_BTN_6',
  '7': 'PMDG_CDU_1_BTN_7',
  '8': 'PMDG_CDU_1_BTN_8',
  '9': 'PMDG_CDU_1_BTN_9',
  A: 'PMDG_CDU_1_BTN_A',
  B: 'PMDG_CDU_1_BTN_B',
  C: 'PMDG_CDU_1_BTN_C',
  D: 'PMDG_CDU_1_BTN_D',
  E: 'PMDG_CDU_1_BTN_E',
  F: 'PMDG_CDU_1_BTN_F',
  G: 'PMDG_CDU_1_BTN_G',
  H: 'PMDG_CDU_1_BTN_H',
  I: 'PMDG_CDU_1_BTN_I',
  J: 'PMDG_CDU_1_BTN_J',
  K: 'PMDG_CDU_1_BTN_K',
  L: 'PMDG_CDU_1_BTN_L',
  M: 'PMDG_CDU_1_BTN_M',
  N: 'PMDG_CDU_1_BTN_N',
  O: 'PMDG_CDU_1_BTN_O',
  P: 'PMDG_CDU_1_BTN_P',
  Q: 'PMDG_CDU_1_BTN_Q',
  R: 'PMDG_CDU_1_BTN_R',
  S: 'PMDG_CDU_1_BTN_S',
  T: 'PMDG_CDU_1_BTN_T',
  U: 'PMDG_CDU_1_BTN_U',
  V: 'PMDG_CDU_1_BTN_V',
  W: 'PMDG_CDU_1_BTN_W',
  X: 'PMDG_CDU_1_BTN_X',
  Y: 'PMDG_CDU_1_BTN_Y',
  Z: 'PMDG_CDU_1_BTN_Z',
  '.': 'PMDG_CDU_1_BTN_DOT',
  '+': 'PMDG_CDU_1_BTN_PLUSMINUS',
  '-': 'PMDG_CDU_1_BTN_PLUSMINUS',
  ' ': 'PMDG_CDU_1_BTN_SP',
  '/': 'PMDG_CDU_1_BTN_SLASH',
  CLR: 'PMDG_CDU_1_BTN_CLR',
  DEL: 'PMDG_CDU_1_BTN_DEL',
  EXEC: 'PMDG_CDU_1_BTN_EXEC',
  PREV_PAGE: 'PMDG_CDU_1_BTN_PREV_PAGE',
  NEXT_PAGE: 'PMDG_CDU_1_BTN_NEXT_PAGE',
  INIT: 'PMDG_CDU_1_BTN_INIT',
  INIT_REF: 'PMDG_CDU_1_BTN_INIT',
  RTE: 'PMDG_CDU_1_BTN_RTE',
  DEP: 'PMDG_CDU_1_BTN_DEP',
  ARR: 'PMDG_CDU_1_BTN_ARR',
  DEP_ARR: 'PMDG_CDU_1_BTN_DEP',
  DIR_INTC: 'PMDG_CDU_1_BTN_DIR_INTC',
  CLB: 'PMDG_CDU_1_BTN_CLB',
  CRZ: 'PMDG_CDU_1_BTN_CRZ',
  DES: 'PMDG_CDU_1_BTN_DES',
  PERF: 'PMDG_CDU_1_BTN_PERF',
  LEGS: 'PMDG_CDU_1_BTN_LEGS',
  PROG: 'PMDG_CDU_1_BTN_PROG',
  FIX: 'PMDG_CDU_1_BTN_FIX',
  HOLD: 'PMDG_CDU_1_BTN_HOLD',
  FMC_COMM: 'PMDG_CDU_1_BTN_FMC_COMM',
  MENU: 'PMDG_CDU_1_BTN_MENU',
  N1_LIMIT: 'PMDG_CDU_1_BTN_N1_LIMIT',
  L1: 'PMDG_CDU_1_BTN_L1',
  L2: 'PMDG_CDU_1_BTN_L2',
  L3: 'PMDG_CDU_1_BTN_L3',
  L4: 'PMDG_CDU_1_BTN_L4',
  L5: 'PMDG_CDU_1_BTN_L5',
  L6: 'PMDG_CDU_1_BTN_L6',
  R1: 'PMDG_CDU_1_BTN_R1',
  R2: 'PMDG_CDU_1_BTN_R2',
  R3: 'PMDG_CDU_1_BTN_R3',
  R4: 'PMDG_CDU_1_BTN_R4',
  R5: 'PMDG_CDU_1_BTN_R5',
  R6: 'PMDG_CDU_1_BTN_R6',
  DOT: 'PMDG_CDU_1_BTN_DOT',
  PLUS_MINUS: 'PMDG_CDU_1_BTN_PLUSMINUS',
  '+/-': 'PMDG_CDU_1_BTN_PLUSMINUS',
  SLASH: 'PMDG_CDU_1_BTN_SLASH',
  SPACE: 'PMDG_CDU_1_BTN_SP',
  INIT_A: 'PMDG_CDU_1_BTN_INIT',
  INIT_B: 'PMDG_CDU_1_BTN_INIT',
  F_PLN: 'PMDG_CDU_1_BTN_RTE',
  PERF_TAKEOFF: 'PMDG_CDU_1_BTN_PERF',
  PROG_A: 'PMDG_CDU_1_BTN_PROG',
  DEP_ARR_A: 'PMDG_CDU_1_BTN_DEP',
  MCDU_MENU: 'PMDG_CDU_1_BTN_MENU',
  DATA_INDEX: 'PMDG_CDU_1_BTN_MENU',
  RAD_NAV: 'PMDG_CDU_1_BTN_MENU',
};

const PMDG_EVENT_BASE = 1000;
const PMDG_NOTIFY_GROUP = 1;

export class PMDG737Adapter implements IAircraftAdapter {
  readonly aircraftType: AircraftType = 'BOEING_737';
  readonly capabilities = ['position', 'heading', 'speed', 'altitude', 'display', 'radios'];
  connectionStatus: ConnectionStatus = 'DISCONNECTED';
  lastError: string | null = null;
  isConnected = false;

  private simState: SimState | null = null;

  /** Cached CDU display lines, updated by SimConnect event handler */
  private cduLines: string[] = [];
  private cduTitle: string = 'IDENT';
  private cduBrightness: number = 0.8;
  private handle: SimConnectConnection | null = null;

  readonly variant: PMDGVariant;

  private static readonly CDU_ROWS = 14;
  private static readonly CDU_COLS = 24;

  private static readonly MOCK_LINES: string[] = [
    '  IDENT            1/1',
    ' MODEL',
    ' 737-800',
    '',
    ' ENG RATING',
    ' 26K',
    '',
    ' NAV DATA',
    ' FMC21A1',
    '',
    ' -----------------------',
    '                         ',
    '                         ',
  ];

  constructor(variant: PMDGVariant = '737-800') {
    this.variant = variant;
    this.cduLines = [...PMDG737Adapter.MOCK_LINES];
  }

  get name(): string {
    return `PMDG ${this.variant}`;
  }

  async connect(): Promise<boolean> {
    this.connectionStatus = 'CONNECTING';
    try {
      devLog(`[PMDG] Attempting connection...`);
      const { recvOpen, handle } = await open('VirtualCDU', Protocol.KittyHawk);
      this.handle = handle;

      devLog(`[PMDG] Connected to ${recvOpen.applicationName}`);

      this._setupKeypressEvents(handle);
      this._setupAircraftStatePolling(handle);
      this._setupCDUDisplayPolling(handle);

      handle.on('close', () => {
        devLog('[PMDG] SimConnect connection closed unexpectedly');
        this.isConnected = false;
        this.connectionStatus = 'DISCONNECTED';
        this.handle = null;
      });

      this.isConnected = true;
      this.connectionStatus = 'CONNECTED';
      this.lastError = null;
      return true;
    } catch (err) {
      this.connectionStatus = 'ERROR';
      this.lastError = err instanceof Error ? err.message : String(err);
      devError('[PMDG] Connection failed:', this.lastError);
      this.isConnected = false;
      this.handle = null;
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.handle) {
        this.handle.close();
        this.handle = null;
      }
    } catch (err) {
      devError('[PMDG] Error during disconnect:', err);
    }
    this.isConnected = false;
    this.connectionStatus = 'DISCONNECTED';
    this.lastError = null;
    this.simState = null;
    // Restore mock data on disconnect
    this.cduLines = [...PMDG737Adapter.MOCK_LINES];
    this.cduTitle = 'IDENT';
    this.cduBrightness = 0.8;
    devLog(`[PMDG] Disconnected`);
  }

  async readDisplay(): Promise<CDUDisplayData> {
    // Always return cached data — it is kept up-to-date by the SimConnect event handler.
    // Fall back to mock data when not connected or on first render before any data arrives.
    if (!this.isConnected || !this.handle || this.cduLines.length === 0) {
      return {
        lines: PMDG737Adapter.MOCK_LINES,
        title: 'IDENT',
        brightness: 0.8,
      };
    }
    return {
      lines: this.cduLines,
      title: this.cduTitle,
      brightness: this.cduBrightness,
    };
  }

  async sendKeypress(key: string): Promise<void> {
    if (!this.handle || !this.isConnected) {
      devLog(`[PMDG] Keypress (not connected): ${key}`);
      return;
    }

    const eventName = PMDG_KEY_MAP[key.toUpperCase()];
    if (!eventName) {
      devWarn(`[PMDG] Unknown key: ${key}`);
      return;
    }

    const eventId = PMDG_EVENT_BASE + Object.keys(PMDG_KEY_MAP).indexOf(key.toUpperCase());
    try {
      this.handle.transmitClientEvent(
        SimConnectConstants.OBJECT_ID_USER,
        eventId,
        0,
        PMDG_NOTIFY_GROUP,
        EventFlag.EVENT_FLAG_DEFAULT,
      );
      devLog(`[PMDG] Sent keypress: ${key} (${eventName})`);
    } catch (err) {
      devError(`[PMDG] Failed to send keypress ${key}:`, err);
    }
  }

  async sendLSK(side: 'L' | 'R', index: number): Promise<void> {
    const lsk = `${side}${index}`;
    await this.sendKeypress(lsk);
  }

  private _setupKeypressEvents(handle: SimConnectConnection): void {
    try {
      const keys = Object.keys(PMDG_KEY_MAP);
      for (let i = 0; i < keys.length; i++) {
        const eventName = PMDG_KEY_MAP[keys[i]];
        const eventId = PMDG_EVENT_BASE + i;
        handle.mapClientEventToSimEvent(eventId, eventName);
      }
      devLog(`[PMDG] Mapped ${keys.length} CDU keypress events`);
    } catch (err) {
      devError('[PMDG] Error setting up keypress events:', err);
    }
  }

  async readAircraftState(): Promise<AdapterAircraftState> {
    if (!this.simState) {
      return {
        lat: 40.6413,
        lon: -73.7781,
        heading: 45,
        track: 45,
        altitude: 0,
        ias: 0,
        tas: 0,
        gs: 0,
        vs: 0,
        fuelTotal: 0,
        gw: 0,
        headingDeg: 45,
        trackDeg: 45,
        altitudeFt: 0,
        indicatedAirspeedKt: 0,
        verticalSpeedFpm: 0,
      };
    }
    return {
      lat: this.simState.lat,
      lon: this.simState.lon,
      heading: this.simState.heading,
      track: this.simState.heading,
      altitude: this.simState.altitude,
      ias: this.simState.ias,
      tas: this.simState.tas,
      gs: this.simState.gs,
      vs: this.simState.vs,
      fuelTotal: 0,
      gw: 0,
      radios: this.simState.radios,
      headingDeg: this.simState.headingDeg,
      trackDeg: this.simState.trackDeg,
      altitudeFt: this.simState.altitudeFt,
      indicatedAirspeedKt: this.simState.indicatedAirspeedKt,
      verticalSpeedFpm: this.simState.verticalSpeedFpm,
    };
  }

  private _setupCDUDisplayPolling(handle: SimConnectConnection): void {
    const DEF_CDU = 1;
    const REQ_CDU = 1;

    try {
      for (let row = 0; row < PMDG737Adapter.CDU_ROWS; row++) {
        for (let col = 0; col < PMDG737Adapter.CDU_COLS; col++) {
          handle.addToDataDefinition(
            DEF_CDU,
            `L:PMDG_CDU_Screen_1_Row_${row}_Col_${col}`,
            null,
            SimConnectDataType.INT32,
          );
        }
      }

      handle.requestDataOnSimObject(REQ_CDU, DEF_CDU, SimConnectConstants.OBJECT_ID_USER, SimConnectPeriod.SECOND);

      handle.on('simObjectData', (recvSimObjectData) => {
        if (recvSimObjectData.requestID !== REQ_CDU) return;

        try {
          const lines: string[] = [];
          for (let row = 0; row < PMDG737Adapter.CDU_ROWS; row++) {
            let rowStr = '';
            for (let col = 0; col < PMDG737Adapter.CDU_COLS; col++) {
              const charCode = recvSimObjectData.data.readInt32();
              rowStr += String.fromCharCode(charCode);
            }
            lines.push(rowStr);
          }

          if (lines.length > 0) {
            this.cduLines = lines;
            if (lines[0].trim().length > 0) {
              const titleMatch = lines[0].match(/^\s*(\S+)/);
              this.cduTitle = titleMatch ? titleMatch[1] : 'CDU';
            }
          }
        } catch (readErr) {
          devError('[PMDG737Adapter] SimConnect CDU data read error:', readErr);
        }
      });
    } catch (err) {
      devError('[PMDG] Error setting up CDU display polling:', err);
    }
  }

  private _setupAircraftStatePolling(handle: SimConnectConnection): void {
    const DEFINITION_ID = 0;
    const REQUEST_ID = 0;

    try {
      handle.addToDataDefinition(DEFINITION_ID, 'Plane Latitude', 'degrees', SimConnectDataType.FLOAT64);
      handle.addToDataDefinition(DEFINITION_ID, 'Plane Longitude', 'degrees', SimConnectDataType.FLOAT64);
      handle.addToDataDefinition(DEFINITION_ID, 'Plane Altitude', 'feet', SimConnectDataType.FLOAT64);
      handle.addToDataDefinition(DEFINITION_ID, 'Plane Heading Degrees True', 'degrees', SimConnectDataType.FLOAT64);
      handle.addToDataDefinition(DEFINITION_ID, 'Airspeed Indicated', 'knots', SimConnectDataType.FLOAT64);
      handle.addToDataDefinition(DEFINITION_ID, 'Airspeed True', 'knots', SimConnectDataType.FLOAT64);
      handle.addToDataDefinition(DEFINITION_ID, 'Ground Velocity', 'knots', SimConnectDataType.FLOAT64);
      handle.addToDataDefinition(DEFINITION_ID, 'Vertical Speed', 'feet per minute', SimConnectDataType.FLOAT64);
      handle.addToDataDefinition(DEFINITION_ID, 'AUTOPILOT MASTER', 'bool', SimConnectDataType.FLOAT64);
      handle.addToDataDefinition(DEFINITION_ID, 'AUTOPILOT LNAV ACTIVE', 'bool', SimConnectDataType.FLOAT64);
      handle.addToDataDefinition(DEFINITION_ID, 'AUTOPILOT VNAV ACTIVE', 'bool', SimConnectDataType.FLOAT64);
      handle.addToDataDefinition(DEFINITION_ID, 'AUTOPILOT HEADING LOCK', 'bool', SimConnectDataType.FLOAT64);
      handle.addToDataDefinition(DEFINITION_ID, 'AUTOPILOT ALTITUDE LOCK', 'bool', SimConnectDataType.FLOAT64);
      handle.addToDataDefinition(DEFINITION_ID, 'AUTOPILOT ALTITUDE LOCK VAR', 'feet', SimConnectDataType.FLOAT64);

      handle.addToDataDefinition(DEFINITION_ID, 'FUEL TOTAL QUANTITY', 'gallons', SimConnectDataType.FLOAT64);
      handle.addToDataDefinition(DEFINITION_ID, 'TOTAL WEIGHT', 'pounds', SimConnectDataType.FLOAT64);

      handle.addToDataDefinition(DEFINITION_ID, 'NAV ACTIVE FREQUENCY:1', 'MHz', SimConnectDataType.FLOAT64);
      handle.addToDataDefinition(DEFINITION_ID, 'NAV ACTIVE FREQUENCY:2', 'MHz', SimConnectDataType.FLOAT64);
      handle.addToDataDefinition(DEFINITION_ID, 'ADF ACTIVE FREQUENCY:1', 'KHz', SimConnectDataType.FLOAT64);

      handle.requestDataOnSimObject(
        REQUEST_ID,
        DEFINITION_ID,
        SimConnectConstants.OBJECT_ID_USER,
        SimConnectPeriod.SECOND,
      );

      handle.on('simObjectData', (recvSimObjectData) => {
        if (recvSimObjectData.requestID === REQUEST_ID) {
          try {
            const lat = recvSimObjectData.data.readFloat64();
            const lon = recvSimObjectData.data.readFloat64();
            const altitude = recvSimObjectData.data.readFloat64();
            const heading = recvSimObjectData.data.readFloat64();
            const ias = recvSimObjectData.data.readFloat64();
            const tas = recvSimObjectData.data.readFloat64();
            const gs = recvSimObjectData.data.readFloat64();
            const vs = recvSimObjectData.data.readFloat64();
            const apMaster = recvSimObjectData.data.readFloat64() !== 0;
            const apLnavActive = recvSimObjectData.data.readFloat64() !== 0;
            const apVnavActive = recvSimObjectData.data.readFloat64() !== 0;
            const apHeadingActive = recvSimObjectData.data.readFloat64() !== 0;
            const apAltitudeActive = recvSimObjectData.data.readFloat64() !== 0;
            const apTargetAltitude = recvSimObjectData.data.readFloat64();

            this.simState = {
              lat,
              lon,
              headingDeg: heading,
              trackDeg: heading, // Simplified
              altitudeFt: altitude,
              indicatedAirspeedKt: ias,
              trueAirspeedKt: tas,
              groundSpeedKt: gs,
              verticalSpeedFpm: vs,
              pitchDeg: 0,
              bankDeg: 0,
              apMaster,
              apLnavActive,
              apVnavActive,
              apHeadingActive,
              apAltitudeActive,
              apTargetAltitude,

              fuelTotal: Math.round(recvSimObjectData.data.readFloat64() * 6.7),
              gw: Math.round(recvSimObjectData.data.readFloat64()),

              // Legacy
              altitude,
              heading,
              ias,
              tas,
              gs,
              vs,
              track: heading,
            };
            this.simState.fuelTotal = this.simState.fuelTotal;
            this.simState.gw = this.simState.gw;

            const vor1 = recvSimObjectData.data.readFloat64().toFixed(2);
            const vor2 = recvSimObjectData.data.readFloat64().toFixed(2);
            const adf1 = Math.round(recvSimObjectData.data.readFloat64()).toString();

            this.simState.radios = { vor1, vor2, adf1 };
          } catch (readErr) {
            devError('[PMDG] Error reading aircraft state:', readErr);
          }
        }
      });
    } catch (err) {
      devError('[PMDG] Error setting up aircraft state polling:', err);
    }
  }
}
