import { AvionicsKey } from '../visual/AvionicsKey';

interface LSKButtonProps {
  side: 'L' | 'R';
  index: number;
  label?: string;
  disabled?: boolean;
  highlighted?: boolean;
  onPress?: (side: 'L' | 'R', index: number) => void;
}

export function LSKButton({ side, index, label, disabled, highlighted, onPress }: LSKButtonProps) {
  const displayLabel = label || (side === 'L' ? '◄' : '►');

  return (
    <AvionicsKey
      label={displayLabel}
      shape="lsk"
      tone="green"
      highlighted={highlighted}
      disabled={disabled && !highlighted}
      className="h-full w-full"
      ariaLabel={`LSK ${side}${index}`}
      onPress={() => {
        if (!disabled && onPress) onPress(side, index);
      }}
    />
  );
}
