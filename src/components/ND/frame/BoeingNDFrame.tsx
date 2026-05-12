import { ReactNode } from 'react';
import { NavigationDisplayModel } from '@shared';
import { InstrumentBezel } from '../../visual/InstrumentBezel';
import { ScreenGlass } from '../../visual/ScreenGlass';

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
              <feGaussianBlur stdDeviation="0.4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          {children}
        </svg>
      </ScreenGlass>
    </InstrumentBezel>
  );
}
