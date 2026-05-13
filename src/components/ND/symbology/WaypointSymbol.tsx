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
      {/* Active Route Waypoints */}
      {model.activeRoutePoints.map(point => {
        const wptColor = point.active ? colors.active : colors.inactive;
        const isDiscon = point.discontinuity;

        return (
          <g key={`active-wpt-${point.id}`} transform={`translate(${point.x} ${point.y})`}>
            {isDiscon ? (
              <path d="M-3-3L3 3M3-3L-3 3" stroke="#ffaa00" strokeWidth="1.2" />
            ) : (
              <path
                d={point.airport ? 'M-2.5 -2.5h5v5h-5z' : 'M0 -3.5 L3.5 0 L0 3.5 L-3.5 0 Z'}
                fill={point.active && !isAirbus ? colors.active : 'none'}
                stroke={wptColor}
                strokeWidth="0.7"
              />
            )}
            
            {/* Label with Shadow for Readability */}
            <g transform="translate(4 -1)">
              <text 
                fill="black" 
                fontSize="3.4" 
                fontWeight="900"
                className="font-avionics"
                opacity="0.8"
                stroke="black"
                strokeWidth="0.8"
              >
                {point.label}
              </text>
              <text 
                fill={point.active ? colors.active : colors.text} 
                fontSize="3.4" 
                fontWeight="bold"
                className="font-avionics"
              >
                {point.label}
              </text>
            </g>
            
            {/* VNAV Constraints */}
            {model.overlays.data && !isDiscon && (
              <g transform="translate(4 4)" fontSize="2.6" className="font-avionics" fontWeight="bold">
                {point.speedLabel && (
                  <text fill="#ffffff" filter="url(#boeing-glow)">{point.speedLabel}</text>
                )}
                {point.altitudeLabel && (
                  <text 
                    y={point.speedLabel ? 3.2 : 0} 
                    fill={isAirbus ? '#ff00ff' : '#ffffff'}
                    filter="url(#boeing-glow)"
                  >
                    {point.altitudeLabel}
                  </text>
                )}
              </g>
            )}
          </g>
        );
      })}

      {/* Pending (MOD) Route Waypoints */}
      {model.pendingRoutePoints.map(point => (
        <g key={`pending-wpt-${point.id}`} transform={`translate(${point.x} ${point.y})`}>
          {!point.discontinuity && (
            <path
              d={point.airport ? 'M-2.5 -2.5h5v5h-5z' : 'M0 -3.5 L3.5 0 L0 3.5 L-3.5 0 Z'}
              fill="none"
              stroke={colors.pending}
              strokeWidth="0.7"
              strokeDasharray="2 2"
            />
          )}
          <text x="4" y="1" fill={colors.pending} fontSize="3.4" fontWeight="bold" className="font-avionics" filter="url(#boeing-glow)">
            {point.label}
          </text>
        </g>
      ))}
    </g>
  );
}
