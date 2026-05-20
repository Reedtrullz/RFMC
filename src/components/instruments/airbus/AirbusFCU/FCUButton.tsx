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
        relative flex h-11 w-16 items-center justify-center rounded-[3px] border border-black/60 border-b-[4px]
        font-bold text-[10px] uppercase tracking-normal transition-all active:translate-y-[2px] active:border-b
        ${highlighted ? 'highlighted-airbus' : ''}
        ${active ? 'bg-[#697273] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]' : 'bg-[#333a3b] text-white/62 hover:bg-[#424a4b]'}
      `}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[3px] bg-gradient-to-b from-white/12 to-black/22" />
      <span>{label}</span>
      {active && <div className="absolute bottom-1 h-1 w-7 rounded-sm bg-[#39ff14] shadow-[0_0_7px_#39ff14]" />}
    </button>
  );
}
