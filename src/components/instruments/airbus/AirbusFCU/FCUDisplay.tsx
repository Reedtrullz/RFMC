interface FCUDisplayProps {
  value: number;
  label?: string;
  managed?: boolean;
  highlighted?: boolean;
}

export function FCUDisplay({ value, label, managed, highlighted = false }: FCUDisplayProps) {
  return (
    <div
      className={`relative flex h-11 w-28 items-center justify-center overflow-hidden rounded-[2px] border border-[#5e7477]/55 bg-[#03090a] font-mono shadow-[inset_0_2px_12px_rgba(0,0,0,0.95),0_1px_0_rgba(255,255,255,0.08)] ${highlighted ? 'highlighted-airbus' : ''}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#a8ffff]/10 via-transparent to-black/35" />
      <div className="pointer-events-none absolute inset-x-1 top-1 h-px bg-white/15" />
      <span className="text-[24px] font-black tabular-nums text-[#39ffef] drop-shadow-[0_0_9px_rgba(57,255,239,0.55)]">
        {label || value}
      </span>
      {managed && (
        <>
          <div className="absolute left-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#ffb84d] shadow-[0_0_8px_rgba(255,184,77,0.8)]" />
          <div className="absolute right-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#ffb84d] shadow-[0_0_8px_rgba(255,184,77,0.8)]" />
        </>
      )}
    </div>
  );
}
