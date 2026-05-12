import { NavigationDisplayModel } from '@shared';

interface ModeAnnunciationsProps {
  model: NavigationDisplayModel;
}

export function ModeAnnunciations({ model }: ModeAnnunciationsProps) {
  const isAirbus = model.style === 'airbus';
  const colors = {
    active: isAirbus ? '#00ff00' : '#00ccff',
    text: '#ffffff',
    magenta: '#ff00ff',
  };

  return (
    <g>
      {/* Mode and Range (Top Left) */}
      <g transform="translate(4 6)" fontSize="3.5" fill={colors.active} fontWeight="bold">
        <text>{model.mode} {model.centered ? 'CTR' : ''}</text>
      </g>
      
      {/* Range (Top Right) */}
      <g transform="translate(96 6)" fontSize="3.5" fill={colors.active} fontWeight="bold" textAnchor="end">
        <text>{model.range}</text>
      </g>

      {/* Active Waypoint Info (Top Right) */}
      {model.activeRoutePoints.length > 0 && model.activeRoutePoints[0].active && (
        <g transform="translate(96 15)" textAnchor="end" fontSize="3.2" fontWeight="bold">
          <text fill={colors.magenta}>{model.activeRoutePoints[0].label}</text>
          <text y="4" fill={colors.text}>123 NM</text>
          <text y="8" fill={colors.text}>12:34</text>
        </g>
      )}

      {/* GS / TAS (Top Left) */}
      <g transform="translate(4 15)" fontSize="3" fill={colors.text} fontWeight="bold">
        <text>GS 450</text>
        <text y="4">TAS 462</text>
      </g>
    </g>
  );
}
