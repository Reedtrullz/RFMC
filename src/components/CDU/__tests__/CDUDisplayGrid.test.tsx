import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CDUDisplayGrid } from '../display/CDUDisplayGrid';
import type { GridDisplayData } from '@shared';

describe('CDUDisplayGrid', () => {
  const grid: GridDisplayData = {
    rows: 14,
    columns: 24,
    segments: [
      {
        row: 0,
        col: 0,
        text: 'IDENT                   ',
        color: 'cyan',
        semantic: 'title',
      },
      {
        row: 1,
        col: 6,
        text: 'MOD',
        color: 'magenta',
        inverse: true,
        blink: true,
        semantic: 'modified',
      },
    ],
    scratchpad: [],
  };

  it('renders fixed display rows with semantic measurement hooks', () => {
    render(<CDUDisplayGrid grid={grid} />);

    expect(screen.getByTestId('cdu-display-grid').querySelectorAll('[data-display-row]')).toHaveLength(14);
    expect(screen.getByText(/IDENT/)).toHaveAttribute('data-semantic', 'title');
  });

  it('positions segments by known grid row and column', () => {
    render(<CDUDisplayGrid grid={grid} />);

    const modified = screen.getByText('MOD');
    expect(modified).toHaveAttribute('data-row', '2');
    expect(modified).toHaveAttribute('data-col', '7');
    expect(modified.className).toContain('animate-blink');
  });
});
