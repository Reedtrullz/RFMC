import { ReactNode } from 'react';
import { NavigationDisplayModel } from '@shared';
import { InstrumentBezel } from '../../instruments/common/InstrumentBezel';
import { ScreenGlass } from '../../instruments/common/ScreenGlass';
import { EffectProfiles } from '../../instruments/common/EffectProfiles';
import { BOEING_ND_GEOMETRY } from '../../instruments/common/GeometryProfiles';

interface BoeingNDFrameProps {
  model: NavigationDisplayModel;
  children: ReactNode;
}

export function BoeingNDFrame({ model, children }: BoeingNDFrameProps) {
  const { screenRect } = BOEING_ND_GEOMETRY;

  return (
    <InstrumentBezel variant="boeing-nd" className="h-full w-full">
      <ScreenGlass 
        className="h-full w-full" 
        effectProfile={EffectProfiles.CRT}
      >
        <svg 
          viewBox={`0 0 ${screenRect.width} ${screenRect.height}`}
          className="h-full w-full font-avionics select-none"
        >
          <defs>
            <filter id="boeing-glow">
              <feGaussianBlur stdDeviation="0.4" result="blur" />
              <feComponentTransfer in="blur" result="glow">
                <feFuncA type="linear" slope="2.2" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          <rect width={screenRect.width} height={screenRect.height} fill="#010303" />
          
          <g filter="url(#boeing-glow)">
            {children}
          </g>
        </svg>
      </ScreenGlass>
    </InstrumentBezel>
  );
}
