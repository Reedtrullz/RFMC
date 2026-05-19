import { useState, useEffect } from 'react';
import { useWebSocket, saveServerUrl, getServerUrl } from '../hooks/useWebSocket';
import { useFMCStore } from '../store/useFMCStore';
import { useAircraftStore } from '../store/aircraftStore';
import { useConnectionStore } from '../store/connectionStore';
import { useCockpitLayoutStore } from '../store/cockpitLayoutStore';
import { CDUButton } from './CDU/CDUButton';

const AIRCRAFT_LABELS: Record<string, string> = {
  BOEING_737: 'PMDG 737-800',
  AIRBUS_A320: 'FBW A320',
  CJ4: 'Working Title CJ4',
};

const INTEGRATION_NOTES: Record<string, string> = {
  BOEING_737: 'PMDG round-trip requires live Windows + MSFS + PMDG verification.',
  AIRBUS_A320: 'FBW display and key I/O are mock-only in this build.',
};

export function ConnectionStatus() {
  const [showSettings, setShowSettings] = useState(false);
  const [serverUrl, setServerUrl] = useState(getServerUrl());
  const { connect, disconnect } = useWebSocket({ autoConnect: false });
  const isHidden = useCockpitLayoutStore((s) => s.hiddenPanels.includes('connection'));
  const cockpitMode = useCockpitLayoutStore((s) => s.cockpitMode);
  const configuredAircraft = useAircraftStore((s) => s.aircraft);
  const aircraftState = useAircraftStore((s) => s.aircraftState);
  const connectionStatus = useConnectionStore((s) => s.connectionStatus);
  const connectionMode = useConnectionStore((s) => s.connectionMode);
  const connectedAircraft = useConnectionStore((s) => s.connectedAircraft);
  const lastError = useConnectionStore((s) => s.lastError);
  const adapterHealth = useConnectionStore((s) => s.adapterHealth);

  const connectedAircraftType = useConnectionStore((s) => s.connectedAircraftType);
  const connectedCapabilities = useConnectionStore((s) => s.connectedCapabilities);
  const structuredCapabilities = useConnectionStore((s) => s.structuredCapabilities);
  const latency = useConnectionStore((s) => s.latency);
  const sessionStartTime = useConnectionStore((s) => s.sessionStartTime);
  const [uptime, setUptime] = useState('00:00:00');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!sessionStartTime || connectionStatus !== 'CONNECTED') {
      setUptime('00:00:00');
      return;
    }

    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - sessionStartTime) / 1000);
      const h = Math.floor(seconds / 3600)
        .toString()
        .padStart(2, '0');
      const m = Math.floor((seconds % 3600) / 60)
        .toString()
        .padStart(2, '0');
      const s = Math.floor(seconds % 60)
        .toString()
        .padStart(2, '0');
      setUptime(`${h}:${m}:${s}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime, connectionStatus]);

  if (cockpitMode && isHidden) return null;

  const statusMap = {
    DISCONNECTED: { label: 'DISCONNECTED', color: 'bg-gray-500', text: 'text-gray-400' },
    CONNECTING: { label: 'CONNECTING', color: 'bg-cdu-amber animate-pulse', text: 'text-cdu-amber' },
    CONNECTED: { label: 'CONNECTED', color: 'bg-cdu-exec', text: 'text-cdu-exec' },
    ERROR: { label: 'ERROR', color: 'bg-cdu-error', text: 'text-cdu-error' },
  } as const;

  const status = statusMap[connectionStatus];
  const aircraftType = connectedAircraftType || configuredAircraft;
  const adapterName = connectedAircraft || AIRCRAFT_LABELS[aircraftType] || aircraftType;
  const capabilities = connectedCapabilities ?? [];
  const integrationNote = INTEGRATION_NOTES[aircraftType];

  const formatNumber = (value: number | undefined, digits = 0) =>
    typeof value === 'number' && Number.isFinite(value) ? value.toFixed(digits) : '---';

  const handleConnect = () => {
    saveServerUrl(serverUrl);
    connect();
  };

  const handleDisconnect = () => {
    disconnect();
    setShowSettings(false);
  };

  return (
    <div className="fixed bottom-2 right-2 z-50">
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cdu-bezel/90 backdrop-blur border border-cdu-bezel-light shadow-lg"
      >
        <div className={`w-2.5 h-2.5 rounded-full ${status.color}`} />
        <span className={`text-xs font-cdu ${status.text}`}>{status.label}</span>
        <span className="hidden sm:inline text-[10px] font-cdu text-cdu-cyan/80">{adapterName}</span>
      </button>

      {showSettings && (
        <div className="absolute bottom-full right-0 mb-2 p-3 rounded-lg bg-cdu-bezel border border-cdu-bezel-light shadow-lg min-w-[300px] max-w-[340px]">
          <h3 className="text-cdu-cyan text-xs font-cdu uppercase tracking-wider mb-2">MSFS Connection Diagnostics</h3>

          <div className="mb-3 space-y-1 rounded bg-cdu-screen/80 border border-cdu-bezel-light/60 p-2 font-cdu text-[10px]">
            <DiagnosticRow label="STATUS" value={status.label} className={status.text} />
            <DiagnosticRow label="ADAPTER" value={adapterName} className="text-cdu-cyan" />
            <DiagnosticRow label="MODE" value={connectionMode} />
            {connectionStatus === 'CONNECTED' && (
              <>
                <DiagnosticRow label="AIRCRAFT" value={aircraftType} />
                <DiagnosticRow
                  label="HEALTH"
                  value={adapterHealth?.state ?? connectionStatus}
                  className={adapterHealth?.state === 'CONNECTED' ? 'text-cdu-exec' : 'text-cdu-amber'}
                />
                <DiagnosticRow label="PROFILE" value={adapterHealth?.profileVersion ?? '---'} />
                <DiagnosticRow label="CAPS" value={capabilities.length ? capabilities.join(', ') : '---'} />
                <DiagnosticRow
                  label="DATA"
                  value={structuredCapabilities?.data.length ? structuredCapabilities.data.join(', ') : '---'}
                />
                <DiagnosticRow
                  label="LATENCY"
                  value={`${latency} MS`}
                  className={latency > 100 ? 'text-cdu-amber' : 'text-cdu-exec'}
                />
                <DiagnosticRow label="UPTIME" value={uptime} className="text-cdu-cyan" />
              </>
            )}
            {lastError && (
              <div className="pt-1 text-cdu-error leading-tight">
                <span className="text-cdu-text/50">LAST ERROR </span>
                {lastError}
              </div>
            )}
            {isOffline && (
              <div className="pt-1 text-cdu-amber leading-tight">
                <span className="text-cdu-text/50">NETWORK </span>OFFLINE (LOCAL CACHE ACTIVE)
              </div>
            )}
            {integrationNote && (
              <div className="pt-1 text-cdu-amber leading-tight">
                <span className="text-cdu-text/50">LIMIT </span>
                {integrationNote}
              </div>
            )}
          </div>

          {connectionStatus === 'CONNECTED' && (
            <div className="mb-3 grid grid-cols-2 gap-x-3 gap-y-1 rounded bg-cdu-screen/80 border border-cdu-bezel-light/60 p-2 font-cdu text-[10px]">
              <DiagnosticRow label="LAT" value={formatNumber(aircraftState?.lat, 5)} />
              <DiagnosticRow label="LON" value={formatNumber(aircraftState?.lon, 5)} />
              <DiagnosticRow label="ALT" value={`${formatNumber(aircraftState?.altitude)} FT`} />
              <DiagnosticRow label="HDG" value={`${formatNumber(aircraftState?.heading)}°`} />
              <DiagnosticRow label="SPD" value={`${formatNumber(aircraftState?.ias)} KT`} />
              <DiagnosticRow label="VS" value={`${formatNumber(aircraftState?.vs)} FPM`} />
            </div>
          )}

          <label className="block text-cdu-text/50 text-[10px] font-cdu mb-1">Server URL (WebSocket)</label>
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
                onPress={handleDisconnect}
              />
            ) : (
              <CDUButton
                label={connectionStatus === 'ERROR' ? 'RETRY MSFS' : 'CONNECT TO MSFS'}
                className="flex-1 h-8 text-[10px]"
                variant="exec"
                onPress={handleConnect}
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

function DiagnosticRow({
  label,
  value,
  className = 'text-cdu-text',
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="flex justify-between gap-2 min-w-0">
      <span className="text-cdu-text/50 shrink-0">{label}</span>
      <span className={`truncate text-right ${className}`}>{value}</span>
    </div>
  );
}
