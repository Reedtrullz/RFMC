import { ReactNode } from 'react';
import { NavigationDisplayModel } from '@shared';
import { InstrumentBezel } from '../../instruments/common/InstrumentBezel';
import { ScreenGlass } from '../../instruments/common/ScreenGlass';
import { EffectProfiles } from '../../instruments/common/EffectProfiles';
import { AIRBUS_ND_GEOMETRY } from '../../instruments/common/GeometryProfiles';

interface AirbusNDFrameProps {
  model: NavigationDisplayModel;
  children: ReactNode;
}

export function AirbusNDFrame({ model, children }: AirbusNDFrameProps) {
  const { screenRect } = AIRBUS_ND_GEOMETRY;

  return (
    <InstrumentBezel variant="airbus-nd" className="h-full w-full">
      <ScreenGlass 
        className="h-full w-full" 
        variant="airbus"
        effectProfile={EffectProfiles.AIRBUS_ND}
      >
        <svg 
          viewBox={`0 0 ${screenRect.width} ${screenRect.height}`}
          className="h-full w-full font-avionics select-none"
        >
          <defs>
            <filter id="airbus-bloom" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.4" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="1.2" />
              </feComponentTransfer>
            </filter>
          </defs>
          
          <rect width={screenRect.width} height={screenRect.height} fill="#010303" />
          <g filter="url(#airbus-bloom)">
            {children}
          </g>
        </svg>
      </ScreenGlass>
    </InstrumentBezel>
  );
}
