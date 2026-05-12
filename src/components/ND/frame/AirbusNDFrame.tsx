import { ReactNode } from 'react';
import { NavigationDisplayModel } from '@shared';
import { NDGlass } from './NDGlass';

interface AirbusNDFrameProps {
  model: NavigationDisplayModel;
  children: ReactNode;
}

export function AirbusNDFrame({ model, children }: AirbusNDFrameProps) {
  return (
    <div className="relative aspect-square flex-1 overflow-hidden rounded-[2px] bg-black ring-2 ring-[#3a3d3d] shadow-[inset_0_0_40px_rgba(34,197,94,0.05)]">
      <NDGlass brightness={100} scanlines>
        <svg viewBox="0 0 100 100" className="h-full w-full font-cdu select-none">
          <defs>
            <filter id="airbus-bloom" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.6" />
            </filter>
          </defs>
          
          {children}
        </svg>
      </NDGlass>
      
      {/* Airbus CRT glass effect */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-20" />
    </div>
  );
}
