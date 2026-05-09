import { useCallback } from 'react';
import { useTouchFeedback } from '../../hooks/useTouchFeedback';

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
        w-full h-full
        px-1
        rounded-sm
        font-cdu font-bold
        text-[10px]
        transition-all duration-75
        select-none
        ${highlighted
          ? 'bg-cdu-cyan/15 text-cdu-cyan border border-cdu-cyan/40 animate-pulse'
          : disabled
            ? 'text-cdu-text/20 opacity-40 pointer-events-none'
            : 'bg-cdu-bezel-light text-cdu-text/70 hover:text-cdu-text hover:bg-cdu-bezel active:scale-95 active:bg-cdu-text/20 border border-cdu-bezel'
        }
      `}
      disabled={disabled && !highlighted}
      onClick={handlePress}
      aria-label={`LSK ${side}${index}`}
      {...touchHandlers}
    >
      {displayLabel}
    </button>
  );
}
