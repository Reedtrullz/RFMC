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
import { InstrumentFrameSlot } from '../layout/InstrumentSlot';

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
      return (
        <div className="cockpit-stage cockpit-stage--cdu-only">
          <InstrumentFrameSlot scale={0.64}>
            <CDU />
          </InstrumentFrameSlot>
        </div>
      );
    
    case 'cdu-nd':
      return (
        <div className="cockpit-stage cockpit-stage--cdu-nd">
          <InstrumentFrameSlot>
            <NavigationDisplay />
          </InstrumentFrameSlot>
          <InstrumentFrameSlot scale={0.64}>
            <CDU />
          </InstrumentFrameSlot>
        </div>
      );

    case 'pfd-nd-cdu':
      return (
        <div className="cockpit-stage cockpit-stage--full-deck">
          <InstrumentFrameSlot scale={0.95}>
            <PrimaryFlightDisplay />
          </InstrumentFrameSlot>
          <InstrumentFrameSlot scale={0.95}>
            <NavigationDisplay />
          </InstrumentFrameSlot>
          <InstrumentFrameSlot scale={0.62}>
            <CDU />
          </InstrumentFrameSlot>
        </div>
      );

    case 'autopilot-trainer':
      return (
        <div className="cockpit-stage cockpit-stage--autopilot">
          <InstrumentFrameSlot className="cockpit-mcp-slot" scale={0.56}>
            <AutopilotTrainer />
          </InstrumentFrameSlot>
          <div className="cockpit-autopilot-displays">
            <InstrumentFrameSlot scale={0.78}>
              <PrimaryFlightDisplay />
            </InstrumentFrameSlot>
            <InstrumentFrameSlot scale={0.78}>
              <NavigationDisplay />
            </InstrumentFrameSlot>
          </div>
        </div>
      );

    case 'split-instruments':
      return (
        <div className="cockpit-stage cockpit-stage--split">
          <InstrumentFrameSlot className="cockpit-split-panel">
            <PrimaryFlightDisplay />
          </InstrumentFrameSlot>
          <InstrumentFrameSlot className="cockpit-split-panel">
            <NavigationDisplay />
          </InstrumentFrameSlot>
        </div>
      );

    default:
      return <CDU />;
  }
}
