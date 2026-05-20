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
import { BoeingKeypadArea } from './BoeingKeypadArea';
import { BoeingCDUShell } from './BoeingCDUShell';
import { BoeingDisplayBay } from './BoeingDisplayBay';
import { AnnunciatorLight } from '../../instruments/common/AnnunciatorLight';

export function Boeing737CDU() {
  const isKiosk = useKioskMode();

  const pressKey = useFMCStore((s) => s.pressKey);
  const pressLSK = useFMCStore((s) => s.pressLSK);
  const annunciators = useAircraftStore((s) => s.boeingAnnunciators);
  const execLit = useFMCStore((s) => s.execLit);
  const connectionMode = useConnectionStore((s) => s.connectionMode);
  const connectionStatus = useConnectionStore((s) => s.connectionStatus);
  const tutorialHighlight = useFMCStore((s) => s.tutorialHighlight);
  const tutorialHintLevel = useFMCStore((s) => s.tutorialHintLevel);
  const brightness = useCockpitLayoutStore((s) => s.brightness);
  const setBrightness = useCockpitLayoutStore((s) => s.setBrightness);
  const displayData = useFMCStore(useShallow((s) => s.getDisplayData()));

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
      aircraft,
      layoutMode,
      fmcState: useFMCStore.getState(),
      autopilotState,
    });
  }, [aircraft, layoutMode, currentPage, flightPhase, tutorialActive, autopilotState]);

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

  const getLSKLabel = useCallback(
    (side: 'L' | 'R', index: number): string | undefined => {
      const lskId = `${side}${index}`;
      const action = displayData.lskActions[lskId];
      if (!action) return undefined;
      if (displayData.lskLabels?.[lskId]) return displayData.lskLabels[lskId];
      if (action === 'next_page') return '▼';
      if (action === 'prev_page') return '▲';
      if (action === 'dep_page') return 'DEP';
      if (action === 'arr_page') return 'ARR';
      if (action === 'set_hold_fix') return 'FIX';
      if (action === 'set_inbound_crs') return 'CRS';
      if (action === 'set_leg_time') return 'TIME';
      if (action === 'set_leg_dist') return 'DIST';
      if (action === 'set_hold_direction') return 'DIR';
      if (action === 'set_fix_ref') return 'REF';
      if (action === 'set_fix_radial_distance') return 'RAD/DIS';
      if (side === 'L' && action) return '◄';
      if (side === 'R' && action) return '►';
      return undefined;
    },
    [displayData.lskActions, displayData.lskLabels],
  );

  const isHighlighted = useCallback(
    (id: string) => {
      if (tutorialHighlight === id) return true;
      if (tutorialActive && layoutMode !== 'free-practice') {
        if (progress.expectedLSK === id) return true;
        if (progress.expectedKey === id) return true;
        if (id === 'POS_INIT' && progress.expectedKey === 'INIT_REF') return true;
        if (id === 'PERF_INIT' && progress.expectedKey === 'PERF') return true;
        if (id === 'PROGRESS' && progress.expectedKey === 'PROG') return true;
      }
      return false;
    },
    [tutorialActive, tutorialHighlight, progress.expectedLSK, progress.expectedKey, layoutMode],
  );

  const effectiveHintLevel =
    tutorialHintLevel ||
    (tutorialHighlight ||
    (tutorialActive && layoutMode !== 'free-practice' && (progress.expectedKey || progress.expectedLSK))
      ? 1
      : 0);
  const keypadHighlight =
    tutorialHighlight || (tutorialActive && layoutMode !== 'free-practice' ? progress.expectedKey : null);

  return (
    <div className={`flex h-full w-full items-center justify-center bg-[#111] ${isKiosk ? 'fixed inset-0' : ''}`}>
      <BoeingCDUShell annunciators={annunciators}>
        <BoeingDisplayBay
          brightness={brightness}
          getLSKLabel={getLSKLabel}
          isHighlighted={isHighlighted}
          hintLevel={effectiveHintLevel}
          onPressLSK={onPressLSK}
        />
        <BoeingKeypadArea
          onPress={onPressKey}
          isHighlighted={isHighlighted}
          hintLevel={effectiveHintLevel}
          execLit={execLit}
          brightness={brightness}
          onBrightnessChange={setBrightness}
        />
      </BoeingCDUShell>
    </div>
  );
}
