import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DisplayLine } from '../DisplayLine';

describe('DisplayLine', () => {
  it('exposes display semantics for visual measurement tooling', () => {
    render(<DisplayLine text="IDENT" color="cyan" semantic="title" />);

    expect(screen.getByText(/IDENT/).parentElement).toHaveAttribute('data-semantic', 'title');
  });
});
