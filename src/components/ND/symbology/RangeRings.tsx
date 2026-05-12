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
    <g stroke={color} fill="none" strokeWidth="0.4" pointerEvents="none">
      {rings.map((factor, i) => {
        const radius = factor * maxR;
        return model.centered ? (
          <circle key={i} cx="50" cy={cy} r={radius} strokeDasharray="1 2" />
        ) : (
          <path 
            key={i} 
            d={`M${50 - radius} ${cy} A${radius} ${radius} 0 0 1 ${50 + radius} ${cy}`} 
            strokeDasharray="1 2"
          />
        );
      })}
      
      {/* Range Label at the top of the outer ring */}
      {!model.centered && (
        <text 
          x="50" 
          y={cy - maxR - 2} 
          fill={color} 
          fontSize="2.8" 
          textAnchor="middle" 
          fontWeight="bold"
        >
          {model.range}
        </text>
      )}
    </g>
  );
}
