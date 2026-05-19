import type { ClientMessage, ServerMessage } from '@shared';
import { devLog, devError } from '@shared';
import { useFMCStore } from '../store/useFMCStore';
import { useAircraftStore } from '../store/aircraftStore';
import { useConnectionStore } from '../store/connectionStore';

type StatusListener = (status: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR') => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private statusListeners: Set<StatusListener> = new Set();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private url: string = '';
  private isManualDisconnect = false;
  private isFatalError = false;
  private offlineQueue: string[] = [];
  private heartbeatTimer: ReturnType<typeof setTimeout> | null = null;
  private sendTimestamps: number[] = [];
  private static readonly SEND_RATE_LIMIT = 8;
  private static readonly SEND_RATE_WINDOW_MS = 1000;
  private static readonly HEARTBEAT_TIMEOUT_MS = 15000;

  constructor() {
    this.url = this.getSavedServerUrl();
  }

  public subscribe(listener: StatusListener) {
    this.statusListeners.add(listener);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  private setStatus(status: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR') {
    useFMCStore.getState().setConnectionStatus(status);
    useConnectionStore.getState().setConnectionStatus(status);

    if (status === 'DISCONNECTED' || status === 'ERROR') {
      // Clear stale telemetry and connected state on disconnect to prevent ghost data
      useFMCStore.getState().setConnectedAircraft(null, null, null);
      useFMCStore.getState().setAircraftState(null);
      useFMCStore.getState().setSimVariables({});

      useConnectionStore.getState().setConnectedAircraft(null, null, null);
      useConnectionStore.getState().setSimVariables({});

      useAircraftStore.getState().setAircraftState(null);
    }

    this.statusListeners.forEach((l) => l(status));
  }

  public connect(url?: string) {
    if (url) {
      this.url = url;
      this.saveServerUrl(url);
    }

    // Clear any orphaned reconnect timer from a previous connection
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;

    this.isManualDisconnect = false;
    this.isFatalError = false;
    this.setStatus('CONNECTING');

    try {
      const ws = new WebSocket(this.url);
      this.ws = ws;

      ws.onopen = () => {
        devLog('[WS] Connected to', this.url);
        this.setStatus('CONNECTED');
        this.send({ type: 'sim.connect' } satisfies ClientMessage);
        this.reconnectAttempts = 0;
        this.flushOfflineQueue();
        this.resetHeartbeatWatchdog();
      };

      ws.onmessage = (event) => {
        try {
          const msg: ServerMessage = JSON.parse(event.data);
          this.handleServerMessage(msg);
        } catch (err) {
          devError('[WS] Parse error:', err);
        }
      };

      ws.onclose = () => {
        devLog('[WS] Disconnected');
        this.clearHeartbeatWatchdog();
        this.setStatus('DISCONNECTED');
        this.ws = null;

        // Only auto-reconnect if this was NOT a manual disconnect or fatal error
        if (!this.isManualDisconnect && !this.isFatalError) {
          this.scheduleReconnect();
        }
      };

      ws.onerror = (err) => {
        const error = err instanceof Event ? 'WebSocket error event' : err;
        devError('[WS] WebSocket error:', error);

        const isFatal = this.classifyError(error);

        if (isFatal) {
          devError('[WS] Fatal error encountered, stopping reconnect attempts');
          this.isFatalError = true;
          this.setStatus('ERROR');
          if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
          }
          this.handleFatalError(error);
          this.ws?.close();
        } else {
          this.setStatus('ERROR');
          this.ws?.close();
        }
      };
    } catch (err) {
      devError('[WS] Connection failed:', err);
      this.setStatus('ERROR');
      this.scheduleReconnect();
    }
  }

  public disconnect() {
    this.isManualDisconnect = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.clearHeartbeatWatchdog();
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.send({ type: 'sim.disconnect' } satisfies ClientMessage);
    }
    this.ws?.close();
    this.ws = null;
    this.setStatus('DISCONNECTED');
  }

  public send(msg: ClientMessage) {
    const serialized = JSON.stringify(msg);
    if (this.ws?.readyState === WebSocket.OPEN) {
      if (this.isRateLimited()) {
        this.offlineQueue.push(serialized);
        this.scheduleQueueFlush();
        return;
      }
      this.sendTimestamps.push(Date.now());
      this.ws.send(serialized);
    } else {
      this.offlineQueue.push(serialized);
    }
  }

  private scheduleQueueFlush() {
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.flushOfflineQueue();
      }
    }, WebSocketClient.SEND_RATE_WINDOW_MS);
  }

  private isRateLimited(): boolean {
    const now = Date.now();
    this.sendTimestamps = this.sendTimestamps.filter((t) => now - t < WebSocketClient.SEND_RATE_WINDOW_MS);
    return this.sendTimestamps.length >= WebSocketClient.SEND_RATE_LIMIT;
  }

  private flushOfflineQueue(): void {
    while (this.offlineQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      if (this.isRateLimited()) {
        this.scheduleQueueFlush();
        break;
      }
      const serialized = this.offlineQueue.shift()!;
      this.sendTimestamps.push(Date.now());
      this.ws.send(serialized);
    }
  }

  private resetHeartbeatWatchdog(): void {
    this.clearHeartbeatWatchdog();
    this.heartbeatTimer = setTimeout(() => {
      devError('[WS] Heartbeat timeout — forcing reconnect');
      this.ws?.close();
    }, WebSocketClient.HEARTBEAT_TIMEOUT_MS);
  }

  private clearHeartbeatWatchdog(): void {
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;

    const delayBase = 1000;
    const delayMax = 10000;
    const backoff = Math.min(delayMax, delayBase * Math.pow(2, this.reconnectAttempts));
    const jitter = Math.random() * 1500;
    const delay = backoff + jitter;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  private classifyError(error: unknown): boolean {
    if (typeof error === 'string') {
      const errMsg = error.toLowerCase();
      if (
        errMsg.includes('network') ||
        errMsg.includes('timeout') ||
        errMsg.includes('connection refused') ||
        errMsg.includes('server error') ||
        errMsg.includes('failed to connect') ||
        errMsg.includes('unexpected token')
      ) {
        return false;
      }
      if (
        errMsg.includes('cors') ||
        errMsg.includes('forbidden') ||
        errMsg.includes('unauthorized') ||
        errMsg.includes('401') ||
        errMsg.includes('403') ||
        errMsg.includes('invalid url') ||
        errMsg.includes('syntax error') ||
        errMsg.includes('protocol error')
      ) {
        return true;
      }
    }

    if (error instanceof Error) {
      const name = error.name.toLowerCase();
      const message = error.message.toLowerCase();
      if (
        name.includes('network') ||
        name.includes('timeout') ||
        name.includes('connectionerror') ||
        message.includes('connection refused') ||
        message.includes('server error') ||
        message.includes('failed to connect')
      ) {
        return false;
      }
      if (
        name.includes('security') ||
        name.includes('cros') ||
        name.includes('cors') ||
        (name.includes('http') && message.includes('401')) ||
        (name.includes('http') && message.includes('403')) ||
        message.includes('invalid url') ||
        message.includes('syntax error') ||
        message.includes('protocol')
      ) {
        return true;
      }
    }

    return false;
  }

  private handleFatalError(error: unknown): void {
    devError('[WS] Fatal WebSocket error - user notification required:', error);
  }

  private handleServerMessage(msg: ServerMessage) {
    switch (msg.type) {
      case 'fmc.display':
        useFMCStore.getState().setExternalDisplayData(msg.data);
        break;
      case 'sim.connected':
        useFMCStore.getState().setConnectedAircraft(msg.aircraft, msg.capabilities ?? [], msg.aircraftType);
        useFMCStore.getState().setConnectionDiagnostics({
          connectedAircraft: msg.aircraft,
          connectedCapabilities: msg.capabilities as string[] | null | undefined,
          adapterHealth: msg.adapterHealth,
          lastError: null,
        });
        break;
      case 'sim.disconnected':
        useFMCStore.getState().setConnectedAircraft(null, null, null);
        useFMCStore.getState().setConnectionDiagnostics({
          connectedAircraft: null,
          connectedCapabilities: null,
          adapterHealth: null,
          lastError: msg.lastError,
        });
        break;
      case 'sim.data':
        const acState = msg.aircraftState ?? null;
        useFMCStore.getState().setAircraftState(acState);
        useFMCStore.getState().setSimVariables(msg.variables);
        useAircraftStore.getState().setAircraftState(acState);
        if (msg.radios) {
          useAircraftStore.getState().updateRadios(msg.radios);
        }
        break;
      case 'sim.heartbeat':
        this.resetHeartbeatWatchdog();
        break;
      case 'error':
        devError('[WS] Server error:', msg.message);
        break;
    }
  }

  private getSavedServerUrl(): string {
    try {
      const saved = localStorage.getItem('cdu-server-url');
      if (saved) return saved;
    } catch {
      devError('[WS] Failed to read server URL');
    }
    return `ws://${window.location.hostname}:8080`;
  }

  private saveServerUrl(url: string): void {
    try {
      localStorage.setItem('cdu-server-url', url);
    } catch {
      devError('[WS] Failed to save server URL');
    }
  }

  public getUrl(): string {
    return this.url;
  }
}

export const webSocketClient = new WebSocketClient();
