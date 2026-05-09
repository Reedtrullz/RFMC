import { useEffect, useRef, useCallback, useState } from 'react';
import type { ClientMessage, ServerMessage, ConnectionMode } from '@shared';
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

  const connect = useCallback(() => {
    const url = options.url || getSavedServerUrl();

    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setConnectionStatus('CONNECTING');
    setFMCConnectionStatus('CONNECTING');

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WS] Connected to', url);
        setConnectionStatus('CONNECTED');
        setFMCConnectionStatus('CONNECTED');
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const msg: ServerMessage = JSON.parse(event.data);
          handleServerMessage(msg);
        } catch (err) {
          console.error('[WS] Parse error:', err);
        }
      };

      ws.onclose = () => {
        console.log('[WS] Disconnected');
        setConnectionStatus('DISCONNECTED');
        setFMCConnectionStatus('DISCONNECTED');
        wsRef.current = null;
        scheduleReconnect();
      };

      ws.onerror = (err) => {
        console.error('[WS] Error:', err);
        setConnectionStatus('ERROR');
        setFMCConnectionStatus('ERROR');
      };
    } catch (err) {
      console.error('[WS] Connection failed:', err);
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
      // In backend-authoritative mode, we would apply display data
      // For now, just log it
      console.log('[WS] Display update:', msg.data.title);
      break;
    case 'sim.connected':
      store.setConnectionStatus('CONNECTED');
      store.setConnectionMode('CONTROL');
      break;
    case 'sim.disconnected':
      store.setConnectionStatus('DISCONNECTED');
      store.setConnectionMode('STANDALONE');
      break;
    case 'sim.data':
      // Handle sim data variables
      break;
    case 'error':
      console.error('[WS] Server error:', msg.message);
      break;
  }
}

function getSavedServerUrl(): string {
  try {
    const saved = localStorage.getItem('cdu-server-url');
    if (saved) return saved;
  } catch {}
  return `ws://${window.location.hostname}:8080`;
}

export function saveServerUrl(url: string): void {
  try {
    localStorage.setItem('cdu-server-url', url);
  } catch {}
}

export function getServerUrl(): string {
  return getSavedServerUrl();
}
