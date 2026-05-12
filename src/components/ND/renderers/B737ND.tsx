import { NavigationDisplayModel } from '@shared';
import { RangeRings } from '../layers/RangeRings';
import { HeadingRose } from '../layers/HeadingRose';
import { AircraftSymbol } from '../symbols/AircraftSymbol';
import { NDAnchorZones } from '../layers/NDAnchorZones';
import { TCASOverlay } from '../layers/TCASOverlay';
import { WXROverlay } from '../layers/WXROverlay';
import { VerticalProfileOverlay } from '../layers/VerticalProfileOverlay';
import { HoldOverlay } from '../layers/HoldOverlay';
import { FixOverlay } from '../layers/FixOverlay';

interface B737NDProps {
  model: NavigationDisplayModel;
}

export function B737ND({ model }: B737NDProps) {
  const colors = {
    active: '#00ccff', // Boeing Cyan
    text: '#ffffff',
    warning: '#ffcc00',
    magenta: '#ff00ff', // Active Route
    modified: '#ffffff', // White dashed for pending
  };

  const isMap = model.mode === 'MAP';
  const cy = model.centered ? 50 : 84;

  return (
    <g data-testid="b737-nd-renderer">
      <defs>
        <clipPath id="b737-nd-clip">
          {model.centered ? (
            <circle cx="50" cy={cy} r="45" />
          ) : (
            <path d={`M0 0 L0 ${cy} A50 50 0 0 1 100 ${cy} L100 0 Z`} />
          )}
        </clipPath>
      </defs>

      {/* Background Layers */}
      <g opacity="0.4">
        <RangeRings range={model.range} centered={model.centered} color="#003344" />
        <HeadingRose 
          centered={model.centered} 
          heading={model.heading} 
          selectedHeading={model.selectedHeading}
          isPlan={model.mode === 'PLN'}
        />
      </g>

      {/* Header Info */}
      <g transform="translate(4 6)" fontSize="3.2" fill={colors.active} fontWeight="bold">
        <text>{model.mode} {model.centered ? 'CTR' : ''}</text>
      </g>
      <text x="4" y="15" fill={colors.text} fontSize="3.5" fontWeight="bold" opacity="0.8">{model.procedureLabel}</text>

      {/* Dynamic Overlay Legend (Left) - Dimmed when inactive */}
      <g transform="translate(4 25)" fontSize="2.8" fill={colors.active} fontWeight="bold">
        <text opacity={model.overlays.arpt ? 1 : 0.25}>ARPT</text>
        <text y="4" opacity={model.overlays.sta ? 1 : 0.25}>STA</text>
        <text y="8" opacity={model.overlays.wpt ? 1 : 0.25}>WPT</text>
        <text y="12" opacity={model.overlays.data ? 1 : 0.25} fill={colors.text}>DATA</text>
      </g>

      {/* Source Info (Bottom) */}
      <g transform="translate(4 94)" fontSize="3.2" fill={colors.active} fontWeight="bold">
        <text>FMC L</text>
      </g>

      <g clipPath="url(#b737-nd-clip)">
        {/* Background Waypoints */}
        {model.backgroundWaypoints.map(point => (
          <g key={point.id} transform={`translate(${point.x} ${point.y})`} opacity="0.5">
            <path d="M0 -1.5 L1.5 1.5 L-1.5 1.5 Z" fill="none" stroke={colors.active} strokeWidth="0.4" />
            <text x="2" y="1" fill={colors.active} fontSize="2.2">{point.label}</text>
          </g>
        ))}

        {/* Background Airports */}
        {model.backgroundAirports.map(point => (
          <g key={point.id} transform={`translate(${point.x} ${point.y})`} opacity="0.6">
            <path d="M-1.5 -1.5h3v3h-3z" fill="none" stroke={colors.active} strokeWidth="0.5" />
            <text x="2.5" y="1" fill={colors.active} fontSize="2.4">{point.label}</text>
          </g>
        ))}

        {/* Active Route Segments */}
        {model.activeRouteSegments.map((segment, i) => (
          <line
            key={`active-seg-${i}`}
            x1={segment.x1} y1={segment.y1}
            x2={segment.x2} y2={segment.y2}
            stroke={isMap ? colors.magenta : colors.active}
            strokeWidth={segment.active ? '1.8' : '1.2'}
            strokeDasharray={segment.dashed ? '2 2' : undefined}
            opacity={0.9}
          />
        ))}

        {/* Pending Route Segments */}
        {model.pendingRouteSegments.map((segment, i) => (
          <line
            key={`pending-seg-${i}`}
            x1={segment.x1} y1={segment.y1}
            x2={segment.x2} y2={segment.y2}
            stroke={colors.modified}
            strokeWidth="1.2"
            strokeDasharray={segment.dashed ? '2 2' : '4 2'}
            opacity={0.9}
          />
        ))}

        {/* Active Waypoints & Labels */}
        {model.activeRoutePoints.map(point => (
          <g key={`active-wpt-${point.id}`} transform={`translate(${point.x} ${point.y})`}>
            {point.discontinuity ? (
              <path d="M-2-2L2 2M2-2L-2 2" stroke="#ffaa00" strokeWidth="1" />
            ) : (
              <path
                d={point.airport ? 'M-2 -2h4v4h-4z' : 'M0 -2.5 L2.5 2.5 L-2.5 2.5 Z'}
                fill={point.active ? colors.magenta : 'none'}
                stroke={point.active ? colors.magenta : colors.active}
                strokeWidth="0.8"
              />
            )}
            <text x="3" y="1" fill={point.active ? colors.magenta : colors.text} fontSize="3.2" fontWeight="bold">
              {point.label}
            </text>
            
            {/* DATA Overlay: Constraints */}
            {model.overlays.data && !point.discontinuity && (
              <g transform="translate(0 4)" fontSize="2.4" fill={colors.text} opacity="0.8">
                {point.speedLabel && <text y="0">{point.speedLabel}</text>}
                {point.altitudeLabel && <text y={point.speedLabel ? 3 : 0}>{point.altitudeLabel}</text>}
              </g>
            )}
          </g>
        ))}

        {/* Pending Waypoints & Labels */}
        {model.pendingRoutePoints.map(point => (
          <g key={`pending-wpt-${point.id}`} transform={`translate(${point.x} ${point.y})`}>
            {!point.discontinuity && (
              <path
                d={point.airport ? 'M-2 -2h4v4h-4z' : 'M0 -2.5 L2.5 2.5 L-2.5 2.5 Z'}
                fill="none"
                stroke={colors.modified}
                strokeWidth="0.8"
              />
            )}
            <text x="3" y="1" fill={colors.modified} fontSize="3.2" fontWeight="bold">
              {point.label}
            </text>
          </g>
        ))}

        {/* Overlays */}
        <WXROverlay data={model.wxrData} />
        <VerticalProfileOverlay points={model.verticalProfilePoints} />
        <TCASOverlay targets={model.tcasTargets} />
        <HoldOverlay hold={model.holdOverlay} />
        <FixOverlay fixes={model.fixOverlays} />
      </g>
      
      {/* Anchor Zones */}
      <NDAnchorZones model={model} colors={colors} />

      {/* Aircraft Symbol */}
      <AircraftSymbol centered={model.centered} color={colors.active} style="boeing" />

      {/* Track Line (Boeing style) */}
      {!model.centered && model.mode !== 'PLN' && (
        <g transform={`rotate(${model.track - model.heading} 50 ${cy})`}>
          <line x1="50" y1={cy} x2="50" y2={cy - 45} stroke="#ffffff" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.6" />
        </g>
      )}

      {/* MOD Annunciation */}
      {model.isModified && (
        <text x="50" y="92" textAnchor="middle" fill={colors.modified} fontSize="4" fontWeight="bold">MOD</text>
      )}
    </g>
  );
}
