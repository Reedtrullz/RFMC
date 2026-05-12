import { ReactNode } from 'react';
import { NavigationDisplayModel } from '@shared';

interface NDFrameProps {
  model: NavigationDisplayModel;
  children: ReactNode;
}

export function NDFrame({ model, children }: NDFrameProps) {
  return (
    <div className={`relative aspect-square flex-1 overflow-hidden rounded-[2px] bg-black ring-1 ring-white/5 ${model.style === 'airbus' ? 'shadow-[inset_0_0_40px_rgba(34,197,94,0.05)]' : ''}`}>
      <svg viewBox="0 0 100 100" className="h-full w-full font-cdu select-none">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="0.4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="crt-bloom" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.6" />
          </filter>
        </defs>

        <rect width="100" height="100" fill="#070909" />
        
        {/* Children slot (A320ND or B737ND) */}
        {children}
      </svg>
      
      {/* CRT Scanline Overlay for Airbus */}
      {model.style === 'airbus' && (
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%]" />
      )}
    </div>
  );
}
