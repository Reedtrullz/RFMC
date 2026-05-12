import React, { useState } from 'react';
import { useFMCStore } from '../../store/useFMCStore';
import { CDU } from '../CDU/CDU';
import { NavigationDisplay } from '../ND/NavigationDisplay';
import { PrimaryFlightDisplay } from '../PFD/PrimaryFlightDisplay';
import { AutopilotTrainer } from '../Autopilot/AutopilotTrainer';
import { DisplaySelector, CockpitLayoutMode } from './DisplaySelector';
import { BrightnessPanel } from './BrightnessPanel';
import { useOrientation } from '../../hooks/useOrientation';
import { useWakeLock } from '../../hooks/useWakeLock';

export function CockpitLayout() {
  const [layoutMode, setLayoutMode] = useState<CockpitLayoutMode>('pfd-nd-cdu');
  const brightness = useFMCStore(s => s.brightness);
  const orientation = useOrientation();
  
  // Keep screen awake in cockpit mode
  useWakeLock(true);

  const isNight = brightness < 40;

  return (
    <div 
      className={`
        cockpit-grid cockpit-lock no-scrollbar bg-black text-white
        ${isNight ? 'cockpit-night' : ''}
      `}
      style={{
        '--cockpit-brightness': brightness / 100,
        '--cockpit-text-glow': brightness / 100,
        '--cockpit-annun-intensity': brightness / 100,
        '--cockpit-backlight': (brightness / 100) * 0.9,
      } as React.CSSProperties}
    >
      {/* Top Controller Bar */}
      <div className="p-4 flex flex-wrap items-center justify-between gap-4 border-b border-white/5 bg-black/40 backdrop-blur-md">
        <DisplaySelector current={layoutMode} onSelect={setLayoutMode} />
        <div className="flex items-center gap-4">
           <BrightnessPanel />
           <div className="hidden lg:flex flex-col items-end">
             <span className="text-[10px] font-cdu text-cdu-cyan uppercase font-bold tracking-tighter">Cockpit Mode</span>
             <span className="text-[8px] font-cdu text-white/30 uppercase">v1.2.0-STABLE</span>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="cockpit-main relative">
        {renderLayout(layoutMode, orientation)}
      </main>
    </div>
  );
}

function renderLayout(mode: CockpitLayoutMode, orientation: 'portrait' | 'landscape') {
  if (orientation === 'portrait') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-8">
        <div className="w-full max-w-[400px]">
          {mode === 'cdu-only' && <CDU />}
          {mode === 'cdu-nd' && <NavigationDisplay />}
          {mode === 'pfd-nd-cdu' && <PrimaryFlightDisplay />}
          {mode === 'autopilot-trainer' && <AutopilotTrainer />}
        </div>
        <p className="text-[10px] font-cdu text-white/20 uppercase">
          Switch modes or rotate to landscape for multi-instrument view
        </p>
      </div>
    );
  }

  // Landscape Layouts
  switch (mode) {
    case 'cdu-only':
      return <div className="max-w-[480px] w-full"><CDU /></div>;
    
    case 'cdu-nd':
      return (
        <div className="layout-cdu-nd">
          <div className="h-[min(88vh,560px)]"><NavigationDisplay /></div>
          <div className="flex items-center justify-center"><CDU /></div>
        </div>
      );

    case 'pfd-nd-cdu':
      return (
        <div className="layout-pfd-nd-cdu">
          <div className="h-[min(88vh,560px)]"><PrimaryFlightDisplay /></div>
          <div className="h-[min(88vh,560px)]"><NavigationDisplay /></div>
          <div className="flex items-center justify-center scale-90 origin-center"><CDU /></div>
        </div>
      );

    case 'autopilot-trainer':
      return (
        <div className="flex flex-col items-center justify-center gap-8 w-full">
          <AutopilotTrainer />
          <div className="grid grid-cols-2 gap-8 w-full max-w-[1000px]">
             <div className="h-[400px]"><PrimaryFlightDisplay /></div>
             <div className="h-[400px]"><NavigationDisplay /></div>
          </div>
        </div>
      );

    case 'split-instruments':
      return (
        <div className="grid grid-cols-2 gap-4 w-full h-full">
          <div className="border border-white/5 bg-panel-dark p-4 rounded-xl flex items-center justify-center">
            <PrimaryFlightDisplay />
          </div>
          <div className="border border-white/5 bg-panel-dark p-4 rounded-xl flex items-center justify-center">
            <NavigationDisplay />
          </div>
        </div>
      );

    default:
      return <CDU />;
  }
}
