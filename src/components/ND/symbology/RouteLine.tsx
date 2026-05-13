import { NavigationDisplayModel } from '@shared';

interface RouteLineProps {
  model: NavigationDisplayModel;
}

export function RouteLine({ model }: RouteLineProps) {
  const isAirbus = model.style === 'airbus';
  const colors = {
    active: isAirbus ? '#00ff00' : '#ff00ff', // Green for Airbus, Magenta for Boeing
    pending: isAirbus ? '#ffcc00' : '#ffffff', // Yellow (Amber) for Airbus TMPY, White for Boeing MOD
    inactive: isAirbus ? '#ffffff' : '#00ffff', // White (Secondary) for Airbus, Cyan for Boeing
  };

  return (
    <g>
      {/* Active Route */}
      {model.activeRouteSegments.map((segment, i) => {
        const strokeColor = segment.modified 
          ? colors.pending 
          : (segment.active ? colors.active : colors.inactive);
          
        return segment.arcPath ? (
          <path
            key={`active-seg-${i}`}
            d={segment.arcPath}
            fill="none"
            stroke={strokeColor}
            strokeWidth={segment.active ? '1.8' : '1.2'}
            strokeDasharray={segment.dashed ? '3 2' : undefined}
            opacity={0.9}
          />
        ) : (
          <line
            key={`active-seg-${i}`}
            x1={segment.x1} y1={segment.y1}
            x2={segment.x2} y2={segment.y2}
            stroke={strokeColor}
            strokeWidth={segment.active ? '1.8' : '1.2'}
            strokeDasharray={segment.dashed ? '3 2' : undefined}
            opacity={0.9}
          />
        );
      })}

      {/* Pending Route (dashed white) */}
      {model.pendingRouteSegments.map((segment, i) => (
        segment.arcPath ? (
          <path
            key={`pending-seg-${i}`}
            d={segment.arcPath}
            fill="none"
            stroke={colors.pending}
            strokeWidth="1.2"
            strokeDasharray="4 2"
            opacity={0.9}
          />
        ) : (
          <line
            key={`pending-seg-${i}`}
            x1={segment.x1} y1={segment.y1}
            x2={segment.x2} y2={segment.y2}
            stroke={colors.pending}
            strokeWidth="1.2"
            strokeDasharray="4 2"
            opacity={0.9}
          />
        )
      ))}
    </g>
  );
}
