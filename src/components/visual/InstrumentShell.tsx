import type { ReactNode } from 'react';

export type InstrumentShellVariant =
  | 'boeing-cdu'
  | 'airbus-mcdu'
  | 'boeing-nd'
  | 'airbus-nd'
  | 'boeing-mcp'
  | 'airbus-fcu';

interface InstrumentShellProps {
  variant: InstrumentShellVariant;
  children: ReactNode;
  className?: string;
  id?: string;
  'data-testid'?: string;
}

export function InstrumentShell({ 
  variant, 
  children, 
  className = '', 
  id,
  'data-testid': dataTestId 
}: InstrumentShellProps) {
  return (
    <div 
      id={id}
      data-testid={dataTestId}
      className={`instrument-shell instrument-shell--${variant} ${className}`}
    >
      <div className="instrument-shell__edge-highlight" />
      <div className="instrument-shell__wear" />
      <div className="instrument-shell__content">
        {children}
      </div>
    </div>
  );
}
