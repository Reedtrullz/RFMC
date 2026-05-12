import { NavigationDisplayModel } from '@shared';
import { useFMCStore } from '../../store/useFMCStore';

const RANGES = [5, 10, 20, 40, 80, 160, 320, 640];
const BOEING_MODES = [
  { label: 'APP', value: 'APP' },
  { label: 'VOR', value: 'VOR' },
  { label: 'MAP', value: 'MAP' },
  { label: 'PLN', value: 'PLN' },
];

const AIRBUS_MODES = [
  { label: 'ROSE NAV', value: 'ROSE_NAV' },
  { label: 'ARC', value: 'ARC' },
  { label: 'PLAN', value: 'PLAN' },
  { label: 'ROSE ILS', value: 'ROSE_ILS' },
  { label: 'ROSE VOR', value: 'ROSE_VOR' },
];

interface NDControlsProps {
  model: NavigationDisplayModel;
  side: 'L' | 'R';
}

export function NDControls({ model, side }: NDControlsProps) {
  const state = useFMCStore();
  const efis = side === 'L' ? state.efisL : state.efisR;
  const modes = model.style === 'airbus' ? AIRBUS_MODES : BOEING_MODES;

  return (
    <div className="mt-1.5 flex flex-col gap-1.5 bg-cdu-bezel/40 p-2 rounded-sm border border-white/5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-0.5" aria-label="Mode Selector">
          {modes.map(m => (
            <button
              key={m.value}
              onClick={() => state.setNDMode(side, m.value as any)}
              className={`px-2 py-1 text-[8px] font-bold tracking-tighter transition-all ${efis.mode === m.value ? 'bg-cdu-cyan text-black' : 'bg-black/40 text-cdu-cyan/60 hover:text-cdu-cyan'}`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex gap-0.5 overflow-hidden" aria-label="Range Selector">
          {RANGES.map(r => (
            <button
              key={r}
              onClick={() => state.setNDRange(side, r)}
              className={`flex-1 px-1 py-1 text-[9px] font-bold transition-all ${efis.range === r ? 'bg-cdu-white text-black' : 'bg-black/40 text-cdu-white/40 hover:text-cdu-white'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-1">
        {['WPT', 'ARPT', 'STA', 'DATA', 'POS', 'TERR', 'WXR', 'TFC'].map(ov => (
          <button
            key={ov}
            onClick={() => state.toggleNDOverlay(side, ov.toLowerCase() as any)}
            className={`flex-1 py-0.5 text-[8px] font-bold border ${efis.overlays[ov.toLowerCase() as keyof typeof efis.overlays] ? 'border-cdu-green text-cdu-green bg-cdu-green/10' : 'border-white/10 text-white/30'}`}
          >
            {ov}
          </button>
        ))}
        {model.style === 'boeing' && (
          <button
            onClick={() => state.toggleNDCenter(side)}
            className={`px-2 py-0.5 text-[8px] font-bold border ${efis.centered ? 'border-cdu-cyan text-cdu-cyan' : 'border-white/10 text-white/30'}`}
          >
            CTR
          </button>
        )}
      </div>
    </div>
  );
}
