import React from 'react';
import { useFMCStore } from '../../store/useFMCStore';

export type BrightnessPreset = 'DAY' | 'DUSK' | 'NIGHT' | 'DIM';

const PRESETS: Record<BrightnessPreset, { label: string; value: number }> = {
  DAY: { label: 'Day', value: 100 },
  DUSK: { label: 'Dusk', value: 65 },
  NIGHT: { label: 'Night', value: 35 },
  DIM: { label: 'Dim', value: 15 },
};

export function BrightnessPanel() {
  const brightness = useFMCStore(s => s.brightness);
  const setBrightness = useFMCStore(s => s.setBrightness);

  return (
    <div className="bg-cdu-bezel/40 backdrop-blur-md p-4 rounded-xl border border-white/5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-cdu text-cdu-text/40 uppercase tracking-widest">Display Intensity</span>
        <span className="text-xs font-cdu text-cdu-cyan">{brightness}%</span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {(Object.entries(PRESETS) as [BrightnessPreset, typeof PRESETS['DAY']][]).map(([id, data]) => (
          <button
            key={id}
            onClick={() => setBrightness(data.value)}
            className={`
              py-2 rounded border transition-all text-[10px] font-cdu uppercase
              ${brightness === data.value 
                ? 'bg-cdu-cyan/20 border-cdu-cyan text-cdu-cyan shadow-lg shadow-cdu-cyan/20' 
                : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/60'}
            `}
          >
            {data.label}
          </button>
        ))}
      </div>

      <input
        type="range"
        min="5"
        max="100"
        value={brightness}
        onChange={(e) => setBrightness(parseInt(e.target.value))}
        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-cdu-cyan"
      />
    </div>
  );
}
