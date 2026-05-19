import type { CockpitLayoutMode } from '@shared';
import { trainingModes } from '../../config/trainingModes';
export { CockpitLayoutMode };

export function DisplaySelector({
  current,
  onSelect,
}: {
  current: CockpitLayoutMode;
  onSelect: (mode: CockpitLayoutMode) => void;
}) {
  return (
    <div className="flex bg-cdu-bezel/60 backdrop-blur-xl p-1 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
      {trainingModes.map((m) => (
        <button
          key={m.id}
          data-testid={`layout-mode-${m.id}`}
          aria-label={m.label}
          onClick={() => onSelect(m.id)}
          title={m.purpose}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap
            ${
              current === m.id
                ? 'bg-cdu-cyan text-cdu-bezel font-bold shadow-lg shadow-cdu-cyan/20'
                : 'text-white/40 hover:text-white/60 hover:bg-white/5'
            }
          `}
        >
          <span className="text-[10px] font-cdu uppercase tracking-wider">{m.label}</span>
        </button>
      ))}
    </div>
  );
}
