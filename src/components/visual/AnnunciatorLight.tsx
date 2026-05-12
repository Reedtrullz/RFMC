interface AnnunciatorLightProps {
  label: string;
  active?: boolean;
  tone?: 'green' | 'amber';
  className?: string;
}

export function AnnunciatorLight({ label, active, tone = 'green', className = '' }: AnnunciatorLightProps) {
  const activeClass = tone === 'amber'
    ? 'bg-cdu-amber/25 text-cdu-amber border-cdu-amber/60 shadow-[0_0_10px_rgba(255,176,0,0.35)]'
    : 'bg-cdu-exec/20 text-cdu-exec border-cdu-exec/60 shadow-[0_0_10px_rgba(0,255,0,0.35)]';

  return (
    <div
      className={[
        'flex h-5 min-w-[42px] items-center justify-center rounded-[3px] border px-1',
        'font-cdu text-[8px] font-bold tracking-[0.12em]',
        active ? activeClass : 'border-black/60 bg-black/40 text-cdu-white/25',
        className,
      ].join(' ')}
      aria-label={`${label} annunciator ${active ? 'lit' : 'unlit'}`}
    >
      {label}
    </div>
  );
}
