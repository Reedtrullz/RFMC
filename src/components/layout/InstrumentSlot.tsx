import type { CSSProperties, ReactNode } from 'react';

interface InstrumentSlotProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  scale?: number;
  maxHeight?: string;
  dataTestId?: string;
}

interface InstrumentFrameSlotProps {
  children: ReactNode;
  scale?: number;
  className?: string;
  dataTestId?: string;
}

export function InstrumentSlot({
  children,
  className = '',
  contentClassName = '',
  scale,
  maxHeight,
  dataTestId,
}: InstrumentSlotProps) {
  return (
    <div
      className={`instrument-slot ${className}`}
      style={{ '--instrument-slot-max-height': maxHeight } as CSSProperties}
      data-testid={dataTestId}
    >
      <div
        className={`instrument-slot__content ${contentClassName}`}
        style={scale === undefined ? undefined : ({ '--instrument-slot-scale': scale } as CSSProperties)}
      >
        {children}
      </div>
    </div>
  );
}

export function InstrumentFrameSlot({ children, scale = 1, className = '', dataTestId }: InstrumentFrameSlotProps) {
  return (
    <div className={`cockpit-instrument ${className}`} data-testid={dataTestId}>
      <div className="cockpit-scale" style={{ '--scale': scale } as CSSProperties}>
        {children}
      </div>
    </div>
  );
}
