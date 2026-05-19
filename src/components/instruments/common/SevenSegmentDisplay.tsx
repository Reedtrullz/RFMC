interface SevenSegmentDisplayProps {
  value: string | number | null;
  digits: number;
  color?: 'amber' | 'white' | 'red' | 'green' | 'orange';
  active?: boolean;
}

export function SevenSegmentDisplay({ value, digits, color = 'orange', active = true }: SevenSegmentDisplayProps) {
  const colorMap = {
    amber: 'text-[#ffb000] drop-shadow-[0_0_5px_rgba(255,176,0,0.6)]',
    white: 'text-[#f8f8f8] drop-shadow-[0_0_5px_rgba(248,248,248,0.4)]',
    red: 'text-[#ff3030] drop-shadow-[0_0_5px_rgba(255,48,48,0.6)]',
    green: 'text-[#3cff5f] drop-shadow-[0_0_5px_rgba(60,255,95,0.6)]',
    orange: 'text-[#ff3c00] drop-shadow-[0_0_5px_rgba(255,60,0,0.6)]',
  };

  const displayValue = value === null ? '' : value.toString().padStart(digits, ' ');

  return (
    <div className="relative flex h-10 items-center justify-center rounded-sm bg-[#120808] border-2 border-[#2a2d2d] px-2 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]">
      {/* Background segments (inactive look) */}
      <span className="absolute font-mono text-2xl font-bold tracking-widest text-[#201010] opacity-20">
        {'8'.repeat(digits)}
      </span>

      {/* Active segments */}
      <span
        className={`relative z-10 font-mono text-2xl font-bold tracking-widest ${active ? colorMap[color] : 'text-[#201010]'}`}
        style={{ opacity: active ? 'var(--cockpit-brightness, 1)' : 1 }}
      >
        {displayValue}
      </span>

      {/* Glass overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent" />
    </div>
  );
}
