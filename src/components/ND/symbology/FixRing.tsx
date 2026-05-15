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
      <defs>
        <filter id="nd-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {fixes.map((fix, i) => {
        const refX = fix.refX ?? fix.x;
        const refY = fix.refY ?? fix.y;
        if (refX === undefined || refY === undefined) return null;
        
        // Scale distance to pixels
        const distPx = fix.distance * (45 / model.range);

        return (
          <g key={i} data-testid="nd-fix-overlay">
            {/* Radial Line (Cyan/Green Glow) */}
            {fix.radial > 0 && (
              <line
                x1={refX}
                y1={refY}
                x2={refX + Math.sin(fix.radial * Math.PI / 180) * 100}
                y2={refY - Math.cos(fix.radial * Math.PI / 180) * 100}
                stroke={color}
                strokeWidth="0.4"
                strokeDasharray="2 4"
                opacity="0.6"
                filter="url(#nd-glow)"
              />
            )}
            
            {/* Distance Circle (High-Fidelity) */}
            {fix.distance > 0 && (
              <circle
                cx={refX}
                cy={refY}
                r={distPx}
                fill="none"
                stroke={color}
                strokeWidth="0.6"
                strokeDasharray="3 3"
                opacity="0.8"
                filter="url(#nd-glow)"
              />
            )}

            {/* Fix Label (Aviation Typography) */}
            <g transform={`rotate(45 ${refX} ${refY}) translate(0 ${-distPx - 4})`}>
              <text
                x={refX}
                y={refY}
                fill={color}
                fontSize="3.5"
                fontWeight="900"
                textAnchor="middle"
                className="font-avionics"
                transform={`rotate(-45 ${refX} ${refY})`}
                filter="url(#nd-glow)"
              >
                {fix.ident ?? fix.refFix}
              </text>
            </g>
          </g>
        );
      })}
    </g>
  );
}
