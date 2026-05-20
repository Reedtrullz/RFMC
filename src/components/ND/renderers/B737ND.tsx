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
import { TerrainOverlay } from '../layers/TerrainOverlay';
import { CoastlineOverlay } from '../layers/CoastlineOverlay';
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
          <CoastlineOverlay model={model} />
          <TerrainOverlay model={model} />
          <AirportSymbol model={model} />
          <RouteLine model={model} />
          <WaypointSymbol model={model} />
          <HoldPattern model={model} />
          <FixRing model={model} />

          {/* Advanced Overlays */}
          <WXROverlay model={model} />
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
      <g transform="translate(0, 9.5)">
        <WindVector model={model} />
      </g>
      <ModeAnnunciations model={model} />

      {/* IRS Status Flags */}
      {model.irsState !== 'NAV' && (
        <g transform="translate(50 50)">
          {/* Background dimming */}
          <rect x="-45" y="-22" width="90" height="44" fill="black" opacity="0.6" />
          {/* Failure text box */}
          <rect
            x="-35"
            y="-14"
            width="70"
            height="28"
            fill="black"
            stroke={model.irsState === 'ALIGNING' ? '#00ff00' : '#ffcc00'}
            strokeWidth="0.8"
            rx="2"
          />
          <text
            y="-3"
            fill={model.irsState === 'ALIGNING' ? '#00ff00' : '#ffcc00'}
            fontSize="6"
            fontWeight="bold"
            textAnchor="middle"
            letterSpacing="1.5"
            stroke="black"
            strokeWidth="0.4"
            paintOrder="stroke"
            strokeLinejoin="round"
          >
            {model.irsState === 'OFF' ? 'MAP FAILURE' : 'IRS ALIGN'}
          </text>
          {model.irsState === 'ALIGNING' && (
            <text
              y="5"
              fill="#ffcc00"
              fontSize="3"
              textAnchor="middle"
              opacity="0.8"
              stroke="black"
              strokeWidth="0.4"
              paintOrder="stroke"
              strokeLinejoin="round"
            >
              ALIGNING...
            </text>
          )}
        </g>
      )}

      {/* ANP/RNP Display */}
      <g transform="translate(96 94)" textAnchor="end" fontSize="3" fill="#ffffff" opacity="0.8">
        <text y="-4" stroke="black" strokeWidth="0.4" paintOrder="stroke" strokeLinejoin="round">
          RNP {model.rnpNm.toFixed(2)}
        </text>
        <text
          fill={model.anpNm > model.rnpNm ? '#ffcc00' : '#ffffff'}
          stroke="black"
          strokeWidth="0.4"
          paintOrder="stroke"
          strokeLinejoin="round"
        >
          ANP {model.anpNm.toFixed(2)}
        </text>
      </g>

      <g transform="translate(4 94)" fontSize="3.2" fill={colors.active} fontWeight="bold">
        <text stroke="black" strokeWidth="0.4" paintOrder="stroke" strokeLinejoin="round">
          FMC L
        </text>
      </g>

      {/* Active Overlay List (Bottom Left) */}
      <g
        transform="translate(4 64)"
        fontSize="2.8"
        fontWeight="bold"
        fill="#00ccff"
        opacity="0.95"
        className="font-mono"
      >
        <text
          fill={model.overlays.arpt ? '#00ccff' : '#3a4d5c'}
          stroke="black"
          strokeWidth="0.4"
          paintOrder="stroke"
          strokeLinejoin="round"
        >
          ARPT
        </text>
        <text
          y="3.4"
          fill={model.overlays.wpt ? '#00ccff' : '#3a4d5c'}
          stroke="black"
          strokeWidth="0.4"
          paintOrder="stroke"
          strokeLinejoin="round"
        >
          WPT
        </text>
        <text
          y="6.8"
          fill={model.overlays.sta ? '#00ccff' : '#3a4d5c'}
          stroke="black"
          strokeWidth="0.4"
          paintOrder="stroke"
          strokeLinejoin="round"
        >
          STA
        </text>
        <text
          y="10.2"
          fill={model.overlays.terr ? '#00ccff' : '#3a4d5c'}
          stroke="black"
          strokeWidth="0.4"
          paintOrder="stroke"
          strokeLinejoin="round"
        >
          TERR
        </text>
        <text
          y="13.6"
          fill={model.overlays.tfc ? '#00ccff' : '#3a4d5c'}
          stroke="black"
          strokeWidth="0.4"
          paintOrder="stroke"
          strokeLinejoin="round"
        >
          TFC
        </text>
      </g>

      {/* VOR 1 / ADF 2 Blocks */}
      <g
        transform="translate(4 82)"
        fontSize="2.8"
        fontWeight="bold"
        fill="#00ff66"
        opacity="0.95"
        className="font-mono"
      >
        <text stroke="black" strokeWidth="0.4" paintOrder="stroke" strokeLinejoin="round">
          VOR 1
        </text>
        <text y="4.2" fill="#00ff66" stroke="black" strokeWidth="0.4" paintOrder="stroke" strokeLinejoin="round">
          {model.radios?.vor1 || '111.50'}
        </text>
        <text y="8.4" fill="#00ff66" stroke="black" strokeWidth="0.4" paintOrder="stroke" strokeLinejoin="round">
          DME ----
        </text>
      </g>

      <g
        transform="translate(96 82)"
        textAnchor="end"
        fontSize="2.8"
        fontWeight="bold"
        fill="#00ccff"
        opacity="0.95"
        className="font-mono"
      >
        <text stroke="black" strokeWidth="0.4" paintOrder="stroke" strokeLinejoin="round">
          ADF 2
        </text>
        <text y="4.2" fill="#00ccff" stroke="black" strokeWidth="0.4" paintOrder="stroke" strokeLinejoin="round">
          {model.radios?.adf1 ? parseFloat(model.radios.adf1).toFixed(1) : '210.0'}
        </text>
      </g>

      {/* Aircraft Symbol */}
      <AircraftSymbol centered={model.centered} color={colors.active} style="boeing" />

      {/* Track Line (Boeing style) */}
      {!model.centered && model.mode !== 'PLN' && (
        <g transform={`rotate(${model.track - model.heading} 50 ${cy})`}>
          <line x1="50" y1={cy} x2="50" y2={cy - 45} stroke="#ffffff" strokeWidth="0.5" opacity="0.75" />
        </g>
      )}

      {/* MOD Annunciation */}
      {model.isModified && (
        <text
          x="50"
          y="92"
          textAnchor="middle"
          fill="white"
          fontSize="4"
          fontWeight="bold"
          stroke="black"
          strokeWidth="0.4"
          paintOrder="stroke"
          strokeLinejoin="round"
        >
          MOD
        </text>
      )}
    </g>
  );
}
