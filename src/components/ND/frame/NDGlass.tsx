import { ReactNode } from 'react';

interface NDGlassProps {
  children: ReactNode;
  brightness?: number;
  scanlines?: boolean;
}

export function NDGlass({ children, brightness = 100, scanlines = false }: NDGlassProps) {
  return (
    <div 
      className="relative h-full w-full overflow-hidden"
      style={{ filter: `brightness(${brightness}%)` }}
    >
      {/* Base content */}
      {children}

      {/* CRT Scanline Overlay */}
      {scanlines && (
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%]" />
      )}

      {/* Screen Glare / Reflection */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 mix-blend-overlay" />
      
      {/* Subtle vignettes */}
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.4)]" />
    </div>
  );
}
