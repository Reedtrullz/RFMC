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
        active 
          ? `${colorMap[color]} ring-1 ring-white/10` 
          : 'bg-[#0a0a0a] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]'
      }`} 
      style={{ opacity: active ? 'var(--cockpit-annun-intensity, 1)' : 1 }}
    >
      {/* Subsurface Scattering Effect */}
      {active && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/30" />
      )}
      
      {/* Internal hardware detail */}
      <div className="absolute inset-0 border border-white/5 opacity-20" />
    </div>
  );
}
