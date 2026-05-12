import { buildCells, type GridDisplayData } from '@shared';

interface CDUDisplayGridProps {
  grid: GridDisplayData;
  variant?: 'boeing' | 'airbus';
  className?: string;
}

export function CDUDisplayGrid({ grid, variant = 'boeing', className = '' }: CDUDisplayGridProps) {
  const cells = buildCells(grid);

  return (
    <div
      className={`cdu-display-matrix cdu-display-matrix--${variant} ${className}`}
      data-testid="cdu-display-grid"
    >
      {cells.map((cell, idx) => (
        <span
          key={`${cell.row}-${cell.col}-${idx}`}
          className={[
            'cdu-display-cell',
            `cdu-display-cell--${cell.color ?? (variant === 'airbus' ? 'amber' : 'text')}`,
            cell.inverse ? 'cdu-display-cell--inverse' : '',
            cell.size === 'small' ? 'cdu-display-cell--small' : '',
            cell.blink ? 'animate-blink' : '',
          ].join(' ')}
          style={{
            gridRow: cell.row + 1,
            gridColumn: cell.col + 1,
          }}
          data-row={cell.row + 1}
          data-col={cell.col + 1}
          data-semantic={cell.semantic}
        >
          {cell.char || '\u00A0'}
        </span>
      ))}
    </div>
  );
}
