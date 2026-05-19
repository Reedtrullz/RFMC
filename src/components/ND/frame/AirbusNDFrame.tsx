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

export function AirbusNDFrame({ model: _model, children }: AirbusNDFrameProps) {
  const { screenRect } = AIRBUS_ND_GEOMETRY;

  return (
    <div data-aircraft="airbus" className="airbus-nd-surface relative h-full w-full rounded-md">
      <InstrumentBezel variant="airbus-nd" className="h-full w-full">
        <ScreenGlass className="h-full w-full" variant="airbus" effectProfile={EffectProfiles.AIRBUS_ND}>
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

              <radialGradient id="airbus-vignette" cx="50%" cy="50%" r="85%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="75%" stopColor="transparent" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.18)" />
              </radialGradient>

              <pattern id="airbus-dot-grid" patternUnits="userSpaceOnUse" width="3" height="3">
                <circle cx="1.5" cy="1.5" r="0.35" fill="rgba(255,176,0,0.04)" />
              </pattern>
            </defs>

            <rect width={screenRect.width} height={screenRect.height} fill="#020403" />

            <g filter="url(#airbus-bloom)">
              <g transform="scale(1.58)">{children}</g>
            </g>

            <rect
              width={screenRect.width}
              height={screenRect.height}
              fill="url(#airbus-dot-grid)"
              className="airbus-nd-dot-grid"
            />

            <rect
              width={screenRect.width}
              height={screenRect.height}
              fill="url(#airbus-vignette)"
              className="airbus-nd-vignette"
            />
          </svg>
        </ScreenGlass>
      </InstrumentBezel>
    </div>
  );
}
