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

      <g transform="translate(50 6)" fontSize="3.2" fill={colors.text} fontWeight="bold" textAnchor="middle">
        <text>{isAirbus ? 'AIRBUS' : 'BOEING'}</text>
      </g>

      {model.procedureLabel && model.procedureLabel !== 'NO PROC' && (
        <g transform="translate(50 11)" fontSize="3" fill={colors.magenta} fontWeight="bold" textAnchor="middle">
          <text>{model.procedureLabel}</text>
        </g>
      )}
      
      {/* Range (Top Right) - Airbus only */}
      {isAirbus && (
        <g transform="translate(96 6)" fontSize="3.5" fill={colors.active} fontWeight="bold" textAnchor="end">
          <text>{model.range}</text>
        </g>
      )}
 
      {/* Active Waypoint Info (Top Right) - Aligned to top row for Boeing */}
      {model.anchorZones.waypointBlock && (
        <g transform="translate(96 6)" textAnchor="end" fontSize="3.2" fontWeight="bold">
          <text fill={colors.magenta} filter="url(#boeing-glow)">{model.anchorZones.waypointBlock.ident}</text>
          <text y="4.6" fill={colors.text}>
            {model.anchorZones.waypointBlock.eta.replace(':', '').replace('z', '')}.8z
          </text>
          <text y="9.2" fill={colors.text}>{model.anchorZones.waypointBlock.dist.toFixed(1)} NM</text>
        </g>
      )}
    </g>
  );
}
