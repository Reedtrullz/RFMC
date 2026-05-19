import type { ClientMessage, ServerMessage } from '@shared';
import { devLog, devError } from '@shared';
import { useFMCStore } from '../store/useFMCStore';

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
    return () => { this.statusListeners.delete(listener); };
  }

  private setStatus(status: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR') {
    useFMCStore.getState().setConnectionStatus(status);
    this.statusListeners.forEach(l => l(status));
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
        devError('[WS] Error:', err);
        this.setStatus('ERROR');
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

  private handleServerMessage(msg: ServerMessage) {
    const store = useFMCStore.getState();
    switch (msg.type) {
      case 'fmc.display':
        store.setExternalDisplayData(msg.data);
        break;
      case 'sim.connected':
        store.setConnectionStatus('CONNECTED');
        store.setConnectionMode('CONTROL');
        store.setConnectionDiagnostics({
          structuredCapabilities: msg.structuredCapabilities ?? null,
          adapterHealth: msg.adapterHealth ?? null,
        });
        store.setConnectedAircraft(msg.aircraft, msg.capabilities ?? null, msg.aircraftType ?? null);
        store.setConnectedLastError(msg.lastError ?? null);
        store.setSessionStartTime(Date.now());
        break;
      case 'sim.disconnected':
        store.setConnectionStatus('DISCONNECTED');
        store.setConnectionMode('STANDALONE');
        store.setConnectedAircraft(null, null, null);
        store.setConnectionDiagnostics({
          structuredCapabilities: null,
          adapterHealth: null,
        });
        store.setAircraftState(null);
        store.setConnectedLastError(msg.lastError ?? null);
        store.setSessionStartTime(null);
        break;
      case 'sim.data':
        store.setSimVariables(msg.variables);
        if (msg.aircraftState) {
          store.setAircraftState(msg.aircraftState);
        }
        break;
      case 'sim.heartbeat':
        store.setLatency(Math.abs(Date.now() - msg.serverTime));
        break;
      case 'error':
        devError('[WS] Server error:', msg.message);
        store.setConnectionStatus('ERROR');
        store.setConnectedLastError(msg.message);
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
