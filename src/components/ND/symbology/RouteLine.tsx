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

  const glowFilter = (color: string) => `drop-shadow(0 0 2px ${color}) drop-shadow(0 0 1px rgba(0,0,0,0.8))`;

  return (
    <g>
      {/* Active Route */}
      {model.activeRouteSegments.map((segment, i) => {
        const strokeColor = segment.modified
          ? colors.pending
          : model.lnavActive && segment.active
            ? colors.active
            : colors.inactive;

        const width = segment.active ? (isAirbus ? '2.4' : '2.6') : isAirbus ? '1.4' : '1.5';
        const dashes = segment.dashed ? '3 3' : undefined;

        return segment.arcPath ? (
          <path
            key={`active-seg-${i}`}
            d={segment.arcPath}
            fill="none"
            stroke={strokeColor}
            strokeWidth={width}
            strokeDasharray={dashes}
            style={{ filter: segment.active ? glowFilter(strokeColor) : undefined }}
            opacity={segment.active ? 1.0 : 0.6}
          />
        ) : (
          <line
            key={`active-seg-${i}`}
            x1={segment.x1}
            y1={segment.y1}
            x2={segment.x2}
            y2={segment.y2}
            stroke={strokeColor}
            strokeWidth={width}
            strokeDasharray={dashes}
            style={{ filter: segment.active ? glowFilter(strokeColor) : undefined }}
            opacity={segment.active ? 1.0 : 0.6}
          />
        );
      })}

      {/* Pending Route (dashed white/amber) */}
      {model.pendingRouteSegments.map((segment, i) =>
        segment.arcPath ? (
          <path
            key={`pending-seg-${i}`}
            d={segment.arcPath}
            fill="none"
            stroke={colors.pending}
            strokeWidth="1.2"
            strokeDasharray="6 3"
            opacity={0.9}
          />
        ) : (
          <line
            key={`pending-seg-${i}`}
            x1={segment.x1}
            y1={segment.y1}
            x2={segment.x2}
            y2={segment.y2}
            stroke={colors.pending}
            strokeWidth="1.2"
            strokeDasharray="6 3"
            opacity={0.9}
          />
        ),
      )}
    </g>
  );
}
