interface AnnunciatorLightProps {
  active: boolean;
  color?: 'green' | 'amber' | 'red' | 'white';
  label?: string;
  className?: string;
}

export function AnnunciatorLight({ active, color = 'green', label, className = '' }: AnnunciatorLightProps) {
  const colorMap = {
    green: 'bg-[#3cff5f] shadow-[0_0_10px_rgba(60,255,95,0.8)]',
    amber: 'bg-[#ffb000] shadow-[0_0_10px_rgba(255,176,0,0.8)]',
    red: 'bg-[#ff3030] shadow-[0_0_10px_rgba(255,48,48,0.8)]',
    white: 'bg-[#ffffff] shadow-[0_0_10px_rgba(255,255,255,0.8)]',
  };

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div
        className={`h-2 w-6 rounded-full transition-all duration-200 ${active ? colorMap[color] : 'bg-[#1a1a1a] shadow-inner'}`}
      />
      {label && <span className="text-[8px] font-bold text-white/60 uppercase">{label}</span>}
    </div>
  );
}
