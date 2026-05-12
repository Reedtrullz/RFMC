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
      className={`h-1.5 w-6 rounded-full transition-all duration-200 ${active ? colorMap[color] : 'bg-[#1a1a1a]'}`} 
      style={{ opacity: active ? 'var(--cockpit-annun-intensity, 1)' : 1 }}
    />
  );
}
