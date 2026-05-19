import { NavigationDisplayModel } from '@shared';

interface RangeRingsProps {
  model: NavigationDisplayModel;
  color?: string;
}

export function RangeRings({ model, color = '#003344' }: RangeRingsProps) {
  const cy = model.centered ? 50 : 84;
  const rings = [0.25, 0.5, 0.75, 1.0];
  const maxR = 45;

  return (
    <g pointerEvents="none">
      {rings.map((factor, i) => {
        const radius = factor * maxR;
        const rangeLabel = Math.round(model.range * factor);

        // Center position for high-fidelity Boeing range labels
        const labelX = 50;
        const labelY = cy - radius + 1.0;

        return (
          <g key={`range-ring-${i}`}>
            {model.centered ? (
              <circle
                cx="50"
                cy={cy}
                r={radius}
                stroke={color}
                fill="none"
                strokeWidth="0.3"
                strokeDasharray={model.style === 'airbus' ? '1 3' : '2 4'}
                opacity="0.5"
              />
            ) : (
              <path
                d={`M${50 - radius} ${cy} A${radius} ${radius} 0 0 1 ${50 + radius} ${cy}`}
                stroke={color}
                fill="none"
                strokeWidth="0.3"
                strokeDasharray={model.style === 'airbus' ? '1 3' : '2 4'}
                opacity="0.5"
              />
            )}

            {/* Intermediate Range Labels */}
            {i > 0 && i < 3 && (
              <g>
                <text
                  x={labelX}
                  y={labelY}
                  fill="black"
                  fontSize="2.5"
                  textAnchor="middle"
                  className="font-avionics"
                  opacity="0.9"
                  stroke="black"
                  strokeWidth="0.6"
                >
                  {rangeLabel}
                </text>
                <text
                  x={labelX}
                  y={labelY}
                  fill="#ffffff"
                  fontSize="2.5"
                  textAnchor="middle"
                  className="font-avionics"
                  opacity="0.75"
                >
                  {rangeLabel}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Outer Range Label (Primary) */}
      {!model.centered && (
        <g transform={`translate(50 ${cy - maxR - 2})`}>
          <text fill={color} fontSize="3.2" textAnchor="middle" fontWeight="bold" className="font-avionics">
            {model.range}
          </text>
        </g>
      )}
    </g>
  );
}
