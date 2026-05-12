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
import { InstrumentFit } from '../layout/InstrumentFit';

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
      <div className="px-4 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-white/5 bg-black/40 backdrop-blur-md">
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
      return (
        <div className="cockpit-stage cockpit-stage--cdu-only">
          <InstrumentFit target="boeingCdu">
            <CDU />
          </InstrumentFit>
        </div>
      );
    
    case 'cdu-nd':
      return (
        <div className="cockpit-stage cockpit-stage--cdu-nd">
          <InstrumentFit target="boeingNd">
            <NavigationDisplay />
          </InstrumentFit>
          <InstrumentFit target="boeingCdu" preferredScale={0.9}>
            <CDU />
          </InstrumentFit>
        </div>
      );

    case 'pfd-nd-cdu':
      return (
        <div className="cockpit-stage cockpit-stage--full-deck">
          <InstrumentFit target="boeingPfd">
            <PrimaryFlightDisplay />
          </InstrumentFit>
          <InstrumentFit target="boeingNd">
            <NavigationDisplay />
          </InstrumentFit>
          <InstrumentFit target="boeingCdu" preferredScale={0.82}>
            <CDU />
          </InstrumentFit>
        </div>
      );

    case 'autopilot-trainer':
      return (
        <div className="cockpit-stage cockpit-stage--autopilot">
          <InstrumentFit target="boeingMcp" className="cockpit-mcp-slot" preferredScale={0.9}>
            <AutopilotTrainer />
          </InstrumentFit>
          <div className="cockpit-autopilot-displays">
            <InstrumentFit target="boeingPfd">
              <PrimaryFlightDisplay />
            </InstrumentFit>
            <InstrumentFit target="boeingNd">
              <NavigationDisplay />
            </InstrumentFit>
          </div>
        </div>
      );

    case 'split-instruments':
      return (
        <div className="cockpit-stage cockpit-stage--split">
          <InstrumentFit target="boeingPfd" className="cockpit-split-panel">
            <PrimaryFlightDisplay />
          </InstrumentFit>
          <InstrumentFit target="boeingNd" className="cockpit-split-panel">
            <NavigationDisplay />
          </InstrumentFit>
        </div>
      );

    default:
      return <CDU />;
  }
}
