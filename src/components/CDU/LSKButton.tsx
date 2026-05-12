import { AvionicsKey } from '../visual/AvionicsKey';

interface LSKButtonProps {
  side: 'L' | 'R';
  index: number;
  label?: string;
  disabled?: boolean;
  active?: boolean;
  highlighted?: boolean;
  hintLevel?: number;
  onPress?: (side: 'L' | 'R', index: number) => void;
}

export function LSKButton({ side, index, label, disabled, active, highlighted, hintLevel, onPress }: LSKButtonProps) {
  const displayLabel = label || (side === 'L' ? '◄' : '►');

  return (
    <AvionicsKey
      label={displayLabel}
      ariaLabel={`LSK ${side}${index}`}
      variant="lsk"
      active={active || highlighted}
      highlighted={highlighted}
      hintLevel={hintLevel}
      disabled={disabled}
      className="h-full w-full"
      onPress={() => {
        if (!disabled && onPress) onPress(side, index);
      }}
    />
  );
}
