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

  // Calculate Wind Components
  const angleRad = (windDir - model.heading) * (Math.PI / 180);
  const headwind = Math.round(windSpeed * Math.cos(angleRad));
  const crosswind = Math.round(windSpeed * Math.sin(angleRad));

  return (
    <g transform="translate(4 4)" className="font-avionics">
      {/* Speed Block (GS/TAS) */}
      <g fontSize="3.8" fontWeight="900" filter="url(#nd-glow)">
        <text fill="white" opacity="0.8">GS</text>
        <text x="7.5" fill={textColor}>{Math.round(gs)}</text>
        <text y="4.8" fill="white" opacity="0.8">TAS</text>
        <text x="7.5" y="4.8" fill={textColor}>{Math.round(tas)}</text>
      </g>

      {/* Wind Block (Arrow & Components) */}
      {windSpeed > 1 && (
        <g transform="translate(0 11.5)" filter="url(#nd-glow)">
          <g transform={`rotate(${rotation} 2.5 2.5)`}>
            <line x1="2.5" y1="5.5" x2="2.5" y2="0" stroke={arrowColor} strokeWidth="0.8" />
            <path d="M1 1.8 L2.5 0 L4 1.8" fill="none" stroke={arrowColor} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          
          <g transform="translate(7.5 0)" fontSize="3.8" fontWeight="900">
             <text fill={textColor}>{windDir.toString().padStart(3, '0')} / {Math.round(windSpeed)}</text>
             {/* Components (Subtle) */}
             <g transform="translate(0 4.2)" fontSize="2.8" opacity="0.6">
                <text fill="white">H {headwind > 0 ? headwind : 0} T {headwind < 0 ? Math.abs(headwind) : 0}</text>
                <text x="14" fill="white">L {crosswind < 0 ? Math.abs(crosswind) : 0} R {crosswind > 0 ? crosswind : 0}</text>
             </g>
          </g>
        </g>
      )}
    </g>
  );
}
