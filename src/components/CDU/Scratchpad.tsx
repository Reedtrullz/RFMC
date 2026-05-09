import { useState, useEffect } from 'react';
import { useFMCStore } from '../../store/useFMCStore';

export function Scratchpad() {
  const scratchpad = useFMCStore(s => s.scratchpad);
  const scratchpadError = useFMCStore(s => s.scratchpadError);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible(v => !v);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const displayText = scratchpadError || scratchpad || '\u00A0';
  const isError = !!scratchpadError;

  return (
    <div className={`
      flex items-center px-1 py-0.5
      font-cdu text-[15px] leading-[1.3]
      border-b border-cdu-text-dim
      h-[1.6em]
      ${isError ? 'text-cdu-error animate-blink' : 'text-cdu-text text-glow'}
    `}>
      <span>{displayText}</span>
      {!scratchpadError && (
        <span className={`ml-0.5 bg-cdu-text w-[7px] h-[14px] ${cursorVisible ? 'opacity-100' : 'opacity-0'}`} />
      )}
    </div>
  );
}
