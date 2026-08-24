import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useWakeLock } from '../useWakeLock';

function WakeLockHarness({ enabled = true }: { enabled?: boolean }) {
  const { isActive, isSupported } = useWakeLock(enabled);
  return <div data-testid="wake-lock-state" data-active={String(isActive)} data-supported={String(isSupported)} />;
}

function createWakeLockSentinel(): WakeLockSentinel {
  let released = false;
  const sentinel = new EventTarget() as WakeLockSentinel;

  Object.defineProperties(sentinel, {
    onrelease: { configurable: true, writable: true, value: null },
    released: { configurable: true, get: () => released },
    type: { configurable: true, get: () => 'screen' as WakeLockType },
    release: {
      configurable: true,
      value: vi.fn(async () => {
        if (released) return;
        released = true;
        sentinel.dispatchEvent(new Event('release'));
      }),
    },
  });

  return sentinel;
}

function installWakeLock(...sentinels: WakeLockSentinel[]) {
  const request = vi.fn(async () => {
    const sentinel = sentinels.shift();
    if (!sentinel) throw new Error('No test wake lock sentinel available');
    return sentinel;
  });

  Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request } });
  return request;
}

let visibilityState: DocumentVisibilityState = 'visible';
const originalWakeLockDescriptor = Object.getOwnPropertyDescriptor(navigator, 'wakeLock');
const originalVisibilityDescriptor = Object.getOwnPropertyDescriptor(document, 'visibilityState');

function setVisibility(state: DocumentVisibilityState) {
  visibilityState = state;
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => visibilityState });
}

afterEach(() => {
  vi.restoreAllMocks();

  if (originalWakeLockDescriptor) {
    Object.defineProperty(navigator, 'wakeLock', originalWakeLockDescriptor);
  } else {
    delete (navigator as unknown as { wakeLock?: WakeLock }).wakeLock;
  }

  if (originalVisibilityDescriptor) {
    Object.defineProperty(document, 'visibilityState', originalVisibilityDescriptor);
  } else {
    delete (document as unknown as { visibilityState?: DocumentVisibilityState }).visibilityState;
  }

  visibilityState = 'visible';
});

describe('useWakeLock', () => {
  it('keeps one acquired sentinel without state-driven release churn', async () => {
    setVisibility('visible');
    const sentinel = createWakeLockSentinel();
    const request = installWakeLock(sentinel);

    render(<WakeLockHarness />);
    await waitFor(() => expect(screen.getByTestId('wake-lock-state')).toHaveAttribute('data-active', 'true'));

    expect(screen.getByTestId('wake-lock-state')).toHaveAttribute('data-supported', 'true');
    expect(request).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledWith('screen');
    expect(vi.mocked(sentinel.release)).not.toHaveBeenCalled();
  });

  it('releases on hidden visibility and reacquires only while enabled', async () => {
    setVisibility('visible');
    const firstSentinel = createWakeLockSentinel();
    const secondSentinel = createWakeLockSentinel();
    const request = installWakeLock(firstSentinel, secondSentinel);
    const { rerender } = render(<WakeLockHarness enabled />);

    await waitFor(() => expect(screen.getByTestId('wake-lock-state')).toHaveAttribute('data-active', 'true'));
    setVisibility('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    await waitFor(() => expect(screen.getByTestId('wake-lock-state')).toHaveAttribute('data-active', 'false'));
    expect(vi.mocked(firstSentinel.release)).toHaveBeenCalledTimes(1);

    setVisibility('visible');
    document.dispatchEvent(new Event('visibilitychange'));
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.getByTestId('wake-lock-state')).toHaveAttribute('data-active', 'true'));

    rerender(<WakeLockHarness enabled={false} />);
    await waitFor(() => expect(screen.getByTestId('wake-lock-state')).toHaveAttribute('data-active', 'false'));
    expect(vi.mocked(secondSentinel.release)).toHaveBeenCalledTimes(1);

    document.dispatchEvent(new Event('visibilitychange'));
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('releases an in-flight acquisition that resolves after disable', async () => {
    setVisibility('visible');
    const sentinel = createWakeLockSentinel();
    let resolveRequest: ((value: WakeLockSentinel) => void) | undefined;
    const request = vi.fn(
      () =>
        new Promise<WakeLockSentinel>((resolve) => {
          resolveRequest = resolve;
        }),
    );
    Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request } });

    const { rerender } = render(<WakeLockHarness enabled />);
    expect(request).toHaveBeenCalledTimes(1);
    rerender(<WakeLockHarness enabled={false} />);
    resolveRequest?.(sentinel);

    await waitFor(() => expect(vi.mocked(sentinel.release)).toHaveBeenCalledTimes(1));
    expect(screen.getByTestId('wake-lock-state')).toHaveAttribute('data-active', 'false');
  });
});
