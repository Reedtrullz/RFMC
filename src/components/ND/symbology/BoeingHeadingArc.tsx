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
          const length = isMajor ? 3 : 1.5;
          
          return (
            <line
              key={angle}
              x1={50 + Math.cos(rad) * (radius - length)}
              y1={cy + Math.sin(rad) * (radius - length)}
              x2={50 + Math.cos(rad) * radius}
              y2={cy + Math.sin(rad) * radius}
              stroke="white"
              strokeWidth={isMajor ? 0.8 : 0.5}
              opacity="0.6"
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
              x={50 + Math.cos(rad) * (radius + 4)}
              y={cy + Math.sin(rad) * (radius + 4) + 1}
              fill="white"
              fontSize="3.2"
              textAnchor="middle"
              transform={`rotate(${-rotation} ${50 + Math.cos(rad) * (radius + 4)} ${cy + Math.sin(rad) * (radius + 4) + 1})`}
              opacity="0.8"
            >
              {label}
            </text>
          );
        })}
      </g>

      {/* Static Heading Pointer */}
      {model.mode !== 'PLN' && (
        <path d="M48.5 35 L51.5 35 L50 39 Z" fill="white" transform={`translate(0 ${cy - 84})`} />
      )}

      {/* Heading Readout */}
      {!model.centered && model.mode !== 'PLN' && (
        <g transform={`translate(50 ${cy - 48})`}>
          <rect x="-6" y="-3.5" width="12" height="7" fill="black" stroke="white" strokeWidth="0.5" />
          <text textAnchor="middle" y="1.5" fill="white" fontSize="4.5" fontWeight="bold">
            {Math.round(model.heading).toString().padStart(3, '0')}
          </text>
        </g>
      )}
      
      {/* Selected Heading Bug (Magenta) */}
      {model.selectedHeading !== null && (
        <g transform={`rotate(${model.selectedHeading - model.heading} 50 ${cy})`}>
          <path d="M48 35 L52 35 L52 38 L51 38 L51 36 L49 36 L49 38 L48 38 Z" fill="#ff00ff" />
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
