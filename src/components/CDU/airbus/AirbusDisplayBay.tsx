import { Display } from '../Display';
import { Scratchpad } from '../Scratchpad';
import { ScreenGlass } from '../../instruments/common/ScreenGlass';
import { AirbusLSKColumn } from './AirbusLSKColumn';
import { useDisplaySettings } from '../../../store/displaySettingsStore';

interface AirbusDisplayBayProps {
  brightness: number;
  getLSKLabel: (side: 'L' | 'R', index: number) => string | undefined;
  isHighlighted: (id: string) => boolean;
  onPressLSK: (side: 'L' | 'R', index: number) => void;
}

import { AIRBUS_A320_MCDU_TOKENS } from '../../instruments/common/tokens/airbus-mcdu.tokens';

export function AirbusDisplayBay({ brightness, getLSKLabel, isHighlighted, onPressLSK }: AirbusDisplayBayProps) {
  const tokens = AIRBUS_A320_MCDU_TOKENS;
  const mmToPx = 3.8;

  const rowHeight = `${tokens.screen.rowHeightMm * mmToPx}px`;
  const scratchpadHeight = `${tokens.screen.scratchpadHeightMm * mmToPx}px`;
  const lskWidth = `${tokens.lsk.insetMm * mmToPx * 2.2}px`;

  const { wearIntensity } = useDisplaySettings();
  const wearT = wearIntensity / 100;

  const displayStyle = {
    display: 'grid',
    gridTemplateColumns: `${lskWidth} minmax(0, 1fr) ${lskWidth}`,
    background: 'linear-gradient(145deg, #151818, #080909)',
    filter: wearT > 0.1 ? `contrast(${1 + wearT * 0.12})` : undefined,
  } as React.CSSProperties;

  return (
    <div className="instrument-display-recess cdu-display-bay">
      <div className="p-1" style={displayStyle}>
        <AirbusLSKColumn side="L" getLabel={getLSKLabel} isHighlighted={isHighlighted} onPress={onPressLSK} />
        <AirbusLSKColumn side="R" getLabel={getLSKLabel} isHighlighted={isHighlighted} onPress={onPressLSK} />

        <div style={{ gridRow: '1 / 15', gridColumn: 2 }}>
          <ScreenGlass brightness={brightness} className="bg-cdu-screen w-full h-full flex flex-col">
            <div className="flex-1">
              <Display />
            </div>
            <div className="h-[42px] flex items-center px-1">
              <Scratchpad />
            </div>
          </ScreenGlass>

          {/* Phase 2: Dynamic wear + micro-scratches for Airbus */}
          {wearT > 0.05 && (
            <div
              className="absolute inset-0 pointer-events-none rounded mix-blend-multiply"
              style={{
                background: `
                  linear-gradient(180deg, rgba(0,30,0,${0.04 * wearT}), transparent 40%, rgba(0,30,0,${0.07 * wearT}) 100%),
                  repeating-linear-gradient(
                    38deg,
                    transparent,
                    transparent 4px,
                    rgba(0, 40, 0, ${0.05 * wearT}) 4px,
                    rgba(0, 40, 0, ${0.05 * wearT}) 5px
                  )
                `,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
