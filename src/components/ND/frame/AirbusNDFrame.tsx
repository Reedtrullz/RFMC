import { ReactNode } from 'react';
import { NavigationDisplayModel } from '@shared';
import { InstrumentBezel } from '../../visual/InstrumentBezel';
import { ScreenGlass } from '../../visual/ScreenGlass';

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
          
          {children}
        </svg>
      </ScreenGlass>
    </InstrumentBezel>
  );
}
