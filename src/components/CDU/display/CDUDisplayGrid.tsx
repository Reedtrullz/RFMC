import { buildCells, gridToPlainText, type GridDisplayData } from '@shared';
import type { CSSProperties } from 'react';

interface CDUDisplayGridProps {
  grid: GridDisplayData;
  variant?: 'boeing' | 'airbus';
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

export function CDUDisplayGrid({ 
  grid, variant = 'boeing', className = '', children, testId = 'cdu-display-grid' 
}: CDUDisplayGridProps) {
  const cells = buildCells(grid);

  const style = {
    '--cdu-cols': grid.columns,
    '--cdu-rows': grid.rows,
  } as CSSProperties;

  return (
    <div className={`cdu-display-container ${className}`} data-testid={testId}>
      <div
        className={`cdu-display-matrix cdu-display-matrix--${variant}`}
        style={style}
        aria-hidden="true"
      >
        {cells.map((cell, idx) => (
          <span
            key={`${cell.row}-${cell.col}-${idx}`}
            className={[
              'cdu-display-cell',
              `cdu-display-cell--${cell.color ?? (variant === 'airbus' ? 'white' : 'green')}`,
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
        {children}
      </div>
      <pre className="sr-only" aria-live="polite" data-testid={`${testId}-text`}>
        {gridToPlainText(grid)}
      </pre>
    </div>
  );
}
