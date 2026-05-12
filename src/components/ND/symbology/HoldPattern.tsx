import { NavigationDisplayModel } from '@shared';

interface HoldPatternProps {
  model: NavigationDisplayModel;
}

export function HoldPattern({ model }: HoldPatternProps) {
  const hold = model.holdOverlay;
  if (!hold) return null;

  const isAirbus = model.style === 'airbus';
  const color = isAirbus ? '#00ff00' : '#ff00ff';
  
  // Racetrack geometry
  // A typical hold is 1 minute inbound. 
  // For visualization, we'll use a fixed scale based on the ND range.
  const legLen = 8; 
  const radius = 3;

  return (
    <g transform={`translate(${hold.x} ${hold.y}) rotate(${hold.inboundCourse})`}>
      {/* Racetrack path */}
      <path
        d={`
          M 0 0
          L 0 ${-legLen}
          A ${radius} ${radius} 0 0 1 ${radius * 2} ${-legLen}
          L ${radius * 2} 0
          A ${radius} ${radius} 0 0 1 0 0
          Z
        `}
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        strokeDasharray={hold.isPending ? '2 2' : undefined}
      />
      
      {/* Inbound arrow */}
      <path d="M-1 -2 L0 0 L1 -2" fill="none" stroke={color} strokeWidth="0.8" />
      
      <text
        x={radius * 2 + 2}
        y="-2"
        fill={color}
        fontSize="2.8"
        fontWeight="bold"
        transform={`rotate(${-hold.inboundCourse})`}
      >
        HOLD
      </text>
    </g>
  );
}
