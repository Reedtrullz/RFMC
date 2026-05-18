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
      className="boeing-nd-surface relative h-full w-full rounded-[20px] overflow-hidden bg-[#2c2f32] p-4 flex flex-col justify-between"
      style={{
        boxShadow: 'inset 0 4px 10px rgba(255,255,255,0.2), inset 0 -4px 10px rgba(0,0,0,0.6), 0 10px 30px rgba(0,0,0,0.8)',
        border: '2px solid #3c3f42',
      }}
    >
      <div 
        className="relative flex-1 min-h-0 bg-black rounded-lg overflow-hidden"
        style={{
          boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.9), inset -2px -2px 4px rgba(255,255,255,0.1), 0 0 0 3px #1a1c1e',
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

            <g filter="url(#boeing-glow)">
              <g transform="scale(1.54)">
                {children}
              </g>
            </g>

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

      <div className="mt-4 mb-2 flex items-center justify-between px-4 select-none">
        <div className="flex items-center gap-4">
          {[
            { num: '0', sym: '⬜' },
            { num: '2', sym: 'R' },
            { num: '0', sym: '9' },
            { num: '8', sym: 'B' },
            { num: '5', sym: '7' },
            { num: '9', sym: 'S' },
            { num: '56', sym: 'FT' },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="flex flex-col items-center leading-none mb-1 text-[10px] font-bold text-gray-400 select-none h-6 justify-end">
                <span>{item.num}</span>
                <span className="text-[9px] mt-0.5">{item.sym}</span>
              </div>
              <button
                type="button"
                className="w-7 h-7 rounded-full bg-[#141517] border border-[#2d3033] shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),_0_3px_5px_rgba(0,0,0,0.6)] active:shadow-[inset_0_3px_5px_rgba(0,0,0,0.8)] active:translate-y-[1px] transition-all duration-75 flex items-center justify-center cursor-pointer"
                style={{
                  background: 'radial-gradient(circle, #202224 0%, #101112 100%)',
                }}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center ml-auto">
          <div className="text-[9px] font-bold text-gray-400 mb-1 select-none tracking-wider">BRT</div>
          <div 
            className="w-9 h-9 rounded-full relative flex items-center justify-center shadow-[0_4px_8px_rgba(0,0,0,0.6),_inset_0_2px_3px_rgba(255,255,255,0.2)]"
            style={{
              background: 'conic-gradient(from 0deg, #4a4d50, #2c2e30, #6c7074, #2c2e30, #4a4d50)',
              border: '2px solid #3c3f42',
            }}
          >
            <div className="absolute inset-1 rounded-full border border-dashed border-[#ffffff30] pointer-events-none" />
            <div 
              className="w-5 h-5 rounded-full shadow-[inset_0_1px_3px_rgba(255,255,255,0.3)] flex items-center justify-center"
              style={{
                background: 'radial-gradient(circle, #5a5d60 0%, #2c2e30 100%)',
              }}
            >
              <div className="w-1 h-2 bg-white rounded-full -translate-y-1.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
