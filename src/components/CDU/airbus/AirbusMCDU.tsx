import { useCallback } from 'react';
import { useKioskMode } from '../../../hooks/useKioskMode';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { useFMCStore } from '../../../store/useFMCStore';
import { useAircraftStore } from '../../../store/aircraftStore';
import { useConnectionStore } from '../../../store/connectionStore';
import { useTrainingStore } from '../../../store/trainingStore';
import { useCockpitLayoutStore } from '../../../store/cockpitLayoutStore';
import type { CDUKey } from '@shared';
import { AirbusMCDUShell } from './AirbusMCDUShell';
import { AirbusDisplayBay } from './AirbusDisplayBay';
import { AirbusFunctionKeyPanel } from './AirbusFunctionKeyPanel';
import { AirbusKeypad } from './AirbusKeypad';
import { AnnunciatorLight } from '../../instruments/common/AnnunciatorLight';

export function AirbusMCDU() {
  const isKiosk = useKioskMode();
  const pressKey = useFMCStore(s => s.pressKey);
  const pressLSK = useFMCStore(s => s.pressLSK);
  const annunciators = useAircraftStore(s => s.airbusAnnunciators);
  const execLit = useFMCStore(s => s.execLit);
  const connectionMode = useConnectionStore(s => s.connectionMode);
  const connectionStatus = useConnectionStore(s => s.connectionStatus);
  const tutorialHighlight = useTrainingStore(s => s.tutorialHighlight);
  const brightness = useCockpitLayoutStore(s => s.brightness);
  const { send } = useWebSocket();

  const onPressKey = useCallback((key: string) => {
    if (connectionMode === 'CONTROL' && connectionStatus === 'CONNECTED') {
      send({ type: 'fmc.input', key: key as CDUKey });
      return;
    }
    pressKey(key as CDUKey, 'AIRBUS_A320');
  }, [pressKey, connectionMode, connectionStatus, send]);

  const onPressLSK = useCallback((side: 'L' | 'R', index: number) => {
    if (connectionMode === 'CONTROL' && connectionStatus === 'CONNECTED') {
      send({ type: 'fmc.input', key: `${side}${index}` as CDUKey });
      return;
    }
    pressLSK(side, index, 'AIRBUS_A320');
  }, [pressLSK, connectionMode, connectionStatus, send]);

  const displayData = useFMCStore(s => s.getDisplayData('AIRBUS_A320'));
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

  const isHighlighted = (id: string) => tutorialHighlight === id;

  return (
    <div className={`flex h-full w-full items-center justify-center bg-[#111] airbus-mcdu ${isKiosk ? 'fixed inset-0' : ''}`}>
      <AirbusMCDUShell annunciators={annunciators}>
        <AirbusDisplayBay
          brightness={brightness}
          getLSKLabel={getLSKLabel}
          isHighlighted={isHighlighted}
          onPressLSK={onPressLSK}
        />
        <AirbusFunctionKeyPanel onPress={onPressKey} isHighlighted={isHighlighted} />
        <AirbusKeypad onPress={onPressKey} highlight={tutorialHighlight} execLit={execLit} />
      </AirbusMCDUShell>
    </div>
  );
}
