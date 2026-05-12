import { NavigationDisplayModel } from '@shared';
import { RangeRings } from '../layers/RangeRings';
import { HeadingRose } from '../layers/HeadingRose';
import { AircraftSymbol } from '../symbols/AircraftSymbol';
import { NDAnchorZones } from '../layers/NDAnchorZones';
import { TCASOverlay } from '../layers/TCASOverlay';
import { WXROverlay } from '../layers/WXROverlay';
import { VerticalProfileOverlay } from '../layers/VerticalProfileOverlay';

interface B737NDProps {
  model: NavigationDisplayModel;
}

export function B737ND({ model }: B737NDProps) {
  const colors = {
    active: '#39ff14', // Boeing Green
    magenta: '#d946ef', // Boeing Magenta
    modified: '#00ffff', // Boeing Cyan
    text: '#00d0ff', // Boeing Light Blue
    warning: '#ffcc00',
  };

  const isMap = model.mode === 'MAP';

  return (
    <g data-testid="b737-nd-renderer">
      {/* Background Layers */}
      <g opacity="0.4">
        <RangeRings range={model.range} centered={model.centered} color="#003344" />
        <HeadingRose centered={model.centered} />
      </g>

      {/* Mode / Source Top Left */}
      <g transform="translate(4 6)" fontSize="3.2" fill={colors.active} fontWeight="bold">
        <text>{model.mode} {model.centered ? 'CTR' : ''}</text>
      </g>

      {/* Procedure Label */}
      <text x="4" y="15" fill={colors.text} fontSize="3.5" fontWeight="bold" opacity="0.8">
        {model.procedureLabel}
      </text>

      {/* Active Route Segments */}
      {model.activeRouteSegments.map((segment, i) => (
        <line
          key={`active-seg-${i}`}
          x1={segment.from.x} y1={segment.from.y}
          x2={segment.to.x} y2={segment.to.y}
          stroke={isMap ? colors.magenta : colors.active}
          strokeWidth={segment.active ? '1.8' : '1.2'}
          strokeDasharray={segment.dashed ? '2 2' : undefined}
          opacity={0.9}
        />
      ))}

      {/* Pending Route Segments */}
      {model.pendingRouteSegments.map((segment, i) => (
        <line
          key={`pending-seg-${i}`}
          x1={segment.from.x} y1={segment.from.y}
          x2={segment.to.x} y2={segment.to.y}
          stroke={colors.modified}
          strokeWidth="1.2"
          strokeDasharray={segment.dashed ? '2 2' : '4 2'}
          opacity={0.9}
        />
      ))}

      {/* Active Waypoints & Labels */}
      {model.activeRoutePoints.map(point => (
        <g key={`active-wpt-${point.id}`} transform={`translate(${point.x} ${point.y})`}>
          {point.discontinuity ? (
            <path d="M-2-2L2 2M2-2L-2 2" stroke="#ffaa00" strokeWidth="1" />
          ) : (
            <path
              d={point.airport ? 'M-2 -2h4v4h-4z' : 'M0 -2.5 L2.5 2.5 L-2.5 2.5 Z'}
              fill={point.active ? colors.magenta : 'none'}
              stroke={point.active ? colors.magenta : colors.active}
              strokeWidth="0.8"
            />
          )}
          <text x="3" y="1" fill={point.active ? colors.magenta : colors.text} fontSize="3.2" fontWeight="bold">
            {point.label}
          </text>
          
          {/* DATA Overlay: Constraints */}
          {model.overlays.data && !point.discontinuity && (
            <g transform="translate(0 4)" fontSize="2.4" fill={colors.text} opacity="0.8">
              {point.speedLabel && <text y="0">{point.speedLabel}</text>}
              {point.altitudeLabel && <text y={point.speedLabel ? 3 : 0}>{point.altitudeLabel}</text>}
            </g>
          )}
        </g>
      ))}

      {/* Pending Waypoints & Labels */}
      {model.pendingRoutePoints.map(point => (
        <g key={`pending-wpt-${point.id}`} transform={`translate(${point.x} ${point.y})`}>
          {!point.discontinuity && (
            <path
              d={point.airport ? 'M-2 -2h4v4h-4z' : 'M0 -2.5 L2.5 2.5 L-2.5 2.5 Z'}
              fill="none"
              stroke={colors.modified}
              strokeWidth="0.8"
            />
          )}
          <text x="3" y="1" fill={colors.modified} fontSize="3.2" fontWeight="bold">
            {point.label}
          </text>
        </g>
      ))}

      {/* Overlays (Fix/Hold) */}
      {model.fixOverlays.map((f, i) => (
        <g key={`fix-${i}`} transform={`translate(${f.x} ${f.y})`} opacity="0.8" data-testid="nd-fix-overlay">
          <circle r="0.8" fill={colors.active} />
          <circle r="8" fill="none" stroke={colors.active} strokeWidth="0.5" strokeDasharray="1 1" />
          <text x="2" y="-5" fill={colors.active} fontSize="2.8">{f.refFix}</text>
        </g>
      ))}
      
      {model.holdOverlay && (
        <g transform={`translate(${model.holdOverlay.x} ${model.holdOverlay.y})`} data-testid="nd-hold-overlay">
          <ellipse rx="10" ry="4" fill="none" stroke={colors.magenta} strokeWidth="0.8" transform={`rotate(${model.holdOverlay.inboundCourse})`} />
        </g>
      )}

      {/* Overlays */}
      <WXROverlay data={model.wxrData} />
      <VerticalProfileOverlay points={model.verticalProfilePoints} />
      <TCASOverlay targets={model.tcasTargets} />
      
      {/* Anchor Zones */}
      <NDAnchorZones model={model} colors={colors} />

      {/* Aircraft Symbol */}
      <AircraftSymbol centered={model.centered} color={colors.active} style="boeing" />

      {/* MOD Annunciation */}
      {model.isModified && (
        <text x="50" y="92" textAnchor="middle" fill={colors.modified} fontSize="4" fontWeight="bold">MOD</text>
      )}
    </g>
  );
}
