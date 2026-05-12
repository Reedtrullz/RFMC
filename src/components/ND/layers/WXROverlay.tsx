export function WXROverlay({ data }: { data: any }) {
  if (!data) return null;
  return (
    <g data-testid="nd-wxr-overlay" opacity="0.4">
      {data.points.map((p: any, i: number) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={p.r}
          fill={data.intensity === 'heavy' ? '#ff0000' : data.intensity === 'medium' ? '#ffff00' : '#00ff00'}
          filter="url(#crt-bloom)"
        />
      ))}
    </g>
  );
}
