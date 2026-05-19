import { NavigationDisplayModel } from '@shared';

interface HoldPatternProps {
  model: NavigationDisplayModel;
}

export function HoldPattern({ model }: HoldPatternProps) {
  const hold = model.holdOverlay;
  if (!hold || isNaN(hold.x) || isNaN(hold.y)) return null;

  const isAirbus = model.style === 'airbus';
  const color = isAirbus ? '#00ff00' : '#ff00ff';

  // Dynamic racetrack sizing: scale leg distance by ND range
  const pixelsPerNm = 45 / model.range;
  const legLen = Math.max(hold.legDist ? hold.legDist * pixelsPerNm : 8, 3);
  const radius = Math.max(legLen * 0.3, 1.5);

  return (
    <g data-testid="nd-hold-overlay" transform={`translate(${hold.x} ${hold.y}) rotate(${hold.inboundCourse})`}>
      {/* Racetrack path (High-Fidelity) */}
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
        strokeDasharray={hold.isPending ? '2.5 2.5' : undefined}
        filter="url(#nd-glow)"
      />

      {/* Inbound entry arrow */}
      <path
        d="M-1.5 -3 L0 0 L1.5 -3"
        fill="none"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#nd-glow)"
      />

      {/* Label with industrial contrast */}
      <g transform={`rotate(${-hold.inboundCourse}) translate(${radius * 2 + 3} 0)`}>
        <text
          fill="black"
          fontSize="3.8"
          fontWeight="900"
          className="font-avionics"
          stroke="black"
          strokeWidth="1.2"
          opacity="0.9"
        >
          HOLD
        </text>
        <text fill={color} fontSize="3.8" fontWeight="900" className="font-avionics" filter="url(#nd-glow)">
          HOLD
        </text>
      </g>
    </g>
  );
}
