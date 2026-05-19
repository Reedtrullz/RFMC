import { ReactNode, useRef, useEffect } from 'react';
import { NavigationDisplayModel } from '@shared';
import { ScreenGlass } from '../../instruments/common/ScreenGlass';
import { EffectProfiles } from '../../instruments/common/EffectProfiles';
import { BOEING_ND_GEOMETRY } from '../../instruments/common/GeometryProfiles';
import { useFMCStore } from '../../../store/useFMCStore';

interface BoeingNDFrameProps {
  model: NavigationDisplayModel;
  children: ReactNode;
  side?: 'L' | 'R';
}

const RANGES = [5, 10, 20, 40, 80, 160, 320, 640];

const getKnobRotation = (range: number) => {
  const index = RANGES.indexOf(range);
  if (index === -1) return 0;
  return -135 + index * (270 / 7);
};

const overlayButtons = [
  { label: 'WPT', key: 'wpt' },
  { label: 'ARPT', key: 'arpt' },
  { label: 'STA', key: 'sta' },
  { label: 'DATA', key: 'data' },
  { label: 'POS', key: 'pos' },
  { label: 'TERR', key: 'terr' },
  { label: 'WXR', key: 'wxr' },
  { label: 'TFC', key: 'tfc' },
];

export function BoeingNDFrame({ model: _model, children, side }: BoeingNDFrameProps) {
  const { screenRect } = BOEING_ND_GEOMETRY;
  const sideKey = side || 'L';

  // Using narrow Zustand selectors to prevent unnecessary re-renders when other store slices change
  const efis = useFMCStore((s) => (sideKey === 'L' ? s.efisL : s.efisR));
  const setNDRange = useFMCStore((s) => s.setNDRange);
  const setNDMode = useFMCStore((s) => s.setNDMode);
  const toggleNDOverlay = useFMCStore((s) => s.toggleNDOverlay);
  const toggleNDCenter = useFMCStore((s) => s.toggleNDCenter);

  const currentRange = efis.range;
  const knobRef = useRef<HTMLDivElement>(null);

  // Keep references fresh for the event listener without re-binding it on every state change
  const currentRangeRef = useRef(currentRange);
  const sideKeyRef = useRef(sideKey);
  const setNDRangeRef = useRef(setNDRange);

  useEffect(() => {
    currentRangeRef.current = currentRange;
    sideKeyRef.current = sideKey;
    setNDRangeRef.current = setNDRange;
  }, [currentRange, sideKey, setNDRange]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const currentVal = currentRangeRef.current;
      const sideVal = sideKeyRef.current;
      const currentIndex = RANGES.indexOf(currentVal);
      if (e.deltaY < 0) {
        if (currentIndex < RANGES.length - 1) {
          setNDRangeRef.current(sideVal, RANGES[currentIndex + 1]);
        }
      } else if (e.deltaY > 0) {
        if (currentIndex > 0) {
          setNDRangeRef.current(sideVal, RANGES[currentIndex - 1]);
        }
      }
    };

    const element = knobRef.current;
    if (element) {
      element.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (element) {
        element.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  const handleKnobMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentIndex = RANGES.indexOf(currentRange);
    if (e.button === 0) {
      if (currentIndex > 0) {
        setNDRange(sideKey, RANGES[currentIndex - 1]);
      }
    } else if (e.button === 2) {
      if (currentIndex < RANGES.length - 1) {
        setNDRange(sideKey, RANGES[currentIndex + 1]);
      }
    }
  };

  const handleKnobContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const handleScreenDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const modes = ['APP', 'VOR', 'MAP', 'PLN'];
    const currentIndex = modes.indexOf(efis.mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setNDMode(sideKey, modes[nextIndex]);
  };

  return (
    <div
      data-aircraft="boeing"
      className="boeing-nd-surface relative h-full w-full rounded-[20px] overflow-hidden bg-[#2c2f32] p-4 flex flex-col justify-between"
      style={{
        boxShadow:
          'inset 0 4px 10px rgba(255,255,255,0.2), inset 0 -4px 10px rgba(0,0,0,0.6), 0 10px 30px rgba(0,0,0,0.8)',
        border: '2px solid #3c3f42',
      }}
    >
      <div
        className="relative flex-1 min-h-0 bg-black rounded-lg overflow-hidden cursor-pointer"
        onDoubleClick={handleScreenDoubleClick}
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
              <g transform="scale(1.54)">{children}</g>
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

      <div
        className="mt-4 mb-2 p-3 rounded-xl flex items-center justify-between gap-4 select-none"
        style={{
          background: 'linear-gradient(to bottom, #383b3e 0%, #222426 50%, #121315 100%)',
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 8px rgba(0,0,0,0.5), inset 0 -1px 2px rgba(0,0,0,0.6)',
          border: '1px solid #2f3133',
        }}
      >
        <div className="flex items-center gap-2">
          {overlayButtons.map((btn) => {
            const isActive = efis.overlays[btn.key as keyof typeof efis.overlays];
            return (
              <div key={btn.key} className="flex flex-col items-center gap-1.5">
                <span className="text-[9px] font-bold text-gray-300 select-none tracking-wider">{btn.label}</span>
                <div className="bg-[#0a0b0c] p-[4px] pt-[6px] rounded-[6px] border border-[#3a3d40] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] flex flex-col items-center gap-1">
                  <div
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-150 ${
                      isActive
                        ? 'bg-[#00ff66] shadow-[0_0_6px_#00ff66]'
                        : 'bg-[#002208] shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)] border border-[#004411]/20'
                    }`}
                  />
                  <button
                    type="button"
                    data-testid={`nd-overlay-btn-${btn.key}`}
                    onClick={() => toggleNDOverlay(sideKey, btn.key as keyof typeof efis.overlays)}
                    className="w-7 h-7 rounded-[3px] bg-[#1a1b1d] border border-[#303336] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_0_2px_4px_rgba(0,0,0,0.8)] active:translate-y-[1px] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] cursor-pointer flex items-center justify-center transition-all duration-75"
                    style={{
                      background: 'radial-gradient(circle, #25282b 0%, #151719 100%)',
                    }}
                  />
                </div>
              </div>
            );
          })}

          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[9px] font-bold text-gray-300 select-none tracking-wider">CTR</span>
            <div className="bg-[#0a0b0c] p-[4px] pt-[6px] rounded-[6px] border border-[#3a3d40] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] flex flex-col items-center gap-1">
              <div
                className={`w-1.5 h-1.5 rounded-full transition-all duration-150 ${
                  efis.centered
                    ? 'bg-[#00ff66] shadow-[0_0_6px_#00ff66]'
                    : 'bg-[#002208] shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)] border border-[#004411]/20'
                }`}
              />
              <button
                type="button"
                data-testid="nd-center-btn"
                onClick={() => toggleNDCenter(sideKey)}
                className="w-7 h-7 rounded-[3px] bg-[#1a1b1d] border border-[#303336] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_0_2px_4px_rgba(0,0,0,0.8)] active:translate-y-[1px] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] cursor-pointer flex items-center justify-center transition-all duration-75"
                style={{
                  background: 'radial-gradient(circle, #25282b 0%, #151719 100%)',
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center ml-auto">
          <div className="text-[9px] font-bold text-gray-300 mb-1 select-none tracking-wider">RANGE</div>
          <div
            ref={knobRef}
            data-testid="nd-range-knob"
            onMouseDown={handleKnobMouseDown}
            onContextMenu={handleKnobContextMenu}
            className="w-10 h-10 rounded-full relative flex items-center justify-center shadow-[0_4px_8px_rgba(0,0,0,0.6),_inset_0_2px_3px_rgba(255,255,255,0.2)] cursor-pointer select-none"
            style={{
              background: 'conic-gradient(from 0deg, #4a4d50, #2c2e30, #6c7074, #2c2e30, #4a4d50)',
              border: '2px solid #3c3f42',
            }}
          >
            <div className="absolute inset-1 rounded-full border border-dashed border-[#ffffff30] pointer-events-none" />
            <div
              data-testid="nd-range-knob-pointer"
              className="w-6 h-6 rounded-full shadow-[inset_0_1px_3px_rgba(255,255,255,0.3)] flex items-center justify-center transition-transform duration-200"
              style={{
                background: 'radial-gradient(circle, #5a5d60 0%, #2c2e30 100%)',
                transform: `rotate(${getKnobRotation(currentRange)}deg)`,
              }}
            >
              <div className="w-1 h-2 bg-white rounded-full -translate-y-2 shadow-[0_0_2px_white]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
