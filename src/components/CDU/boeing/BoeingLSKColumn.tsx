import { LSKButton } from '../LSKButton';

const LSK_BOEING = [
  { row: 2, index: 1 },
  { row: 4, index: 2 },
  { row: 6, index: 3 },
  { row: 8, index: 4 },
  { row: 10, index: 5 },
  { row: 12, index: 6 },
];

interface BoeingLSKColumnProps {
  side: 'L' | 'R';
  getLabel: (side: 'L' | 'R', index: number) => string | undefined;
  isHighlighted: (id: string) => boolean;
  hintLevel?: number;
  onPress: (side: 'L' | 'R', index: number) => void;
}

export function BoeingLSKColumn({ side, getLabel, isHighlighted, hintLevel, onPress }: BoeingLSKColumnProps) {
  return (
    <>
      {LSK_BOEING.map(({ row, index }) => (
        <div
          key={`${side}${index}`}
          className={`flex items-center ${side === 'R' ? 'justify-end' : ''}`}
          style={{
            gridRow: `${row} / ${row + 2}`,
            gridColumn: side === 'L' ? 1 : 3,
          }}
        >
          <LSKButton
            side={side}
            index={index}
            label={getLabel(side, index)}
            highlighted={isHighlighted(`${side}${index}`)}
            hintLevel={isHighlighted(`${side}${index}`) ? hintLevel : 0}
            onPress={onPress}
          />
        </div>
      ))}
    </>
  );
}
