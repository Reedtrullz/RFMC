import { useFMCStore } from '../../store/useFMCStore';
import { PAGE_LINES, PAGE_WIDTH } from '@shared';
import { DisplayLine } from './DisplayLine';

export function Display() {
  const displayData = useFMCStore(s => s.getDisplayData());
  const lines = displayData.lines;

  return (
    <div className="flex flex-col px-1 py-0.5 font-cdu">
      {Array.from({ length: PAGE_LINES }).map((_, i) => {
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
          />
        );
      })}
    </div>
  );
}
