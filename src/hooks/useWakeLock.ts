import { useState, useEffect, useCallback, useRef } from 'react';
import { devLog, devError } from '@shared';

function hasWakeLockSupport(): boolean {
  return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
}

function isDocumentVisible(): boolean {
  return typeof document === 'undefined' || document.visibilityState === 'visible';
}

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export function useWakeLock(enabled: boolean = true) {
  const [isSupported] = useState(hasWakeLockSupport);
  const [isActive, setIsActive] = useState(false);
  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  const enabledRef = useRef(enabled);
  const requestSequenceRef = useRef(0);
  const isRequestingRef = useRef(false);

  const releaseWakeLock = useCallback(async () => {
    requestSequenceRef.current += 1;
    isRequestingRef.current = false;

    const sentinel = sentinelRef.current;
    sentinelRef.current = null;

    if (!sentinel) {
      setIsActive(false);
      return;
    }

    try {
      if (!sentinel.released) {
        await sentinel.release();
      }
    } catch (err) {
      devError(`[WakeLock] Failed to release: ${getErrorMessage(err)}`);
    } finally {
      setIsActive(false);
    }
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (!hasWakeLockSupport() || !enabledRef.current || !isDocumentVisible()) return;
    if (sentinelRef.current || isRequestingRef.current) return;

    const requestSequence = requestSequenceRef.current + 1;
    requestSequenceRef.current = requestSequence;
    isRequestingRef.current = true;

    try {
      const lock = await navigator.wakeLock.request('screen');

      if (requestSequence !== requestSequenceRef.current || !enabledRef.current || !isDocumentVisible()) {
        await lock.release();
        return;
      }

      sentinelRef.current = lock;
      setIsActive(true);
      devLog('[WakeLock] Screen lock acquired');

      lock.addEventListener(
        'release',
        () => {
          if (sentinelRef.current === lock) {
            sentinelRef.current = null;
            setIsActive(false);
          }
          devLog('[WakeLock] Screen lock released');
        },
        { once: true },
      );
    } catch (err) {
      if (requestSequence === requestSequenceRef.current) {
        setIsActive(false);
      }
      devError(`[WakeLock] Failed to acquire: ${getErrorMessage(err)}`);
    } finally {
      if (requestSequence === requestSequenceRef.current) {
        isRequestingRef.current = false;
      }
    }
  }, []);

  useEffect(() => {
    enabledRef.current = enabled;

    if (enabled) {
      void requestWakeLock();
    } else {
      void releaseWakeLock();
    }
  }, [enabled, requestWakeLock, releaseWakeLock]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (enabledRef.current) {
          void requestWakeLock();
        }
      } else {
        void releaseWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      enabledRef.current = false;
      void releaseWakeLock();
    };
  }, [requestWakeLock, releaseWakeLock]);

  return { isSupported, isActive, requestWakeLock, releaseWakeLock };
}
