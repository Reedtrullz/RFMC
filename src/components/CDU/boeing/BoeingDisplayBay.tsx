import { Display } from '../Display';
import { Scratchpad } from '../Scratchpad';
import { ScreenGlass } from '../../visual/ScreenGlass';
import { BoeingLSKColumn } from './BoeingLSKColumn';

interface BoeingDisplayBayProps {
  brightness: number;
  getLSKLabel: (side: 'L' | 'R', index: number) => string | undefined;
  isHighlighted: (id: string) => boolean;
  hintLevel?: number;
  onPressLSK: (side: 'L' | 'R', index: number) => void;
}

export function BoeingDisplayBay({ brightness, getLSKLabel, isHighlighted, hintLevel, onPressLSK }: BoeingDisplayBayProps) {
  return (
    <div
      className="w-full rounded-[5px] border border-black/70 bg-[#101010] p-2 shadow-[inset_0_0_18px_rgba(0,0,0,0.65)]"
      style={{
        display: 'grid',
        gridTemplateColumns: '44px minmax(0, 1fr) 44px',
        gridTemplateRows: 'repeat(14, var(--cdu-row-h, 21px)) auto',
        columnGap: '0.35rem',
        // @ts-ignore
        '--cdu-row-h': '21px',
        '--cdu-row-height': '21px',
        '--cdu-inverse-bg': '#39ff14',
      }}
    >
      <BoeingLSKColumn side="L" getLabel={getLSKLabel} isHighlighted={isHighlighted} hintLevel={hintLevel} onPress={onPressLSK} />
      <BoeingLSKColumn side="R" getLabel={getLSKLabel} isHighlighted={isHighlighted} hintLevel={hintLevel} onPress={onPressLSK} />

      <div style={{ gridRow: '1 / 15', gridColumn: 2, width: '100%' }}>
        <ScreenGlass brightness={brightness} className="bg-cdu-screen rounded-b-none w-full">
          <div className="w-full" style={{ height: 'calc(14 * var(--cdu-row-h, 21px))' }}>
            <Display />
          </div>
        </ScreenGlass>
      </div>
      <div
        className="bg-cdu-screen"
        style={{
          gridRow: 15,
          gridColumn: 2,
          filter: `brightness(${brightness}%)`,
          height: '24px',
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
