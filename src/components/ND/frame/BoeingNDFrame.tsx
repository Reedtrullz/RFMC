import { ReactNode } from 'react';
import { NavigationDisplayModel } from '@shared';
import { NDGlass } from './NDGlass';

interface BoeingNDFrameProps {
  model: NavigationDisplayModel;
  children: ReactNode;
}

export function BoeingNDFrame({ model, children }: BoeingNDFrameProps) {
  return (
    <div className="relative aspect-square flex-1 overflow-hidden rounded-[2px] bg-[#070909] ring-2 ring-[#2a2d2d] shadow-[inset_0_0_60px_rgba(0,0,0,0.8)]">
      <NDGlass brightness={100}>
        <svg viewBox="0 0 100 100" className="h-full w-full font-cdu select-none">
          <defs>
            <filter id="boeing-glow">
              <feGaussianBlur stdDeviation="0.4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          {children}
        </svg>
      </NDGlass>
      
      {/* Boeing outer bezel shadow */}
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.6)]" />
    </div>
  );
}
