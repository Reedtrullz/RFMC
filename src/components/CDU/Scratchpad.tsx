import { useState, useEffect } from 'react';
import { useFMCStore } from '../../store/useFMCStore';

interface ScratchpadProps {
  variant?: 'boeing' | 'airbus';
}

export function Scratchpad({ variant = 'boeing' }: ScratchpadProps) {
  const scratchpad = useFMCStore(s => s.scratchpad);
  const scratchpadError = useFMCStore(s => s.scratchpadError);
  const [cursorVisible, setCursorVisible] = useState(true);
  const isAirbus = variant === 'airbus';

  useEffect(() => {
    const interval = setInterval(() => setCursorVisible(v => !v), 500);
    return () => clearInterval(interval);
  }, []);

  const displayText = scratchpadError || scratchpad || '\u00A0';
  const isError = !!scratchpadError;
  const colorClass = isAirbus ? 'text-cdu-amber' : 'text-cdu-text';
  const glowClass = isAirbus ? 'text-glow-amber' : 'text-glow';

  return (
    <div className={`flex items-center px-1 py-0.5 font-cdu text-[13px] leading-[1.3] border-b border-cdu-bezel-light h-[1.6em] ${isError ? 'text-cdu-error animate-blink' : `${colorClass} ${glowClass}`}`}>
      <span>{displayText}</span>
      {!scratchpadError && (
        <span className={`ml-0.5 ${isAirbus ? 'bg-cdu-amber' : 'bg-cdu-text'} w-[7px] h-[12px] ${cursorVisible ? 'opacity-100' : 'opacity-0'}`} />
      )}
    </div>
  );
}
