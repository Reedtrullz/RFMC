import { ReactNode } from 'react';
import { BezelScrew } from './BezelScrew';

type BezelVariant =
  | 'boeing-cdu'
  | 'airbus-mcdu'
  | 'boeing-nd'
  | 'airbus-nd'
  | 'boeing-pfd'
  | 'airbus-pfd'
  | 'boeing-eicas'
  | 'airbus-ecam'
  | 'boeing-mcp'
  | 'airbus-fcu';

interface InstrumentBezelProps {
  children: ReactNode;
  variant: BezelVariant;
  className?: string;
}

export function InstrumentBezel({ children, variant, className = '' }: InstrumentBezelProps) {
  const isAirbus = variant.startsWith('airbus');
  const bezelColor = isAirbus ? 'bg-[#4b4e52]' : 'bg-[#1c1f20]';

  return (
    <div
      className={`relative rounded-md border-b-[6px] border-r-[2px] border-black/60 ${bezelColor} p-1.5 shadow-2xl ${className}`}
    >
      {/* Structural Highlight */}
      <div className="absolute inset-0 rounded-md border border-white/5 pointer-events-none z-10" />
      <div className="absolute inset-x-0 top-0 h-[1px] bg-white/10 rounded-t-md z-10" />

      {/* Corner Screws */}
      <BezelScrew className="absolute top-1 left-1 w-2 h-2 opacity-60 z-10" rotation={45} />
      <BezelScrew className="absolute top-1 right-1 w-2 h-2 opacity-60 z-10" rotation={-15} />
      <BezelScrew className="absolute bottom-1 left-1 w-2 h-2 opacity-60 z-10" rotation={110} />
      <BezelScrew className="absolute bottom-1 right-1 w-2 h-2 opacity-60 z-10" rotation={-75} />

      {/* Recessed display area */}
      <div className="relative h-full w-full rounded-[4px] bg-black p-[1px] shadow-[0_4px_12px_rgba(0,0,0,0.8),inset_0_8px_16px_rgba(0,0,0,0.95)] overflow-hidden">
        {children}
      </div>
    </div>
  );
}
