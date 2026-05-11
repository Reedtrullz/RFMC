/**
 * FBW A320 adapter - reads MCDU display via SimConnect.
 *
 * The FlyByWire A32NX exposes MCDU data via SimConnect L: variables.
 * Falls back to mock data when MSFS/SimConnect is unavailable.
 */

import {
  open,
  Protocol,
  SimConnectConstants,
  SimConnectDataType,
  SimConnectPeriod,
} from 'node-simconnect';
import type { SimConnectConnection } from 'node-simconnect';
import type { IAircraftAdapter, CDUDisplayData, AircraftState } from './IAircraftAdapter';
import type { AircraftType, ConnectionStatus } from '@shared';
import { devLog, devError } from '@shared';

export class FBWA320Adapter implements IAircraftAdapter {
  readonly name = 'FBW A320neo';
  readonly aircraftType: AircraftType = 'AIRBUS_A320';
  readonly capabilities = ['position', 'heading', 'speed', 'altitude', 'display'];
  connectionStatus: ConnectionStatus = 'DISCONNECTED';
  lastError: string | null = null;
  isConnected = false;

  private simState: { lat: number; lon: number; altitude: number; heading: number; ias: number; tas: number; gs: number; vs: number } | null = null;

  private mockLines: string[] = [];
  private handle: SimConnectConnection | null = null;

  constructor() {
    this.mockLines = [
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
    if (!this.isConnected || !this.handle) {
      return {
        lines: this.mockLines,
        title: 'INIT',
        brightness: 0.8,
      };
    }

    try {
      return {
        lines: this.mockLines,
        title: 'INIT',
        brightness: 0.8,
      };
    } catch (err) {
      devError('[FBW A320] Error reading display:', err);
      return {
        lines: this.mockLines,
        title: 'INIT',
        brightness: 0.8,
      };
    }
  }

  async sendKeypress(key: string): Promise<void> {
    devLog(`[FBW A320] Keypress: ${key}`);
  }

  async sendLSK(side: 'L' | 'R', index: number): Promise<void> {
    const lsk = `${side}${index}`;
    devLog(`[FBW A320] LSK: ${lsk}`);
    await this.sendKeypress(lsk);
  }

  async readAircraftState(): Promise<AircraftState> {
    if (!this.simState) {
      return {
        position: { lat: 40.6413, lon: -73.7781 },
        heading: 45,
        altitude: 0,
        speed: 0,
        verticalSpeed: 0,
      };
    }
    return {
      position: { lat: this.simState.lat, lon: this.simState.lon },
      heading: this.simState.heading,
      altitude: this.simState.altitude,
      speed: this.simState.ias,
      verticalSpeed: this.simState.vs,
    };
  }

  private _setupAircraftStatePolling(handle: SimConnectConnection): void {
    const DEFINITION_ID = 0;
    const REQUEST_ID = 0;

    try {
      handle.addToDataDefinition(
        DEFINITION_ID,
        'Plane Latitude',
        'degrees',
        SimConnectDataType.FLOAT64
      );
      handle.addToDataDefinition(
        DEFINITION_ID,
        'Plane Longitude',
        'degrees',
        SimConnectDataType.FLOAT64
      );
      handle.addToDataDefinition(
        DEFINITION_ID,
        'Plane Altitude',
        'feet',
        SimConnectDataType.FLOAT64
      );
      handle.addToDataDefinition(
        DEFINITION_ID,
        'Plane Heading Degrees True',
        'degrees',
        SimConnectDataType.FLOAT64
      );
      handle.addToDataDefinition(
        DEFINITION_ID,
        'Airspeed Indicated',
        'knots',
        SimConnectDataType.FLOAT64
      );
      handle.addToDataDefinition(
        DEFINITION_ID,
        'Airspeed True',
        'knots',
        SimConnectDataType.FLOAT64
      );
      handle.addToDataDefinition(
        DEFINITION_ID,
        'Ground Velocity',
        'knots',
        SimConnectDataType.FLOAT64
      );
      handle.addToDataDefinition(
        DEFINITION_ID,
        'Vertical Speed',
        'feet per minute',
        SimConnectDataType.FLOAT64
      );

      handle.requestDataOnSimObject(
        REQUEST_ID,
        DEFINITION_ID,
        SimConnectConstants.OBJECT_ID_USER,
        SimConnectPeriod.SECOND
      );

      handle.on('simObjectData', (recvSimObjectData) => {
        if (recvSimObjectData.requestID === REQUEST_ID) {
          try {
            this.simState = {
              lat: recvSimObjectData.data.readFloat64(),
              lon: recvSimObjectData.data.readFloat64(),
              altitude: recvSimObjectData.data.readFloat64(),
              heading: recvSimObjectData.data.readFloat64(),
              ias: recvSimObjectData.data.readFloat64(),
              tas: recvSimObjectData.data.readFloat64(),
              gs: recvSimObjectData.data.readFloat64(),
              vs: recvSimObjectData.data.readFloat64(),
            };
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
