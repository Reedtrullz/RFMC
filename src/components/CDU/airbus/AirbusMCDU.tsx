import { type CSSProperties, useCallback, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useKioskMode } from '../../../hooks/useKioskMode';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { useFMCStore } from '../../../store/useFMCStore';
import { useAircraftStore } from '../../../store/aircraftStore';
import { useConnectionStore } from '../../../store/connectionStore';
import { useCockpitLayoutStore } from '../../../store/cockpitLayoutStore';
import { useAutopilotStore } from '../../../store/autopilotStore';
import { useDisplaySettings } from '../../../store/displaySettingsStore';
import { buildTrainingProgress, type CDUKey } from '@shared';
import { AirbusMCDUShell } from './AirbusMCDUShell';
import { AirbusDisplayBay } from './AirbusDisplayBay';
import { AirbusFunctionKeyPanel } from './AirbusFunctionKeyPanel';
import { AirbusKeypad } from './AirbusKeypad';
import { AnnunciatorLight } from '../../instruments/common/AnnunciatorLight';
import { HardwareRealismControls } from '../HardwareRealismControls';

export function AirbusMCDU() {
  const isKiosk = useKioskMode();
  const pressKey = useFMCStore((s) => s.pressKey);
  const pressLSK = useFMCStore((s) => s.pressLSK);
  const annunciators = useAircraftStore((s) => s.airbusAnnunciators);
  const execLit = useFMCStore((s) => s.execLit);
  const connectionMode = useConnectionStore((s) => s.connectionMode);
  const connectionStatus = useConnectionStore((s) => s.connectionStatus);
  const tutorialHighlight = useFMCStore((s) => s.tutorialHighlight);
  const brightness = useCockpitLayoutStore((s) => s.brightness);
  const focusedPanel = useCockpitLayoutStore((s) => s.focusedPanel);
  const { crtIntensity, wearIntensity, bloomIntensity, scanlineIntensity } = useDisplaySettings(
    useShallow((s) => ({
      crtIntensity: s.crtIntensity,
      wearIntensity: s.wearIntensity,
      bloomIntensity: s.bloomIntensity,
      scanlineIntensity: s.scanlineIntensity,
    })),
  );

  const currentPage = useFMCStore((s) => s.currentPage);
  const aircraft = useFMCStore((s) => s.aircraft);
  const flightPhase = useFMCStore((s) => s.flightPhase);
  const tutorialActive = useFMCStore((s) => s.tutorialActive);

  const layoutMode = useCockpitLayoutStore((s) => s.cockpitLayoutMode);
  const autopilotState = useAutopilotStore((state) => ({
    boeing: state.boeing,
    airbus: state.airbus,
    truth: state.truth,
  }));

  const progress = useMemo(() => {
    void currentPage;
    void flightPhase;
    void tutorialActive;
    return buildTrainingProgress({
      aircraft: 'AIRBUS_A320',
      layoutMode,
      fmcState: useFMCStore.getState(),
      autopilotState,
    });
  }, [layoutMode, currentPage, flightPhase, tutorialActive, autopilotState]);

  const { send } = useWebSocket();

  const onPressKey = useCallback(
    (key: string) => {
      if (connectionMode === 'CONTROL' && connectionStatus === 'CONNECTED') {
        send({ type: 'fmc.input', key: key as CDUKey });
        return;
      }
      pressKey(key as CDUKey);
    },
    [pressKey, connectionMode, connectionStatus, send],
  );

  const onPressLSK = useCallback(
    (side: 'L' | 'R', index: number) => {
      if (connectionMode === 'CONTROL' && connectionStatus === 'CONNECTED') {
        send({ type: 'fmc.input', key: `${side}${index}` as CDUKey });
        return;
      }
      pressLSK(side, index);
    },
    [pressLSK, connectionMode, connectionStatus, send],
  );

  const isHighlighted = useCallback(
    (id: string) => {
      if (tutorialHighlight === id) return true;
      return false;
    },
    [tutorialHighlight],
  );

  // Only show realism controls when not in focused CDU mode
  const showRealismControls = focusedPanel !== 'cdu';
  const wearLevel = Math.max(0, Math.min(100, wearIntensity)) / 100;
  const hardwareWearClass =
    wearIntensity >= 70 ? 'hardware-wear-unit--abused' : wearIntensity >= 35 ? 'hardware-wear-unit--used' : '';
  const hardwareWearStyle = {
    '--hardware-crt': (Math.max(0, Math.min(100, crtIntensity)) / 100).toFixed(2),
    '--hardware-wear': wearLevel.toFixed(2),
    '--hardware-wear-inverse': (1 - wearLevel).toFixed(2),
    '--hardware-bloom': (Math.max(0, Math.min(100, bloomIntensity)) / 100).toFixed(2),
    '--hardware-scan': (Math.max(0, Math.min(100, scanlineIntensity)) / 100).toFixed(2),
  } as CSSProperties;

  return (
    <div
      className={`hardware-wear-unit ${hardwareWearClass} flex h-full w-full flex-col items-center justify-center bg-[#111] ${isKiosk ? 'fixed inset-0' : ''}`}
      style={hardwareWearStyle}
    >
      <AirbusMCDUShell annunciators={annunciators}>
        <AirbusDisplayBay
          brightness={brightness}
          getLSKLabel={() => undefined}
          isHighlighted={isHighlighted}
          onPressLSK={onPressLSK}
        />
        <AirbusFunctionKeyPanel onPress={onPressKey} isHighlighted={isHighlighted} />
        <AirbusKeypad onPress={onPressKey} highlight={null} execLit={execLit} />
      </AirbusMCDUShell>

      {showRealismControls && (
        <div className="mt-3 w-full max-w-[620px]">
          <HardwareRealismControls />
        </div>
      )}
    </div>
  );
}
