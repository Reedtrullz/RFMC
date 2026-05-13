import { useEffect, useState } from 'react';
import { scratchpadToGridSegment, AlertLevel } from '@shared';
import { CDUDisplayGrid } from './CDUDisplayGrid';

interface ScratchpadRowProps {
  text: string;
  level?: AlertLevel;
  variant?: 'boeing' | 'airbus';
}

export function ScratchpadRow({ text, level, variant = 'boeing' }: ScratchpadRowProps) {
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setCursorVisible(v => !v), 500);
    return () => clearInterval(interval);
  }, []);

  const getLevelColor = () => {
    if (level === 'WARNING') return 'red';
    if (level === 'CAUTION') return 'amber';
    return variant === 'airbus' ? 'amber' : 'green';
  };

  const color = getLevelColor();
  const segment = scratchpadToGridSegment(text || ' ', {
    color,
    blink: level === 'WARNING' || level === 'CAUTION',
    semantic: level === 'WARNING' ? 'warning' : level === 'CAUTION' ? 'caution' : undefined,
  });

  return (
    <div className="relative" data-testid="scratchpad">
      <CDUDisplayGrid
        variant={variant}
        grid={{
          rows: 1,
          columns: 24,
          segments: [segment],
          scratchpad: [],
        }}
        className="overflow-hidden"
      />
      {!error && (
        <span
          className={[
            'absolute top-1/2 -translate-y-1/2 w-[2px] h-[14px]',
            cursorVisible ? 'opacity-100' : 'opacity-0',
            variant === 'airbus' ? 'bg-cdu-amber' : 'bg-cdu-text',
          ].join(' ')}
          style={{
            left: variant === 'boeing' 
              ? `calc(${Math.min(text.length, 23)} * 1ch + (100% - 24ch) / 2)` 
              : `${(Math.min(text.length, 23) / 24) * 100}%`,
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
