import { useCallback } from 'react';
import { CDUButton } from './CDUButton';
import { LSKButton } from './LSKButton';
import { Display } from './Display';
import { Scratchpad } from './Scratchpad';
import { MSGLight } from './MSGLight';
import { useKioskMode } from '../../hooks/useKioskMode';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useFMCStore } from '../../store/useFMCStore';
import type { CDUKey } from '@shared';

// 24 grid rows total for display (1 row per line). 6 LSKs × 4 rows each = 24.
const LSK_AIRBUS = [
  { row: 1, index: 1 }, { row: 5, index: 2 }, { row: 9, index: 3 },
  { row: 13, index: 4 }, { row: 17, index: 5 }, { row: 21, index: 6 },
];

export function AirbusCDU() {
  const isKiosk = useKioskMode();
  const pressKey = useFMCStore(s => s.pressKey);
  const pressLSK = useFMCStore(s => s.pressLSK);
  const msgLight = useFMCStore(s => s.msgLight);
  const execLit = useFMCStore(s => s.execLit);
  const connectionMode = useFMCStore(s => s.connectionMode);
  const tutorialHighlight = useFMCStore(s => s.tutorialHighlight);
  const { send, connectionStatus } = useWebSocket();

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
    <div className={`flex items-center justify-center w-full h-full bg-[#111] ${isKiosk ? 'fixed inset-0' : ''}`}>
      <div className="flex flex-col items-center bg-cdu-bezel rounded-lg p-2 pt-1.5 w-[520px] max-w-[96vw] max-md:w-[420px] max-sm:w-full max-sm:rounded-none">
        <div className="flex items-center justify-between w-full px-1 pb-0.5">
          <span className="text-cdu-amber/50 text-[9px] font-cdu tracking-[0.3em] uppercase">AIRBUS A320</span>
          <MSGLight active={msgLight} />
        </div>

        <div className="w-full grid gap-0" style={{ gridTemplateColumns: 'auto 1fr auto', gridTemplateRows: 'repeat(24, minmax(0, 1fr)) auto' }}>
          {LSK_AIRBUS.map(({ row, index }) => (
            <div key={`L${index}`} className="flex items-center" style={{ gridRow: `${row} / ${row + 4}`, gridColumn: 1 }}>
              <LSKButton side="L" index={index} label={getLSKLabel('L', index)} highlighted={isHighlighted(`L${index}`)} onPress={onPressLSK} />
            </div>
          ))}
          {LSK_AIRBUS.map(({ row, index }) => (
            <div key={`R${index}`} className="flex items-center justify-end" style={{ gridRow: `${row} / ${row + 4}`, gridColumn: 3 }}>
              <LSKButton side="R" index={index} label={getLSKLabel('R', index)} highlighted={isHighlighted(`R${index}`)} onPress={onPressLSK} />
            </div>
          ))}
          <div className="bg-cdu-screen border-2 border-cdu-bezel-light rounded-sm overflow-hidden" style={{ gridRow: '1 / 25', gridColumn: 2 }}>
            <Display variant="airbus" />
          </div>
          <div className="bg-cdu-screen border-x-2 border-b-2 border-cdu-bezel-light rounded-b-sm" style={{ gridRow: 25, gridColumn: 2 }}>
            <Scratchpad variant="airbus" />
          </div>
        </div>

        {/* Airbus function keys */}
        <div className="flex w-full mt-1 gap-1">
          <CDUButton label="AIR PORT" className="flex-1 h-9 text-[8px]" variant={isHighlighted('INIT_A') ? 'highlight' : 'function'} onPress={() => onPressKey('INIT_A')} />
          <CDUButton label="F-PLN" className="flex-1 h-9 text-xs" variant={isHighlighted('F_PLN') ? 'highlight' : 'function'} onPress={() => onPressKey('F_PLN')} />
          <CDUButton label="PERF" className="flex-1 h-9 text-xs" variant={isHighlighted('PERF_TAKEOFF') ? 'highlight' : 'function'} onPress={() => onPressKey('PERF_TAKEOFF')} />
          <CDUButton label="PROG" className="flex-1 h-9 text-xs" variant={isHighlighted('PROG_A') ? 'highlight' : 'function'} onPress={() => onPressKey('PROG_A')} />
        </div>
        <div className="flex w-full gap-1 mt-0.5">
          <CDUButton label="RAD NAV" className="flex-1 h-9 text-[8px]" variant={isHighlighted('RAD_NAV') ? 'highlight' : 'function'} onPress={() => onPressKey('RAD_NAV')} />
          <CDUButton label="MCDU MENU" className="flex-1 h-9 text-[7px]" variant={isHighlighted('MCDU_MENU') ? 'highlight' : 'function'} onPress={() => onPressKey('MCDU_MENU')} />
          <div className="flex-[2]" />
        </div>

        {/* Airbus keypad */}
        <div className="w-full mt-1"><AirbusKeypad onPress={onPressKey} highlight={tutorialHighlight} execLit={execLit} /></div>
      </div>
    </div>
  );
}

function AirbusKeypad({ onPress, highlight, execLit }: { onPress: (key: string) => void; highlight: string | null; execLit: boolean }) {
  const numpad = [['1','2','3'],['4','5','6'],['7','8','9'],['.','0','+/-']];
  const alpha = [['A','B','C'],['D','E','F'],['G','H','I'],['J','K','L'],['M','N','O'],['P','Q','R'],['S','T','U'],['V','W','X'],['Y','Z','SP']];
  return (
    <div className="flex gap-1">
      <div className="flex-[1] flex flex-col gap-0.5">
        {numpad.map((row, ri) => (
          <div key={ri} className="flex gap-0.5">
            {row.map(k => <CDUButton key={k} label={k} className="flex-1 h-9 text-sm" onPress={() => onPress(k)} />)}
          </div>
        ))}
      </div>
      <div className="flex-[2] flex flex-col gap-0.5">
        {alpha.map((row, ri) => (
          <div key={ri} className="flex gap-0.5">
            {row.map(k => <CDUButton key={k} label={k} className="flex-1 h-9 text-xs" onPress={() => onPress(k === 'SP' ? 'SPACE' : k)} />)}
          </div>
        ))}
        <div className="flex gap-0.5 mt-0.5">
          <CDUButton label="/" className="flex-1 h-9 text-xs" onPress={() => onPress('SLASH')} />
          <CDUButton label="CLR" className="flex-[2] h-9 text-xs" onPress={() => onPress('CLR')} />
          <CDUButton label="DEL" className="flex-1 h-9 text-xs" onPress={() => onPress('DEL')} />
          <CDUButton label="EXEC" className="flex-[2] h-9 text-xs" variant={execLit ? 'exec' : highlight === 'EXEC' ? 'highlight' : 'default'} onPress={() => onPress('EXEC')} />
        </div>
      </div>
    </div>
  );
}
