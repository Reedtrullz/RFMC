import { NavigationDisplayModel } from '@shared';
import { RangeRings } from '../layers/RangeRings';
import { HeadingRose } from '../layers/HeadingRose';
import { AircraftSymbol } from '../symbols/AircraftSymbol';
import { NDAnchorZones } from '../layers/NDAnchorZones';
import { TCASOverlay } from '../layers/TCASOverlay';
import { WXROverlay } from '../layers/WXROverlay';
import { VerticalProfileOverlay } from '../layers/VerticalProfileOverlay';

interface A320NDProps {
  model: NavigationDisplayModel;
}

export function A320ND({ model }: A320NDProps) {
  const colors = {
    active: '#00ff00', // Airbus Green
    text: '#ffffff', // Airbus White labels
    warning: '#ffcc00',
    magenta: '#ff00ff', // Constraint / Deviation
    temporary: '#ffff00', // Yellow dashed
  };

  const isArc = model.mode === 'ARC';
  const cy = model.centered ? 50 : 84;

  return (
    <g data-testid="a320-nd-renderer" filter="url(#glow)">
      <defs>
        <clipPath id="a320-nd-clip">
          {model.centered ? (
            <circle cx="50" cy={cy} r="45" />
          ) : (
            <path d={`M0 0 L0 ${cy} A50 50 0 0 1 100 ${cy} L100 0 Z`} />
          )}
        </clipPath>
      </defs>

      {/* Background Layers */}
      <g opacity="0.4">
        <RangeRings range={model.range} centered={!isArc} color="#004400" />
        <HeadingRose centered={!isArc} />
      </g>

      {/* Header Info */}
      <text x="50" y="12" fill={colors.active} fontSize="3.8" fontWeight="bold" textAnchor="middle" opacity="0.8">
        {model.procedureLabel}
      </text>

      {/* Dynamic Overlay Legend (Left) */}
      <g transform="translate(4 25)" fontSize="2.8" fill={colors.active} fontWeight="bold">
        {model.overlays.arpt && <text>ARPT</text>}
        {model.overlays.sta && <text y="4">STA</text>}
        {model.overlays.wpt && <text y="8">WPT</text>}
        {model.overlays.cstr && <text y="12" fill={colors.magenta}>CSTR</text>}
      </g>

      {/* Source Info (Bottom) */}
      <g transform="translate(4 94)" fontSize="3.2" fill={colors.active} fontWeight="bold">
        <text>FMC L</text>
      </g>
      <g transform="translate(96 94)" textAnchor="end" fontSize="2.8" fill={colors.text}>
        <text>ANP 0.05</text>
        <text x="-12" fill={colors.active}>RNP 0.10</text>
      </g>

      <g clipPath="url(#a320-nd-clip)">
        {/* Background Waypoints */}
        {model.backgroundWaypoints.map(point => (
          <g key={point.id} transform={`translate(${point.x} ${point.y})`} opacity="0.5">
            <path d="M-1.5 0 L0 -1.5 L1.5 0 L0 1.5 Z" fill="none" stroke={colors.active} strokeWidth="0.4" />
            <text x="2" y="1" fill={colors.active} fontSize="2.2">{point.label}</text>
          </g>
        ))}

        {/* Background Airports */}
        {model.backgroundAirports.map(point => (
          <g key={point.id} transform={`translate(${point.x} ${point.y})`} opacity="0.6">
            <path d="M-2 0 L0 -2 L2 0 L0 2 Z" fill="none" stroke={colors.active} strokeWidth="0.5" />
            <text x="2.5" y="1" fill={colors.active} fontSize="2.4">{point.label}</text>
          </g>
        ))}

        {/* Active Route Segments */}
        {model.activeRouteSegments.map((segment, i) => (
          <line
            key={`active-seg-${i}`}
            x1={segment.from.x} y1={segment.from.y}
            x2={segment.to.x} y2={segment.to.y}
            stroke={colors.active}
            strokeWidth={segment.active ? '1.8' : '1.2'}
            strokeDasharray={segment.dashed ? '2 2' : undefined}
            opacity={segment.active ? 1.0 : 0.7}
          />
        ))}

        {/* Pending Route Segments */}
        {model.pendingRouteSegments.map((segment, i) => (
          <line
            key={`pending-seg-${i}`}
            x1={segment.from.x} y1={segment.from.y}
            x2={segment.to.x} y2={segment.to.y}
            stroke={colors.temporary}
            strokeWidth="1.5"
            strokeDasharray={segment.dashed ? '2 2' : '4 2'}
            opacity="0.9"
          />
        ))}

        {/* Active Waypoints & Labels */}
        {model.activeRoutePoints.map(point => (
          <g key={`active-wpt-${point.id}`} transform={`translate(${point.x} ${point.y})`}>
            {point.discontinuity ? (
              <path d="M-2-2L2 2M2-2L-2 2" stroke="#ffaa00" strokeWidth="1" />
            ) : (
              <path
                d={point.airport ? 'M-2.5 0 L0 -2.5 L2.5 0 L0 2.5 Z' : 'M-2 0 L0 -2 L2 0 L0 2 Z'}
                fill={point.active ? colors.active : 'none'}
                stroke={colors.active}
                strokeWidth="0.8"
              />
            )}
            <text x="3" y="1" fill={colors.text} fontSize="3.2" fontWeight="normal">
              {point.label}
            </text>
            
            {/* CSTR Overlay: Constraints */}
            {model.overlays.cstr && !point.discontinuity && (
              <g fontSize="2.4">
                {point.speedLabel && (
                  <text x="3" y="4.5" fill={colors.magenta}>{point.speedLabel}</text>
                )}
                {point.altitudeLabel && (
                  <text x="3" y={point.speedLabel ? 7.5 : 4.5} fill={colors.magenta}>{point.altitudeLabel}</text>
                )}
              </g>
            )}
          </g>
        ))}

        {/* Pending Waypoints & Labels */}
        {model.pendingRoutePoints.map(point => (
          <g key={`pending-wpt-${point.id}`} transform={`translate(${point.x} ${point.y})`}>
            {!point.discontinuity && (
              <path
                d={point.airport ? 'M-2.5 0 L0 -2.5 L2.5 0 L0 2.5 Z' : 'M-2 0 L0 -2 L2 0 L0 2 Z'}
                fill="none"
                stroke={colors.temporary}
                strokeWidth="0.8"
              />
            )}
            <text x="3" y="1" fill={colors.text} fontSize="3.2" fontWeight="normal">
              {point.label}
            </text>
          </g>
        ))}

        {/* Overlays (Fix/Hold) */}
        {model.fixOverlays.map((f, i) => (
          <g key={`fix-${i}`} transform={`translate(${f.x} ${f.y})`} opacity="0.8" data-testid="nd-fix-overlay">
            <circle r="6" fill="none" stroke={colors.active} strokeWidth="0.5" />
            <text x="2" y="-5" fill={colors.active} fontSize="2.8">{f.refFix}</text>
          </g>
        ))}
        
        {model.holdOverlay && (
          <g transform={`translate(${model.holdOverlay.x} ${model.holdOverlay.y})`} data-testid="nd-hold-overlay">
            <path d="M-8 0 A8 4 0 1 1 8 0 A8 4 0 1 1 -8 0" fill="none" stroke={colors.active} strokeWidth="0.8" transform={`rotate(${model.holdOverlay.inboundCourse})`} />
          </g>
        )}

        {/* Overlays */}
        <WXROverlay data={model.wxrData} />
        <VerticalProfileOverlay points={model.verticalProfilePoints} />
        <TCASOverlay targets={model.tcasTargets} />
      </g>
      
      {/* Anchor Zones */}
      <NDAnchorZones model={model} colors={{ ...colors, background: '#070909' }} />

      {/* Aircraft Symbol */}
      <AircraftSymbol centered={!isArc} color={colors.active} style="airbus" />
    </g>
  );
}
