import { useMemo, useState } from 'react';
import {
  buildNavigationDisplayModel,
  type NDMapMode,
  type NDOverlaySettings,
  type NDRange,
  type NavigationDisplayModel,
} from '@shared';
import { useFMCStore } from '../store/useFMCStore';

const RANGES: NDRange[] = [10, 20, 40, 80, 160, 320];
const OVERLAY_KEYS: Array<keyof NDOverlaySettings> = ['fix', 'hold', 'wpt', 'arpt'];

export function NavigationDisplay() {
  const fmcState = useFMCStore(s => s);
  const [mode, setMode] = useState<NDMapMode>('MAP');
  const [range, setRange] = useState<NDRange>(40);
  const [overlays, setOverlays] = useState<NDOverlaySettings>({ fix: true, hold: true, wpt: true, arpt: true });
  const model = useMemo(
    () => buildNavigationDisplayModel(fmcState, { mode, range, overlays }),
    [fmcState, mode, range, overlays]
  );

  const toggleOverlay = (key: keyof NDOverlaySettings) => {
    setOverlays(current => ({ ...current, [key]: !current[key] }));
  };

  return (
    <section
      data-testid="navigation-display"
      className="flex h-full min-h-[260px] w-full max-w-[460px] flex-col rounded-md border border-cdu-bezel-light bg-[#070909] p-2 text-cdu-white shadow-[inset_0_0_24px_rgba(0,0,0,0.85)]"
      aria-label="Navigation Display training context"
    >
      <div className="flex items-center justify-between gap-2 border-b border-cdu-bezel-light/80 pb-1 font-cdu text-[10px] uppercase tracking-[0.16em]">
        <span className={model.style === 'airbus' ? 'text-cdu-cyan' : 'text-cdu-white'}>
          {model.style === 'airbus' ? 'A320 ND' : '737 ND'}
        </span>
        <span className="text-cdu-magenta">{model.procedureLabel}</span>
      </div>

      <div className="relative mt-2 aspect-square min-h-0 flex-1 overflow-hidden rounded bg-black">
        <NavigationDisplaySvg model={model} />
      </div>

      <div className="mt-2 grid grid-cols-[auto_1fr] gap-2 font-cdu text-[10px] uppercase">
        <div className="flex gap-1" aria-label="ND map mode selector">
          {(['MAP', 'PLAN'] as NDMapMode[]).map(option => (
            <button
              key={option}
              type="button"
              className={`h-7 min-w-12 rounded-sm border px-2 ${mode === option ? 'border-cdu-cyan bg-cdu-cyan/15 text-cdu-cyan' : 'border-cdu-bezel-light text-cdu-white/70'}`}
              aria-pressed={mode === option}
              onClick={() => setMode(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="flex min-w-0 gap-1 overflow-hidden" aria-label="ND range selector">
          {RANGES.map(option => (
            <button
              key={option}
              type="button"
              className={`h-7 min-w-0 flex-1 rounded-sm border px-1 ${range === option ? 'border-cdu-cyan bg-cdu-cyan/15 text-cdu-cyan' : 'border-cdu-bezel-light text-cdu-white/70'}`}
              aria-pressed={range === option}
              onClick={() => setRange(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="col-span-2 flex gap-1" aria-label="ND overlay toggles">
          {OVERLAY_KEYS.map(key => (
            <button
              key={key}
              type="button"
              className={`h-7 flex-1 rounded-sm border px-1 ${overlays[key] ? 'border-cdu-text/80 bg-cdu-text/10 text-cdu-text' : 'border-cdu-bezel-light text-cdu-white/45'}`}
              aria-pressed={overlays[key]}
              onClick={() => toggleOverlay(key)}
            >
              {key.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function NavigationDisplaySvg({ model }: { model: NavigationDisplayModel }) {
  const routeColor = model.style === 'airbus' ? '#22c55e' : '#d946ef';
  const labelColor = model.style === 'airbus' ? '#22c55e' : '#00d0ff';
  const activeColor = model.style === 'airbus' ? '#ffffff' : '#39ff14';

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label="ND route map">
      <defs>
        <radialGradient id="nd-range-glow" cx="50%" cy="72%" r="70%">
          <stop offset="0%" stopColor="#06200f" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill="url(#nd-range-glow)" />
      <RangeRings range={model.range} />
      <HeadingRose />

      {model.routeSegments.map(segment => (
        <line
          key={`${segment.from.id}-${segment.to.id}`}
          x1={segment.from.x}
          y1={segment.from.y}
          x2={segment.to.x}
          y2={segment.to.y}
          stroke={routeColor}
          strokeWidth={segment.active ? '1.9' : '1.2'}
          strokeDasharray={segment.dashed ? '3 2' : undefined}
          opacity={segment.active ? 1 : segment.dashed ? 0.7 : 0.95}
        />
      ))}

      {model.fixOverlays.map((overlay, index) => (
        <g key={`${overlay.refFix}-${index}`} data-testid="nd-fix-overlay" transform={`translate(${overlay.x} ${overlay.y})`}>
          <circle r="12" fill="none" stroke="#22c55e" strokeWidth="0.9" strokeDasharray="2 2" />
          {overlay.radial > 0 && (
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="-18"
              stroke="#22c55e"
              strokeWidth="0.8"
              transform={`rotate(${overlay.radial})`}
            />
          )}
          <text x="3" y="-13" fill="#22c55e" fontSize="3.5" fontFamily="'B612 Mono', monospace">
            {overlay.refFix}
          </text>
          <text x="3" y="-9" fill="#22c55e" fontSize="3" fontFamily="'B612 Mono', monospace">
            R{String(overlay.radial || 0).padStart(3, '0')} D{overlay.distance || '--'}
          </text>
        </g>
      ))}

      {model.holdOverlay && (
        <g data-testid="nd-hold-overlay" transform={`translate(${model.holdOverlay.x} ${model.holdOverlay.y})`}>
          <ellipse
            rx="13"
            ry="5"
            fill="none"
            stroke="#d946ef"
            strokeWidth="1"
            transform={`rotate(${model.holdOverlay.inboundCourse || 0})`}
          />
          <text x="4" y="9" fill="#d946ef" fontSize="3.5" fontFamily="'B612 Mono', monospace">
            HOLD {model.holdOverlay.fix} {model.holdOverlay.direction}
          </text>
        </g>
      )}

      {model.routePoints.map(point => (
        <g key={point.id} data-testid={point.discontinuity ? 'nd-discontinuity' : 'nd-waypoint'} transform={`translate(${point.x} ${point.y})`}>
          {point.discontinuity ? (
            <>
              <path d="M-3 -3 L3 3 M3 -3 L-3 3" stroke="#f59e0b" strokeWidth="1.2" />
              <text x="4" y="1" fill="#f59e0b" fontSize="3.3" fontFamily="'B612 Mono', monospace">DISCO</text>
            </>
          ) : (
            <>
              <path
                d={point.airport ? 'M0 -3 L3 3 L-3 3 Z' : 'M0 -3 L2 0 L0 3 L-2 0 Z'}
                fill={point.active ? activeColor : 'none'}
                stroke={point.active ? activeColor : labelColor}
                strokeWidth="1"
              />
              {(model.overlays.wpt || (point.airport && model.overlays.arpt)) && (
                <>
                  <text x="3.5" y="-3" fill={point.active ? activeColor : labelColor} fontSize="3.5" fontFamily="'B612 Mono', monospace">
                    {point.label}
                  </text>
                  {(point.speedLabel || point.altitudeLabel) && (
                    <text x="3.5" y="2" fill="#facc15" fontSize="2.8" fontFamily="'B612 Mono', monospace">
                      {[point.speedLabel, point.altitudeLabel].filter(Boolean).join('/')}
                    </text>
                  )}
                </>
              )}
            </>
          )}
        </g>
      ))}

      {model.routePoints.length === 0 && (
        <text x="50" y="50" textAnchor="middle" fill="#64748b" fontSize="4" fontFamily="'B612 Mono', monospace">
          NO ROUTE
        </text>
      )}

      <AircraftSymbol />
      <text x="5" y="8" fill="#ffffff" fontSize="4" fontFamily="'B612 Mono', monospace">{model.mode}</text>
      <text x="50" y="8" textAnchor="middle" fill="#f97316" fontSize="4" fontFamily="'B612 Mono', monospace">TRK 000</text>
      <text x="95" y="8" textAnchor="end" fill="#ffffff" fontSize="4" fontFamily="'B612 Mono', monospace">RNG {model.range}</text>
      <text x="5" y="96" fill="#22c55e" fontSize="3.5" fontFamily="'B612 Mono', monospace">{model.origin || '----'}</text>
      <text x="95" y="96" textAnchor="end" fill="#22c55e" fontSize="3.5" fontFamily="'B612 Mono', monospace">{model.destination || '----'}</text>
    </svg>
  );
}

function RangeRings({ range }: { range: NDRange }) {
  return (
    <g stroke="#15803d" strokeWidth="0.5" fill="none" opacity="0.55">
      <circle cx="50" cy="78" r="18" strokeDasharray="1.5 2" />
      <circle cx="50" cy="78" r="34" strokeDasharray="1.5 2" />
      <circle cx="50" cy="78" r="50" />
      <text x="53" y="60" fill="#22c55e" fontSize="3" fontFamily="'B612 Mono', monospace">{range / 2}</text>
      <text x="53" y="43" fill="#22c55e" fontSize="3" fontFamily="'B612 Mono', monospace">{range}</text>
    </g>
  );
}

function HeadingRose() {
  return (
    <g stroke="#facc15" strokeWidth="0.55" fill="#facc15" opacity="0.9">
      <path d="M10 78 A40 40 0 0 1 90 78" fill="none" />
      {[0, 30, 60, 90, 120, 150, 180].map((angle, index) => {
        const radians = (Math.PI * (180 - angle)) / 180;
        const x1 = 50 + Math.cos(radians) * 37;
        const y1 = 78 - Math.sin(radians) * 37;
        const x2 = 50 + Math.cos(radians) * 40;
        const y2 = 78 - Math.sin(radians) * 40;
        return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} opacity={index % 2 === 0 ? 1 : 0.7} />;
      })}
    </g>
  );
}

function AircraftSymbol() {
  return (
    <g transform="translate(50 78)" stroke="#39ff14" fill="none" strokeWidth="1.2">
      <path d="M0 -5 L3 5 L0 3 L-3 5 Z" />
      <line x1="-7" y1="3" x2="7" y2="3" />
    </g>
  );
}
