import { useEffect, useCallback, useState } from 'react';
import type { ClientMessage } from '@shared';
import { webSocketClient } from '../services/WebSocketClient';
import { useConnectionStore } from '../store/connectionStore';

interface UseWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const fmcStatus = useConnectionStore((s) => s.connectionStatus);
  const [status, setStatus] = useState(fmcStatus);

  useEffect(() => {
    return webSocketClient.subscribe(setStatus);
  }, []);

  const connect = useCallback(() => {
    webSocketClient.connect(options.url);
  }, [options.url]);

  const disconnect = useCallback(() => {
    webSocketClient.disconnect();
  }, []);

  const send = useCallback((msg: ClientMessage) => {
    webSocketClient.send(msg);
  }, []);

  // Handle auto-connect if requested
  useEffect(() => {
    if (options.autoConnect && fmcStatus === 'DISCONNECTED') {
      connect();
    }
  }, [options.autoConnect, connect, fmcStatus]);

  return {
    connectionStatus: status,
    connect,
    disconnect,
    send,
  };
}

export function saveServerUrl(url: string): void {
  localStorage.setItem('cdu-server-url', url);
}

export function getServerUrl(): string {
  return webSocketClient.getUrl();
}
