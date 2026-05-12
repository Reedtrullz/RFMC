import { ReactNode } from 'react';

type BezelVariant = 
  | 'boeing-cdu' | 'airbus-mcdu' 
  | 'boeing-nd' | 'airbus-nd' 
  | 'boeing-pfd' | 'airbus-pfd' 
  | 'boeing-mcp' | 'airbus-fcu';

interface InstrumentBezelProps {
  children: ReactNode;
  variant: BezelVariant;
  className?: string;
}

export function InstrumentBezel({ children, variant, className = '' }: InstrumentBezelProps) {
  const isAirbus = variant.startsWith('airbus');
  const bezelColor = isAirbus ? 'bg-[#3a3d3d]' : 'bg-[#1a1c1c]';
  
  return (
    <div className={`relative rounded-sm border-b-4 border-r-2 border-black/40 ${bezelColor} p-1 shadow-2xl ${className}`}>
      {/* Outer rim glow */}
      <div className="absolute inset-0 rounded-sm shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_4px_10px_rgba(0,0,0,0.5)]" />
      
      {/* Recessed inner area */}
      <div className="relative rounded-[2px] bg-black p-[2px] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
        {children}
      </div>
    </div>
  );
}
