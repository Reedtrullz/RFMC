interface MCPDisplayWindowProps {
  label: string;
  value: string | number | null;
  active?: boolean;
  highlighted?: boolean;
  unit?: string;
}

export function MCPDisplayWindow({ label, value, active = true, highlighted, unit }: MCPDisplayWindowProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-cdu">{label}</span>

      <div
        className={`relative group p-[2px] bg-[#2a2d2d] rounded-sm shadow-lg ${highlighted ? 'highlighted-boeing' : ''}`}
      >
        {/* Recessed Bezel */}
        <div
          className={`relative flex h-10 w-24 items-center justify-center rounded-[1px] bg-[#0c0404] shadow-[inset_0_2px_10px_rgba(0,0,0,1)] overflow-hidden border border-black/40`}
        >
          {/* LED / Display Segment Glow */}
          <div className="flex items-baseline gap-1">
            <span
              className={`font-mono text-2xl font-bold tracking-widest transition-all duration-300 ${
                active
                  ? 'text-[#ff4500] drop-shadow-[0_0_8px_rgba(255,69,0,0.8)] opacity-100'
                  : 'text-[#3a1010] opacity-40'
              }`}
            >
              {value !== null ? value : ''}
            </span>
            {unit && (
              <span className={`text-[8px] font-bold uppercase ${active ? 'text-[#ff4500]/60' : 'text-transparent'}`}>
                {unit}
              </span>
            )}
          </div>

          {/* Glass Overlay & Reflection */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/10 opacity-60" />
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]" />

          {/* Scanline / Hardware Texture */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        </div>
      </div>
    </div>
  );
}
