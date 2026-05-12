import { NavigationDisplayModel } from '@shared';

interface FixRingProps {
  model: NavigationDisplayModel;
}

export function FixRing({ model }: FixRingProps) {
  const fixes = model.fixOverlays;
  if (!fixes || fixes.length === 0) return null;

  const isAirbus = model.style === 'airbus';
  const color = isAirbus ? '#00ff00' : '#00ccff';

  return (
    <g>
      {fixes.map((fix, i) => {
        if (!fix.refX || !fix.refY) return null;
        
        // Scale distance to pixels
        const distPx = fix.distance * (45 / model.range);

        return (
          <g key={i}>
            {/* Radial Line */}
            {fix.radial > 0 && (
              <line
                x1={fix.refX}
                y1={fix.refY}
                x2={fix.refX + Math.sin(fix.radial * Math.PI / 180) * 100}
                y2={fix.refY - Math.cos(fix.radial * Math.PI / 180) * 100}
                stroke={color}
                strokeWidth="0.4"
                strokeDasharray="2 2"
                opacity="0.6"
              />
            )}
            
            {/* Distance Circle */}
            {fix.distance > 0 && (
              <circle
                cx={fix.refX}
                cy={fix.refY}
                r={distPx}
                fill="none"
                stroke={color}
                strokeWidth="0.6"
                strokeDasharray="4 2"
                opacity="0.8"
              />
            )}

            {/* Fix Label */}
            <text
              x={fix.refX + 2}
              y={fix.refY - 2}
              fill={color}
              fontSize="2.4"
              fontWeight="bold"
              opacity="0.9"
            >
              {fix.ident}
            </text>
          </g>
        );
      })}
    </g>
  );
}
