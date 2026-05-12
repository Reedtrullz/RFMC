import { NavigationDisplayModel } from '@shared';

interface CommonNDContentProps {
  model: NavigationDisplayModel;
}

export function CommonNDContent({ model }: CommonNDContentProps) {
  const colors = {
    active: model.style === 'airbus' ? '#ffffff' : '#39ff14',
    route: model.style === 'airbus' ? '#00ff00' : '#d946ef',
    modified: '#00ffff',
    text: model.style === 'airbus' ? '#00ff00' : '#00d0ff',
  };

  return (
    <g filter={model.style === 'airbus' ? 'url(#glow)' : undefined}>
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
  );
}
