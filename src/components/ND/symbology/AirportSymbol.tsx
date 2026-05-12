import { NavigationDisplayModel } from '@shared';

interface AirportSymbolProps {
  model: NavigationDisplayModel;
}

export function AirportSymbol({ model }: AirportSymbolProps) {
  const isAirbus = model.style === 'airbus';
  const color = isAirbus ? '#00ff00' : '#00ccff';

  return (
    <g>
      {model.backgroundAirports.map(point => (
        <g key={point.id} transform={`translate(${point.x} ${point.y})`} opacity="0.6">
          <rect x="-1.5" y="-1.5" width="3" height="3" fill="none" stroke={color} strokeWidth="0.5" />
          <text x="2.5" y="1" fill={color} fontSize="2.4" fontWeight="bold">
            {point.label}
          </text>
        </g>
      ))}
    </g>
  );
}
