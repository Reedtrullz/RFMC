import { NavigationDisplayModel } from '@shared';

interface BoeingHeadingArcProps {
  model: NavigationDisplayModel;
}

export function BoeingHeadingArc({ model }: BoeingHeadingArcProps) {
  const cy = model.centered ? 50 : 84;
  const radius = 45;
  const rotation = model.mode === 'PLN' ? 0 : -model.heading;

  return (
    <g>
      <g transform={`rotate(${rotation} 50 ${cy})`}>
        {/* Arc */}
        {model.centered ? (
          <circle cx="50" cy={cy} r={radius} stroke="white" fill="none" strokeWidth="0.5" opacity="0.4" />
        ) : (
          <path 
            d={`M${50 - radius} ${cy} A${radius} ${radius} 0 0 1 ${50 + radius} ${cy}`} 
            stroke="white" 
            fill="none" 
            strokeWidth="0.5" 
            opacity="0.4" 
          />
        )}

        {/* Ticks */}
        {[...Array(36)].map((_, i) => {
          const angle = i * 10;
          const rad = (Math.PI * (angle - 90)) / 180;
          const isMajor = angle % 30 === 0;
          const length = isMajor ? 2.5 : 1.2;
          
          return (
            <line
              key={angle}
              x1={50 + Math.cos(rad) * radius}
              y1={cy + Math.sin(rad) * radius}
              x2={50 + Math.cos(rad) * (radius + length)}
              y2={cy + Math.sin(rad) * (radius + length)}
              stroke="white"
              strokeWidth={isMajor ? 0.75 : 0.45}
              opacity="0.55"
            />
          );
        })}

        {/* Labels */}
        {[...Array(12)].map((_, i) => {
          const angle = i * 30;
          const rad = (Math.PI * (angle - 90)) / 180;
          const label = (angle / 10).toString().padStart(2, '0');
          
          return (
            <text
              key={angle}
              x={50 + Math.cos(rad) * (radius - 4.8)}
              y={cy + Math.sin(rad) * (radius - 4.8) + 1.1}
              fill="white"
              fontSize="3.1"
              textAnchor="middle"
              transform={`rotate(${-rotation} ${50 + Math.cos(rad) * (radius - 4.8)} ${cy + Math.sin(rad) * (radius - 4.8) + 1.1})`}
              opacity="0.9"
              fontWeight="bold"
            >
              {label}
            </text>
          );
        })}
      </g>

      {/* Static Heading Pointer (Triangle v) */}
      {model.mode !== 'PLN' && (
        <path d="M48.8 35 L51.2 35 L50 38.5 Z" fill="white" transform={`translate(0 ${cy - 84})`} opacity="0.9" />
      )}

      {/* Heading Readout */}
      {!model.centered && model.mode !== 'PLN' && (
        <g transform={`translate(50 ${cy - 45})`}>
          {/* Green TRK label to the left */}
          <text x="-12.5" y="1" fill="#00ff66" fontSize="3.0" fontWeight="extrabold" textAnchor="end">TRK</text>
          
          {/* White outline box over track digits */}
          <rect x="-6" y="-3.5" width="12" height="6.5" fill="#020505" stroke="#ffffff" strokeWidth="0.5" rx="0.5" />
          <text textAnchor="middle" y="1.2" fill="#ffffff" fontSize="4.2" fontWeight="black" letterSpacing="0.1">
            {Math.round(model.heading).toString().padStart(3, '0')}
          </text>

          {/* Green MAG label to the right */}
          <text x="12.5" y="1" fill="#00ff66" fontSize="3.0" fontWeight="extrabold" textAnchor="start">MAG</text>
          
          {/* White pointer triangle pointing down at the top center of the arc */}
          <path d="M-1.2 3 L1.2 3 L0 5.2 Z" fill="#ffffff" />
        </g>
      )}
      
      {/* Selected Heading Bug & Line (Magenta) */}
      {model.selectedHeading !== null && (
        <g transform={`rotate(${model.selectedHeading - model.heading} 50 ${cy})`}>
          <line x1="50" y1={cy} x2="50" y2={cy - radius} stroke="#ff00ff" strokeWidth="0.55" strokeDasharray="2.5 1.5" opacity="0.85" filter="url(#boeing-glow)" />
          <path d="M48 36.5 L52 36.5 L52 39.5 L51 39.5 L51 37.5 L49 37.5 L49 39.5 L48 39.5 Z" fill="#ff00ff" filter="url(#boeing-glow)" />
        </g>
      )}

      {/* Selected Course Line (Magenta) */}
      {model.selectedCourse !== null && (
        <g transform={`rotate(${model.selectedCourse - model.heading} 50 ${cy})`}>
          <line x1="50" y1={cy - radius} x2="50" y2={cy + radius} stroke="#ff00ff" strokeWidth="0.8" strokeDasharray="4 4" />
          <path d="M48 39 L52 39 L50 35 Z" fill="#ff00ff" />
        </g>
      )}

      {/* Track Diamond */}
      {Math.abs(model.track - model.heading) > 0.5 && (
        <g transform={`rotate(${model.track - model.heading} 50 ${cy})`}>
          <path d="M50 36 L52 39 L48 39 Z" fill="white" stroke="black" strokeWidth="0.2" />
          <text x="50" y="34.5" fill="white" fontSize="2.2" textAnchor="middle" fontWeight="bold">TRK</text>
        </g>
      )}
    </g>
  );
}
