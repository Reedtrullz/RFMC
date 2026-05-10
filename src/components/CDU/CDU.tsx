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

const LSK_BOEING = [
  { row: 2, index: 1 }, { row: 4, index: 2 }, { row: 6, index: 3 },
  { row: 8, index: 4 }, { row: 10, index: 5 }, { row: 12, index: 6 },
];

const LSK_AIRBUS = [
  { row: 4, index: 1 }, { row: 7, index: 2 }, { row: 10, index: 3 },
  { row: 13, index: 4 }, { row: 16, index: 5 }, { row: 19, index: 6 },
];

export function CDU() {
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
    if (action === 'next_page') return '▼';
    if (action === 'prev_page') return '▲';
    if (action === 'dep_page') return 'DEP';
    if (action === 'arr_page') return 'ARR';
    if (side === 'L' && action) return '◄';
    if (side === 'R' && action) return '►';
    return undefined;
  };

  const isHighlighted = (id: string) => tutorialHighlight === id;

  return (
    <div className={`
      flex items-center justify-center
      w-full h-full
      bg-[#111]
      ${isKiosk ? 'fixed inset-0' : ''}
    `}>
      <div className={`
        flex flex-col items-center
        bg-cdu-bezel
        rounded-lg
        p-2 pt-1.5
        w-[520px] max-w-[96vw]
        max-md:w-[420px]
        max-sm:w-full max-sm:rounded-none
      `}>
        {/* Title bar */}
        <div className="flex items-center justify-between w-full px-1 pb-0.5">
          <span className="text-cdu-text/40 text-[9px] font-cdu tracking-[0.3em] uppercase">
            BOEING 737-800
          </span>
          <MSGLight active={msgLight} />
        </div>

        {/* Screen area with aligned LSK grid */}
        <div className="w-full grid gap-0"
          style={{
            gridTemplateColumns: 'auto 1fr auto',
            gridTemplateRows: 'repeat(14, minmax(0, 1fr)) auto',
          }}
        >
          {/* Left LSK buttons */}
          {LSK_POSITIONS.map(({ row, index }) => (
            <div
              key={`L${index}`}
              className="flex items-center"
              style={{ gridRow: `${row} / ${row + 2}`, gridColumn: 1 }}
            >
              <LSKButton
                side="L"
                index={index}
                label={getLSKLabel('L', index)}
                highlighted={isHighlighted(`L${index}`)}
                onPress={onPressLSK}
              />
            </div>
          ))}

          {/* Right LSK buttons */}
          {LSK_POSITIONS.map(({ row, index }) => (
            <div
              key={`R${index}`}
              className="flex items-center justify-end"
              style={{ gridRow: `${row} / ${row + 2}`, gridColumn: 3 }}
            >
              <LSKButton
                side="R"
                index={index}
                label={getLSKLabel('R', index)}
                highlighted={isHighlighted(`R${index}`)}
                onPress={onPressLSK}
              />
            </div>
          ))}

          {/* Display */}
          <div
            className="bg-cdu-screen border-2 border-cdu-bezel-light rounded-sm overflow-hidden"
            style={{ gridRow: '1 / 15', gridColumn: 2 }}
          >
            <Display />
          </div>

          {/* Scratchpad */}
          <div
            className="bg-cdu-screen border-x-2 border-b-2 border-cdu-bezel-light rounded-b-sm"
            style={{ gridRow: 15, gridColumn: 2 }}
          >
            <Scratchpad />
          </div>
        </div>

        {/* Keypad */}
        <div className="w-full mt-1">
          <KeypadGrid onPress={onPressKey} highlight={tutorialHighlight} execLit={execLit} />
        </div>

        {/* Function key row 1 */}
        <div className="flex w-full mt-1 gap-1">
          <CDUButton 
            label="INIT REF" 
            className="flex-1 h-9 text-[9px] font-semibold" 
            variant={isHighlighted('POS_INIT') ? 'highlight' : 'function'} 
            onPress={() => onPressKey('INIT_REF')} 
          />
          <CDUButton label="RTE" className="flex-1 h-9 text-xs" variant={isHighlighted('RTE') ? 'highlight' : 'function'} onPress={() => onPressKey('RTE')} />
          <CDUButton 
            label="DEP ARR" 
            className="flex-1 h-9 text-[9px] font-semibold" 
            variant={isHighlighted('DEP_ARR') ? 'highlight' : 'function'} 
            onPress={() => onPressKey('DEP_ARR')} 
          />
          <CDUButton label="LEGS" className="flex-1 h-9 text-xs" variant={isHighlighted('LEGS') ? 'highlight' : 'function'} onPress={() => onPressKey('LEGS')} />
        </div>

        {/* Function key row 2 */}
        <div className="flex w-full gap-1 mt-0.5">
          <CDUButton label="PERF" className="flex-1 h-9 text-xs" variant={isHighlighted('PERF_INIT') ? 'highlight' : 'function'} onPress={() => onPressKey('PERF')} />
          <CDUButton label="PROG" className="flex-1 h-9 text-xs" variant={isHighlighted('PROGRESS') ? 'highlight' : 'function'} onPress={() => onPressKey('PROG')} />
          <div className="flex-1" />
          <CDUButton label="MENU" className="flex-1 h-9 text-xs" variant={isHighlighted('MENU') ? 'highlight' : 'function'} onPress={() => onPressKey('MENU')} />
        </div>
      </div>
    </div>
  );
}

function KeypadGrid({ onPress, highlight, execLit }: { onPress: (key: string) => void; highlight: string | null; execLit: boolean }) {
  const numKeys = [['1','2','3'],['4','5','6'],['7','8','9'],['.','0','+/-']];
  const alphaKeys = [['A','B','C','D','E'],['F','G','H','I','J'],['K','L','M','N','O'],['P','Q','R','S','T'],['U','V','W','X','Y']];

  return (
    <div className="flex gap-1">
      <div className="flex-[1.2] flex flex-col gap-0.5">
        {numKeys.map((row, ri) => (
          <div key={ri} className="flex gap-0.5">
            {row.map(key => (
              <CDUButton key={key} label={key} className="flex-1 h-9 text-sm" onPress={() => onPress(key)} />
            ))}
          </div>
        ))}
      </div>
      <div className="flex-[1.8] flex flex-col gap-0.5">
        {alphaKeys.map((row, ri) => (
          <div key={ri} className="flex gap-0.5">
            {row.map(key => (
              <CDUButton key={key} label={key} className="flex-1 h-9 text-sm" onPress={() => onPress(key)} />
            ))}
          </div>
        ))}
        <div className="flex gap-0.5">
          <CDUButton label="/" className="flex-[0.7] h-9 text-xs" onPress={() => onPress('SLASH')} />
          <CDUButton label="CLR" className="flex-[1.3] h-9 text-xs" onPress={() => onPress('CLR')} />
          <CDUButton label="SP" className="flex-[1.3] h-9 text-xs" onPress={() => onPress('SPACE')} />
          <CDUButton label="Z" className="flex-[0.7] h-9 text-sm" onPress={() => onPress('Z')} />
          <CDUButton label="DEL" className="flex-[1.0] h-9 text-xs" onPress={() => onPress('DEL')} />
        </div>
        <div className="flex gap-0.5 mt-0.5">
          <CDUButton label="EXEC" className="flex-[1.5] h-9 text-xs"
            variant={execLit ? 'exec' : highlight === 'EXEC' ? 'highlight' : 'default'}
            onPress={() => onPress('EXEC')} />
          <div className="flex-[0.5]" />
          <CDUButton label="NEXT" className="flex-[1.0] h-9 text-[10px]"
            variant={highlight === 'NEXT_PAGE' ? 'highlight' : 'function'}
            onPress={() => onPress('NEXT_PAGE')} />
          <CDUButton label="PREV" className="flex-[1.0] h-9 text-[10px]"
            variant={highlight === 'PREV_PAGE' ? 'highlight' : 'function'}
            onPress={() => onPress('PREV_PAGE')} />
        </div>
      </div>
    </div>
  );
}
