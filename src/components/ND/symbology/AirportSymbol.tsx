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
        <g key={point.id} transform={`translate(${point.x} ${point.y})`} opacity="0.7">
          {/* Airport Icon */}
          <rect x="-2" y="-2" width="4" height="4" fill="none" stroke={color} strokeWidth="0.7" />
          
          {/* Label with Shadow */}
          <g transform="translate(3 1)">
            <text 
              fill="black" 
              fontSize="2.8" 
              fontWeight="900" 
              className="font-avionics"
              stroke="black"
              strokeWidth="0.6"
              opacity="0.8"
            >
              {point.label}
            </text>
            <text 
              fill={color} 
              fontSize="2.8" 
              fontWeight="bold" 
              className="font-avionics"
            >
              {point.label}
            </text>
          </g>
        </g>
      ))}
    </g>
  );
}
