import { useState, useEffect, useCallback } from 'react';
import { devLog, devError } from '@shared';

export function useWakeLock(enabled: boolean = true) {
  const [isSupported, setIsSupported] = useState('wakeLock' in navigator);
  const [isActive, setIsActive] = useState(false);
  const [sentinel, setSentinel] = useState<any>(null);

  const requestWakeLock = useCallback(async () => {
    if (!('wakeLock' in navigator)) return;

    try {
      const lock = await (navigator as any).wakeLock.request('screen');
      setSentinel(lock);
      setIsActive(true);
      devLog('[WakeLock] Screen lock acquired');

      lock.addEventListener('release', () => {
        setIsActive(false);
        devLog('[WakeLock] Screen lock released');
      });
    } catch (err: any) {
      setIsActive(false);
      devError(`[WakeLock] Failed to acquire: ${err.message}`);
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (sentinel) {
      try {
        await sentinel.release();
      } catch (err: any) {
        devError(`[WakeLock] Failed to release: ${err.message}`);
      }
      setSentinel(null);
    }
  }, [sentinel]);

  useEffect(() => {
    if (enabled) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    // Re-acquire if visibility changes (browser requirement)
    const handleVisibilityChange = () => {
      if (enabled && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, [enabled, requestWakeLock, releaseWakeLock]);

  return { isSupported, isActive };
}
