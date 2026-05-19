interface MCPAnnunciatorProps {
  active: boolean;
  color?: 'green' | 'amber' | 'white';
}

export function MCPAnnunciator({ active, color = 'green' }: MCPAnnunciatorProps) {
  const colorMap = {
    green: 'bg-[#00ff44] shadow-[0_0_8px_rgba(0,255,68,0.8)]',
    amber: 'bg-[#ffcc00] shadow-[0_0_8px_rgba(255,204,0,0.8)]',
    white: 'bg-[#ffffff] shadow-[0_0_8px_rgba(255,255,255,0.8)]',
  };

  return (
    <div
      className={`h-2 w-7 rounded-[1px] transition-all duration-300 relative overflow-hidden ${
        active ? `${colorMap[color]} ring-1 ring-white/10` : 'bg-[#0a0a0a] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]'
      }`}
      style={{ opacity: active ? 'var(--cockpit-annun-intensity, 1)' : 1 }}
    >
      {/* Frosted Diffuser Texture */}
      {active && (
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '20px 20px' }}
        />
      )}

      {/* Subsurface Scattering & Glow Layer */}
      {active && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/40" />
          <div className="absolute inset-0 shadow-[inset_0_0_4px_rgba(255,255,255,0.4)]" />
        </>
      )}

      {/* Internal hardware detail (Filament/LED) */}
      <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 h-[1px] bg-white/20 blur-[0.5px]" />
      <div className="absolute inset-0 border border-white/5 opacity-30" />
    </div>
  );
}
