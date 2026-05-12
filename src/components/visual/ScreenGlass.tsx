import type { ReactNode } from 'react';

interface ScreenGlassProps {
  children: ReactNode;
  variant?: 'boeing' | 'airbus' | 'nd' | 'pfd';
  brightness?: number;
  className?: string;
}

export function ScreenGlass({ children, variant = 'boeing', brightness = 100, className = '' }: ScreenGlassProps) {
  return (
    <div
      className={`screen-glass screen-glass--${variant} ${className}`}
      style={{ '--screen-brightness': `${brightness}%` } as React.CSSProperties}
    >
      <div className="screen-glass__content">
        {children}
      </div>
      <div className="screen-glass__scanlines" />
      <div className="screen-glass__reflection" />
      <div className="screen-glass__vignette" />
    </div>
  );
}
