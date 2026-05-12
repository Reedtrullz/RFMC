import { useMemo } from 'react';
import {
  buildNavigationDisplayModel,
  type NavigationDisplayModel,
} from '@shared';
import { useFMCStore } from '../store/useFMCStore';

const RANGES = [5, 10, 20, 40, 80, 160, 320, 640];
const BOEING_MODES = ['APP', 'VOR', 'MAP', 'PLAN'];
const AIRBUS_MODES = ['ROSE', 'ARC', 'PLAN'];

export function NavigationDisplay() {
  const state = useFMCStore(s => s);
  const side = 'L'; // In a multi-display setup, this would be a prop
  const efis = side === 'L' ? state.efisL : state.efisR;
  
  const model = useMemo(
    () => buildNavigationDisplayModel(state, efis),
    [state, efis]
  );

  const modes = model.style === 'airbus' ? AIRBUS_MODES : BOEING_MODES;

  return (
    <section
      data-testid="navigation-display"
      className={`flex h-full min-h-[300px] w-full max-w-[500px] flex-col rounded-md border-4 border-cdu-bezel bg-[#0a0c0c] p-1 shadow-2xl ${model.style === 'airbus' ? 'border-[#3a3d3d]' : 'border-cdu-bezel'}`}
      aria-label="Navigation Display"
    >
      {/* Simulation Display Area */}
      <div className={`relative aspect-square flex-1 overflow-hidden rounded-[2px] bg-black ring-1 ring-white/5 ${model.style === 'airbus' ? 'shadow-[inset_0_0_40px_rgba(34,197,94,0.05)]' : ''}`}>
        <NavigationDisplaySvg model={model} />
        
        {/* CRT Scanline Overlay for Airbus */}
        {model.style === 'airbus' && (
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%]" />
        )}
      </div>

      {/* Training Rail / EFIS Control Panel */}
      <div className="mt-1.5 flex flex-col gap-1.5 bg-cdu-bezel/40 p-2 rounded-sm border border-white/5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-0.5" aria-label="Mode Selector">
            {modes.map(m => (
              <button
                key={m}
                onClick={() => state.setNDMode(side, m)}
                className={`px-2 py-1 text-[9px] font-bold tracking-tighter transition-all ${efis.mode === m ? 'bg-cdu-cyan text-black' : 'bg-black/40 text-cdu-cyan/60 hover:text-cdu-cyan'}`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="flex gap-0.5 overflow-hidden" aria-label="Range Selector">
            {RANGES.map(r => (
              <button
                key={r}
                onClick={() => state.setNDRange(side, r)}
                className={`flex-1 px-1 py-1 text-[9px] font-bold transition-all ${efis.range === r ? 'bg-cdu-white text-black' : 'bg-black/40 text-cdu-white/40 hover:text-cdu-white'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-1">
          {['WPT', 'ARPT', 'STA', 'DATA', 'POS', 'TERR', 'WXR', 'TFC'].map(ov => (
            <button
              key={ov}
              onClick={() => state.toggleNDOverlay(side, ov.toLowerCase() as any)}
              className={`flex-1 py-0.5 text-[8px] font-bold border ${efis.overlays[ov.toLowerCase() as keyof typeof efis.overlays] ? 'border-cdu-green text-cdu-green bg-cdu-green/10' : 'border-white/10 text-white/30'}`}
            >
              {ov}
            </button>
          ))}
          {model.style === 'boeing' && (
            <button
              onClick={() => state.toggleNDCenter(side)}
              className={`px-2 py-0.5 text-[8px] font-bold border ${efis.centered ? 'border-cdu-cyan text-cdu-cyan' : 'border-white/10 text-white/30'}`}
            >
              CTR
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function NavigationDisplaySvg({ model }: { model: NavigationDisplayModel }) {
  const colors = {
    active: model.style === 'airbus' ? '#ffffff' : '#39ff14',
    route: model.style === 'airbus' ? '#00ff00' : '#d946ef',
    modified: '#00ffff',
    text: model.style === 'airbus' ? '#00ff00' : '#00d0ff',
    warning: '#ffcc00',
    background: '#070909'
  };

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full font-cdu select-none">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="0.4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="crt-bloom" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.6" />
        </filter>
      </defs>

      <rect width="100" height="100" fill={colors.background} />
      
      {/* Procedure Label (Top Left-ish) */}
      <text x="4" y="15" fill={colors.text} fontSize="3.5" fontWeight="bold" opacity="0.8">
        {model.procedureLabel}
      </text>

      {/* Visual Base (Rings / Rose) */}
      <g opacity="0.4">
        <RangeRings range={model.range} centered={model.centered} color={model.style === 'airbus' ? '#004400' : '#003344'} />
        <HeadingRose centered={model.centered} />
      </g>

      {/* Map Content Layer */}
      <g filter={model.style === 'airbus' ? 'url(#glow)' : undefined}>
        {/* Route Segments */}
        {model.routeSegments.map((segment, i) => (
          <line
            key={`seg-${i}`}
            x1={segment.from.x} y1={segment.from.y}
            x2={segment.to.x} y2={segment.to.y}
            stroke={segment.modified ? colors.modified : colors.route}
            strokeWidth={segment.active ? '1.8' : '1.2'}
            strokeDasharray={segment.dashed ? '2 2' : segment.modified ? '4 2' : undefined}
            opacity={0.9}
          />
        ))}

        {/* Waypoints & Labels */}
        {model.routePoints.map(point => (
          <g key={point.id} transform={`translate(${point.x} ${point.y})`}>
            {point.discontinuity ? (
              <path d="M-2-2L2 2M2-2L-2 2" stroke="#ffaa00" strokeWidth="1" />
            ) : (
              <path
                d={point.airport ? 'M0-2.5L2.5 2.5L-2.5 2.5Z' : 'M0-2.5L1.8 0L0 2.5L-1.8 0Z'}
                fill={point.active ? colors.active : 'none'}
                stroke={point.active ? colors.active : colors.text}
                strokeWidth="0.8"
              />
            )}
            <text x="3" y="1" fill={point.active ? colors.active : colors.text} fontSize="3.2" fontWeight="bold">
              {point.label}
            </text>
            <g fontSize="2.4">
              {point.speedLabel && (
                <text x="3" y="4.5" fill="#facc15">{point.speedLabel}</text>
              )}
              {point.altitudeLabel && (
                <text x="3" y={point.speedLabel ? 7.5 : 4.5} fill="#facc15">{point.altitudeLabel}</text>
              )}
            </g>
          </g>
        ))}

        {/* Overlays (Fix/Hold) */}
        {model.fixOverlays.map((f, i) => (
          <g key={`fix-${i}`} transform={`translate(${f.x} ${f.y})`} opacity="0.8" data-testid="nd-fix-overlay">
            <circle r="8" fill="none" stroke={colors.text} strokeWidth="0.5" strokeDasharray="1 1" />
            <text x="2" y="-5" fill={colors.text} fontSize="2.8">{f.refFix}</text>
          </g>
        ))}
        
        {model.holdOverlay && (
          <g transform={`translate(${model.holdOverlay.x} ${model.holdOverlay.y})`} data-testid="nd-hold-overlay">
            <ellipse rx="10" ry="4" fill="none" stroke={colors.route} strokeWidth="0.8" transform={`rotate(${model.holdOverlay.inboundCourse})`} />
          </g>
        )}
      </g>

      {/* Anchor Zones (Data Density) */}
      <g fontSize="3.2" fontWeight="bold">
        {/* Top Left: Speed Block */}
        <text x="4" y="6" fill="#ffffff">TAS {model.anchorZones.speedBlock.tas}</text>
        <text x="4" y="10" fill="#ffffff">GS  {model.anchorZones.speedBlock.gs}</text>
        
        {/* Top Right: Next Waypoint */}
        {model.anchorZones.waypointBlock && (
          <g textAnchor="end">
            <text x="96" y="6" fill={colors.active}>{model.anchorZones.waypointBlock.ident}</text>
            <text x="96" y="10" fill="#ffffff">{model.anchorZones.waypointBlock.dist} NM</text>
            <text x="82" y="10" fill="#ffffff">{model.anchorZones.waypointBlock.eta}</text>
            <text x="82" y="6" fill="#ffffff" fontSize="2.8" opacity="0.6">{model.anchorZones.waypointBlock.ete}</text>
          </g>
        )}

        {/* Bottom Corners: Wind & Source */}
        <text x="4" y="96" fill="#ffffff">{model.anchorZones.windBlock.dir}/{model.anchorZones.windBlock.speed}</text>
        <text x="96" y="96" textAnchor="end" fill={colors.text}>{model.style.toUpperCase()} {model.mode}</text>
        
        {/* Center Top: TRK/HDG */}
        <g transform="translate(50 6)">
          <rect x="-8" y="-4" width="16" height="6" fill="black" stroke={colors.warning} strokeWidth="0.5" />
          <text textAnchor="middle" y="0.5" fill={colors.warning}>000 MAG</text>
        </g>
      </g>

      {/* Aircraft Symbol */}
      <g transform={`translate(50 ${model.centered ? 50 : 84})`} filter={model.style === 'airbus' ? 'url(#crt-bloom)' : undefined}>
        <path d="M0-4L2.5 4L0 2L-2.5 4Z" fill="none" stroke={colors.active} strokeWidth="1.2" />
        <line x1="-6" y1="2" x2="6" y2="2" stroke={colors.active} strokeWidth="1" />
      </g>

      {/* MOD Annunciation */}
      {model.isModified && (
        <text x="50" y="92" textAnchor="middle" fill={colors.modified} fontSize="4" fontWeight="bold" filter="url(#glow)">MOD</text>
      )}
    </svg>
  );
}

function RangeRings({ range, centered, color }: { range: number, centered: boolean, color: string }) {
  const cy = centered ? 50 : 84;
  return (
    <g stroke={color} fill="none" strokeWidth="0.4">
      <circle cx="50" cy={cy} r="20" strokeDasharray="1 2" />
      <circle cx="50" cy={cy} r="40" strokeDasharray="1 2" />
      <text x="52" y={cy - 21} fill={color} fontSize="2.5">{range / 2}</text>
      <text x="52" y={cy - 41} fill={color} fontSize="2.5">{range}</text>
    </g>
  );
}

function HeadingRose({ centered }: { centered: boolean }) {
  const cy = centered ? 50 : 84;
  return (
    <g stroke="#ffffff" opacity="0.3" fill="none" strokeWidth="0.5">
      <path d={`M15 ${cy} A35 35 0 0 1 85 ${cy}`} />
      {[0, 30, 60, 90, 120, 150, 180].map(a => {
        const rad = (Math.PI * (180 - a)) / 180;
        return <line key={a} x1={50 + Math.cos(rad) * 33} y1={cy - Math.sin(rad) * 33} x2={50 + Math.cos(rad) * 35} y2={cy - Math.sin(rad) * 35} />;
      })}
    </g>
  );
}
