import { useCallback } from 'react';
import { useTouchFeedback } from '../../hooks/useTouchFeedback';
import { BacklitLegend } from './BacklitLegend';

export type AvionicsKeyShape = 'alpha' | 'numeric' | 'function' | 'lsk' | 'exec' | 'wide';
export type AvionicsKeyTone = 'white' | 'cyan' | 'amber' | 'green';

interface AvionicsKeyProps {
  label: string;
  shape?: AvionicsKeyShape;
  tone?: AvionicsKeyTone;
  disabled?: boolean;
  lit?: boolean;
  highlighted?: boolean;
  active?: boolean;
  className?: string;
  ariaLabel?: string;
  onPress?: () => void;
}

const shapeClass: Record<AvionicsKeyShape, string> = {
  alpha: 'min-w-[44px] min-h-[44px] px-2 text-sm',
  numeric: 'min-w-[44px] min-h-[44px] px-2 text-sm',
  function: 'min-w-[44px] min-h-[42px] px-1 text-[10px]',
  lsk: 'min-w-[44px] min-h-[44px] px-1 text-[10px]',
  exec: 'min-w-[64px] min-h-[44px] px-2 text-xs',
  wide: 'min-w-[72px] min-h-[44px] px-2 text-xs',
};

export function AvionicsKey({
  label,
  shape = 'alpha',
  tone = 'white',
  disabled,
  lit,
  highlighted,
  active,
  className = '',
  ariaLabel,
  onPress,
}: AvionicsKeyProps) {
  const handlePress = useCallback(() => {
    if (!disabled && onPress) onPress();
  }, [disabled, onPress]);

  const { touchHandlers } = useTouchFeedback({
    minPressDuration: 80,
    onPress: handlePress,
  });

  return (
    <button
      type="button"
      className={[
        'cdu-button group relative isolate flex items-center justify-center overflow-hidden',
        'rounded-[4px] border border-black/70 bg-[#262626]',
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-4px_0_rgba(0,0,0,0.42),0_3px_4px_rgba(0,0,0,0.55)]',
        'transition-[transform,box-shadow,background-color,border-color] duration-100 ease-out',
        'select-none touch-manipulation',
        'active:translate-y-[2px] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(0,0,0,0.5),0_1px_2px_rgba(0,0,0,0.5)]',
        shapeClass[shape],
        highlighted ? 'border-cdu-cyan/60 bg-[#20343a] animate-pulse' : '',
        lit ? 'border-cdu-exec/70 bg-[#173117]' : '',
        active ? 'border-cdu-white/60 bg-[#333]' : '',
        disabled ? 'opacity-40 pointer-events-none' : '',
        className,
      ].join(' ')}
      disabled={disabled}
      onClick={handlePress}
      aria-label={ariaLabel}
      {...touchHandlers}
    >
      <span className="pointer-events-none absolute inset-x-1 top-1 h-1/3 rounded-[3px] bg-white/[0.05]" />
      <BacklitLegend tone={lit ? 'green' : highlighted ? 'cyan' : tone}>
        {label}
      </BacklitLegend>
    </button>
  );
}
