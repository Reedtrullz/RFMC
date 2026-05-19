import React from 'react';
import { useFPSMonitor } from '../../hooks/useFPSMonitor';

export function PerformanceOverlay({ enabled }: { enabled: boolean }) {
  const { fps, latency } = useFPSMonitor(enabled);

  if (!enabled) return null;

  return (
    <div className="fixed top-2 right-2 z-[9999] pointer-events-none font-mono text-[10px] bg-black/60 text-white p-1.5 rounded border border-white/10 backdrop-blur-sm flex flex-col gap-0.5">
      <div className="flex justify-between gap-4">
        <span className="opacity-50 uppercase">FPS</span>
        <span className={fps < 50 ? 'text-red-400' : 'text-green-400'}>{fps}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="opacity-50 uppercase">LATENCY</span>
        <span>{latency}ms</span>
      </div>
    </div>
  );
}
