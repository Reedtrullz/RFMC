import { ReactNode } from 'react';
import { NavigationDisplayModel } from '@shared';
import { ScreenGlass } from '../../instruments/common/ScreenGlass';
import { EffectProfiles } from '../../instruments/common/EffectProfiles';
import { BOEING_ND_GEOMETRY } from '../../instruments/common/GeometryProfiles';

interface BoeingNDFrameProps {
  model: NavigationDisplayModel;
  children: ReactNode;
}

export function BoeingNDFrame({ model: _model, children }: BoeingNDFrameProps) {
  const { screenRect } = BOEING_ND_GEOMETRY;

  return (
    <div
      data-aircraft="boeing"
      className="boeing-nd-surface relative h-full w-full rounded-md overflow-hidden bg-black"
      style={{
        boxShadow: 'inset 0 0 28px rgba(0,0,0,0.55)',
      }}
    >
      <ScreenGlass className="h-full w-full" effectProfile={EffectProfiles.CRT}>
        <svg
          viewBox={`0 0 ${screenRect.width} ${screenRect.height}`}
          className="h-full w-full font-avionics select-none"
        >
          <defs>
            <filter id="boeing-glow">
              <feGaussianBlur stdDeviation="0.3" result="blur" />
              <feComponentTransfer in="blur" result="glow">
                <feFuncA type="linear" slope="2.5" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <radialGradient id="boeing-vignette" cx="50%" cy="50%" r="75%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="65%" stopColor="transparent" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.5)" />
            </radialGradient>

            <pattern id="boeing-scanlines" patternUnits="userSpaceOnUse" width="4" height="4">
              <line x1="0" y1="0" x2="4" y2="0" stroke="rgba(0,0,0,0.15)" strokeWidth="0.55" />
              <line x1="0" y1="2" x2="4" y2="2" stroke="rgba(0,0,0,0.08)" strokeWidth="0.55" />
            </pattern>
          </defs>

          <rect width={screenRect.width} height={screenRect.height} fill="#020505" />

          <g filter="url(#boeing-glow)">{children}</g>

          <rect
            width={screenRect.width}
            height={screenRect.height}
            fill="url(#boeing-scanlines)"
            className="boeing-nd-scanlines pointer-events-none"
          />

          <rect
            width={screenRect.width}
            height={screenRect.height}
            fill="url(#boeing-vignette)"
            className="boeing-nd-vignette pointer-events-none"
          />
        </svg>
      </ScreenGlass>
    </div>
  );
}
