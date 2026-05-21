import { Display } from '../Display';
import { Scratchpad } from '../Scratchpad';
import { ScreenGlass } from '../../instruments/common/ScreenGlass';
import { BoeingLSKColumn } from './BoeingLSKColumn';
import { useDisplaySettings } from '../../../store/displaySettingsStore';

interface BoeingDisplayBayProps {
  brightness: number;
  getLSKLabel: (side: 'L' | 'R', index: number) => string | undefined;
  isHighlighted: (id: string) => boolean;
  hintLevel?: number;
  onPressLSK: (side: 'L' | 'R', index: number) => void;
}

import { BOEING_737_CDU_TOKENS } from '../../instruments/common/tokens/boeing-cdu.tokens';

export function BoeingDisplayBay({
  brightness,
  getLSKLabel,
  isHighlighted,
  hintLevel,
  onPressLSK,
}: BoeingDisplayBayProps) {
  const tokens = BOEING_737_CDU_TOKENS;
  const mmToPx = 3.8;

  const rowHeight = `${tokens.screen.rowHeightMm * mmToPx}px`;
  const lskWidth = `${tokens.lsk.insetMm * mmToPx * 2.2}px`;
  const scratchpadHeight = `${tokens.screen.scratchpadHeightMm * mmToPx}px`;

  const { wearIntensity } = useDisplaySettings();
  const wearT = wearIntensity / 100;

  const displayBayStyle = {
    display: 'grid',
    gridTemplateColumns: `${lskWidth} minmax(0, 1fr) ${lskWidth}`,
    gridTemplateRows: `repeat(${tokens.screen.rows - 1}, ${rowHeight}) ${scratchpadHeight}`,
    columnGap: '0.2rem',
    '--cdu-row-h': rowHeight,
    '--cdu-row-height': rowHeight,
    '--cdu-inverse-bg': '#39ff14',
    backgroundImage: `
      radial-gradient(rgba(255,255,255,.035) 1px, transparent 1px),
      linear-gradient(145deg, #151818, #080909)
    `,
    backgroundSize: '6px 6px, auto',
    filter: wearT > 0.1 ? `contrast(${1 + wearT * 0.12})` : undefined,
  } as React.CSSProperties & Record<'--cdu-row-h' | '--cdu-row-height' | '--cdu-inverse-bg', string>;

  return (
    <div
      className="cdu-display-bay w-full rounded-[5px] border border-black/70 p-2 shadow-[inset_0_0_18px_rgba(0,0,0,0.65)] mix-blend-normal relative"
      style={displayBayStyle}
    >
      <BoeingLSKColumn
        side="L"
        getLabel={getLSKLabel}
        isHighlighted={isHighlighted}
        hintLevel={hintLevel}
        onPress={onPressLSK}
      />
      <BoeingLSKColumn
        side="R"
        getLabel={getLSKLabel}
        isHighlighted={isHighlighted}
        hintLevel={hintLevel}
        onPress={onPressLSK}
      />

      <div style={{ gridRow: '1 / 15', gridColumn: 2, width: '100%', height: '100%' }}>
        <ScreenGlass brightness={brightness} className="bg-cdu-screen w-full h-full flex flex-col">
          <div className="w-full" style={{ height: 'calc(13 * var(--cdu-row-h, 21px))' }}>
            <Display />
          </div>
          <div
            className="w-full"
            style={{
              height: scratchpadHeight,
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '4px',
            }}
          >
            <Scratchpad />
          </div>
        </ScreenGlass>

        {/* Phase 2: Dynamic wear + micro-scratches + light reflection */}
        {wearT > 0.05 && (
          <>
            {/* Micro scratches */}
            <div
              className="absolute inset-0 pointer-events-none rounded-[5px] mix-blend-multiply"
              style={{
                background: `
                  linear-gradient(180deg, rgba(0,30,0,${0.04 * wearT}), transparent 35%, rgba(0,30,0,${0.07 * wearT}) 100%),
                  repeating-linear-gradient(
                    35deg,
                    transparent,
                    transparent 3px,
                    rgba(0, 40, 0, ${0.06 * wearT}) 3px,
                    rgba(0, 40, 0, ${0.06 * wearT}) 4px
                  )
                `,
              }}
            />

            {/* Dynamic light reflection (Phase 2) */}
            <div
              className="absolute inset-0 pointer-events-none rounded-[5px]"
              style={{
                background: `linear-gradient(135deg, 
                  rgba(255,255,255,${0.08 * (1 - wearT * 0.6)}) 0%, 
                  transparent 35%, 
                  transparent 65%, 
                  rgba(255,255,255,${0.04 * (1 - wearT * 0.6)}) 100%)`,
                mixBlendMode: 'screen',
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
