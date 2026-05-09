import { useCallback } from 'react';
import { useTouchFeedback } from '../../hooks/useTouchFeedback';

interface LSKButtonProps {
  side: 'L' | 'R';
  index: number;
  label?: string;
  disabled?: boolean;
  onPress?: (side: 'L' | 'R', index: number) => void;
}

export function LSKButton({ side, index, label, disabled, onPress }: LSKButtonProps) {
  const displayLabel = label || (side === 'L' ? '◄' : '►');

  const handlePress = useCallback(() => {
    if (!disabled && onPress) onPress(side, index);
  }, [disabled, onPress, side, index]);

  const { touchHandlers } = useTouchFeedback({
    minPressDuration: 80,
    onPress: handlePress,
  });

  return (
    <button
      className={`
        cdu-button ripple-effect
        flex items-center justify-center
        min-w-[32px] min-h-[28px]
        h-[1.45em]
        px-1
        rounded-sm
        font-cdu font-bold
        text-[9px]
        bg-cdu-bezel-light
        border border-cdu-bezel
        transition-all duration-75
        select-none
        ${disabled 
          ? 'text-cdu-text/20 opacity-40 pointer-events-none' 
          : 'text-cdu-text/70 hover:text-cdu-text hover:bg-cdu-bezel active:scale-95 active:bg-cdu-text/20'
        }
      `}
      disabled={disabled}
      aria-label={`LSK ${side}${index}`}
      {...touchHandlers}
    >
      {displayLabel}
    </button>
  );
}
