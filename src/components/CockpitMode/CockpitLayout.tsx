import React, { useEffect, useState } from 'react';
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
import { InstrumentHeader } from '../workspace/InstrumentHeader';
import { FocusOverlay } from '../workspace/FocusOverlay';
import { PanelTray } from '../workspace/PanelTray';
import type { PanelId } from '../workspace/panelTypes';

interface LayoutControls {
  hiddenPanels: Set<PanelId>;
  pinnedPanels: Set<PanelId>;
  onFocus: (panelId: PanelId) => void;
  onHide: (panelId: PanelId) => void;
  onTogglePin: (panelId: PanelId) => void;
}

export function CockpitLayout() {
  const [layoutMode, setLayoutMode] = useState<CockpitLayoutMode>('fmc-focus');
  const [focusedPanel, setFocusedPanel] = useState<PanelId | null>(null);
  const [hiddenPanels, setHiddenPanels] = useState<Set<PanelId>>(() => new Set());
  const [pinnedPanels, setPinnedPanels] = useState<Set<PanelId>>(() => new Set());
  const brightness = useFMCStore(s => s.brightness);
  const orientation = useOrientation();
  
  // Keep screen awake in cockpit mode
  useWakeLock(true);

  const isNight = brightness < 40;
  const controls: LayoutControls = {
    hiddenPanels,
    pinnedPanels,
    onFocus: setFocusedPanel,
    onHide: panelId => {
      setFocusedPanel(current => (current === panelId ? null : current));
      setHiddenPanels(current => new Set(current).add(panelId));
    },
    onTogglePin: panelId => {
      setPinnedPanels(current => {
        const next = new Set(current);
        if (next.has(panelId)) {
          next.delete(panelId);
        } else {
          next.add(panelId);
          setHiddenPanels(hidden => {
            const visible = new Set(hidden);
            visible.delete(panelId);
            return visible;
          });
        }
        return next;
      });
    },
  };

  useEffect(() => {
    const closeFocus = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFocusedPanel(null);
    };

    window.addEventListener('keydown', closeFocus);
    return () => window.removeEventListener('keydown', closeFocus);
  }, []);

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
        {renderLayout(layoutMode, orientation, controls)}
        <PanelTray
          hiddenPanels={Array.from(hiddenPanels)}
          onShow={panelId => {
            setHiddenPanels(current => {
              const next = new Set(current);
              next.delete(panelId);
              return next;
            });
          }}
        />
      </main>

      {focusedPanel && (
        <FocusOverlay panelId={focusedPanel} onClose={() => setFocusedPanel(null)}>
          {renderFocusedPanel(focusedPanel)}
        </FocusOverlay>
      )}
    </div>
  );
}

function renderLayout(
  mode: CockpitLayoutMode,
  orientation: 'portrait' | 'landscape',
  controls: LayoutControls,
) {
  if (orientation === 'portrait') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-8">
        <div className="w-full max-w-[400px]">
          {mode === 'fmc-focus' && <CDU />}
          {mode === 'navigation' && <NavigationDisplay />}
          {mode === 'automation' && <AutopilotTrainer />}
          {mode === 'approach' && <PrimaryFlightDisplay />}
          {mode === 'full-deck' && <NavigationDisplay />}
          {mode === 'free-practice' && <PrimaryFlightDisplay />}
        </div>
        <p className="text-[10px] font-cdu text-white/20 uppercase">
          Switch modes or rotate to landscape for multi-instrument view
        </p>
      </div>
    );
  }

  // Landscape Layouts
  switch (mode) {
    case 'fmc-focus':
      return (
        <div className="cockpit-stage cockpit-stage--fmc-focus">
          {renderInstrumentPanel('cdu', controls)}
        </div>
      );
    
    case 'navigation':
      return (
        <div className="cockpit-stage cockpit-stage--navigation">
          {renderInstrumentPanel('nd', controls)}
          {renderInstrumentPanel('cdu', controls, { preferredScale: 0.9 })}
        </div>
      );

    case 'automation':
      return (
        <div className="cockpit-stage cockpit-stage--automation">
          {renderInstrumentPanel('mcp', controls, { className: 'cockpit-mcp-slot', preferredScale: 0.9 })}
          <div className="cockpit-pfd-nd-displays">
            {renderInstrumentPanel('pfd', controls)}
            {renderInstrumentPanel('nd', controls)}
          </div>
        </div>
      );

    case 'approach':
      return (
        <div className="cockpit-stage cockpit-stage--approach">
          <div className="cockpit-pfd-nd-displays">
            {renderInstrumentPanel('pfd', controls)}
            {renderInstrumentPanel('nd', controls)}
          </div>
          {renderInstrumentPanel('mcp', controls, { className: 'cockpit-mcp-slot', preferredScale: 0.9 })}
        </div>
      );

    case 'full-deck':
      return (
        <div className="cockpit-stage cockpit-stage--full-deck">
          {renderInstrumentPanel('mcp', controls, { className: 'cockpit-mcp-slot', preferredScale: 0.82 })}
          <div className="cockpit-pfd-nd-displays">
            {renderInstrumentPanel('pfd', controls)}
            {renderInstrumentPanel('nd', controls)}
          </div>
        </div>
      );

    case 'free-practice':
      return (
        <div className="cockpit-stage cockpit-stage--free-practice">
          {renderInstrumentPanel('pfd', controls, { className: 'cockpit-split-panel' })}
          {renderInstrumentPanel('nd', controls, { className: 'cockpit-split-panel' })}
        </div>
      );

    default:
      return <CDU />;
  }
}

function renderInstrumentPanel(
  panelId: PanelId,
  controls: LayoutControls,
  options: { className?: string; preferredScale?: number } = {},
) {
  if (controls.hiddenPanels.has(panelId)) return null;

  return (
    <InstrumentFit
      target={targetForPanel(panelId)}
      className={options.className}
      preferredScale={options.preferredScale}
      overlay={
        <InstrumentHeader
          panelId={panelId}
          pinned={controls.pinnedPanels.has(panelId)}
          onFocus={controls.onFocus}
          onHide={controls.onHide}
          onTogglePin={controls.onTogglePin}
        />
      }
    >
      {renderPanel(panelId)}
    </InstrumentFit>
  );
}

function renderFocusedPanel(panelId: PanelId) {
  return (
    <InstrumentFit target={targetForPanel(panelId)} preferredScale={panelId === 'mcp' ? 0.9 : 1}>
      {renderPanel(panelId)}
    </InstrumentFit>
  );
}

function renderPanel(panelId: PanelId) {
  switch (panelId) {
    case 'cdu':
      return <CDU />;
    case 'nd':
      return <NavigationDisplay />;
    case 'pfd':
      return <PrimaryFlightDisplay />;
    case 'mcp':
      return <AutopilotTrainer />;
  }
}

function targetForPanel(panelId: PanelId) {
  switch (panelId) {
    case 'cdu':
      return 'boeingCdu';
    case 'nd':
      return 'boeingNd';
    case 'pfd':
      return 'boeingPfd';
    case 'mcp':
      return 'boeingMcp';
  }
}
