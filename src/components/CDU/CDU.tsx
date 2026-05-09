import { useMemo, useCallback } from 'react';
import { CDUButton } from './CDUButton';
import { LSKButton } from './LSKButton';
import { Display } from './Display';
import { Scratchpad } from './Scratchpad';
import { MSGLight } from './MSGLight';
import { useKioskMode } from '../../hooks/useKioskMode';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useFMCStore } from '../../store/useFMCStore';
import type { CDUKey } from '@shared';

export function CDU() {
  const isKiosk = useKioskMode();

  const pressKey = useFMCStore(s => s.pressKey);
  const pressLSK = useFMCStore(s => s.pressLSK);
  const clearScratchpad = useFMCStore(s => s.clearScratchpad);
  const pressEXEC = useFMCStore(s => s.pressEXEC);
  const msgLight = useFMCStore(s => s.msgLight);
  const execLit = useFMCStore(s => s.execLit);
  const connectionMode = useFMCStore(s => s.connectionMode);

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
        p-2
        /* Desktop: realistic aspect ratio ~500px */
        w-[500px] max-w-[95vw]
        /* Tablet landscape: full CDU */
        max-md:landscape:w-[420px]
        /* Tablet portrait: compact */
        max-md:w-[380px]
        /* Phone: fill width */
        max-sm:w-full max-sm:rounded-none
      `}>
        {/* Title bar */}
        <div className="flex items-center justify-between w-full px-2 pb-1">
          <span className="text-cdu-text/40 text-[10px] font-cdu tracking-[0.3em] uppercase">
            BOEING 737-800
          </span>
          <MSGLight active={msgLight} />
        </div>

        {/* Screen + LSK area */}
        <div className="flex w-full">
          <LSKColumn side="L" onPress={onPressLSK} />
          <div className="flex-1 bg-cdu-screen border-2 border-cdu-bezel-light rounded-sm">
            <Display />
            <Scratchpad />
          </div>
          <LSKColumn side="R" onPress={onPressLSK} />
        </div>

        {/* Keypad */}
        <div className="w-full mt-1">
          <KeypadGrid onPress={onPressKey} />
        </div>

        {/* Bottom row: action keys */}
        <div className="flex w-full mt-1 gap-1">
          <CDUButton label="INIT\nREF" className="flex-1 h-10 text-[10px] leading-tight" variant="function" onPress={() => onPressKey('INIT_REF')} />
          <CDUButton label="RTE" className="flex-1 h-10 text-xs" variant="function" onPress={() => onPressKey('RTE')} />
          <CDUButton label="DEP\nARR" className="flex-1 h-10 text-[10px] leading-tight" variant="function" onPress={() => onPressKey('DEP_ARR')} />
          <CDUButton label="LEGS" className="flex-1 h-10 text-xs" variant="function" onPress={() => onPressKey('LEGS')} />
        </div>
        <div className="flex w-full gap-1 mt-0.5">
          <CDUButton label="PERF" className="flex-1 h-10 text-xs" variant="function" onPress={() => onPressKey('PERF')} />
          <CDUButton label="PROG" className="flex-1 h-10 text-xs" variant="function" onPress={() => onPressKey('PROG')} />
          <div className="flex-1" />
          <CDUButton label="MENU" className="flex-1 h-10 text-xs" variant="function" onPress={() => onPressKey('MENU')} />
        </div>
      </div>
    </div>
  );
}

function LSKColumn({ side, onPress }: { side: 'L' | 'R'; onPress: (side: 'L' | 'R', index: number) => void }) {
  const displayData = useFMCStore(s => s.getDisplayData());
  const currentPage = useFMCStore(s => s.currentPage);
  const legsPageIndex = useFMCStore(s => s.legsPageIndex);
  const legsPageCount = useFMCStore(s => s.legsPageCount);

  const getLabel = (idx: number): string | undefined => {
    const lskId = `${side}${idx}`;
    const action = displayData.lskActions[lskId];
    if (!action) return undefined;

    if (action === 'next_page') return '▼';
    if (action === 'prev_page') return '▲';
    if (action === 'dep_page') return 'DEP';
    if (action === 'arr_page') return 'ARR';

    // For menu-style actions, show arrows
    if (side === 'L' && action) return '◄';
    if (side === 'R' && action) return '►';
    return undefined;
  };

  return (
    <div className="flex flex-col justify-between py-1 px-0.5">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <LSKButton
          key={`${side}${i}`}
          side={side}
          index={i}
          label={getLabel(i)}
          onPress={onPress}
        />
      ))}
    </div>
  );
}

function KeypadGrid({ onPress }: { onPress: (key: string) => void }) {
  const numKeys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', '+/-'],
  ];
  const alphaKeys = [
    ['A', 'B', 'C', 'D', 'E'],
    ['F', 'G', 'H', 'I', 'J'],
    ['K', 'L', 'M', 'N', 'O'],
    ['P', 'Q', 'R', 'S', 'T'],
    ['U', 'V', 'W', 'X', 'Y'],
  ];

  const execLit = useFMCStore(s => s.execLit);

  return (
    <div className="flex gap-1">
      {/* Numpad */}
      <div className="flex-[1.2] flex flex-col gap-0.5">
        {numKeys.map((row, ri) => (
          <div key={ri} className="flex gap-0.5">
            {row.map(key => (
              <CDUButton key={key} label={key} className="flex-1 h-9 text-sm" onPress={() => onPress(key)} />
            ))}
          </div>
        ))}
      </div>

      {/* Alphabet */}
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
        {/* Bottom action row */}
        <div className="flex gap-0.5 mt-0.5">
          <CDUButton label="EXEC" className="flex-[1.5] h-9 text-xs" variant={execLit ? 'exec' : 'default'} onPress={() => onPress('EXEC')} />
          <div className="flex-[0.5]" />
          <CDUButton label="NEXT" className="flex-[1.0] h-9 text-[10px]" variant="function" onPress={() => onPress('NEXT_PAGE')} />
          <CDUButton label="PREV" className="flex-[1.0] h-9 text-[10px]" variant="function" onPress={() => onPress('PREV_PAGE')} />
        </div>
      </div>
    </div>
  );
}
