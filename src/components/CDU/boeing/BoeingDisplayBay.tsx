import { Display } from '../Display';
import { Scratchpad } from '../Scratchpad';
import { ScreenGlass } from '../../instruments/common/ScreenGlass';
import { BoeingLSKColumn } from './BoeingLSKColumn';

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
  const mmToPx = 3.8; // Approximate conversion for high-fidelity feel

  const rowHeight = `${tokens.screen.rowHeightMm * mmToPx}px`;
  const lskWidth = `${tokens.lsk.insetMm * mmToPx * 2.2}px`; // Approximate width for LSK columns
  const scratchpadHeight = `${tokens.screen.scratchpadHeightMm * mmToPx}px`;

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
  } as React.CSSProperties & Record<'--cdu-row-h' | '--cdu-row-height' | '--cdu-inverse-bg', string>;

  return (
    <div
      className="w-full rounded-[5px] border border-black/70 p-2 shadow-[inset_0_0_18px_rgba(0,0,0,0.65)] mix-blend-normal"
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

      <div style={{ gridRow: '1 / 14', gridColumn: 2, width: '100%' }}>
        <ScreenGlass brightness={brightness} className="bg-cdu-screen rounded-b-none w-full">
          <div className="w-full" style={{ height: 'calc(13 * var(--cdu-row-h, 21px))' }}>
            <Display />
          </div>
        </ScreenGlass>
      </div>
      <div
        className="bg-cdu-screen"
        style={{
          gridRow: 14,
          gridColumn: 2,
          filter: `brightness(${brightness}%)`,
          height: scratchpadHeight,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '4px',
        }}
      >
        <Scratchpad />
      </div>
    </div>
  );
}
