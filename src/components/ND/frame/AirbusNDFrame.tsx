import { ReactNode } from 'react';
import { NavigationDisplayModel } from '@shared';
import { InstrumentBezel } from '../../instruments/common/InstrumentBezel';
import { ScreenGlass } from '../../instruments/common/ScreenGlass';

interface AirbusNDFrameProps {
  model: NavigationDisplayModel;
  children: ReactNode;
}

export function AirbusNDFrame({ model, children }: AirbusNDFrameProps) {
  return (
    <InstrumentBezel variant="airbus-nd" className="h-full w-full">
      <ScreenGlass className="h-full w-full" variant="airbus-crt">
        <svg viewBox="0 0 100 100" className="h-full w-full font-avionics select-none">
          <defs>
            <filter id="airbus-bloom" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.6" />
            </filter>
          </defs>
          
          <rect width="100" height="100" fill="#010303" />
          <g filter="url(#airbus-bloom)">
            {children}
          </g>
        </svg>
      </ScreenGlass>
    </InstrumentBezel>
  );
}
