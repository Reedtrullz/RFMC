import React from 'react';
import { useCockpitLayoutStore } from '../../store/cockpitLayoutStore';

export type BrightnessPreset = 'DAY' | 'DUSK' | 'NIGHT' | 'DIM';

const PRESETS: Record<BrightnessPreset, { label: string; value: number }> = {
  DAY: { label: 'Day', value: 100 },
  DUSK: { label: 'Dusk', value: 65 },
  NIGHT: { label: 'Night', value: 35 },
  DIM: { label: 'Dim', value: 15 },
};

export function BrightnessPanel() {
  const brightness = useCockpitLayoutStore((s) => s.brightness);
  const setBrightness = useCockpitLayoutStore((s) => s.setBrightness);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/5 bg-cdu-bezel/40 px-3 py-2 backdrop-blur-md">
      <div className="flex min-w-[132px] items-center gap-2">
        <span className="text-[9px] font-cdu text-cdu-text/40 uppercase tracking-widest">Intensity</span>
        <span className="text-xs font-cdu text-cdu-cyan">{brightness}%</span>
      </div>

      <div className="grid grid-cols-4 gap-1">
        {(Object.entries(PRESETS) as [BrightnessPreset, (typeof PRESETS)['DAY']][]).map(([id, data]) => (
          <button
            key={id}
            onClick={() => setBrightness(data.value)}
            className={`
              min-h-8 px-2 rounded border transition-all text-[9px] font-cdu uppercase
              ${
                brightness === data.value
                  ? 'bg-cdu-cyan/20 border-cdu-cyan text-cdu-cyan shadow-lg shadow-cdu-cyan/20'
                  : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/60'
              }
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
        className="h-1 w-32 cursor-pointer appearance-none rounded-full bg-white/10 accent-cdu-cyan"
      />
    </div>
  );
}
