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
    const interval = setInterval(() => setCursorVisible((v) => !v), 500);
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
    <div
      className="relative"
      data-testid="scratchpad"
      aria-live="assertive"
      aria-atomic="true"
      aria-label={`Scratchpad: ${text}`}
    >
      <CDUDisplayGrid
        variant={variant}
        grid={{
          rows: 1,
          columns: 24,
          segments: [segment],
          scratchpad: [],
        }}
        className="overflow-hidden"
      >
        {!level && (
          <span
            className={[
              'scratchpad-cursor',
              cursorVisible ? 'opacity-100' : 'opacity-0',
              variant === 'airbus' ? 'bg-cdu-amber' : 'bg-cdu-text',
            ].join(' ')}
            style={{
              gridRow: 1,
              gridColumn: Math.min(text.length + 1, 24),
            }}
            aria-hidden="true"
          />
        )}
      </CDUDisplayGrid>
    </div>
  );
}
