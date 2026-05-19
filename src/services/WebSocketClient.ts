import type { ClientMessage, ServerMessage } from '@shared';
import { devLog, devError } from '@shared';
import { useFMCStore } from '../store/useFMCStore';
import { useAircraftStore } from '../store/aircraftStore';

type StatusListener = (status: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR') => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private statusListeners: Set<StatusListener> = new Set();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private url: string = '';

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
    this.statusListeners.forEach((l) => l(status));
  }

  public connect(url?: string) {
    if (url) {
      this.url = url;
      this.saveServerUrl(url);
    }

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;

    this.setStatus('CONNECTING');

    try {
      const ws = new WebSocket(this.url);
      this.ws = ws;

      ws.onopen = () => {
        devLog('[WS] Connected to', this.url);
        this.setStatus('CONNECTED');
        this.send({ type: 'sim.connect' } satisfies ClientMessage);
        this.reconnectAttempts = 0;
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
        this.setStatus('DISCONNECTED');
        this.ws = null;
        this.scheduleReconnect();
      };

      ws.onerror = (err) => {
        const error = err instanceof Event ? 'WebSocket error event' : err;
        devError('[WS] WebSocket error:', error);

        const isFatal = this.classifyError(error);

        if (isFatal) {
          devError('[WS] Fatal error encountered, stopping reconnect attempts');
          this.setStatus('ERROR');
          this.ws?.close();
          if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
          }
          this.handleFatalError(error);
        } else {
          this.setStatus('ERROR');
          this.ws?.close();
          this.scheduleReconnect();
        }
      };
    } catch (err) {
      devError('[WS] Connection failed:', err);
      this.setStatus('ERROR');
      this.scheduleReconnect();
    }
  }

  public disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.send({ type: 'sim.disconnect' } satisfies ClientMessage);
    }
    this.ws?.close();
    this.ws = null;
    this.setStatus('DISCONNECTED');
  }

  public send(msg: ClientMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
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
