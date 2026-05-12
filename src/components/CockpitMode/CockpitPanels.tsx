import { useState } from 'react';
import { useFMCStore } from '../../store/useFMCStore';
import { getCockpitChecklists, type CockpitChecklistItem } from '../../checklists';

export function SettingsPanel() {
  const isHidden = useFMCStore(s => s.hiddenPanels.includes('settings'));
  const cockpitMode = useFMCStore(s => s.cockpitMode);
  const brightness = useFMCStore(s => s.brightness);
  const setBrightness = useFMCStore(s => s.setBrightness);

  if (cockpitMode && isHidden) return null;

  return (
    <div className="fixed top-24 right-6 w-64 bg-cdu-bezel/90 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-2xl z-30 pointer-events-auto animate-in fade-in zoom-in duration-200">
      <h3 className="text-[10px] font-cdu text-cdu-cyan uppercase tracking-widest font-bold mb-4">Cockpit Settings</h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-[9px] font-cdu text-white/40 uppercase mb-2 block">Display Brightness</label>
          <input 
            type="range" 
            min="10" max="100" 
            value={brightness} 
            onChange={(e) => setBrightness(parseInt(e.target.value))}
            className="w-full accent-cdu-cyan"
          />
        </div>
        
        <div className="pt-2 border-t border-white/5">
          <p className="text-[8px] font-cdu text-white/20 uppercase leading-tight">
            Advanced settings and profile management are available in the main menu.
          </p>
        </div>
      </div>
    </div>
  );
}

export function ChecklistPanel() {
  const isHidden = useFMCStore(s => s.hiddenPanels.includes('checklist'));
  const cockpitMode = useFMCStore(s => s.cockpitMode);
  const aircraft = useFMCStore(s => s.aircraft);
  const highlightControl = useFMCStore(s => s.highlightControl);
  const [sectionIndex, setSectionIndex] = useState(0);

  if (cockpitMode && isHidden) return null;

  const checklists = getCockpitChecklists(aircraft);
  const section = checklists[sectionIndex % checklists.length] ?? checklists[0];
  const nextSection = () => setSectionIndex(index => (index + 1) % checklists.length);

  return (
    <div className="fixed top-24 left-6 w-80 bg-white/95 backdrop-blur-xl rounded-lg border border-black/10 p-6 shadow-2xl z-30 pointer-events-auto animate-in fade-in slide-in-from-left-4 duration-300">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/5">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">{section.title}</h3>
        <span className="text-[9px] font-bold bg-cdu-bezel text-white px-2 py-0.5 rounded">{section.badge}</span>
      </div>
      
      <div className="space-y-3">
        {section.items.map(item => (
          <ChecklistItem
            key={item.id}
            item={item}
            onHighlight={item.relatedControl ? () => highlightControl(item.relatedControl!) : undefined}
          />
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-black/5 flex justify-between items-center">
        <span className="text-[9px] font-bold text-gray-400 uppercase">{(sectionIndex % checklists.length) + 1} / {checklists.length}</span>
        <button
          type="button"
          className="text-[9px] font-bold text-cdu-cyan uppercase hover:underline"
          onClick={nextSection}
        >
          Next Section
        </button>
      </div>
    </div>
  );
}

function ChecklistItem({ item, onHighlight }: { item: CockpitChecklistItem; onHighlight?: () => void }) {
  return (
    <button
      type="button"
      onClick={onHighlight}
      className={`flex w-full items-center justify-between group text-left ${item.completed ? 'opacity-40' : ''} ${onHighlight ? 'cursor-pointer' : 'cursor-default'}`}
      disabled={!onHighlight}
    >
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded border ${item.completed ? 'bg-cdu-exec border-cdu-exec' : 'border-black/20'}`} />
        <span className="text-[11px] font-medium text-gray-700">{item.label}</span>
      </div>
      <div className="flex-1 border-b border-dotted border-black/10 mx-2 mb-1" />
      <span className="text-[10px] font-bold text-gray-900 font-mono">{item.expected}</span>
    </button>
  );
}
