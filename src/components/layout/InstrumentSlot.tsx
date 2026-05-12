import type { CSSProperties, ReactNode } from 'react';

interface InstrumentSlotProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  scale?: number;
  maxHeight?: string;
}

export function InstrumentSlot({
  children,
  className = '',
  contentClassName = '',
  scale,
  maxHeight,
}: InstrumentSlotProps) {
  return (
    <div
      className={`instrument-slot ${className}`}
      style={{ '--instrument-slot-max-height': maxHeight } as CSSProperties}
    >
      <div
        className={`instrument-slot__content ${contentClassName}`}
        style={(scale === undefined ? undefined : { '--instrument-slot-scale': scale } as CSSProperties)}
      >
        {children}
      </div>
    </div>
  );
}
