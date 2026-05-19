export function AircraftSymbol({ centered, color, style }: { centered: boolean; color: string; style: string }) {
  const cy = centered ? 50 : 84;

  if (style === 'airbus') {
    return (
      <g transform={`translate(50 ${cy})`} filter="url(#crt-bloom)">
        {/* Airbus Style Airplane */}
        <path
          d="M0 -4 L1.5 -2 L1.5 2 L6 3 L6 4 L1.5 3.5 L1.5 6 L3 7 L3 8 L0 7.5 L-3 8 L-3 7 L-1.5 6 L-1.5 3.5 L-6 4 L-6 3 L-1.5 2 L-1.5 -2 Z"
          fill="none"
          stroke={color}
          strokeWidth="1.2"
        />
        <circle r="0.6" fill={color} />
      </g>
    );
  }

  return (
    <g transform={`translate(50 ${cy})`}>
      {/* Boeing Style Airplane */}
      <path
        d="M0 -5 L1.5 -3 L1.5 2 L8 2 L8 4 L1.5 3 L1.5 7 L4 7.5 L4 8.5 L0 8 L-4 8.5 L-4 7.5 L-1.5 7 L-1.5 3 L-8 4 L-8 2 L-1.5 2 L-1.5 -3 Z"
        fill="none"
        stroke="#ffffff"
        strokeWidth="0.8"
        opacity="0.95"
      />
    </g>
  );
}
