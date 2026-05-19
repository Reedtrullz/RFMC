import { NavigationDisplayModel } from '@shared';

interface WXROverlayProps {
  model: NavigationDisplayModel;
}

export function WXROverlay({ model }: WXROverlayProps) {
  const data = model.wxrData;
  if (!data || !model.overlays.wxr || (model.irsState !== 'NAV' && model.navSource !== 'GPS')) return null;

  const cy = model.centered ? 50 : 84;

  // Math for 12-degree arc sector trail:
  // dx = 45 * sin(-12) = -9.35
  // dy = -45 * cos(-12) = -44.0
  const trailPath = `M 50 ${cy} L ${50 - 9.35} ${cy - 44.0} A 45 45 0 0 1 50 ${cy - 45} Z`;

  return (
    <g data-testid="nd-wxr-overlay" pointerEvents="none">
      <defs>
        {/* Sweep gradient fading from sweep edge (100%) to trail edge (0%) */}
        <linearGradient id="wxr-sweep-trail" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#00ccff" stopOpacity="0" />
          <stop offset="30%" stopColor="#00ccff" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#00ccff" stopOpacity="0.22" />
        </linearGradient>
      </defs>

      <style>{`
        @keyframes wxr-radar-sweeper {
          0% { transform: rotate(-55deg); }
          50% { transform: rotate(55deg); }
          100% { transform: rotate(-55deg); }
        }
        .wxr-sweep-group {
          transform-origin: 50px ${cy}px;
          animation: wxr-radar-sweeper 3.6s ease-in-out infinite;
        }
        @keyframes wxr-cell-glow {
          0%, 100% { opacity: 0.35; filter: drop-shadow(0 0 1px rgba(0,255,100,0.2)); }
          50% { opacity: 0.55; filter: drop-shadow(0 0 4px rgba(0,255,100,0.6)); }
        }
        .wxr-weather-cell {
          animation: wxr-cell-glow 3.6s infinite ease-in-out;
        }
      `}</style>

      {/* Render the organic weather precipitation cells */}
      <g className="wxr-weather-cell">
        {data.points.map((p, i: number) => {
          let fill = '#00ff00'; // Light rain (Green)
          if (p.intensity === 'heavy') {
            fill = '#ff0055'; // Heavy precipitation (Red/Magenta)
          } else if (p.intensity === 'medium') {
            fill = '#ffcc00'; // Moderate precipitation (Amber)
          }

          return (
            <circle
              key={`wxr-cell-${i}`}
              cx={p.x}
              cy={p.y}
              r={p.r}
              fill={fill}
              filter="url(#crt-bloom)"
              opacity="0.8"
            />
          );
        })}
      </g>

      {/* Animated Glowing Radar Sweep Line and Fade Wedge */}
      <g className="wxr-sweep-group">
        {/* Fading persistent wedge sector trailing behind */}
        <path d={trailPath} fill="url(#wxr-sweep-trail)" />

        {/* Crisp glowing primary sweep line */}
        <line
          x1="50"
          y1={cy}
          x2="50"
          y2={cy - 45}
          stroke="#00f0ff"
          strokeWidth="0.5"
          opacity="0.8"
          filter="url(#crt-bloom)"
        />
      </g>
    </g>
  );
}
