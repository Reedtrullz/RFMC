export function HeadingRose({ centered }: { centered: boolean }) {
  const cy = centered ? 50 : 84;
  return (
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
        
        // Don't draw bottom ticks if not centered
        if (!centered && (angle < 110 || angle > 250)) return null;

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
        if (!centered && (angle > 90 && angle < 270)) return null;
        
        return (
          <text
            key={label}
            x={50 + Math.cos(rad) * 39}
            y={cy + Math.sin(rad) * 39 + 1}
            fill="#ffffff"
            fontSize="3.5"
            textAnchor="middle"
            fontWeight="bold"
          >
            {label}
          </text>
        );
      })}
    </g>
  );
}
