import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PwaUpdatePrompt } from '../PwaUpdatePrompt';

describe('PwaUpdatePrompt', () => {
  it('renders nothing when no offline or update state is active', () => {
    const { container } = render(
      <PwaUpdatePrompt offlineReady={false} needRefresh={false} onClose={vi.fn()} onReload={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('announces offline-ready state without a reload action', () => {
    render(<PwaUpdatePrompt offlineReady needRefresh={false} onClose={vi.fn()} onReload={vi.fn()} />);

    expect(screen.getByRole('status')).toHaveTextContent('App successfully configured for offline flight operations.');
    expect(screen.queryByRole('button', { name: 'Update Now' })).not.toBeInTheDocument();
  });

  it('announces refresh state and runs reload action', () => {
    const onReload = vi.fn();
    render(<PwaUpdatePrompt offlineReady={false} needRefresh onClose={vi.fn()} onReload={onReload} />);

    expect(screen.getByRole('status')).toHaveTextContent('New database update is available for VirtualCDU.');
    fireEvent.click(screen.getByRole('button', { name: 'Update Now' }));
    expect(onReload).toHaveBeenCalledTimes(1);
  });

  it('runs close action from either prompt state', () => {
    const onClose = vi.fn();
    render(<PwaUpdatePrompt offlineReady needRefresh={false} onClose={onClose} onReload={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
