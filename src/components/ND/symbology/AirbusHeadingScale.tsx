import { NavigationDisplayModel } from '@shared';

interface AirbusHeadingScaleProps {
  model: NavigationDisplayModel;
}

export function AirbusHeadingScale({ model }: AirbusHeadingScaleProps) {
  const cy = model.centered ? 50 : 84;
  const radius = 45;
  const rotation = model.mode === 'PLAN' ? 0 : -model.heading;

  return (
    <g>
      <g transform={`rotate(${rotation} 50 ${cy})`}>
        {/* Arc */}
        {model.centered ? (
          <circle cx="50" cy={cy} r={radius} stroke="#00ff00" fill="none" strokeWidth="0.6" opacity="0.6" />
        ) : (
          <path
            d={`M${50 - radius} ${cy} A${radius} ${radius} 0 0 1 ${50 + radius} ${cy}`}
            stroke="#00ff00"
            fill="none"
            strokeWidth="0.6"
            opacity="0.6"
          />
        )}

        {/* Ticks and Labels */}
        {[...Array(72)].map((_, i) => {
          const angle = i * 5;
          const rad = (Math.PI * (angle - 90)) / 180;
          const isMajor = angle % 10 === 0;
          const isLabel = angle % 30 === 0;
          const length = isMajor ? 3 : 1.5;

          return (
            <g key={angle}>
              <line
                x1={50 + Math.cos(rad) * (radius - length)}
                y1={cy + Math.sin(rad) * (radius - length)}
                x2={50 + Math.cos(rad) * radius}
                y2={cy + Math.sin(rad) * radius}
                stroke="#00ff00"
                strokeWidth={isMajor ? 0.8 : 0.5}
                opacity="0.8"
              />
              {isLabel && (
                <text
                  x={50 + Math.cos(rad) * (radius - 7)}
                  y={cy + Math.sin(rad) * (radius - 7) + 1}
                  fill="#00ff00"
                  fontSize="3"
                  textAnchor="middle"
                  transform={`rotate(${-rotation} ${50 + Math.cos(rad) * (radius - 7)} ${cy + Math.sin(rad) * (radius - 7) + 1})`}
                >
                  {angle / 10}
                </text>
              )}
            </g>
          );
        })}
      </g>

      {/* Static Heading Pointer (Yellow in Airbus) */}
      {model.mode !== 'PLAN' && (
        <path d="M50 35 L52 40 L48 40 Z" fill="#ffff00" transform={`translate(0 ${cy - 84})`} />
      )}

      {/* Track Diamond (Green) */}
      {model.track !== model.heading && (
        <g transform={`rotate(${model.track - model.heading} 50 ${cy})`}>
          <path d="M50 36 L52 39 L50 42 L48 39 Z" fill="#00ff00" />
        </g>
      )}

      {/* Selected Heading Bug & Line (Magenta) */}
      {model.selectedHeading !== null && (
        <g transform={`rotate(${model.selectedHeading - model.heading} 50 ${cy})`}>
          <line
            x1="50"
            y1={cy}
            x2="50"
            y2={cy - radius}
            stroke="#ff00ff"
            strokeWidth="0.4"
            strokeDasharray="4 4"
            opacity="0.6"
          />
          <path d="M48 35 L52 35 L52 38 L51 38 L51 36 L49 36 L49 38 L48 38 Z" fill="#ff00ff" />
        </g>
      )}

      {/* Selected Course Line (Magenta) */}
      {model.selectedCourse !== null && (
        <g transform={`rotate(${model.selectedCourse - model.heading} 50 ${cy})`}>
          <line
            x1="50"
            y1={cy - radius}
            x2="50"
            y2={cy + radius}
            stroke="#ff00ff"
            strokeWidth="0.8"
            strokeDasharray="4 4"
          />
          <path d="M48 39 L52 39 L50 35 Z" fill="#ff00ff" />
        </g>
      )}
    </g>
  );
}
