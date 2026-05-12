interface FCUButtonProps {
  label: string;
  active: boolean;
  onPress: () => void;
  highlighted?: boolean;
}

export function FCUButton({ label, active, onPress, highlighted = false }: FCUButtonProps) {
  return (
    <button
      onClick={onPress}
      className={`
        relative h-10 w-14 rounded-sm border-b-2 border-black/80 flex items-center justify-center
        font-bold text-[10px] uppercase tracking-tighter transition-all
        ${highlighted ? 'ring-2 ring-cdu-amber shadow-[0_0_18px_rgba(255,184,77,0.65)]' : ''}
        ${active ? 'bg-[#5a5d5d] text-white' : 'bg-[#3a3d3d] text-white/60 hover:bg-[#454848]'}
      `}
    >
      <span>{label}</span>
      {active && (
        <div className="absolute bottom-1 w-6 h-0.5 bg-[#39ff14] shadow-[0_0_5px_#39ff14]" />
      )}
    </button>
  );
}
