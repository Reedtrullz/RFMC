import { useEffect, useState } from 'react';
import { scratchpadToGridSegment } from '@shared';
import { CDUDisplayGrid } from './CDUDisplayGrid';

interface ScratchpadRowProps {
  text: string;
  error?: boolean;
  variant?: 'boeing' | 'airbus';
}

export function ScratchpadRow({ text, error, variant = 'boeing' }: ScratchpadRowProps) {
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setCursorVisible(v => !v), 500);
    return () => clearInterval(interval);
  }, []);

  const color = error ? 'red' : variant === 'airbus' ? 'amber' : 'green';
  const segment = scratchpadToGridSegment(text || ' ', {
    color,
    blink: error,
    semantic: error ? 'warning' : undefined,
  });

  return (
    <div className="relative border-b border-cdu-bezel-light" data-testid="scratchpad">
      <CDUDisplayGrid
        variant={variant}
        grid={{
          rows: 14,
          columns: 24,
          segments: [segment],
          scratchpad: [segment],
        }}
        className="h-[1.6em] overflow-hidden text-[13px]"
      />
      {!error && (
        <span
          className={[
            'absolute top-1/2 -translate-y-1/2 w-[7px] h-[12px]',
            cursorVisible ? 'opacity-100' : 'opacity-0',
            variant === 'airbus' ? 'bg-cdu-amber' : 'bg-cdu-text',
          ].join(' ')}
          style={{
            left: `calc(0.25rem + ${Math.min(text.length, 23)}ch + 0.25rem)`,
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
