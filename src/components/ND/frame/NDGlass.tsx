import { ReactNode } from 'react';

interface NDGlassProps {
  children: ReactNode;
  brightness?: number;
  scanlines?: boolean;
}

export function NDGlass({ children, brightness = 100, scanlines = true }: NDGlassProps) {
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-[inherit] bg-black"
      style={{ filter: `brightness(${brightness}%)` }}
    >
      {/* Base content */}
      <div className="h-full w-full">{children}</div>

      {/* Spherical Curvature Overlay (Subtle Glass Bulge) */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05)_0%,transparent_70%)] opacity-30" />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.6)]" />

      {/* CRT Scanline & Phosphor Mask (High-Fidelity) */}
      {scanlines && (
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay">
          {/* Horizontal Scanlines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_3px]" />
          {/* Vertical Phosphor Mask */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,0,0,0.1),rgba(0,255,0,0.05),rgba(0,0,255,0.1))] bg-[length:4px_100%]" />
        </div>
      )}

      {/* Surface Reflection (Anti-Glare Coating) */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.05] mix-blend-screen" />
    </div>
  );
}
