import { ReactNode } from 'react';
import { NavigationDisplayModel } from '@shared';
import { InstrumentBezel } from '../../instruments/common/InstrumentBezel';
import { ScreenGlass } from '../../instruments/common/ScreenGlass';
import { EffectProfiles } from '../../instruments/common/EffectProfiles';

interface BoeingNDFrameProps {
  model: NavigationDisplayModel;
  children: ReactNode;
}

export function BoeingNDFrame({ model, children }: BoeingNDFrameProps) {
  return (
    <InstrumentBezel variant="boeing-nd" className="h-full w-full">
      <ScreenGlass 
        className="h-full w-full" 
        effectProfile={EffectProfiles.CRT}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full font-avionics select-none">
          <defs>
            <filter id="boeing-glow">
              <feGaussianBlur stdDeviation="0.25" result="blur" />
              <feComponentTransfer in="blur" result="glow">
                <feFuncA type="linear" slope="1.8" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          <rect width="100" height="100" fill="#010303" />
          
          <g filter="url(#boeing-glow)">
            {children}
          </g>
        </svg>
      </ScreenGlass>
    </InstrumentBezel>
  );
}
