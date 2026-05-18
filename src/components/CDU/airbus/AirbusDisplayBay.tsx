import { Display } from '../Display';
import { Scratchpad } from '../Scratchpad';
import { ScreenGlass } from '../../instruments/common/ScreenGlass';
import { AirbusLSKColumn } from './AirbusLSKColumn';

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
  const lskWidth = `${tokens.lsk.insetMm * mmToPx * 4}px`;
  const totalWidth = `${tokens.screen.widthMm * mmToPx + (tokens.lsk.insetMm * mmToPx * 8)}px`;

  return (
    <div className="instrument-display-recess">
      <div
        className="p-1"
        style={{
          display: 'grid',
          gridTemplateColumns: `${lskWidth} minmax(0, 1fr) ${lskWidth}`,
          gridTemplateRows: `repeat(${tokens.screen.rows - 1}, ${rowHeight}) ${scratchpadHeight}`,
          columnGap: '0.25rem',
          width: totalWidth,
        }}
      >
        <AirbusLSKColumn side="L" getLabel={getLSKLabel} isHighlighted={isHighlighted} onPress={onPressLSK} />
        <AirbusLSKColumn side="R" getLabel={getLSKLabel} isHighlighted={isHighlighted} onPress={onPressLSK} />

        <div style={{ gridRow: '1 / 14', gridColumn: 2, width: '100%' }}>
          <ScreenGlass brightness={brightness} className="bg-cdu-screen rounded-b-none w-full border-cdu-bezel-light/30">
            <div className="w-full" style={{ height: `calc(${tokens.screen.rows - 1} * ${rowHeight})` }}>
              <Display variant="airbus" />
            </div>
          </ScreenGlass>
        </div>
        <div
          className="bg-cdu-screen border-x-2 border-b-2 border-cdu-bezel-light/30 rounded-b-sm overflow-hidden"
          style={{
            gridRow: 14,
            gridColumn: 2,
            filter: `brightness(${brightness}%)`,
            height: scratchpadHeight,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Scratchpad variant="airbus" />
        </div>
      </div>
    </div>
  );
}
