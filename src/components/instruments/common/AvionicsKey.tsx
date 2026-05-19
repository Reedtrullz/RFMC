import { tactile } from '../../../utils/tactile';
import { devLog } from '@shared';

interface AvionicsKeyProps {
  label: string;
  subLabel?: string;
  active?: boolean;
  lit?: boolean;
  highlighted?: boolean;
  tone?: string;
  shape?: string;
  variant?: 'boeing' | 'airbus' | 'function' | 'exec' | 'lsk';
  onPress: () => void;
  className?: string;
  disabled?: boolean;
  hintLevel?: number;
  ariaLabel?: string;
}

export function AvionicsKey({
  label,
  subLabel,
  active,
  lit,
  highlighted,
  shape,
  variant = 'boeing',
  onPress,
  className = '',
  disabled,
  hintLevel,
  ariaLabel,
}: AvionicsKeyProps) {
  return (
    <button
      type="button"
      data-testid={`key-${variant}-${label}`}
      aria-label={ariaLabel}
      disabled={disabled}
      className={[
        'cdu-button',
        'avionics-key',
        `avionics-key--${variant}`,
        active ? 'avionics-key--active' : '',
        highlighted ? 'avionics-key--highlighted' : '',
        hintLevel ? `avionics-key--hint-${hintLevel}` : '',
        shape ? `avionics-key--${shape}` : '',
        lit ? 'avionics-key--lit' : '',
        className,
      ].join(' ')}
      onClick={() => {
        if (!disabled) {
          tactile.feedback();
          onPress();
        } else {
          devLog(`[FMC] Key clicked but DISABLED: ${label}`);
        }
      }}
    >
      <span className="avionics-key__face">
        <span className="avionics-key__legend">{label}</span>
        {subLabel && <span className="avionics-key__sublabel">{subLabel}</span>}
      </span>
    </button>
  );
}
