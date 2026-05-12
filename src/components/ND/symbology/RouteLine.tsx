import { NavigationDisplayModel } from '@shared';

interface RouteLineProps {
  model: NavigationDisplayModel;
}

export function RouteLine({ model }: RouteLineProps) {
  const isAirbus = model.style === 'airbus';
  const colors = {
    active: isAirbus ? '#00ff00' : '#ff00ff', // Green for Airbus, Magenta for Boeing
    pending: '#ffffff',
    inactive: isAirbus ? '#00ff00' : '#00ccff',
  };

  return (
    <g>
      {/* Active Route */}
      {model.activeRouteSegments.map((segment, i) => (
        segment.arcPath ? (
          <path
            key={`active-seg-${i}`}
            d={segment.arcPath}
            fill="none"
            stroke={segment.active ? colors.active : colors.inactive}
            strokeWidth={segment.active ? '1.8' : '1.2'}
            strokeDasharray={segment.dashed ? '2 2' : undefined}
            opacity={0.9}
          />
        ) : (
          <line
            key={`active-seg-${i}`}
            x1={segment.x1} y1={segment.y1}
            x2={segment.x2} y2={segment.y2}
            stroke={segment.active ? colors.active : colors.inactive}
            strokeWidth={segment.active ? '1.8' : '1.2'}
            strokeDasharray={segment.dashed ? '2 2' : undefined}
            opacity={0.9}
          />
        )
      ))}

      {/* Pending Route */}
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
