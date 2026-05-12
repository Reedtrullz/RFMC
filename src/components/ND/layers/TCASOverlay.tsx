export function TCASOverlay({ targets }: { targets: any[] }) {
  return (
    <g data-testid="nd-tcas-overlay">
      {targets.map(t => (
        <g key={t.id} transform={`translate(${t.x} ${t.y})`}>
          {/* Symbol based on threat level */}
          {t.threatLevel === 'resolution' ? (
            <rect x="-2.5" y="-2.5" width="5" height="5" fill="#ff0000" />
          ) : t.threatLevel === 'traffic' ? (
            <circle r="2.5" fill="#ffcc00" />
          ) : t.threatLevel === 'proximate' ? (
            <path d="M0 -3 L3 0 L0 3 L-3 0 Z" fill="#ffffff" />
          ) : (
            <path d="M0 -3 L3 0 L0 3 L-3 0 Z" fill="none" stroke="#ffffff" strokeWidth="0.5" />
          )}
          
          {/* Altitude Tag */}
          <text
            y={t.relativeAltitude > 0 ? -5 : 7}
            x="4"
            fill={t.threatLevel === 'resolution' ? '#ff0000' : t.threatLevel === 'traffic' ? '#ffcc00' : '#ffffff'}
            fontSize="2.8"
            fontWeight="bold"
          >
            {t.relativeAltitude > 0 ? `+${t.relativeAltitude}` : t.relativeAltitude}
          </text>
          
          {/* Trend Arrow */}
          {t.trend !== 'level' && (
            <path
              d={t.trend === 'climb' ? 'M7 -4 L7 -7 L6 -6 M7 -7 L8 -6' : 'M7 4 L7 7 L6 6 M7 7 L8 6'}
              stroke={t.threatLevel === 'resolution' ? '#ff0000' : t.threatLevel === 'traffic' ? '#ffcc00' : '#ffffff'}
              strokeWidth="0.5"
              fill="none"
            />
          )}
        </g>
      ))}
    </g>
  );
}
