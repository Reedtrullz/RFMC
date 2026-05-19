import { useMemo } from 'react';
import { NavigationDisplayModel } from '@shared';

interface WaypointSymbolProps {
  model: NavigationDisplayModel;
}

function ActiveWaypoint({
  point,
  model,
  colors,
  isAirbus,
}: {
  point: NavigationDisplayModel['activeRoutePoints'][number];
  model: NavigationDisplayModel;
  colors: { active: string; inactive: string; text: string; pending: string };
  isAirbus: boolean;
}) {
  const lines = useMemo(() => {
    const result: { text: string; color: string }[] = [];
    if (model.overlays.data && !point.discontinuity) {
      if (point.speedLabel) {
        result.push({ text: point.speedLabel, color: '#ffffff' });
      }
      if (point.altitudeLabel) {
        result.push({ text: point.altitudeLabel, color: isAirbus ? '#ff00ff' : '#ffffff' });
      }
    }
    if (point.distanceNm !== undefined && !point.discontinuity) {
      const gs = model.anchorZones.speedBlock?.gs || 400;
      const speed = gs > 50 ? gs : 400;
      const eteHours = point.distanceNm / speed;
      const etaTime = new Date(Date.now() + eteHours * 3600000);
      const etaLabel = `${String(etaTime.getUTCHours()).padStart(2, '0')}${String(etaTime.getUTCMinutes()).padStart(2, '0')}z`;
      result.push({
        text: etaLabel,
        color: point.active && model.lnavActive ? colors.active : '#8e9399',
      });
    }
    return result;
  }, [
    point.speedLabel,
    point.altitudeLabel,
    point.distanceNm,
    point.active,
    model.lnavActive,
    model.overlays.data,
    point.discontinuity,
    model.anchorZones,
    isAirbus,
    colors.active,
  ]);

  const wptColor = point.active && model.lnavActive ? colors.active : colors.inactive;
  const isDiscon = point.discontinuity;
  const symbolPath = isAirbus ? 'M0 -3 L2.6 1.5 L-2.6 1.5 Z' : 'M0 -4 L1 -1 L4 0 L1 1 L0 4 L-1 1 L-4 0 L-1 -1 Z';

  return (
    <g transform={`translate(${point.x} ${point.y})`}>
      {isDiscon ? (
        <path d="M-3-3L3 3M3-3L-3 3" stroke="#ffaa00" strokeWidth="1.2" />
      ) : (
        <path
          d={point.airport ? 'M-2.5 -2.5h5v5h-5z' : symbolPath}
          fill={point.active && !isAirbus ? colors.active : 'none'}
          stroke={wptColor}
          strokeWidth={point.active ? '0.9' : '0.6'}
        />
      )}
      <g transform="translate(4 -1)">
        <text
          fill="black"
          fontSize="3.4"
          fontWeight="900"
          className="font-avionics"
          opacity="0.8"
          stroke="black"
          strokeWidth="0.8"
        >
          {point.label}
        </text>
        <text
          fill={point.active && model.lnavActive ? colors.active : colors.text}
          fontSize="3.4"
          fontWeight="bold"
          className="font-avionics"
        >
          {point.label}
        </text>
        {lines.map((line, idx) => (
          <g key={`cl-${point.id}-${idx}`} transform={`translate(0 ${3.2 + idx * 3.0})`}>
            <text
              fill="black"
              fontSize="2.6"
              className="font-avionics"
              fontWeight="bold"
              stroke="black"
              strokeWidth="0.6"
              opacity="0.8"
            >
              {line.text}
            </text>
            <text
              fill={line.color}
              fontSize="2.6"
              className="font-avionics"
              fontWeight="bold"
              filter={line.color === colors.active ? 'url(#boeing-glow)' : ''}
            >
              {line.text}
            </text>
          </g>
        ))}
      </g>
    </g>
  );
}

export function WaypointSymbol({ model }: WaypointSymbolProps) {
  const isAirbus = model.style === 'airbus';
  const colors = useMemo(
    () => ({
      active: isAirbus ? '#00ff00' : '#ff00ff',
      inactive: isAirbus ? '#00ff00' : '#00ccff',
      text: '#ffffff',
      pending: '#ffffff',
    }),
    [isAirbus],
  );

  const activePoint = model.activeRoutePoints.find((p) => p.active);

  return (
    <g>
      {model.lnavActive &&
        activePoint &&
        activePoint.visible &&
        !isAirbus &&
        !isNaN(activePoint.x) &&
        !isNaN(activePoint.y) && (
          <line
            x1="88"
            y1="16.5"
            x2={activePoint.x}
            y2={activePoint.y}
            stroke={colors.active}
            strokeWidth="0.45"
            opacity="0.8"
            filter="url(#boeing-glow)"
            pointerEvents="none"
          />
        )}

      {model.activeRoutePoints
        .filter((p) => !isNaN(p.x) && !isNaN(p.y))
        .map((point) => (
          <ActiveWaypoint
            key={`active-wpt-${point.id}`}
            point={point}
            model={model}
            colors={colors}
            isAirbus={isAirbus}
          />
        ))}

      {model.pendingRoutePoints
        .filter((p) => !isNaN(p.x) && !isNaN(p.y))
        .map((point) => (
          <g key={`pending-wpt-${point.id}`} transform={`translate(${point.x} ${point.y})`}>
            {!point.discontinuity && (
              <path
                d={point.airport ? 'M-2.5 -2.5h5v5h-5z' : 'M0 -3.5 L3.5 0 L0 3.5 L-3.5 0 Z'}
                fill="none"
                stroke={colors.pending}
                strokeWidth="0.7"
                strokeDasharray="2 2"
              />
            )}
            <text
              x="4"
              y="1"
              fill={colors.pending}
              fontSize="3.4"
              fontWeight="bold"
              className="font-avionics"
              filter="url(#boeing-glow)"
            >
              {point.label}
            </text>
          </g>
        ))}
    </g>
  );
}
