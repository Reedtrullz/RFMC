import { AvionicsKey } from '../visual/AvionicsKey';

interface LSKButtonProps {
  side: 'L' | 'R';
  index: number;
  label?: string;
  disabled?: boolean;
  active?: boolean;
  highlighted?: boolean;
  onPress?: (side: 'L' | 'R', index: number) => void;
}

export function LSKButton({ side, index, label, disabled, active, highlighted, onPress }: LSKButtonProps) {
  const displayLabel = label || (side === 'L' ? '◄' : '►');

  return (
    <AvionicsKey
      label={displayLabel}
      variant="lsk"
      active={active || highlighted}
      disabled={disabled}
      className="h-full w-full"
      onPress={() => {
        if (!disabled && onPress) onPress(side, index);
      }}
    />
  );
}
