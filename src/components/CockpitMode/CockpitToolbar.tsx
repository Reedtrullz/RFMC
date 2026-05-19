import { useCockpitLayoutStore } from '../../store/cockpitLayoutStore';
import { panelLabels, type PanelId } from '../workspace/panelTypes';

export function CockpitToolbar() {
  const hiddenPanels = useCockpitLayoutStore((s) => s.hiddenPanels);
  const togglePanelHidden = useCockpitLayoutStore((s) => s.togglePanelHidden);
  const setCockpitMode = useCockpitLayoutStore((s) => s.setCockpitMode);
  const restoreRecommendedLayout = useCockpitLayoutStore((s) => s.restoreRecommendedLayout);
  const highContrast = useCockpitLayoutStore((s) => s.highContrast);
  const toggleHighContrast = useCockpitLayoutStore((s) => s.toggleHighContrast);

  const panels: PanelId[] = [
    'cdu',
    'nd',
    'pfd',
    'autoflight',
    'eicas',
    'instructor',
    'checklist',
    'connection',
    'settings',
  ];

  return (
    <div
      data-testid="cockpit-panel-toolbar"
      className="flex bg-[#0a0c0c] p-0 rounded border border-white/5 overflow-x-auto no-scrollbar gap-0 items-stretch h-8"
    >
      <div className="px-4 flex items-center bg-[#1a1c1c] border-r border-[#2a2d2d]">
        <span className="text-[9px] font-cdu text-white/40 uppercase tracking-[0.2em] font-black">PANELS</span>
      </div>

      <div className="flex flex-1 overflow-x-auto no-scrollbar">
        {panels.map((id) => {
          const isHidden = hiddenPanels.includes(id);
          const label = panelLabels[id] || id.toUpperCase();

          return (
            <button
              key={id}
              onClick={() => togglePanelHidden(id)}
              aria-pressed={!isHidden}
              aria-label={`Toggle ${label} panel`}
              className={`
                flex items-center gap-2 px-4 transition-all whitespace-nowrap border-r border-[#2a2d2d]
                ${!isHidden ? 'bg-cdu-cyan/10 text-cdu-cyan' : 'text-white/20 hover:text-white/40 hover:bg-white/5'}
              `}
            >
              <div
                className={`w-1 h-1 rounded-full ${!isHidden ? 'bg-cdu-cyan shadow-[0_0_4px_rgba(0,255,255,0.8)]' : 'bg-white/5'}`}
              />
              <span className="text-[9px] font-cdu uppercase font-bold tracking-tight">{label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center bg-[#1a1c1c] border-l border-[#2a2d2d]">
        <button
          onClick={restoreRecommendedLayout}
          aria-label="Restore recommended layout"
          className="px-4 h-full text-white/30 hover:text-white hover:bg-white/5 text-[9px] font-cdu uppercase font-bold border-r border-[#2a2d2d] transition-colors"
        >
          RESTORE
        </button>
        <button
          onClick={toggleHighContrast}
          aria-pressed={highContrast}
          className={`
            px-4 h-full text-[9px] font-cdu uppercase font-bold border-r border-[#2a2d2d] transition-colors
            ${highContrast ? 'text-cdu-cyan bg-cdu-cyan/5' : 'text-white/30 hover:text-white hover:bg-white/5'}
          `}
        >
          CONTRAST
        </button>
        <button
          onClick={() => setCockpitMode(false)}
          aria-label="Exit cockpit mode"
          className="px-4 h-full text-cdu-error/40 hover:text-cdu-error hover:bg-cdu-error/5 text-[9px] font-cdu uppercase font-bold transition-colors"
        >
          EXIT
        </button>
      </div>
    </div>
  );
}
