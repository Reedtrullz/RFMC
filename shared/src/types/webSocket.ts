// ============================================================
// WebSocket protocol types shared between frontend and backend
// ============================================================

import type { CDUKey, DisplayData, ConnectionMode } from './fmc';

// ---- Client → Server Messages ----

export interface FmcInputMessage {
  type: 'fmc.input';
  key: CDUKey;
}

export interface SimConnectMessage {
  type: 'sim.connect';
}

export interface SimDisconnectMessage {
  type: 'sim.disconnect';
}

export interface ModeChangeMessage {
  type: 'mode';
  mode: ConnectionMode;
}

export type ClientMessage = 
  | FmcInputMessage 
  | SimConnectMessage 
  | SimDisconnectMessage 
  | ModeChangeMessage;

// ---- Server → Client Messages ----

export interface FmcDisplayMessage {
  type: 'fmc.display';
  data: DisplayData;
}

export interface SimConnectedMessage {
  type: 'sim.connected';
  aircraft: string;
}

export interface SimDisconnectedMessage {
  type: 'sim.disconnected';
}

export interface SimDataMessage {
  type: 'sim.data';
  variables: Record<string, number>;
}

export interface ErrorMessage {
  type: 'error';
  message: string;
}

export type ServerMessage = 
  | FmcDisplayMessage 
  | SimConnectedMessage 
  | SimDisconnectedMessage 
  | SimDataMessage 
  | ErrorMessage;
