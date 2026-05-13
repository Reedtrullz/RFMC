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
    <g data-testid="nd-hold-overlay" transform={`translate(${hold.x} ${hold.y}) rotate(${hold.inboundCourse})`}>
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
        strokeWidth="0.8"
        strokeDasharray={hold.isPending ? '2 2' : undefined}
        filter="url(#boeing-glow)"
      />
      
      {/* Inbound arrow at the entry point */}
      <path d="M-1.2 -2.5 L0 0 L1.2 -2.5" fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Label with Shadow */}
      <g transform={`rotate(${-hold.inboundCourse}) translate(${radius * 2 + 3} 0)`}>
         <text
          fill="black"
          fontSize="3.2"
          fontWeight="900"
          className="font-avionics"
          stroke="black"
          strokeWidth="0.8"
          opacity="0.8"
        >
          HOLD
        </text>
        <text
          fill={color}
          fontSize="3.2"
          fontWeight="bold"
          className="font-avionics"
        >
          HOLD
        </text>
      </g>
    </g>
  );
}
