export function HeadingRose({ 
  centered, 
  heading = 0, 
  selectedHeading = null,
  track = null,
  isPlan = false 
}: { 
  centered: boolean, 
  heading?: number, 
  selectedHeading?: number | null,
  track?: number | null,
  isPlan?: boolean
}) {
  const cy = centered ? 50 : 84;
  const rotation = isPlan ? 0 : -heading;

  return (
    <g>
      {/* Rotating Rose */}
      <g transform={`rotate(${rotation} 50 ${cy})`}>
        <g stroke="#ffffff" opacity="0.3" fill="none" strokeWidth="0.5">
          {/* Compass Arc/Circle */}
          {centered ? (
            <circle cx="50" cy={cy} r="35" strokeDasharray="1 2" />
          ) : (
            <path d={`M15 ${cy} A35 35 0 0 1 85 ${cy}`} />
          )}
          
          {/* Degree Ticks */}
          {[...Array(36)].map((_, i) => {
            const angle = i * 10;
            const rad = (Math.PI * (angle - 90)) / 180;
            const isMajor = angle % 30 === 0;
            const length = isMajor ? 3 : 1.5;
            
            return (
              <line
                key={angle}
                x1={50 + Math.cos(rad) * (35 - length)}
                y1={cy + Math.sin(rad) * (35 - length)}
                x2={50 + Math.cos(rad) * 35}
                y2={cy + Math.sin(rad) * 35}
                strokeWidth={isMajor ? 0.8 : 0.5}
              />
            );
          })}

          {/* Cardinal Labels (N, E, S, W) */}
          {[0, 90, 180, 270].map(angle => {
            const rad = (Math.PI * (angle - 90)) / 180;
            const label = ['N', 'E', 'S', 'W'][angle / 90];
            
            return (
              <text
                key={label}
                x={50 + Math.cos(rad) * 39}
                y={cy + Math.sin(rad) * 39 + 1}
                fill="#ffffff"
                fontSize="3.5"
                textAnchor="middle"
                fontWeight="bold"
                transform={`rotate(${-rotation} ${50 + Math.cos(rad) * 39} ${cy + Math.sin(rad) * 39 + 1})`}
              >
                {label}
              </text>
            );
          })}
        </g>

        {/* Selected Heading Bug */}
        {selectedHeading !== null && (
          <g transform={`rotate(${selectedHeading} 50 ${cy})`}>
            <path d="M48.5 45 L51.5 45 L50 49 Z" fill="#ff00ff" transform={`translate(0 ${cy - 85})`} />
          </g>
        )}

        {/* Track Diamond (Airbus style) */}
        {track !== null && (
          <g transform={`rotate(${track} 50 ${cy})`}>
             <path d="M-1.2 0 L0 -1.2 L1.2 0 L0 1.2 Z" fill="#00ff00" transform={`translate(50 ${cy - 35})`} />
          </g>
        )}
      </g>

      {/* Static Heading Pointer (Triangle at Top) */}
      {!isPlan && (
        <path d="M48 45 L52 45 L50 49 Z" fill="#ffffff" transform={`translate(0 ${cy - 85})`} />
      )}
    </g>
  );
}
