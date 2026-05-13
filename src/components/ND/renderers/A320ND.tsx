import { NavigationDisplayModel } from '@shared';
import { AirbusHeadingScale } from '../symbology/AirbusHeadingScale';
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
import { AircraftSymbol } from '../symbols/AircraftSymbol';
import { ConstraintsOverlay } from '../symbology/ConstraintsOverlay';

interface A320NDProps {
  model: NavigationDisplayModel;
}

export function A320ND({ model }: A320NDProps) {
  const colors = {
    active: '#00ff00', // Airbus Green
    text: '#ffffff',
  };

  const cy = model.centered ? 50 : 84;

  return (
    <g data-testid="a320-nd-renderer">
      <defs>
        <clipPath id="a320-nd-clip">
          {model.centered ? (
            <circle cx="50" cy={cy} r="45" />
          ) : (
            <path d={`M-50 -50 L150 -50 L150 ${cy} A50 50 0 0 1 -50 ${cy} Z`} />
          )}
        </clipPath>
      </defs>

      {/* Static Background */}
      <RangeRings model={model} color="#004433" />
      
      {/* Moving Symbology */}
      {model.irsState === 'NAV' ? (
        <g clipPath="url(#a320-nd-clip)">
          <AirportSymbol model={model} />
          <RouteLine model={model} />
          <WaypointSymbol model={model} />
          <ConstraintsOverlay model={model} />
          <HoldPattern model={model} />
          <FixRing model={model} />
          
          {/* Advanced Overlays */}
          <WXROverlay data={model.wxrData} />
          <VerticalProfileOverlay points={model.verticalProfilePoints} />
          <TCASOverlay targets={model.tcasTargets} />
        </g>
      ) : (
        <g transform="translate(50 50)" textAnchor="middle">
           <rect x="-25" y="-6" width="50" height="12" fill="black" stroke="#ffcc00" strokeWidth="0.5" />
          <text y="2" fill="#ffcc00" fontSize="5" fontWeight="bold">
            {model.irsState === 'OFF' ? 'MAP NOT AVAIL' : 'IRS ALIGN'}
          </text>
        </g>
      )}

      {/* Navigation Foundation */}
      <AirbusHeadingScale model={model} />
      
      {/* Information Blocks */}
      <WindVector model={model} />
      <ModeAnnunciations model={model} />
      
      {/* Nav Accuracy & Source */}
      <g transform="translate(4 94)" fontSize="3" fill="#ffffff" fontWeight="bold">
        <text>GPS {model.navSource === 'GPS' ? 'PRIMARY' : ''}</text>
        <text y="4" fill={model.anpNm > model.rnpNm ? '#ffcc00' : '#00ff00'}>
          ACCUR {model.anpNm > model.rnpNm ? 'LOW' : 'HIGH'}
        </text>
      </g>

      {/* Aircraft Symbol */}
      <AircraftSymbol centered={model.centered} color={colors.active} style="airbus" />
    </g>
  );
}
