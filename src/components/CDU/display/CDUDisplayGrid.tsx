import { DisplayCell } from './DisplayCell';
import type { DisplaySegment, GridDisplayData } from '@shared';

interface CDUDisplayGridProps {
  grid: GridDisplayData;
  variant?: 'boeing' | 'airbus';
  className?: string;
}

function rowSegments(segments: DisplaySegment[], row: number): DisplaySegment[] {
  return segments.filter(segment => segment.row === row);
}

export function CDUDisplayGrid({ grid, variant = 'boeing', className = '' }: CDUDisplayGridProps) {
  const glowClass = variant === 'airbus' ? 'text-glow-amber' : 'text-glow';

  return (
    <div
      className={`bg-cdu-screen font-cdu ${glowClass} px-1 py-0.5 ${className}`}
      data-testid="cdu-display-grid"
      style={{
        display: 'grid',
        gridTemplateRows: `repeat(${grid.rows}, minmax(0, 1fr))`,
        rowGap: 0,
      }}
    >
      {Array.from({ length: grid.rows }).map((_, row) => (
        <div
          key={row}
          className="items-center leading-[1.15]"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${grid.columns}, 1ch)`,
            height: '1.3em',
          }}
          data-display-row={row + 1}
        >
          {rowSegments(grid.segments, row).map((segment, index) => (
            <DisplayCell key={`${row}-${index}-${segment.col}`} segment={segment} variant={variant} />
          ))}
        </div>
      ))}
    </div>
  );
}
