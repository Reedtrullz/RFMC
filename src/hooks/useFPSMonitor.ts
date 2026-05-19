import { useState, useEffect, useRef } from 'react';

export function useFPSMonitor(enabled: boolean = true) {
  const [fps, setFps] = useState(0);
  const [latency, setLatency] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const requestRef = useRef<number>();

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const animate = (time: number) => {
      frameCount.current++;
      if (time >= lastTime.current + 1000) {
        setFps(Math.round((frameCount.current * 1000) / (time - lastTime.current)));
        frameCount.current = 0;
        lastTime.current = time;
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [enabled]);

  // Latency tracking helper
  const recordInteraction = (startTime: number) => {
    const end = performance.now();
    setLatency(Math.round(end - startTime));
  };

  return { fps, latency, recordInteraction };
}
