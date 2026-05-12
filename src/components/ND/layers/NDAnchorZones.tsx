import { NavigationDisplayModel } from '@shared';

export function NDAnchorZones({ model, colors }: { model: NavigationDisplayModel, colors: any }) {
  return (
    <g fontSize="3.2" style={{ fontVariantNumeric: 'tabular-nums' }}>
      {/* Top Left: Speed Block */}
      <g transform="translate(4 6)">
        <text fill="#ffffff" fontWeight="bold">TAS <tspan fill={colors.active}>{model.anchorZones.speedBlock.tas}</tspan></text>
        <text y="4.5" fill="#ffffff" fontWeight="bold">GS  <tspan fill={colors.active}>{model.anchorZones.speedBlock.gs}</tspan></text>
      </g>
      
      {/* Top Right: Next Waypoint */}
      {model.anchorZones.waypointBlock && (
        <g transform="translate(96 6)" textAnchor="end">
          <text fill={colors.active} fontWeight="bold" fontSize="3.8">{model.anchorZones.waypointBlock.ident}</text>
          <text y="4.5" fill="#ffffff">{model.anchorZones.waypointBlock.dist} <tspan fontSize="2.4" opacity="0.6">NM</tspan></text>
          <text y="9" fill="#ffffff">{model.anchorZones.waypointBlock.eta} <tspan fontSize="2.4" opacity="0.6">UTC</tspan></text>
        </g>
      )}

      {/* Bottom Left: Wind Block */}
      <g transform="translate(4 96)">
        <path 
          d="M0 -2 L-1.5 2 L1.5 2 Z" 
          fill={colors.active} 
          transform={`rotate(${model.anchorZones.windBlock.dir + 180 - (model.mode === 'PLAN' || model.mode === 'PLN' ? 0 : model.heading)})`} 
        />
        <text x="4" y="0" fill={colors.active} fontWeight="bold">
          {model.anchorZones.windBlock.dir.toString().padStart(3, '0')}/{model.anchorZones.windBlock.speed}
        </text>
      </g>

      {/* Bottom Right: Mode & Source */}
      <g transform="translate(96 96)" textAnchor="end">
        <text fill={colors.text} fontWeight="bold">{model.style.toUpperCase()} {model.mode}</text>
      </g>
      
      {/* Center Top: TRK/HDG */}
      <g transform="translate(50 6)">
        <rect x="-9" y="-4.5" width="18" height="7" fill="black" stroke={colors.warning} strokeWidth="0.6" rx="0.5" />
        <text textAnchor="middle" y="0.5" fill={colors.warning} fontWeight="bold" fontSize="4">
          {Math.round(model.track).toString().padStart(3, '0')}
        </text>
        <text textAnchor="middle" y="5.5" fill={colors.warning} fontSize="2.2">
          {model.style === 'airbus' ? 'TRK' : 'TRK MAG'}
        </text>
      </g>
    </g>
  );
}
