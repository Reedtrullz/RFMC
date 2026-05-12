import React from 'react';
import { useFMCStore } from '../../store/useFMCStore';
import { panelLabels, type PanelId } from '../workspace/panelTypes';

export function CockpitToolbar() {
  const hiddenPanels = useFMCStore(s => s.hiddenPanels);
  const togglePanelHidden = useFMCStore(s => s.togglePanelHidden);
  const cockpitMode = useFMCStore(s => s.cockpitMode);
  const setCockpitMode = useFMCStore(s => s.setCockpitMode);

  const panels: PanelId[] = ['cdu', 'nd', 'pfd', 'mcp', 'instructor', 'checklist', 'connection', 'settings'];

  return (
    <div className="flex bg-cdu-bezel/80 backdrop-blur-xl p-1 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar gap-1">
      <div className="px-3 flex items-center border-r border-white/10 mr-1">
        <span className="text-[10px] font-cdu text-white/40 uppercase tracking-widest font-bold">Panels</span>
      </div>
      {panels.map((id) => {
        const isHidden = hiddenPanels.includes(id);
        const label = panelLabels[id] || id.toUpperCase();
        
        return (
          <button
            key={id}
            onClick={() => togglePanelHidden(id)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap
              ${!isHidden 
                ? 'bg-cdu-cyan/20 text-cdu-cyan border border-cdu-cyan/30 shadow-lg shadow-cdu-cyan/10' 
                : 'text-white/30 hover:text-white/50 hover:bg-white/5 border border-transparent'}
            `}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${!isHidden ? 'bg-cdu-cyan animate-pulse' : 'bg-white/10'}`} />
            <span className="text-[9px] font-cdu uppercase tracking-wider">{label}</span>
          </button>
        );
      })}
      
      <div className="ml-auto flex items-center px-2 border-l border-white/10">
        <button
          onClick={() => setCockpitMode(false)}
          className="px-3 py-1.5 text-cdu-error/60 hover:text-cdu-error text-[9px] font-cdu uppercase tracking-wider transition-colors"
        >
          Exit Cockpit
        </button>
      </div>
    </div>
  );
}
