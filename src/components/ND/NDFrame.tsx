import { ReactNode } from 'react';
import { NavigationDisplayModel } from '@shared';

interface NDFrameProps {
  model: NavigationDisplayModel;
  children: ReactNode;
}

export function NDFrame({ model, children }: NDFrameProps) {
  return (
    <div className={`relative aspect-square flex-1 overflow-hidden rounded-[2px] bg-black ring-1 ring-white/5 ${model.style === 'airbus' ? 'shadow-[inset_0_0_40px_rgba(34,197,94,0.05)]' : ''}`}>
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

        <rect width="100" height="100" fill="#070909" />
        
        {/* Children slot (A320ND or B737ND) */}
        {children}
      </svg>
      
      {/* CRT Scanline Overlay for Airbus */}
      {model.style === 'airbus' && (
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%]" />
      )}
    </div>
  );
}

// Re-export shared primitives for use in specific renderers
export { TCASOverlay, WXROverlay, VerticalProfileOverlay, RangeRings, HeadingRose, AircraftSymbol, NDAnchorZones };

function TCASOverlay({ targets }: { targets: any[] }) {
  return (
    <g data-testid="nd-tcas-overlay">
      {targets.map(t => (
        <g key={t.id} transform={`translate(${t.x} ${t.y})`}>
          {/* Symbol based on threat level */}
          {t.threatLevel === 'resolution' ? (
            <rect x="-2.5" y="-2.5" width="5" height="5" fill="#ff0000" />
          ) : t.threatLevel === 'traffic' ? (
            <circle r="2.5" fill="#ffcc00" />
          ) : t.threatLevel === 'proximate' ? (
            <path d="M0 -3 L3 0 L0 3 L-3 0 Z" fill="#ffffff" />
          ) : (
            <path d="M0 -3 L3 0 L0 3 L-3 0 Z" fill="none" stroke="#ffffff" strokeWidth="0.5" />
          )}
          
          {/* Altitude Tag */}
          <text
            y={t.relativeAltitude > 0 ? -5 : 7}
            x="4"
            fill={t.threatLevel === 'resolution' ? '#ff0000' : t.threatLevel === 'traffic' ? '#ffcc00' : '#ffffff'}
            fontSize="2.8"
            fontWeight="bold"
          >
            {t.relativeAltitude > 0 ? `+${t.relativeAltitude}` : t.relativeAltitude}
          </text>
          
          {/* Trend Arrow */}
          {t.trend !== 'level' && (
            <path
              d={t.trend === 'climb' ? 'M7 -4 L7 -7 L6 -6 M7 -7 L8 -6' : 'M7 4 L7 7 L6 6 M7 7 L8 6'}
              stroke={t.threatLevel === 'resolution' ? '#ff0000' : t.threatLevel === 'traffic' ? '#ffcc00' : '#ffffff'}
              strokeWidth="0.5"
              fill="none"
            />
          )}
        </g>
      ))}
    </g>
  );
}

function WXROverlay({ data }: { data: any }) {
  if (!data) return null;
  return (
    <g data-testid="nd-wxr-overlay" opacity="0.4">
      {data.points.map((p: any, i: number) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={p.r}
          fill={data.intensity === 'heavy' ? '#ff0000' : data.intensity === 'medium' ? '#ffff00' : '#00ff00'}
          filter="url(#crt-bloom)"
        />
      ))}
    </g>
  );
}

function VerticalProfileOverlay({ points }: { points: any[] }) {
  return (
    <g data-testid="nd-vertical-overlay">
      {points.map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y})`}>
          <circle r="1.5" fill="none" stroke="#00ffff" strokeWidth="0.5" />
          <circle r="0.5" fill="#00ffff" />
          <text y="-3" textAnchor="middle" fill="#00ffff" fontSize="2.8" fontWeight="bold">
            {p.label}
          </text>
        </g>
      ))}
    </g>
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
      {/* Compass Arc/Circle */}
      {centered ? (
        <circle cx="50" cy={cy} r="35" strokeDasharray="1 2" />
      ) : (
        <path d={`M15 ${cy} A35 35 0 0 1 85 ${cy}`} />
      )}
      
      {/* Degree Ticks */}
      {[...Array(36)].map((_, i) => {
        const angle = i * 10;
        const rad = (Math.PI * (angle - 90)) / 180;
        const isMajor = angle % 30 === 0;
        const length = isMajor ? 3 : 1.5;
        
        // Don't draw bottom ticks if not centered
        if (!centered && (angle < 110 || angle > 250)) return null;

        return (
          <line
            key={angle}
            x1={50 + Math.cos(rad) * (35 - length)}
            y1={cy + Math.sin(rad) * (35 - length)}
            x2={50 + Math.cos(rad) * 35}
            y2={cy + Math.sin(rad) * 35}
            strokeWidth={isMajor ? 0.8 : 0.5}
          />
        );
      })}

      {/* Cardinal Labels (N, E, S, W) */}
      {[0, 90, 180, 270].map(angle => {
        const rad = (Math.PI * (angle - 90)) / 180;
        const label = ['N', 'E', 'S', 'W'][angle / 90];
        if (!centered && (angle > 90 && angle < 270)) return null;
        
        return (
          <text
            key={label}
            x={50 + Math.cos(rad) * 39}
            y={cy + Math.sin(rad) * 39 + 1}
            fill="#ffffff"
            fontSize="3.5"
            textAnchor="middle"
            fontWeight="bold"
          >
            {label}
          </text>
        );
      })}
    </g>
  );
}

function AircraftSymbol({ centered, color, style }: { centered: boolean, color: string, style: string }) {
  const cy = centered ? 50 : 84;
  return (
    <g transform={`translate(50 ${cy})`} filter={style === 'airbus' ? 'url(#crt-bloom)' : undefined}>
      <path d="M0-4.5 L3 4 L0 2 L-3 4 Z" fill="none" stroke={color} strokeWidth="1.2" />
      <line x1="-7" y1="2" x2="7" y2="2" stroke={color} strokeWidth="1" />
      <circle r="0.5" fill={color} />
    </g>
  );
}

function NDAnchorZones({ model, colors }: { model: NavigationDisplayModel, colors: any }) {
  return (
    <g fontSize="3.2" style={{ fontVariantNumeric: 'tabular-nums' }}>
      {/* Top Left: Speed Block */}
      <g transform="translate(4 6)">
        <text fill="#ffffff" fontWeight="bold">TAS <tspan fill={colors.active}>{model.anchorZones.speedBlock.tas}</tspan></text>
        <text y="4.5" fill="#ffffff" fontWeight="bold">GS  <tspan fill={colors.active}>{model.anchorZones.speedBlock.gs}</tspan></text>
      </g>
      
      {/* Top Right: Next Waypoint */}
      {model.anchorZones.waypointBlock && (
        <g transform="translate(96 6)" textAnchor="end">
          <text fill={colors.active} fontWeight="bold" fontSize="3.8">{model.anchorZones.waypointBlock.ident}</text>
          <text y="4.5" fill="#ffffff">{model.anchorZones.waypointBlock.dist} <tspan fontSize="2.4" opacity="0.6">NM</tspan></text>
          <text y="9" fill="#ffffff">{model.anchorZones.waypointBlock.eta} <tspan fontSize="2.4" opacity="0.6">UTC</tspan></text>
        </g>
      )}

      {/* Bottom Left: Wind Block */}
      <g transform="translate(4 96)">
        <path d="M0 0 L-2 -1 L2 -1 Z" fill={colors.active} transform={`rotate(${model.anchorZones.windBlock.dir})`} />
        <text x="4" y="0" fill={colors.active} fontWeight="bold">{model.anchorZones.windBlock.dir}/{model.anchorZones.windBlock.speed}</text>
      </g>

      {/* Bottom Right: Mode & Source */}
      <g transform="translate(96 96)" textAnchor="end">
        <text fill={colors.text} fontWeight="bold">{model.style.toUpperCase()} {model.mode}</text>
      </g>
      
      {/* Center Top: TRK/HDG */}
      <g transform="translate(50 6)">
        <rect x="-9" y="-4.5" width="18" height="7" fill="black" stroke={colors.warning} strokeWidth="0.6" rx="0.5" />
        <text textAnchor="middle" y="0.5" fill={colors.warning} fontWeight="bold" fontSize="4">000</text>
        <text textAnchor="middle" y="5.5" fill={colors.warning} fontSize="2.2">TRK MAG</text>
      </g>
    </g>
  );
}
