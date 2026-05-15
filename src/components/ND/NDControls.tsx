import { NavigationDisplayModel } from '@shared';
import { useFMCStore } from '../../store/useFMCStore';
import { AvionicsKey } from '../instruments/common/AvionicsKey';

const RANGES = [5, 10, 20, 40, 80, 160, 320, 640];
const BOEING_MODES = ['APP', 'VOR', 'MAP', 'PLN'];
const AIRBUS_MODES = ['ROSE_NAV', 'ARC', 'PLAN', 'ROSE_ILS', 'ROSE_VOR'];

interface NDControlsProps {
  model: NavigationDisplayModel;
  side: 'L' | 'R';
}

export function NDControls({ model, side }: NDControlsProps) {
  const state = useFMCStore();
  const efis = side === 'L' ? state.efisL : state.efisR;
  const modes = model.style === 'airbus' ? AIRBUS_MODES : BOEING_MODES;

  return (
    <div className="mt-1 flex flex-col gap-1 bg-[#1a1c1c] p-2 rounded border-t border-[#2a2d2d] shadow-[inset_0_1px_5px_rgba(0,0,0,0.8)]">
      {/* Upper Panel: Knobs */}
      <div className="flex items-start justify-between">
        {/* Mode Selector Knob Look */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[7px] text-gray-500 uppercase font-bold tracking-widest">Mode</span>
          <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-full border border-white/5">
            {modes.map(m => (
              <button
                key={m}
                onClick={() => state.setNDMode(side, m as any)}
                className={`h-5 px-1.5 rounded-full text-[8px] font-bold transition-all ${efis.mode === m ? 'bg-cdu-cyan text-black shadow-[0_0_8px_rgba(0,255,255,0.5)]' : 'text-gray-500 hover:text-white'}`}
              >
                {m.replace('ROSE_', '').replace('NAV', 'NV')}
              </button>
            ))}
          </div>
        </div>

        {/* Range Selector Knob Look */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[7px] text-gray-500 uppercase font-bold tracking-widest">Range</span>
          <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-full border border-white/5">
            {RANGES.map(r => (
              <button
                key={r}
                onClick={() => state.setNDRange(side, r)}
                className={`h-5 w-5 rounded-full text-[8px] font-bold transition-all flex items-center justify-center ${efis.range === r ? 'bg-white text-black shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-gray-500 hover:text-white'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Panel: Overlays */}
      <div className="grid grid-cols-4 gap-1">
        {['WPT', 'ARPT', 'STA', 'DATA', 'POS', 'TERR', 'WXR', 'TFC'].map(ov => (
          <AvionicsKey
            key={ov}
            label={ov}
            active={efis.overlays[ov.toLowerCase() as keyof typeof efis.overlays]}
            lit={efis.overlays[ov.toLowerCase() as keyof typeof efis.overlays]}
            onPress={() => state.toggleNDOverlay(side, ov.toLowerCase() as any)}
            variant={model.style === 'airbus' ? 'airbus' : 'boeing'}
            className="!h-6 !text-[7px] !min-w-0"
          />
        ))}
        {model.style === 'boeing' && (
           <AvionicsKey
            label="CTR"
            active={efis.centered}
            lit={efis.centered}
            onPress={() => state.toggleNDCenter(side)}
            variant="boeing"
            className="!h-6 !text-[7px] !min-w-0"
          />
        )}
      </div>
    </div>
  );
}
