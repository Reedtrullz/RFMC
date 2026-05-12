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
      <g clipPath="url(#b737-nd-clip)">
        <AirportSymbol model={model} />
        <RouteLine model={model} />
        <WaypointSymbol model={model} />
        <HoldPattern model={model} />
        <FixRing model={model} />
        
        {/* Advanced Overlays */}
        <WXROverlay data={model.wxrData} />
        <VerticalProfileOverlay points={model.verticalProfilePoints} />
        <TCASOverlay targets={model.tcasTargets} />
      </g>

      {/* Navigation Foundation */}
      <BoeingHeadingArc model={model} />
      
      {/* Information Blocks */}
      <WindVector model={model} />
      <ModeAnnunciations model={model} />
      
      <g transform="translate(4 94)" fontSize="3.2" fill={colors.active} fontWeight="bold">
        <text>FMC L</text>
      </g>

      {/* Aircraft Symbol */}
      <AircraftSymbol centered={model.centered} color={colors.active} style="boeing" />

      {/* MOD Annunciation */}
      {model.isModified && (
        <text x="50" y="92" textAnchor="middle" fill="white" fontSize="4" fontWeight="bold">MOD</text>
      )}
    </g>
  );
}
