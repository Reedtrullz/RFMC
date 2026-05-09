import { useState, useEffect } from 'react';

export function useKioskMode(): boolean {
  const [isKiosk, setIsKiosk] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    setIsKiosk(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsKiosk(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isKiosk;
}
