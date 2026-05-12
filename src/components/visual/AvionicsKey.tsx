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
  disabled
}: AvionicsKeyProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={[
        'avionics-key',
        `avionics-key--${variant}`,
        active ? 'avionics-key--active' : '',
        highlighted ? 'avionics-key--highlighted' : '',
        shape ? `avionics-key--${shape}` : '',
        lit ? 'avionics-key--lit' : '',
        className,
      ].join(' ')}
      onClick={onPress}
    >
      <span className="avionics-key__legend">{label}</span>
      {subLabel && <span className="avionics-key__sublabel">{subLabel}</span>}
    </button>
  );
}
