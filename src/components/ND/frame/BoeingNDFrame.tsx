import { ReactNode } from 'react';
import { NavigationDisplayModel } from '@shared';
import { InstrumentBezel } from '../../instruments/common/InstrumentBezel';
import { ScreenGlass } from '../../instruments/common/ScreenGlass';

interface BoeingNDFrameProps {
  model: NavigationDisplayModel;
  children: ReactNode;
}

export function BoeingNDFrame({ model, children }: BoeingNDFrameProps) {
  return (
    <InstrumentBezel variant="boeing-nd" className="h-full w-full">
      <ScreenGlass className="h-full w-full">
        <svg viewBox="0 0 100 100" className="h-full w-full font-avionics select-none">
          <defs>
            <filter id="boeing-glow">
              <feGaussianBlur stdDeviation="0.3" result="blur" />
              <feComponentTransfer in="blur" result="glow">
                <feFuncA type="linear" slope="1.5" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            {/* Scanline Pattern */}
            <pattern id="scanlines" width="100" height="1" patternUnits="userSpaceOnUse">
              <rect width="100" height="0.4" fill="rgba(255,255,255,0.02)" />
            </pattern>

            <radialGradient id="glass-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="80%" stopColor="rgba(0,0,0,0.1)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.4)" />
            </radialGradient>
          </defs>
          
          <rect width="100" height="100" fill="#020505" />
          
          {/* Hardware Artifacts */}
          <rect width="100" height="100" fill="url(#scanlines)" />
          <rect width="100" height="100" fill="transparent" style={{ boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)' }} />

          <g filter="url(#boeing-glow)">
            {children}
          </g>
          
          {/* Glass Reflection Vignette */}
          <rect width="100" height="100" fill="url(#glass-gradient)" opacity="0.1" pointerEvents="none" />
        </svg>
      </ScreenGlass>
    </InstrumentBezel>
  );
}
