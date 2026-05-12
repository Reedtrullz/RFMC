import { NavigationDisplayModel } from '@shared';

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

  return (
    <g data-testid="b737-nd-renderer">
      {/* Procedure Label */}
      <text x="4" y="15" fill={colors.text} fontSize="3.5" fontWeight="bold" opacity="0.8">
        {model.procedureLabel}
      </text>

      {/* Route Segments */}
      {model.routeSegments.map((segment, i) => (
        <line
          key={`seg-${i}`}
          x1={segment.from.x} y1={segment.from.y}
          x2={segment.to.x} y2={segment.to.y}
          stroke={segment.modified ? colors.modified : (segment.active ? colors.magenta : colors.active)}
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
              d={point.airport ? 'M-2 -2h4v4h-4z' : 'M0 -2.5 L2.5 2.5 L-2.5 2.5 Z'}
              fill={point.active ? colors.magenta : 'none'}
              stroke={point.active ? colors.magenta : colors.active}
              strokeWidth="0.8"
            />
          )}
          <text x="3" y="1" fill={point.active ? colors.magenta : colors.text} fontSize="3.2" fontWeight="bold">
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
    </g>
  );
}
