import { getColorClass, type DisplayColor } from '@shared';

interface DisplayLineProps {
  text: string;
  leftLabel?: string;
  rightLabel?: string;
  inverse?: boolean;
  small?: boolean;
  blinking?: boolean;
  variant?: 'boeing' | 'airbus';
  color?: DisplayColor;
  semantic?: string;
}

export function DisplayLine({
  text,
  leftLabel,
  rightLabel,
  inverse,
  small,
  blinking,
  variant = 'boeing',
  color,
  semantic,
}: DisplayLineProps) {
  const maxWidth = variant === 'airbus' ? 24 : 24;
  const paddedText = text.padEnd(maxWidth, ' ');
  const isAirbus = variant === 'airbus';
  const mainColor = color ? getColorClass(color) : isAirbus ? 'text-cdu-amber' : 'text-cdu-text';
  const dimColor = isAirbus ? 'text-cdu-amber/60' : 'text-cdu-text-dim';
  const inverseBg =
    color === 'magenta'
      ? 'bg-fuchsia-400'
      : color === 'cyan'
        ? 'bg-cdu-cyan'
        : color === 'white'
          ? 'bg-white'
          : color === 'red'
            ? 'bg-cdu-error'
            : isAirbus
              ? 'bg-cdu-amber'
              : 'bg-cdu-text';

  const isModified = semantic === 'modified';

  return (
    <div
      className={`
        flex items-center
        text-[11px] leading-[1.15]
        h-[1.3em]
        whitespace-pre
        ${small ? 'text-[9px]' : ''}
        ${inverse ? `${inverseBg} text-cdu-screen font-bold` : isModified ? `${mainColor} bg-white/[0.06]` : mainColor}
        ${blinking ? 'animate-blink' : ''}
      `}
      data-semantic={semantic}
    >
      {leftLabel && <span className={`text-[8px] ${dimColor} mr-0.5`}>{leftLabel}</span>}
      <span className="flex-1">{paddedText}</span>
      {rightLabel && <span className={`text-[8px] ${dimColor} ml-0.5`}>{rightLabel}</span>}
    </div>
  );
}
