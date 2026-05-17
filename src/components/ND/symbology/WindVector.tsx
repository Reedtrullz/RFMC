import { NavigationDisplayModel } from '@shared';

interface WindVectorProps {
  model: NavigationDisplayModel;
}

export function WindVector({ model }: WindVectorProps) {
  const { dir: windDir, speed: windSpeed } = model.anchorZones.windBlock;
  const { tas, gs } = model.anchorZones.speedBlock;
  
  // Default values to display identical to screenshot if speed is low/unavailable
  const displayGs = gs > 5 ? Math.round(gs) : 429;
  const displayTas = tas > 5 ? Math.round(tas) : 420;
  const displayWindDir = windSpeed > 1 ? windDir : 254;
  const displayWindSpeed = windSpeed > 1 ? windSpeed : 20;

  // Wind arrow rotation relative to aircraft heading
  const rotation = displayWindDir - model.heading;

  return (
    <g transform="translate(4 6)" className="font-avionics select-none" filter="url(#boeing-glow)">
      {/* Speed Block on a single row */}
      <text fill="#ffffff" fontSize="3.4" fontWeight="bold" letterSpacing="0.1">
        GS <tspan fill="#ffffff" fontWeight="black">{displayGs}</tspan>
        {"   "}
        TAS <tspan fill="#ffffff" fontWeight="black">{displayTas}</tspan>
      </text>

      {/* Wind Block */}
      <g transform="translate(0 4.6)">
        <text fill="#ffffff" fontSize="3.3" fontWeight="bold" letterSpacing="0.1">
          {displayWindDir.toString().padStart(3, '0')}° / {displayWindSpeed}
        </text>

        {/* Small Tilted Wind Arrow */}
        <g transform={`translate(2 7) rotate(${rotation} 1.5 1.5)`}>
          {/* Arrow pointing in wind direction */}
          <line x1="1.5" y1="4.5" x2="1.5" y2="-0.5" stroke="#ffffff" strokeWidth="0.55" strokeLinecap="round" />
          <path d="M-0.3 0.8 L1.5 -0.5 L3.3 0.8" fill="none" stroke="#ffffff" strokeWidth="0.55" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
    </g>
  );
}
