interface MCPDisplayWindowProps {
  label: string;
  value: string | number | null;
  active?: boolean;
}

export function MCPDisplayWindow({ label, value, active = true }: MCPDisplayWindowProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-bold text-[#c8c8c8] uppercase tracking-wider">{label}</span>
      <div className={`relative flex h-10 w-24 items-center justify-center rounded-sm bg-[#120808] border-2 border-[#2a2d2d] shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]`}>
        <span className={`font-mono text-2xl font-bold tracking-widest ${active ? 'text-[#ff3c00] drop-shadow-[0_0_5px_rgba(255,60,0,0.6)]' : 'text-[#301010]'}`}>
          {value !== null ? value : ''}
        </span>
        {/* Subtle glass reflection */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent" />
      </div>
    </div>
  );
}
