import { NavigationDisplayModel } from '@shared';

interface WindVectorProps {
  model: NavigationDisplayModel;
}

export function WindVector({ model }: WindVectorProps) {
  const { dir: windDir, speed: windSpeed } = model.anchorZones.windBlock;
  const isAirbus = model.style === 'airbus';
  const color = isAirbus ? '#00ff00' : '#00ccff';

  // Wind arrow rotation relative to aircraft heading
  const rotation = windDir - model.heading;

  return (
    <g transform="translate(10 10)" fill={color} fontWeight="bold">
      <text fontSize="3.2">{windDir.toString().padStart(3, '0')} / {windSpeed}</text>
      <g transform={`translate(0 6) rotate(${rotation})`}>
        <line x1="0" y1="0" x2="0" y2="-5" stroke={color} strokeWidth="0.8" />
        <path d="M-1.5 -3.5 L0 -5 L1.5 -3.5" fill="none" stroke={color} strokeWidth="0.8" />
      </g>
    </g>
  );
}
