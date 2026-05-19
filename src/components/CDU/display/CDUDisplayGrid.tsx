import { buildCells, gridToPlainText, type GridDisplayData, type CellData } from '@shared';
import { memo, useMemo, type CSSProperties } from 'react';

interface CellSpanProps {
  cell: CellData;
  variant: 'boeing' | 'airbus';
}

function classNameFor(cell: CellData, variant: 'boeing' | 'airbus'): string {
  return [
    'cdu-display-cell',
    `cdu-display-cell--${cell.color ?? (variant === 'airbus' ? 'white' : 'green')}`,
    cell.inverse ? 'cdu-display-cell--inverse' : '',
    cell.size === 'small' ? 'cdu-display-cell--small' : '',
    cell.blink ? 'animate-blink' : '',
  ].join(' ');
}

function styleFor(cell: CellData): CSSProperties {
  return { gridRow: cell.row + 1, gridColumn: cell.col + 1 };
}

const CellSpan = memo(
  function CellSpan({ cell, variant }: CellSpanProps) {
    return (
      <span
        className={classNameFor(cell, variant)}
        style={styleFor(cell)}
        data-row={cell.row + 1}
        data-col={cell.col + 1}
        data-semantic={cell.semantic}
      >
        {cell.char || '\u00A0'}
      </span>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.variant === nextProps.variant &&
      prevProps.cell.row === nextProps.cell.row &&
      prevProps.cell.col === nextProps.cell.col &&
      prevProps.cell.char === nextProps.cell.char &&
      prevProps.cell.color === nextProps.cell.color &&
      prevProps.cell.size === nextProps.cell.size &&
      prevProps.cell.blink === nextProps.cell.blink &&
      prevProps.cell.inverse === nextProps.cell.inverse &&
      prevProps.cell.semantic === nextProps.cell.semantic
    );
  },
);

interface CDUDisplayGridProps {
  grid: GridDisplayData;
  variant?: 'boeing' | 'airbus';
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

export function CDUDisplayGrid({
  grid,
  variant = 'boeing',
  className = '',
  children,
  testId = 'cdu-display-grid',
}: CDUDisplayGridProps) {
  const cells = useMemo(() => buildCells(grid), [grid]);

  const style = {
    '--cdu-cols': grid.columns,
    '--cdu-rows': grid.rows,
  } as CSSProperties;

  return (
    <div className={`cdu-display-container ${className}`} data-testid={testId}>
      <div className={`cdu-display-matrix cdu-display-matrix--${variant}`} style={style} aria-hidden="true">
        {cells.map((cell) => (
          <CellSpan key={`${cell.row}-${cell.col}`} cell={cell} variant={variant} />
        ))}
        {children}
      </div>
      <pre className="sr-only" aria-live="polite" data-testid={`${testId}-text`}>
        {gridToPlainText(grid)}
      </pre>
    </div>
  );
}
