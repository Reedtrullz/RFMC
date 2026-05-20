import { useCallback, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useKioskMode } from '../../../hooks/useKioskMode';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { useFMCStore } from '../../../store/useFMCStore';
import { useAircraftStore } from '../../../store/aircraftStore';
import { useConnectionStore } from '../../../store/connectionStore';
import { useCockpitLayoutStore } from '../../../store/cockpitLayoutStore';
import { useAutopilotStore } from '../../../store/autopilotStore';
import { buildTrainingProgress, type CDUKey } from '@shared';
import { AirbusMCDUShell } from './AirbusMCDUShell';
import { AirbusDisplayBay } from './AirbusDisplayBay';
import { AirbusFunctionKeyPanel } from './AirbusFunctionKeyPanel';
import { AirbusKeypad } from './AirbusKeypad';
import { AnnunciatorLight } from '../../instruments/common/AnnunciatorLight';

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

  const displayData = useFMCStore(useShallow((s) => s.getDisplayData()));
  const getLSKLabel = (side: 'L' | 'R', index: number): string | undefined => {
    const lskId = `${side}${index}`;
    const action = displayData.lskActions[lskId];
    if (!action) return undefined;
    if (action === 'next_page' || action === 'fpln_next') return '▼';
    if (action === 'prev_page' || action === 'fpln_prev') return '▲';
    if (side === 'L' && action) return '◄';
    if (side === 'R' && action) return '►';
    return undefined;
  };

  const isHighlighted = useCallback(
    (id: string) => {
      if (tutorialHighlight === id) return true;
      if (tutorialActive && layoutMode !== 'free-practice') {
        if (progress.expectedLSK === id) return true;
        if (progress.expectedKey === id) return true;
        if (id === 'INIT_A' && progress.expectedKey === 'INIT_B') return true;
      }
      return false;
    },
    [tutorialActive, tutorialHighlight, progress.expectedLSK, progress.expectedKey, layoutMode],
  );

  const keypadHighlight =
    tutorialHighlight || (tutorialActive && layoutMode !== 'free-practice' ? progress.expectedKey : null);

  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-[#111] airbus-mcdu ${isKiosk ? 'fixed inset-0' : ''}`}
    >
      <AirbusMCDUShell annunciators={annunciators}>
        <AirbusDisplayBay
          brightness={brightness}
          getLSKLabel={getLSKLabel}
          isHighlighted={isHighlighted}
          onPressLSK={onPressLSK}
        />
        <AirbusFunctionKeyPanel onPress={onPressKey} isHighlighted={isHighlighted} />
        <AirbusKeypad onPress={onPressKey} highlight={keypadHighlight} execLit={execLit} />
      </AirbusMCDUShell>
    </div>
  );
}
