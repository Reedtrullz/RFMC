import type { CSSProperties, ReactNode } from 'react';

interface InstrumentSlotProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  scale?: number;
  maxHeight?: string;
}

interface InstrumentFrameSlotProps {
  children: ReactNode;
  scale?: number;
  className?: string;
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

export function InstrumentFrameSlot({
  children,
  scale = 1,
  className = '',
}: InstrumentFrameSlotProps) {
  return (
    <div className={`cockpit-instrument ${className}`}>
      <div
        className="cockpit-scale"
        style={{ '--scale': scale } as CSSProperties}
      >
        {children}
      </div>
    </div>
  );
}
