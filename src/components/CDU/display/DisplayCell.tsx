import { getColorClass, type DisplaySegment } from '@shared';

interface DisplayCellProps {
  segment: DisplaySegment;
  variant: 'boeing' | 'airbus';
}

function inverseClass(segment: DisplaySegment, variant: 'boeing' | 'airbus'): string {
  if (segment.color === 'magenta') return 'bg-fuchsia-400 text-cdu-screen';
  if (segment.color === 'cyan') return 'bg-cdu-cyan text-cdu-screen';
  if (segment.color === 'white') return 'bg-white text-cdu-screen';
  if (segment.color === 'red') return 'bg-cdu-error text-cdu-screen';
  return variant === 'airbus'
    ? 'bg-cdu-amber text-cdu-screen'
    : 'bg-cdu-text text-cdu-screen';
}

export function DisplayCell({ segment, variant }: DisplayCellProps) {
  const colorClass = segment.color
    ? getColorClass(segment.color)
    : variant === 'airbus'
      ? 'text-cdu-amber'
      : 'text-cdu-text';

  return (
    <span
      className={[
        'whitespace-pre tabular-nums',
        segment.size === 'small' ? 'text-[9px]' : 'text-[11px]',
        segment.inverse ? `${inverseClass(segment, variant)} font-bold` : colorClass,
        segment.semantic === 'modified' && !segment.inverse ? 'bg-white/[0.06]' : '',
        segment.blink ? 'animate-blink' : '',
      ].join(' ')}
      style={{
        gridColumn: `${segment.col + 1} / span ${Math.max(segment.text.length, 1)}`,
      }}
      data-semantic={segment.semantic}
      data-row={segment.row + 1}
      data-col={segment.col + 1}
    >
      {segment.text}
    </span>
  );
}
