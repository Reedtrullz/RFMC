import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWebSocket } from '../useWebSocket';

const webSocketClientMock = vi.hoisted(() => ({
  connect: vi.fn(),
  disconnect: vi.fn(),
  getUrl: vi.fn(() => 'ws://localhost:8080'),
  send: vi.fn(),
  subscribe: vi.fn(() => vi.fn()),
}));

vi.mock('../../services/WebSocketClient', () => ({
  webSocketClient: webSocketClientMock,
}));

function WebSocketHarness({ configuredUrl }: { configuredUrl?: string }) {
  const { connect } = useWebSocket({ autoConnect: false, url: configuredUrl });

  return (
    <>
      <button type="button" onClick={() => connect()}>
        connect configured
      </button>
      <button type="button" onClick={() => connect('ws://typed-host:9090')}>
        connect typed
      </button>
    </>
  );
}

describe('useWebSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the configured URL by default and a per-call URL when supplied', () => {
    render(<WebSocketHarness configuredUrl="ws://configured-host:8080" />);

    fireEvent.click(screen.getByRole('button', { name: 'connect configured' }));
    expect(webSocketClientMock.connect).toHaveBeenLastCalledWith('ws://configured-host:8080');

    fireEvent.click(screen.getByRole('button', { name: 'connect typed' }));
    expect(webSocketClientMock.connect).toHaveBeenLastCalledWith('ws://typed-host:9090');
  });
});
