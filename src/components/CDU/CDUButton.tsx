import { AvionicsKey } from '../visual/AvionicsKey';

interface CDUButtonProps {
  label: string;
  className?: string;
  variant?: 'default' | 'exec' | 'function' | 'highlight';
  disabled?: boolean;
  active?: boolean;
  onPress?: () => void;
}

export function CDUButton({ label, className = '', variant = 'default', disabled, active, onPress }: CDUButtonProps) {
  return (
    <AvionicsKey
      label={label}
      shape={variant === 'function' ? 'function' : variant === 'exec' ? 'exec' : 'alpha'}
      tone={variant === 'function' || variant === 'highlight' ? 'cyan' : 'white'}
      lit={variant === 'exec'}
      highlighted={variant === 'highlight'}
      active={active}
      disabled={disabled}
      className={className}
      onPress={onPress}
    />
  );
}
