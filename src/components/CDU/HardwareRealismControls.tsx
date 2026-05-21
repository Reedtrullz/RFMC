import React, { useState } from 'react';
import { useDisplaySettings } from '../../store/displaySettingsStore';

interface SliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  icon?: string;
}

const RealismSlider: React.FC<SliderProps> = ({ label, value, onChange, icon }) => (
  <div className="flex flex-col items-center gap-0.5 min-w-[68px]">
    <div className="flex items-center gap-1 text-[10px] font-mono text-amber-400/90 tracking-[0.5px]">
      {icon && <span>{icon}</span>}
      <span>{label}</span>
      <span className="tabular-nums text-amber-400/70 w-6 text-right">{value}</span>
    </div>
    <input
      type="range"
      min={0}
      max={100}
      step={1}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      className="w-full accent-amber-400 cursor-pointer"
      style={{ height: '4px' }}
    />
  </div>
);

export const HardwareRealismControls: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    crtIntensity,
    wearIntensity,
    bloomIntensity,
    scanlineIntensity,
    setCrtIntensity,
    setWearIntensity,
    setBloomIntensity,
    setScanlineIntensity,
    resetRealism,
  } = useDisplaySettings();

  return (
    <div
      data-testid="hardware-realism-controls"
      className={`flex items-center justify-between gap-4 rounded-md border border-zinc-800 bg-zinc-950/90 px-3 py-2 shadow-inner transition-all ${collapsed ? 'w-fit' : ''} ${className}`}
      style={{ backdropFilter: 'blur(2px)' }}
    >
      <button
        type="button"
        onClick={() => setCollapsed((value) => !value)}
        className="flex items-center gap-2 pr-2 border-r border-zinc-800 text-[10px] font-mono text-amber-400/70 tracking-[1px] hover:text-amber-300 transition-colors"
        aria-expanded={!collapsed}
        aria-label={collapsed ? 'Show hardware realism controls' : 'Hide hardware realism controls'}
        title={collapsed ? 'Show hardware controls' : 'Minimize hardware controls'}
      >
        HARDWARE
        <span className="text-amber-400/60">{collapsed ? '▸' : '▾'}</span>
      </button>
      {!collapsed && (
        <>
          <div className="flex flex-1 items-end justify-around gap-3">
            <RealismSlider label="CRT" value={crtIntensity} onChange={setCrtIntensity} icon="◉" />
            <RealismSlider label="WEAR" value={wearIntensity} onChange={setWearIntensity} icon="◌" />
            <RealismSlider label="BLOOM" value={bloomIntensity} onChange={setBloomIntensity} icon="✧" />
            <RealismSlider label="SCAN" value={scanlineIntensity} onChange={setScanlineIntensity} icon="≡" />
          </div>
          <button
            type="button"
            onClick={resetRealism}
            className="ml-1 rounded px-2 py-0.5 text-[9px] font-mono text-amber-400/70 hover:bg-zinc-900 hover:text-amber-400 active:bg-zinc-800 transition-colors"
            title="Reset to defaults"
          >
            RESET
          </button>
        </>
      )}
    </div>
  );
};
