import type { CockpitLayoutMode, PanelId } from '@shared';
import { getTrainingModeConfig } from '../../config/trainingModes';
import { panelLabels } from '../workspace/panelTypes';

interface CockpitEmptyStateProps {
  mode: CockpitLayoutMode;
  missingPanels: PanelId[];
  onRestore: () => void;
}

export function CockpitEmptyState({ mode, missingPanels, onRestore }: CockpitEmptyStateProps) {
  const config = getTrainingModeConfig(mode);
  const missing = missingPanels.map((panelId) => panelLabels[panelId]);

  return (
    <div
      className="flex flex-col items-center justify-center h-full p-8 text-center bg-[#0a0c0c]/80 backdrop-blur-md rounded-lg border border-white/5 shadow-2xl"
      role="status"
    >
      <div className="w-16 h-16 mb-6 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
        <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h2 className="text-xl font-black text-white uppercase tracking-[0.2em] mb-2 font-cdu">{config.label}</h2>
      <p className="text-white/40 text-[11px] font-cdu uppercase tracking-widest mb-8 max-w-sm">
        Required panels are currently hidden:
        <span className="block mt-2 text-amber-500/80 font-black">{missing.join(' • ')}</span>
      </p>

      <button
        type="button"
        onClick={onRestore}
        className="px-8 py-3 bg-cdu-cyan text-black font-black uppercase tracking-[0.15em] text-[10px] rounded hover:bg-cdu-cyan/90 transition-all shadow-[0_0_20px_rgba(0,255,255,0.2)] active:scale-95"
      >
        Restore Layout
      </button>

      <div className="mt-12 pt-8 border-t border-white/5 w-full flex justify-center gap-8 opacity-20 grayscale pointer-events-none">
        <div className="text-[10px] font-black font-cdu uppercase tracking-[0.3em]">Operational Readiness Check</div>
      </div>
    </div>
  );
}
