import React from 'react';

export type CockpitLayoutMode =
  | 'fmc-focus'
  | 'navigation'
  | 'automation'
  | 'approach'
  | 'full-deck'
  | 'free-practice';

export function DisplaySelector({ 
  current, 
  onSelect 
}: { 
  current: CockpitLayoutMode; 
  onSelect: (mode: CockpitLayoutMode) => void 
}) {
  const modes: { id: CockpitLayoutMode; label: string }[] = [
    { id: 'fmc-focus', label: 'FMC Focus' },
    { id: 'navigation', label: 'Navigation' },
    { id: 'automation', label: 'Automation' },
    { id: 'approach', label: 'Approach' },
    { id: 'full-deck', label: 'Full Deck' },
    { id: 'free-practice', label: 'Free Practice' },
  ];

  return (
    <div className="flex bg-cdu-bezel/60 backdrop-blur-xl p-1 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
      {modes.map((m) => (
        <button
          key={m.id}
          onClick={() => onSelect(m.id)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap
            ${current === m.id 
              ? 'bg-cdu-cyan text-cdu-bezel font-bold shadow-lg shadow-cdu-cyan/20' 
              : 'text-white/40 hover:text-white/60 hover:bg-white/5'}
          `}
        >
          <span className="text-[10px] font-cdu uppercase tracking-wider">{m.label}</span>
        </button>
      ))}
    </div>
  );
}
