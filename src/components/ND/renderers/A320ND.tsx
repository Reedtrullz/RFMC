import { NavigationDisplayModel } from '@shared';

interface A320NDProps {
  model: NavigationDisplayModel;
}

export function A320ND({ model }: A320NDProps) {
  const colors = {
    active: '#00ff00', // Airbus Green
    text: '#ffffff', // Airbus White labels
    warning: '#ffcc00',
    magenta: '#ff00ff', // Constraint / Deviation
  };

  return (
    <g data-testid="a320-nd-renderer" filter="url(#glow)">
      {/* Procedure Label */}
      <text x="4" y="15" fill={colors.active} fontSize="3.5" fontWeight="bold" opacity="0.8">
        {model.procedureLabel}
      </text>

      {/* Route Segments */}
      {model.routeSegments.map((segment, i) => (
        <line
          key={`seg-${i}`}
          x1={segment.from.x} y1={segment.from.y}
          x2={segment.to.x} y2={segment.to.y}
          stroke={colors.active}
          strokeWidth={segment.active ? '1.8' : '1.2'}
          strokeDasharray={segment.dashed ? '2 2' : (segment.modified ? '4 2' : undefined)}
          opacity={segment.active ? 1.0 : 0.7}
        />
      ))}

      {/* Waypoints & Labels */}
      {model.routePoints.map(point => (
        <g key={point.id} transform={`translate(${point.x} ${point.y})`}>
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
          <g fontSize="2.4">
            {point.speedLabel && (
              <text x="3" y="4.5" fill={colors.magenta}>{point.speedLabel}</text>
            )}
            {point.altitudeLabel && (
              <text x="3" y={point.speedLabel ? 7.5 : 4.5} fill={colors.magenta}>{point.altitudeLabel}</text>
            )}
          </g>
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
    </g>
  );
}
