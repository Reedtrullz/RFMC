import { Display } from '../Display';
import { Scratchpad } from '../Scratchpad';
import { ScreenGlass } from '../../visual/ScreenGlass';
import { BoeingLSKColumn } from './BoeingLSKColumn';

interface BoeingDisplayBayProps {
  brightness: number;
  getLSKLabel: (side: 'L' | 'R', index: number) => string | undefined;
  isHighlighted: (id: string) => boolean;
  onPressLSK: (side: 'L' | 'R', index: number) => void;
}

export function BoeingDisplayBay({ brightness, getLSKLabel, isHighlighted, onPressLSK }: BoeingDisplayBayProps) {
  return (
    <div
      className="w-full rounded-[5px] border border-black/70 bg-[#101010] p-2 shadow-[inset_0_0_18px_rgba(0,0,0,0.65)]"
      style={{
        display: 'grid',
        gridTemplateColumns: '44px minmax(0, 1fr) 44px',
        gridTemplateRows: 'repeat(14, minmax(0, 1fr)) auto',
        columnGap: '0.35rem',
      }}
    >
      <BoeingLSKColumn side="L" getLabel={getLSKLabel} isHighlighted={isHighlighted} onPress={onPressLSK} />
      <BoeingLSKColumn side="R" getLabel={getLSKLabel} isHighlighted={isHighlighted} onPress={onPressLSK} />

      <div style={{ gridRow: '1 / 15', gridColumn: 2 }}>
        <ScreenGlass brightness={brightness} className="rounded-b-none">
          <div style={{ minHeight: '18.2em' }}>
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
        }}
      >
        <Scratchpad />
      </div>
    </div>
  );
}
