import { PAGE_WIDTH } from '@shared';

interface DisplayLineProps {
  text: string;
  leftLabel?: string;
  rightLabel?: string;
  inverse?: boolean;
  small?: boolean;
  blinking?: boolean;
}

export function DisplayLine({ text, leftLabel, rightLabel, inverse, small, blinking }: DisplayLineProps) {
  const paddedText = text.padEnd(PAGE_WIDTH, ' ');
  
  return (
    <div className={`
      flex items-center
      text-[13px] leading-[1.15]
      h-[1.3em]
      whitespace-pre
      ${small ? 'text-[10px]' : ''}
      ${inverse 
        ? 'bg-cdu-text text-cdu-screen font-bold' 
        : 'text-cdu-text text-glow'
      }
      ${blinking ? 'animate-blink' : ''}
    `}>
      {leftLabel && (
        <span className="text-[9px] text-cdu-text-dim mr-0.5">{leftLabel}</span>
      )}
      <span className="flex-1">{paddedText}</span>
      {rightLabel && (
        <span className="text-[9px] text-cdu-text-dim ml-0.5">{rightLabel}</span>
      )}
    </div>
  );
}
