import { NavigationDisplayModel } from '@shared';
import { BoeingHeadingArc } from '../symbology/BoeingHeadingArc';
import { RangeRings } from '../symbology/RangeRings';
import { RouteLine } from '../symbology/RouteLine';
import { WaypointSymbol } from '../symbology/WaypointSymbol';
import { HoldPattern } from '../symbology/HoldPattern';
import { FixRing } from '../symbology/FixRing';
import { WindVector } from '../symbology/WindVector';
import { AirportSymbol } from '../symbology/AirportSymbol';
import { ModeAnnunciations } from '../symbology/ModeAnnunciations';
import { TCASOverlay } from '../layers/TCASOverlay';
import { WXROverlay } from '../layers/WXROverlay';
import { VerticalProfileOverlay } from '../layers/VerticalProfileOverlay';
import { RnpContainmentOverlay } from '../layers/RnpContainmentOverlay';
import { DebriefOverlay } from '../layers/DebriefOverlay';
import { AircraftSymbol } from '../symbols/AircraftSymbol';

interface B737NDProps {
  model: NavigationDisplayModel;
}

export function B737ND({ model }: B737NDProps) {
  const colors = {
    active: '#00ccff', // Boeing Cyan
    text: '#ffffff',
    magenta: '#ff00ff',
  };

  const cy = model.centered ? 50 : 84;

  return (
    <g data-testid="b737-nd-renderer">
      <defs>
        <clipPath id="b737-nd-clip">
          {model.centered ? (
            <circle cx="50" cy={cy} r="45" />
          ) : (
            <path d={`M-50 -50 L150 -50 L150 ${cy} A50 50 0 0 1 -50 ${cy} Z`} />
          )}
        </clipPath>
      </defs>

      {/* Static Background */}
      <RangeRings model={model} color="#002233" />
      
      {/* Moving Symbology */}
      {model.irsState === 'NAV' ? (
        <g clipPath="url(#b737-nd-clip)">
          <AirportSymbol model={model} />
          <RouteLine model={model} />
          <WaypointSymbol model={model} />
          <HoldPattern model={model} />
          <FixRing model={model} />
          
          {/* Advanced Overlays */}
          <WXROverlay data={model.wxrData} />
          <VerticalProfileOverlay points={model.verticalProfilePoints} />
          <RnpContainmentOverlay model={model} />
          <DebriefOverlay model={model} />
          <TCASOverlay targets={model.tcasTargets} />
        </g>
      ) : (
        <g clipPath="url(#b737-nd-clip)" opacity="0.3">
          {/* Show minimal placeholders or nothing */}
        </g>
      )}

      {/* Navigation Foundation */}
      <BoeingHeadingArc model={model} />
      
      {/* Information Blocks */}
      <WindVector model={model} />
      <ModeAnnunciations model={model} />

      {/* IRS Status Flags */}
      {model.irsState !== 'NAV' && (
        <g transform="translate(50 50)" textAnchor="middle">
          <rect x="-25" y="-6" width="50" height="12" fill="black" stroke="#ffcc00" strokeWidth="0.5" />
          <text y="2" fill="#ffcc00" fontSize="5" fontWeight="bold">
            {model.irsState === 'OFF' ? 'MAP FAILURE' : 'IRS ALIGN'}
          </text>
        </g>
      )}

      {/* ANP/RNP Display */}
      <g transform="translate(96 94)" textAnchor="end" fontSize="3" fill="#ffffff" opacity="0.8">
        <text y="-4">RNP {model.rnpNm.toFixed(2)}</text>
        <text fill={model.anpNm > model.rnpNm ? '#ffcc00' : '#ffffff'}>ANP {model.anpNm.toFixed(2)}</text>
      </g>
      
      <g transform="translate(4 94)" fontSize="3.2" fill={colors.active} fontWeight="bold">
        <text>FMC L</text>
      </g>

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
        <text x="50" y="92" textAnchor="middle" fill="white" fontSize="4" fontWeight="bold">MOD</text>
      )}
    </g>
  );
}
