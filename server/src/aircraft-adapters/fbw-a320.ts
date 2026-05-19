/**
 * FBW A320 adapter - reads MCDU display via SimConnect.
 *
 * The FlyByWire A32NX exposes MCDU data via SimConnect L: variables.
 * Falls back to mock data when MSFS/SimConnect is unavailable.
 */

import { open, Protocol, SimConnectConstants, SimConnectDataType, SimConnectPeriod } from 'node-simconnect';
import type { SimConnectConnection } from 'node-simconnect';
import type { IAircraftAdapter, CDUDisplayData, AdapterAircraftState } from './IAircraftAdapter';
import type { AircraftType, ConnectionStatus } from '@virtual-cdu/shared';
import { devLog, devError } from '@virtual-cdu/shared';

interface FbwSimState {
  lat: number;
  lon: number;
  headingDeg: number;
  trackDeg: number;
  altitudeFt: number;
  indicatedAirspeedKt: number;
  verticalSpeedFpm: number;
  pitchDeg: number;
  bankDeg: number;
  altitude: number;
  heading: number;
  ias: number;
  tas: number;
  gs: number;
  vs: number;
  track: number;
  fuelTotal: number;
  gw: number;
  radios?: {
    vor1: string;
    vor2: string;
    adf1: string;
  };
}

export class FBWA320Adapter implements IAircraftAdapter {
  readonly name = 'FBW A320neo';
  readonly aircraftType: AircraftType = 'AIRBUS_A320';
  readonly capabilities = ['position', 'heading', 'speed', 'altitude', 'display', 'radios'];
  connectionStatus: ConnectionStatus = 'DISCONNECTED';
  lastError: string | null = null;
  isConnected = false;

  private simState: FbwSimState | null = null;

  private cduLines: string[] = [];
  private handle: SimConnectConnection | null = null;

  private static readonly FBW_KEY_MAP: Record<string, string> = {
    '1': 'A32NX_MCDU_L_BTN_1',
    '2': 'A32NX_MCDU_L_BTN_2',
    '3': 'A32NX_MCDU_L_BTN_3',
    '4': 'A32NX_MCDU_L_BTN_4',
    '5': 'A32NX_MCDU_L_BTN_5',
    '6': 'A32NX_MCDU_L_BTN_6',
    '7': 'A32NX_MCDU_L_BTN_7',
    '8': 'A32NX_MCDU_L_BTN_8',
    '9': 'A32NX_MCDU_L_BTN_9',
    '0': 'A32NX_MCDU_L_BTN_0',
    A: 'A32NX_MCDU_L_BTN_A',
    B: 'A32NX_MCDU_L_BTN_B',
    C: 'A32NX_MCDU_L_BTN_C',
    D: 'A32NX_MCDU_L_BTN_D',
    E: 'A32NX_MCDU_L_BTN_E',
    F: 'A32NX_MCDU_L_BTN_F',
    G: 'A32NX_MCDU_L_BTN_G',
    H: 'A32NX_MCDU_L_BTN_H',
    I: 'A32NX_MCDU_L_BTN_I',
    J: 'A32NX_MCDU_L_BTN_J',
    K: 'A32NX_MCDU_L_BTN_K',
    L: 'A32NX_MCDU_L_BTN_L',
    M: 'A32NX_MCDU_L_BTN_M',
    N: 'A32NX_MCDU_L_BTN_N',
    O: 'A32NX_MCDU_L_BTN_O',
    P: 'A32NX_MCDU_L_BTN_P',
    Q: 'A32NX_MCDU_L_BTN_Q',
    R: 'A32NX_MCDU_L_BTN_R',
    S: 'A32NX_MCDU_L_BTN_S',
    T: 'A32NX_MCDU_L_BTN_T',
    U: 'A32NX_MCDU_L_BTN_U',
    V: 'A32NX_MCDU_L_BTN_V',
    W: 'A32NX_MCDU_L_BTN_W',
    X: 'A32NX_MCDU_L_BTN_X',
    Y: 'A32NX_MCDU_L_BTN_Y',
    Z: 'A32NX_MCDU_L_BTN_Z',
    DIR_INTC: 'A32NX_MCDU_L_BTN_DIR',
    PROG: 'A32NX_MCDU_L_BTN_PROG',
    PERF: 'A32NX_MCDU_L_BTN_PERF',
    INIT: 'A32NX_MCDU_L_BTN_INIT',
    DATA: 'A32NX_MCDU_L_BTN_DATA',
    F_PLN: 'A32NX_MCDU_L_BTN_FPLN',
    RAD_NAV: 'A32NX_MCDU_L_BTN_RADNAV',
    FUEL_PRED: 'A32NX_MCDU_L_BTN_FUEL',
    SEC_FPLN: 'A32NX_MCDU_L_BTN_SEC_FPLN',
    ATC_COMM: 'A32NX_MCDU_L_BTN_ATC_COMM',
    MCDU_MENU: 'A32NX_MCDU_L_BTN_MENU',
    CLR: 'A32NX_MCDU_L_BTN_CLR',
    OVFY: 'A32NX_MCDU_L_BTN_OVFY',
    NEXT_PAGE: 'A32NX_MCDU_L_BTN_NEXT_PAGE',
    PREV_PAGE: 'A32NX_MCDU_L_BTN_PREV_PAGE',
    L1: 'A32NX_MCDU_L_BTN_L1',
    L2: 'A32NX_MCDU_L_BTN_L2',
    L3: 'A32NX_MCDU_L_BTN_L3',
    L4: 'A32NX_MCDU_L_BTN_L4',
    L5: 'A32NX_MCDU_L_BTN_L5',
    L6: 'A32NX_MCDU_L_BTN_L6',
    R1: 'A32NX_MCDU_L_BTN_R1',
    R2: 'A32NX_MCDU_L_BTN_R2',
    R3: 'A32NX_MCDU_L_BTN_R3',
    R4: 'A32NX_MCDU_L_BTN_R4',
    R5: 'A32NX_MCDU_L_BTN_R5',
    R6: 'A32NX_MCDU_L_BTN_R6',
  };

  constructor() {
    this.cduLines = [
      '  INIT            1/2',
      ' CO RTE            ',
      ' KJFK/KDCA         ',
      ' ALTN/CO RTE       ',
      ' FLT NBR           ',
      '                   ',
      ' LAT    40 38.4N   ',
      ' LONG   073 46.7W  ',
      ' COST INDEX        ',
      ' CRZ FL/TEMP       ',
      '                   ',
    ];
  }

  async connect(): Promise<boolean> {
    this.connectionStatus = 'CONNECTING';
    try {
      devLog(`[FBW A320] Attempting connection...`);
      const { recvOpen, handle } = await open('VirtualCDU', Protocol.KittyHawk);
      this.handle = handle;

      devLog(`[FBW A320] Connected to ${recvOpen.applicationName}`);

      this._setupAircraftStatePolling(handle);
      this._setupCDUDisplayPolling(handle);

      handle.on('close', () => {
        devLog('[FBW A320] SimConnect connection closed unexpectedly');
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
      devError('[FBW A320] Connection failed:', this.lastError);
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
      devError('[FBW A320] Error during disconnect:', err);
    }
    this.isConnected = false;
    this.connectionStatus = 'DISCONNECTED';
    this.lastError = null;
    this.simState = null;
    devLog(`[FBW A320] Disconnected`);
  }

  async readDisplay(): Promise<CDUDisplayData> {
    return {
      lines: this.cduLines,
      title: 'MCDU',
      brightness: 0.8,
    };
  }

  async sendKeypress(key: string): Promise<void> {
    if (!this.handle || !this.isConnected) {
      devLog(`[FBW A320] Keypress (not connected): ${key}`);
      return;
    }

    const eventName = FBWA320Adapter.FBW_KEY_MAP[key.toUpperCase()];
    if (!eventName) {
      devLog(`[FBW A320] Unknown key: ${key}`);
      return;
    }

    try {
      // FBW uses H: events for buttons. These can be triggered via MapClientEventToSimEvent or Direct Event.
      // We'll use a unique ID for each key.
      const eventId = 2000 + Object.keys(FBWA320Adapter.FBW_KEY_MAP).indexOf(key.toUpperCase());
      this.handle.mapClientEventToSimEvent(eventId, `H:${eventName}`);
      this.handle.transmitClientEvent(
        0, // SimConnectConstants.OBJECT_ID_USER is 0
        eventId,
        0,
        1, // Group ID
        0, // Flags
      );
      devLog(`[FBW A320] Sent keypress: ${key} (H:${eventName})`);
    } catch (err) {
      devError(`[FBW A320] Failed to send keypress ${key}:`, err);
    }
  }

  async sendLSK(side: 'L' | 'R', index: number): Promise<void> {
    const lsk = `${side}${index}`;
    await this.sendKeypress(lsk);
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
      tas: this.simState.tas || this.simState.ias,
      gs: this.simState.gs || this.simState.ias,
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
      // Poll L:A32NX_MCDU_L_LINE_0 to L:A32NX_MCDU_L_LINE_13
      // Note: SimConnect strings are fixed length. FBW lines are 24 chars.
      for (let i = 0; i < 14; i++) {
        handle.addToDataDefinition(
          DEF_CDU,
          `L:A32NX_MCDU_L_LINE_${i}`,
          'string32', // Use string32 as buffer for 24 chars
          SimConnectDataType.STRING32,
        );
      }

      handle.requestDataOnSimObject(
        REQ_CDU,
        DEF_CDU,
        0, // SimConnectConstants.OBJECT_ID_USER
        SimConnectPeriod.SECOND,
      );

      handle.on('simObjectData', (recvSimObjectData) => {
        if (recvSimObjectData.requestID !== REQ_CDU) return;

        try {
          const lines: string[] = [];
          for (let i = 0; i < 14; i++) {
            const line = recvSimObjectData.data.readString32();
            lines.push(line.padEnd(24, ' '));
          }
          this.cduLines = lines;
        } catch (readErr) {
          devError('[FBWA320Adapter] SimConnect CDU data read error:', readErr);
        }
      });
    } catch (err) {
      devError('[FBW A320] Error setting up CDU display polling:', err);
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
      handle.addToDataDefinition(DEFINITION_ID, 'Vertical Speed', 'feet per minute', SimConnectDataType.FLOAT64);
      handle.addToDataDefinition(DEFINITION_ID, 'FUEL TOTAL QUANTITY', 'gallons', SimConnectDataType.FLOAT64);
      handle.addToDataDefinition(DEFINITION_ID, 'TOTAL WEIGHT', 'pounds', SimConnectDataType.FLOAT64);
      handle.addToDataDefinition(DEFINITION_ID, 'NAV ACTIVE FREQUENCY:1', 'MHz', SimConnectDataType.FLOAT64);
      handle.addToDataDefinition(DEFINITION_ID, 'NAV ACTIVE FREQUENCY:2', 'MHz', SimConnectDataType.FLOAT64);
      handle.addToDataDefinition(DEFINITION_ID, 'ADF ACTIVE FREQUENCY:1', 'KHz', SimConnectDataType.FLOAT64);

      handle.requestDataOnSimObject(REQUEST_ID, DEFINITION_ID, 0, SimConnectPeriod.SECOND);

      handle.on('simObjectData', (recvSimObjectData) => {
        if (recvSimObjectData.requestID === REQUEST_ID) {
          try {
            const lat = recvSimObjectData.data.readFloat64();
            const lon = recvSimObjectData.data.readFloat64();
            const altitude = recvSimObjectData.data.readFloat64();
            const heading = recvSimObjectData.data.readFloat64();
            const ias = recvSimObjectData.data.readFloat64();
            const vs = recvSimObjectData.data.readFloat64();
            const fuelGallons = recvSimObjectData.data.readFloat64();
            const gwVal = recvSimObjectData.data.readFloat64();
            const fuelVal = Math.round(fuelGallons * 6.7);

            this.simState = {
              lat,
              lon,
              headingDeg: heading,
              trackDeg: heading,
              altitudeFt: altitude,
              indicatedAirspeedKt: ias,
              verticalSpeedFpm: vs,
              pitchDeg: 0,
              bankDeg: 0,

              altitude,
              heading,
              ias,
              tas: ias,
              gs: ias,
              vs,
              track: heading,
              fuelTotal: fuelVal,
              gw: gwVal,
            };
            this.simState.fuelTotal = this.simState.fuelTotal;
            this.simState.gw = this.simState.gw;

            const vor1 = recvSimObjectData.data.readFloat64().toFixed(2);
            const vor2 = recvSimObjectData.data.readFloat64().toFixed(2);
            const adf1 = Math.round(recvSimObjectData.data.readFloat64()).toString();

            this.simState.radios = { vor1, vor2, adf1 };
          } catch (readErr) {
            devError('[FBW A320] Error reading aircraft state:', readErr);
          }
        }
      });
    } catch (err) {
      devError('[FBW A320] Error setting up aircraft state polling:', err);
    }
  }
}
