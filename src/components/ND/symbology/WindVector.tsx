import { NavigationDisplayModel } from '@shared';

interface WindVectorProps {
  model: NavigationDisplayModel;
}

export function WindVector({ model }: WindVectorProps) {
  const { dir: windDir, speed: windSpeed } = model.anchorZones.windBlock;
  const { tas, gs } = model.anchorZones.speedBlock;
  const isAirbus = model.style === 'airbus';
  const textColor = isAirbus ? '#00ff00' : '#ffffff';
  const arrowColor = isAirbus ? '#00ff00' : '#ffffff';

  // Wind arrow rotation relative to aircraft heading
  const rotation = windDir - model.heading;

  return (
    <g transform="translate(4 4)" className="font-avionics">
      {/* Speed Block */}
      <g fontSize="3.5" fontWeight="bold">
        <text fill="white">GS</text>
        <text x="7" fill={textColor}>{Math.round(gs)}</text>
        <text y="4.5" fill="white">TAS</text>
        <text x="7" y="4.5" fill={textColor}>{Math.round(tas)}</text>
      </g>

      {/* Wind Block */}
      {windSpeed > 2 && (
        <g transform="translate(0 10.5)">
          <g transform={`rotate(${rotation} 2.5 2.5)`}>
            <line x1="2.5" y1="5" x2="2.5" y2="0" stroke={arrowColor} strokeWidth="0.8" />
            <path d="M1 1.5 L2.5 0 L4 1.5" fill="none" stroke={arrowColor} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <text x="7" y="4.2" fill={textColor} fontSize="3.5" fontWeight="bold">
            {windDir.toString().padStart(3, '0')} / {Math.round(windSpeed)}
          </text>
        </g>
      )}
    </g>
  );
}
