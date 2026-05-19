interface BacklitLegendProps {
  children: string;
  tone?: 'white' | 'cyan' | 'amber' | 'green';
  className?: string;
}

const toneClass = {
  white: 'text-cdu-white/90 drop-shadow-[0_0_3px_rgba(255,255,255,0.35)]',
  cyan: 'text-cdu-cyan/90 drop-shadow-[0_0_3px_rgba(0,208,255,0.35)]',
  amber: 'text-cdu-amber/90 drop-shadow-[0_0_3px_rgba(255,176,0,0.35)]',
  green: 'text-cdu-text drop-shadow-[0_0_3px_rgba(57,255,20,0.35)]',
};

export function BacklitLegend({ children, tone = 'white', className = '' }: BacklitLegendProps) {
  return (
    <span
      className={`font-cdu font-bold leading-none ${toneClass[tone]} ${className}`}
      style={{ opacity: 'var(--cockpit-backlight, 0.9)' }}
    >
      {children}
    </span>
  );
}
