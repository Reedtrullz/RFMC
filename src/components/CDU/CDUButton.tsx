import { useCallback } from 'react';
import { useTouchFeedback } from '../../hooks/useTouchFeedback';

interface CDUButtonProps {
  label: string;
  className?: string;
  variant?: 'default' | 'exec' | 'function' | 'highlight';
  disabled?: boolean;
  active?: boolean;
  onPress?: () => void;
}

export function CDUButton({ label, className = '', variant = 'default', disabled, active, onPress }: CDUButtonProps) {
  const handlePress = useCallback(() => {
    console.log('CDUButton: handlePress called, label:', label);
    if (!disabled && onPress) onPress();
  }, [disabled, onPress]);

  const { touchHandlers } = useTouchFeedback({
    minPressDuration: 80,
    onPress: handlePress,
  });

  const base = `
    cdu-button ripple-effect
    flex items-center justify-center
    rounded font-cdu font-bold border
    transition-all duration-75
    select-none
  `;
  const size = 'min-w-[44px] min-h-[30px] px-1';

  const variants = {
    default: 'bg-cdu-bezel-light text-cdu-text/80 border-cdu-bezel-light hover:bg-cdu-bezel hover:text-cdu-text active:scale-95 active:bg-cdu-text/20',
    exec: 'bg-cdu-exec/10 text-cdu-exec border-cdu-exec/30 hover:bg-cdu-exec/20 active:scale-95 active:bg-cdu-exec/30',
    function: 'bg-cdu-bezel text-cdu-cyan/80 border-cdu-cyan/20 hover:bg-cdu-cyan/10 hover:text-cdu-cyan active:scale-95',
    highlight: 'bg-cdu-cyan/15 text-cdu-cyan border-cdu-cyan/50 animate-pulse hover:bg-cdu-cyan/25 active:scale-95',
  };

  return (
    <button
      className={`
        ${base} ${size} ${variants[variant]} ${className}
        ${active ? 'bg-cdu-text/20 !text-cdu-text border-cdu-text/50' : ''}
        ${disabled ? 'opacity-40 pointer-events-none' : ''}
      `}
      disabled={disabled}
      onClick={handlePress}
      {...touchHandlers}
    >
      {label}
    </button>
  );
}
