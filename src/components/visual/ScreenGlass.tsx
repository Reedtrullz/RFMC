import { ReactNode } from 'react';

interface ScreenGlassProps {
  children: ReactNode;
  variant?: 'boeing-lcd' | 'airbus-crt' | 'generic';
  brightness?: number;
  reflection?: boolean;
  scanlines?: boolean;
  className?: string;
}

export function ScreenGlass({ 
  children, 
  variant = 'generic', 
  brightness = 1, 
  reflection = true, 
  scanlines = true,
  className = ''
}: ScreenGlassProps) {
  return (
    <div className={`relative overflow-hidden bg-[#020505] shadow-[inset_0_0_40px_rgba(0,0,0,0.9)] ${className}`}>
      {/* The actual content */}
      <div style={{ opacity: brightness }}>
        {children}
      </div>

      {/* Phosphor/LCD Glow */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-20" />
      
      {/* Scanlines */}
      {scanlines && (
        <div className="pointer-events-none absolute inset-0 z-20 opacity-[0.03]" 
             style={{ background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)', backgroundSize: '100% 2px' }} />
      )}
      
      {/* Glare/Reflection */}
      {reflection && (
        <div className="pointer-events-none absolute inset-0 z-30 opacity-[0.08]" 
             style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.1) 100%)' }} />
      )}
      
      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]" />
    </div>
  );
}
