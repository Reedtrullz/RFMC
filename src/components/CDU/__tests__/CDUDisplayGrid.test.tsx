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

    // Character cells are rendered individually
    expect(screen.getAllByText('I').find((el) => el.getAttribute('data-semantic') === 'title')).toBeTruthy();
    expect(screen.getAllByText('D').find((el) => el.getAttribute('data-semantic') === 'title')).toBeTruthy();
  });

  it('positions segments by known grid row and column', () => {
    render(<CDUDisplayGrid grid={grid} />);

    // 'M' is at row 1, col 6 -> data-row 2, data-col 7
    const mChar = screen.getByText('M');
    expect(mChar).toHaveAttribute('data-row', '2');
    expect(mChar).toHaveAttribute('data-col', '7');
    expect(mChar.className).toContain('animate-blink');

    // 'O' is at row 1, col 7 -> data-row 2, data-col 8
    const oChar = screen.getByText('O');
    expect(oChar).toHaveAttribute('data-row', '2');
    expect(oChar).toHaveAttribute('data-col', '8');
  });
});
