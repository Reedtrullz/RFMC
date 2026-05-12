import { useEffect, useRef, useCallback, useState } from 'react';
import type { ClientMessage, ServerMessage, ConnectionMode } from '@shared';
import { devLog, devError } from '@shared';
import { useFMCStore } from '../store/useFMCStore';

const RECONNECT_BASE_DELAY = 1000;
const RECONNECT_MAX_DELAY = 10000;

interface UseWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const [connectionStatus, setConnectionStatus] = useState<'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR'>('DISCONNECTED');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef(0);

  const setFMCConnectionStatus = useFMCStore(s => s.setConnectionStatus);
  const setConnectionMode = useFMCStore(s => s.setConnectionMode);
  const setAircraftState = useFMCStore(s => s.setAircraftState);

  const connect = useCallback(() => {
    const url = options.url || getSavedServerUrl();

    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setConnectionStatus('CONNECTING');
    setFMCConnectionStatus('CONNECTING');

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        devLog('[WS] Connected to', url);
        setConnectionStatus('CONNECTED');
        setFMCConnectionStatus('CONNECTED');
        ws.send(JSON.stringify({ type: 'sim.connect' } satisfies ClientMessage));
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const msg: ServerMessage = JSON.parse(event.data);
          handleServerMessage(msg);
        } catch (err) {
          devError('[WS] Parse error:', err);
        }
      };

      ws.onclose = () => {
        devLog('[WS] Disconnected');
        setConnectionStatus('DISCONNECTED');
        setFMCConnectionStatus('DISCONNECTED');
        wsRef.current = null;
        scheduleReconnect();
      };

      ws.onerror = (err) => {
        devError('[WS] Error:', err);
        setConnectionStatus('ERROR');
        setFMCConnectionStatus('ERROR');
      };
    } catch (err) {
      devError('[WS] Connection failed:', err);
      setConnectionStatus('ERROR');
      setFMCConnectionStatus('ERROR');
      scheduleReconnect();
    }
  }, [options.url]);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'sim.disconnect' } satisfies ClientMessage));
    }
    wsRef.current?.close();
    setConnectionStatus('DISCONNECTED');
    setFMCConnectionStatus('DISCONNECTED');
  }, []);

  const send = useCallback((msg: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  function scheduleReconnect() {
    if (reconnectTimer.current) return;
    if (reconnectAttempts.current > 5) return;

    const delay = Math.min(
      RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttempts.current),
      RECONNECT_MAX_DELAY
    );

    reconnectTimer.current = setTimeout(() => {
      reconnectTimer.current = null;
      reconnectAttempts.current++;
      connect();
    }, delay);
  }

  // Handle visibility change (iOS background/foreground)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        if (wsRef.current?.readyState !== WebSocket.OPEN) {
          reconnectAttempts.current = 0;
          connect();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, []);

  return {
    connectionStatus,
    connect,
    disconnect,
    send,
  };
}

function handleServerMessage(msg: ServerMessage): void {
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
      // Basic latency estimate (assumes clock sync, or just shows jitter)
      store.setLatency(Math.abs(Date.now() - msg.serverTime));
      break;
    case 'error':
      devError('[WS] Server error:', msg.message);
      store.setConnectionStatus('ERROR');
      store.setConnectedLastError(msg.message);
      break;
  }
}

function getSavedServerUrl(): string {
  try {
    const saved = localStorage.getItem('cdu-server-url');
    if (saved) return saved;
  } catch {
    devError('[WS] Failed to read server URL');
  }
  return `ws://${window.location.hostname}:8080`;
}

export function saveServerUrl(url: string): void {
  try {
    localStorage.setItem('cdu-server-url', url);
  } catch {
    devError('[WS] Failed to save server URL');
  }
}

export function getServerUrl(): string {
  return getSavedServerUrl();
}
