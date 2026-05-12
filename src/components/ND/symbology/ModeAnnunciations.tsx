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
      
      {/* Range (Top Right) */}
      <g transform="translate(96 6)" fontSize="3.5" fill={colors.active} fontWeight="bold" textAnchor="end">
        <text>{model.range}</text>
      </g>

      {/* Active Waypoint Info (Top Right) */}
      {model.anchorZones.waypointBlock && (
        <g transform="translate(96 15)" textAnchor="end" fontSize="3.2" fontWeight="bold">
          <text fill={colors.magenta}>{model.anchorZones.waypointBlock.ident}</text>
          <text y="4" fill={colors.text}>{model.anchorZones.waypointBlock.dist} NM</text>
          <text y="8" fill={colors.text}>{model.anchorZones.waypointBlock.ete}</text>
        </g>
      )}

      {/* GS / TAS (Top Left) */}
      <g transform="translate(4 17)" fontSize="3" fill={colors.text} fontWeight="bold">
        <text>GS 450</text>
        <text y="4">TAS 462</text>
      </g>
    </g>
  );
}
