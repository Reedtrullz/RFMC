import type { ReactNode } from 'react';

interface ScreenGlassProps {
  children: ReactNode;
  brightness?: number;
  className?: string;
}

export function ScreenGlass({ children, brightness = 100, className = '' }: ScreenGlassProps) {
  return (
    <div
      className={[
        'relative overflow-hidden rounded-[3px] border-2 border-black/80 bg-[#0a0a0a]',
        'shadow-[inset_0_0_18px_rgba(0,0,0,0.95),0_1px_0_rgba(255,255,255,0.08)]',
        className,
      ].join(' ')}
      style={{ filter: `brightness(${brightness}%)` }}
    >
      {children}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(255,255,255,0.08),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-white/[0.03]" />
    </div>
  );
}
