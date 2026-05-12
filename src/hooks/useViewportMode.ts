import { useState, useEffect } from 'react';

export type ViewportMode = 'mobile' | 'tablet' | 'desktop';

export function useViewportMode() {
  const [mode, setMode] = useState<ViewportMode>('desktop');

  useEffect(() => {
    const checkMode = () => {
      const width = window.innerWidth;
      if (width < 768) setMode('mobile');
      else if (width < 1200) setMode('tablet');
      else setMode('desktop');
    };

    checkMode();
    window.addEventListener('resize', checkMode);
    return () => window.removeEventListener('resize', checkMode);
  }, []);

  return mode;
}
