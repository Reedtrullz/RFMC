import { useFMCStore } from '../../store/useFMCStore';
import { PAGE_LINES } from '@shared';
import { DisplayLine } from './DisplayLine';

interface DisplayProps {
  variant?: 'boeing' | 'airbus';
}

export function Display({ variant = 'boeing' }: DisplayProps) {
  const displayData = useFMCStore(s => s.getDisplayData());
  const aircraft = useFMCStore(s => s.aircraft);
  const isAirbus = variant === 'airbus' || aircraft === 'AIRBUS_A320';
  const maxLines = isAirbus ? 24 : PAGE_LINES;
  const colorClass = isAirbus ? 'text-cdu-amber text-glow-amber' : 'text-cdu-text text-glow';
  const lines = displayData.lines;

  return (
    <div className={`flex flex-col px-1 py-0.5 font-cdu text-[11px] ${colorClass}`}>
      {Array.from({ length: maxLines }).map((_, i) => {
        const line = lines[i] || { text: '', leftLabel: '', rightLabel: '', inverse: false };
        return (
          <DisplayLine
            key={i}
            text={line.text}
            leftLabel={line.leftLabel}
            rightLabel={line.rightLabel}
            inverse={line.inverse}
            small={line.small}
            blinking={line.blinking}
            variant={isAirbus ? 'airbus' : 'boeing'}
          />
        );
      })}
    </div>
  );
}
