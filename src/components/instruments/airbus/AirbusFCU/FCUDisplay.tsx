interface FCUDisplayProps {
  value: number;
  label?: string;
  managed?: boolean;
  highlighted?: boolean;
}

export function FCUDisplay({ value, label, managed, highlighted = false }: FCUDisplayProps) {
  return (
    <div className={`relative flex h-10 w-24 items-center justify-center rounded-sm bg-black/80 border border-white/10 shadow-inner overflow-hidden font-mono ${highlighted ? 'ring-2 ring-cdu-amber shadow-[0_0_18px_rgba(255,184,77,0.55)]' : ''}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      <span className="text-xl text-[#00f0ff] tracking-tighter drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]">
        {label || value}
      </span>
      {managed && (
        <div className="absolute top-1/2 -translate-y-1/2 right-2 w-2 h-2 rounded-full bg-[#ffb84d] shadow-[0_0_8px_rgba(255,184,77,0.8)]" />
      )}
    </div>
  );
}
