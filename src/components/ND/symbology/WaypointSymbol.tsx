import { NavigationDisplayModel } from '@shared';

interface WaypointSymbolProps {
  model: NavigationDisplayModel;
}

export function WaypointSymbol({ model }: WaypointSymbolProps) {
  const isAirbus = model.style === 'airbus';
  const colors = {
    active: isAirbus ? '#00ff00' : '#ff00ff',
    inactive: isAirbus ? '#00ff00' : '#00ccff',
    text: '#ffffff',
    pending: '#ffffff',
  };

  return (
    <g>
      {/* Active Waypoints */}
      {model.activeRoutePoints.map(point => (
        <g key={`active-wpt-${point.id}`} transform={`translate(${point.x} ${point.y})`}>
          {point.discontinuity ? (
            <path d="M-2-2L2 2M2-2L-2 2" stroke="#ffaa00" strokeWidth="1" />
          ) : (
            <path
              d={point.airport ? 'M-2 -2h4v4h-4z' : 'M0 -2.5 L2.5 2.5 L-2.5 2.5 Z'}
              fill={point.active ? (isAirbus ? 'none' : colors.active) : 'none'}
              stroke={point.active ? colors.active : colors.inactive}
              strokeWidth="0.8"
            />
          )}
          <text 
            x="3" 
            y="1" 
            fill={point.active ? colors.active : colors.text} 
            fontSize="3.2" 
            fontWeight="bold"
            stroke="black"
            strokeWidth="0.1"
            paintOrder="stroke"
          >
            {point.label}
          </text>
          
          {/* Constraints */}
          {model.overlays.data && !point.discontinuity && (
            <g transform="translate(0 4)" fontSize="2.4" fill={isAirbus ? '#ff00ff' : colors.text} opacity="0.8">
              {point.speedLabel && <text y="0">{point.speedLabel}</text>}
              {point.altitudeLabel && <text y={point.speedLabel ? 3 : 0}>{point.altitudeLabel}</text>}
            </g>
          )}
        </g>
      ))}

      {/* Pending Waypoints */}
      {model.pendingRoutePoints.map(point => (
        <g key={`pending-wpt-${point.id}`} transform={`translate(${point.x} ${point.y})`}>
          {!point.discontinuity && (
            <path
              d={point.airport ? 'M-2 -2h4v4h-4z' : 'M0 -2.5 L2.5 2.5 L-2.5 2.5 Z'}
              fill="none"
              stroke={colors.pending}
              strokeWidth="0.8"
            />
          )}
          <text x="3" y="1" fill={colors.pending} fontSize="3.2" fontWeight="bold">
            {point.label}
          </text>
        </g>
      ))}
    </g>
  );
}
