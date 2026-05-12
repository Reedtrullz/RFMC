import { useCallback } from 'react';
import { useKioskMode } from '../../../hooks/useKioskMode';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { useFMCStore } from '../../../store/useFMCStore';
import type { CDUKey } from '@shared';
import { AirbusMCDUShell } from './AirbusMCDUShell';
import { AirbusDisplayBay } from './AirbusDisplayBay';
import { AirbusFunctionKeyPanel } from './AirbusFunctionKeyPanel';
import { AirbusKeypad } from './AirbusKeypad';

export function AirbusMCDU() {
  const isKiosk = useKioskMode();
  const pressKey = useFMCStore(s => s.pressKey);
  const pressLSK = useFMCStore(s => s.pressLSK);
  const msgLight = useFMCStore(s => s.msgLight);
  const execLit = useFMCStore(s => s.execLit);
  const connectionMode = useFMCStore(s => s.connectionMode);
  const connectionStatus = useFMCStore(s => s.connectionStatus);
  const tutorialHighlight = useFMCStore(s => s.tutorialHighlight);
  const brightness = useFMCStore(s => s.brightness);
  const { send } = useWebSocket();

  const onPressKey = useCallback((key: string) => {
    pressKey(key as CDUKey);
    if (connectionMode === 'CONTROL' && connectionStatus === 'CONNECTED') {
      send({ type: 'fmc.input', key: key as CDUKey });
    }
  }, [pressKey, connectionMode, connectionStatus, send]);

  const onPressLSK = useCallback((side: 'L' | 'R', index: number) => {
    pressLSK(side, index);
    if (connectionMode === 'CONTROL' && connectionStatus === 'CONNECTED') {
      send({ type: 'fmc.input', key: `${side}${index}` as CDUKey });
    }
  }, [pressLSK, connectionMode, connectionStatus, send]);

  const displayData = useFMCStore(s => s.getDisplayData());
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
    <div className={`flex h-full w-full items-center justify-center bg-[#111] ${isKiosk ? 'fixed inset-0' : ''}`}>
      <AirbusMCDUShell msgLight={msgLight}>
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
