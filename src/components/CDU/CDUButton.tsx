import { AvionicsKey } from '../instruments/common/AvionicsKey';

interface CDUButtonProps {
  label: string;
  className?: string;
  variant?: 'default' | 'exec' | 'function' | 'highlight';
  disabled?: boolean;
  active?: boolean;
  onPress?: () => void;
}

export function CDUButton({ label, className = '', variant = 'default', disabled, active, onPress }: CDUButtonProps) {
  const ariaDescription = `Press ${label} key`;

  return (
    <AvionicsKey
      label={label}
      ariaLabel={ariaDescription}
      variant={variant === 'function' ? 'function' : variant === 'exec' ? 'exec' : 'boeing'}
      lit={variant === 'exec'}
      active={active || variant === 'highlight'}
      disabled={disabled}
      className={className}
      onPress={onPress || (() => {})}
    />
  );
}
