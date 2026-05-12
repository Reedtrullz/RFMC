export function VerticalProfileOverlay({ points }: { points: any[] }) {
  return (
    <g data-testid="nd-vertical-overlay">
      {points.map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y})`}>
          <circle r="1.5" fill="none" stroke="#00ffff" strokeWidth="0.5" />
          <circle r="0.5" fill="#00ffff" />
          <text y="-3" textAnchor="middle" fill="#00ffff" fontSize="2.8" fontWeight="bold">
            {p.label}
          </text>
        </g>
      ))}
    </g>
  );
}
