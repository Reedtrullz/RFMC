export function AircraftSymbol({ centered, color, style }: { centered: boolean, color: string, style: string }) {
  const cy = centered ? 50 : 84;
  return (
    <g transform={`translate(50 ${cy})`} filter={style === 'airbus' ? 'url(#crt-bloom)' : undefined}>
      <path d="M0-4.5 L3 4 L0 2 L-3 4 Z" fill="none" stroke={color} strokeWidth="1.2" />
      <line x1="-7" y1="2" x2="7" y2="2" stroke={color} strokeWidth="1" />
      <circle r="0.5" fill={color} />
    </g>
  );
}
