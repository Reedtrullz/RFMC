import { Display } from '../Display';
import { Scratchpad } from '../Scratchpad';
import { ScreenGlass } from '../../visual/ScreenGlass';
import { AirbusLSKColumn } from './AirbusLSKColumn';

interface AirbusDisplayBayProps {
  brightness: number;
  getLSKLabel: (side: 'L' | 'R', index: number) => string | undefined;
  isHighlighted: (id: string) => boolean;
  onPressLSK: (side: 'L' | 'R', index: number) => void;
}

export function AirbusDisplayBay({ brightness, getLSKLabel, isHighlighted, onPressLSK }: AirbusDisplayBayProps) {
  return (
    <div
      className="rounded-[5px] border border-black/70 bg-[#101010] p-2 shadow-[inset_0_0_18px_rgba(0,0,0,0.65)]"
      style={{
        display: 'grid',
        gridTemplateColumns: '48px minmax(0, 1fr) 48px',
        gridTemplateRows: 'repeat(14, var(--airbus-row-height, 21px)) var(--airbus-scratchpad-height, 28px)',
        columnGap: '0.25rem',
        width: 'var(--airbus-display-width, 420px)',
      }}
    >
      <AirbusLSKColumn side="L" getLabel={getLSKLabel} isHighlighted={isHighlighted} onPress={onPressLSK} />
      <AirbusLSKColumn side="R" getLabel={getLSKLabel} isHighlighted={isHighlighted} onPress={onPressLSK} />

      <div style={{ gridRow: '1 / 15', gridColumn: 2, width: '100%' }}>
        <ScreenGlass brightness={brightness} className="bg-cdu-screen rounded-b-none w-full border-cdu-bezel-light/30">
          <div className="w-full" style={{ height: 'calc(14 * var(--airbus-row-height, 21px))' }}>
            <Display variant="airbus" />
          </div>
        </ScreenGlass>
      </div>
      <div
        className="bg-cdu-screen border-x-2 border-b-2 border-cdu-bezel-light/30 rounded-b-sm overflow-hidden"
        style={{
          gridRow: 15,
          gridColumn: 2,
          filter: `brightness(${brightness}%)`,
          height: 'var(--airbus-scratchpad-height, 28px)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Scratchpad variant="airbus" />
      </div>
    </div>
  );
}
