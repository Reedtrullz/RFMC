import { useState } from 'react';
import { useWebSocket, saveServerUrl, getServerUrl } from '../hooks/useWebSocket';
import { CDUButton } from './CDU/CDUButton';

export function ConnectionStatus() {
  const [showSettings, setShowSettings] = useState(false);
  const [serverUrl, setServerUrl] = useState(getServerUrl());
  const { connectionStatus, connect, disconnect } = useWebSocket({ autoConnect: false });

  const statusMap = {
    DISCONNECTED: { label: 'Disconnected', color: 'bg-gray-500', text: 'text-gray-400' },
    CONNECTING: { label: 'Connecting...', color: 'bg-cdu-amber animate-pulse', text: 'text-cdu-amber' },
    CONNECTED: { label: 'Connected', color: 'bg-cdu-exec', text: 'text-cdu-exec' },
    ERROR: { label: 'Connection Error', color: 'bg-cdu-error', text: 'text-cdu-error' },
  };

  const status = statusMap[connectionStatus];

  return (
    <div className="fixed bottom-2 right-2 z-50">
      {/* Status indicator */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cdu-bezel/90 backdrop-blur border border-cdu-bezel-light"
      >
        <div className={`w-2.5 h-2.5 rounded-full ${status.color}`} />
        <span className={`text-xs font-cdu ${status.text}`}>{status.label}</span>
      </button>

      {/* Settings panel */}
      {showSettings && (
        <div className="absolute bottom-full right-0 mb-2 p-3 rounded-lg bg-cdu-bezel border border-cdu-bezel-light shadow-lg min-w-[260px]">
          <h3 className="text-cdu-text/70 text-xs font-cdu uppercase tracking-wider mb-2">
            Connection Settings
          </h3>

          <label className="block text-cdu-text/50 text-[10px] font-cdu mb-1">
            Server URL (WebSocket)
          </label>
          <input
            type="text"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            placeholder="ws://192.168.1.100:8080"
            className="w-full px-2 py-1.5 text-xs font-cdu bg-cdu-screen border border-cdu-bezel-light rounded text-cdu-text mb-2"
          />

          <div className="flex gap-1">
            {connectionStatus === 'CONNECTED' ? (
              <CDUButton
                label="DISCONNECT"
                className="flex-1 h-8 text-[10px]"
                variant="default"
                onPress={() => {
                  disconnect();
                  setShowSettings(false);
                }}
              />
            ) : (
              <CDUButton
                label="CONNECT"
                className="flex-1 h-8 text-[10px]"
                variant="exec"
                onPress={() => {
                  saveServerUrl(serverUrl);
                  connect();
                  setShowSettings(false);
                }}
              />
            )}
            <CDUButton
              label="CLOSE"
              className="flex-1 h-8 text-[10px]"
              variant="default"
              onPress={() => setShowSettings(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
