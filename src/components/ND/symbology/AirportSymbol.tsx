import { useMemo } from 'react';
import { NavigationDisplayModel } from '@shared';

interface AirportSymbolProps {
  model: NavigationDisplayModel;
}

export function AirportSymbol({ model }: AirportSymbolProps) {
  const isAirbus = model.style === 'airbus';
  const color = isAirbus ? '#00ff00' : '#00ccff';

  const airports = useMemo(
    () => model.backgroundAirports.filter((p) => !isNaN(p.x) && !isNaN(p.y)),
    [model.backgroundAirports],
  );

  return (
    <g>
      {airports.map((point) => (
        <g key={point.id} transform={`translate(${point.x} ${point.y})`} opacity="0.7">
          {/* Airport Icon */}
          {isAirbus ? (
            <g stroke={color} strokeWidth="0.7" fill="none">
              <circle r="2.2" />
              <path d="M-2.2 0L2.2 0M0-2.2L0 2.2" />
            </g>
          ) : (
            <g stroke={color} strokeWidth="0.7" fill="none">
              <circle r="2.2" />
              <path d="M-2.8 0L2.8 0M0-2.8L0 2.8" />
            </g>
          )}

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
            <text fill={color} fontSize="2.8" fontWeight="bold" className="font-avionics">
              {point.label}
            </text>
          </g>
        </g>
      ))}
    </g>
  );
}
