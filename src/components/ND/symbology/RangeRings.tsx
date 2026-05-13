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
        
        // 45 degree position for Boeing-style labels
        const labelRad = (Math.PI * -45) / 180;
        const labelX = 50 + Math.cos(labelRad) * radius;
        const labelY = cy + Math.sin(labelRad) * radius;

        return (
          <g key={i}>
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
              <text
                x={labelX}
                y={labelY}
                fill={color}
                fontSize="2.4"
                textAnchor="middle"
                className="font-avionics"
                opacity="0.7"
              >
                {rangeLabel}
              </text>
            )}
          </g>
        );
      })}
      
      {/* Outer Range Label (Primary) */}
      {!model.centered && (
        <g transform={`translate(50 ${cy - maxR - 2})`}>
          <text 
            fill={color} 
            fontSize="3.2" 
            textAnchor="middle" 
            fontWeight="bold"
            className="font-avionics"
          >
            {model.range}
          </text>
        </g>
      )}
    </g>
  );
}
