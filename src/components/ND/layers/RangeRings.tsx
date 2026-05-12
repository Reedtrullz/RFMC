export function RangeRings({ range, centered, color }: { range: number, centered: boolean, color: string }) {
  const cy = centered ? 50 : 84;
  return (
    <g stroke={color} fill="none" strokeWidth="0.4">
      <circle cx="50" cy={cy} r="20" strokeDasharray="1 2" />
      <circle cx="50" cy={cy} r="40" strokeDasharray="1 2" />
      <text x="52" y={cy - 21} fill={color} fontSize="2.5">{range / 2}</text>
      <text x="52" y={cy - 41} fill={color} fontSize="2.5">{range}</text>
    </g>
  );
}
