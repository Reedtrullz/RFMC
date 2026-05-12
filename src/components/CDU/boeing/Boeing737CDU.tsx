import { useCallback } from 'react';
import { useKioskMode } from '../../../hooks/useKioskMode';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { useFMCStore } from '../../../store/useFMCStore';
import type { CDUKey } from '@shared';
import { BoeingAlphaNumericKeypad } from './BoeingAlphaNumericKeypad';
import { BoeingCDUShell } from './BoeingCDUShell';
import { BoeingDisplayBay } from './BoeingDisplayBay';
import { BoeingFunctionKeyPanel } from './BoeingFunctionKeyPanel';
import { AnnunciatorLight } from '../../visual/AnnunciatorLight';

export function Boeing737CDU() {
  const isKiosk = useKioskMode();

  const pressKey = useFMCStore(s => s.pressKey);
  const pressLSK = useFMCStore(s => s.pressLSK);
  const msgLight = useFMCStore(s => s.msgLight);
  const execLit = useFMCStore(s => s.execLit);
  const connectionMode = useFMCStore(s => s.connectionMode);
  const connectionStatus = useFMCStore(s => s.connectionStatus);
  const tutorialHighlight = useFMCStore(s => s.tutorialHighlight);
  const brightness = useFMCStore(s => s.brightness);
  const setBrightness = useFMCStore(s => s.setBrightness);
  const displayData = useFMCStore(s => s.getDisplayData());

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

  const getLSKLabel = (side: 'L' | 'R', index: number): string | undefined => {
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
  };

  const isHighlighted = (id: string) => tutorialHighlight === id;

  return (
    <div className={`flex h-full w-full items-center justify-center bg-[#111] ${isKiosk ? 'fixed inset-0' : ''}`}>
      <BoeingCDUShell msgLight={<AnnunciatorLight label="MSG" active={msgLight} color="amber" />}>
        <BoeingDisplayBay
          brightness={brightness}
          getLSKLabel={getLSKLabel}
          isHighlighted={isHighlighted}
          hintLevel={tutorialHintLevel}
          onPressLSK={onPressLSK}
        />
        <BoeingFunctionKeyPanel onPress={onPressKey} isHighlighted={isHighlighted} hintLevel={tutorialHintLevel} />
        <BoeingAlphaNumericKeypad
          onPress={onPressKey}
          highlight={tutorialHighlight}
          hintLevel={tutorialHintLevel}
          execLit={execLit}
          brightness={brightness}
          onBrightnessChange={setBrightness}
        />
      </BoeingCDUShell>
    </div>
  );
}
