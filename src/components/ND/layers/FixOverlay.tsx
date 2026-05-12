import { NDFixOverlay } from '@shared';

interface FixOverlayProps {
  fixes: NDFixOverlay[];
}

export function FixOverlay({ fixes }: FixOverlayProps) {
  return (
    <g data-testid="nd-fix-overlay-group">
      {fixes.map((fix, i) => (
        <g key={`fix-${i}`} data-testid="nd-fix-overlay">
          {/* Radial line */}
          <line
            x1={fix.x}
            y1={fix.y}
            x2={fix.radialX}
            y2={fix.radialY}
            stroke="#00ff00"
            strokeWidth="0.5"
            strokeDasharray="2 2"
            opacity="0.6"
          />
          {/* Distance circle */}
          <circle
            cx={fix.x}
            cy={fix.y}
            r={fix.radius}
            fill="none"
            stroke="#00ff00"
            strokeWidth="0.5"
            strokeDasharray="1 3"
            opacity="0.4"
          />
        </g>
      ))}
    </g>
  );
}
