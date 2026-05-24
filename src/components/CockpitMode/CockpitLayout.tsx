import { useEffect, useState, useMemo, type CSSProperties } from 'react';
import { buildTrainingProgress, type AircraftType, type CockpitLayoutMode } from '@shared';
import { useFMCStore } from '../../store/useFMCStore';
import { CDU } from '../CDU/CDU';
import { NavigationDisplay } from '../ND/NavigationDisplay';
import { PrimaryFlightDisplay } from '../instruments/common/PFD';
import { AutopilotTrainer } from '../Autopilot/AutopilotTrainer';
import { DisplaySelector } from './DisplaySelector';
import { BrightnessPanel } from './BrightnessPanel';
import { useOrientation } from '../../hooks/useOrientation';
import { useWakeLock } from '../../hooks/useWakeLock';
import { InstrumentFit } from '../layout/InstrumentFit';
import type { InstrumentTarget } from '../layout/instrumentDimensions';
import { InstrumentHeader } from '../workspace/InstrumentHeader';
import { FocusOverlay } from '../workspace/FocusOverlay';
import { CockpitToolbar } from './CockpitToolbar';
import { PanelTray } from '../workspace/PanelTray';
import type { PanelId } from '../workspace/panelTypes';
import { getTrainingModeConfig, validateVisiblePanels } from '../../config/trainingModes';
import { CockpitEmptyState } from './CockpitEmptyState';
import { ModeHelpCard } from './ModeHelpCard';
import { FirstRunGuidance } from './FirstRunGuidance';
import { CockpitLayoutGrid } from './CockpitLayoutGrid';
import { CockpitShell } from './CockpitShell';
import { EICASInstrument } from './EICASPanel';

import { useCockpitLayoutStore } from '../../store/cockpitLayoutStore';
import { useAircraftStore } from '../../store/aircraftStore';
import { useAutopilotStore } from '../../store/autopilotStore';
import { useConnectionStore } from '../../store/connectionStore';
import { KeyboardHelpOverlay } from './KeyboardHelpOverlay';

type InstrumentPanelId = Extract<PanelId, 'cdu' | 'nd' | 'pfd' | 'autoflight' | 'eicas'>;

interface LayoutControls {
  aircraft: AircraftType;
  hiddenPanels: Set<PanelId>;
  pinnedPanels: Set<PanelId>;
  instrumentZoom: Record<InstrumentPanelId, number>;
  onFocus: (panelId: PanelId) => void;
  onHide: (panelId: PanelId) => void;
  onTogglePin: (panelId: PanelId) => void;
  onZoomIn: (panelId: InstrumentPanelId) => void;
  onZoomOut: (panelId: InstrumentPanelId) => void;
  onZoomReset: (panelId: InstrumentPanelId) => void;
  expectedPanel: PanelId | null;
  layoutMode: CockpitLayoutMode;
  tutorialActive: boolean;
}

const instrumentPanelIds: InstrumentPanelId[] = ['cdu', 'nd', 'pfd', 'autoflight', 'eicas'];

function isInstrumentPanelId(panelId: PanelId | null): panelId is InstrumentPanelId {
  return !!panelId && instrumentPanelIds.includes(panelId as InstrumentPanelId);
}

export function CockpitLayout() {
  const aircraft = useAircraftStore((s) => s.aircraft);
  const aircraftState = useAircraftStore((s) => s.aircraftState);
  const autopilotTruth = useAutopilotStore((s) => s.truth);
  const connectionStatus = useConnectionStore((s) => s.connectionStatus);
  const connectionMode = useConnectionStore((s) => s.connectionMode);

  const layoutMode = useCockpitLayoutStore((s) => s.cockpitLayoutMode);
  const setLayoutMode = useCockpitLayoutStore((s) => s.setCockpitLayoutMode);
  const focusedPanel = useCockpitLayoutStore((s) => s.focusedPanel);
  const setFocusedPanel = useCockpitLayoutStore((s) => s.setFocusedPanel);
  const hiddenPanels = useCockpitLayoutStore((s) => s.hiddenPanels);
  const pinnedPanels = useCockpitLayoutStore((s) => s.pinnedPanels);
  const togglePanelHidden = useCockpitLayoutStore((s) => s.togglePanelHidden);
  const togglePanelPinned = useCockpitLayoutStore((s) => s.togglePanelPinned);
  const restoreRecommendedLayout = useCockpitLayoutStore((s) => s.restoreRecommendedLayout);
  const instrumentZoom = useCockpitLayoutStore((s) => s.instrumentZoom);
  const adjustInstrumentZoom = useCockpitLayoutStore((s) => s.adjustInstrumentZoom);
  const resetInstrumentZoom = useCockpitLayoutStore((s) => s.resetInstrumentZoom);
  const highContrast = useCockpitLayoutStore((s) => s.highContrast);
  const brightness = useCockpitLayoutStore((s) => s.brightness);
  const orientation = useOrientation();

  const currentPage = useFMCStore((s) => s.currentPage);
  const flightPhase = useFMCStore((s) => s.flightPhase);
  const tutorialActive = useFMCStore((s) => s.tutorialActive);

  void currentPage;
  void flightPhase;
  void tutorialActive;

  const autopilotState = useAutopilotStore((state) => ({
    boeing: state.boeing,
    airbus: state.airbus,
    truth: state.truth,
  }));

  const progress = useMemo(() => {
    return buildTrainingProgress({
      aircraft,
      layoutMode,
      fmcState: useFMCStore.getState(),
      autopilotState,
    });
  }, [aircraft, layoutMode, currentPage, flightPhase, tutorialActive, autopilotState]);

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const aspectRatio = windowSize.width / windowSize.height;
  const isTall = aspectRatio < 1.35;

  useWakeLock(true);

  const isNight = brightness < 40;
  const validation = validateVisiblePanels(layoutMode, hiddenPanels);
  const controls: LayoutControls = useMemo(
    () => ({
      aircraft,
      hiddenPanels: new Set(hiddenPanels),
      pinnedPanels: new Set(pinnedPanels),
      instrumentZoom,
      onFocus: setFocusedPanel,
      onHide: togglePanelHidden,
      onTogglePin: togglePanelPinned,
      onZoomIn: (panelId) => adjustInstrumentZoom(panelId, 0.08),
      onZoomOut: (panelId) => adjustInstrumentZoom(panelId, -0.08),
      onZoomReset: resetInstrumentZoom,
      expectedPanel: progress.expectedPanel,
      layoutMode,
      tutorialActive,
    }),
    [
      aircraft,
      hiddenPanels,
      pinnedPanels,
      instrumentZoom,
      setFocusedPanel,
      togglePanelHidden,
      togglePanelPinned,
      adjustInstrumentZoom,
      resetInstrumentZoom,
      progress.expectedPanel,
      layoutMode,
      tutorialActive,
    ],
  );

  useEffect(() => {
    const closeFocus = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFocusedPanel(null);
    };

    window.addEventListener('keydown', closeFocus);
    return () => window.removeEventListener('keydown', closeFocus);
  }, [setFocusedPanel]);

  const dynamicStageStyle = {
    '--bezel-padding': isTall ? '8px' : '24px',
    '--side-margin': isTall ? '4px' : '32px',
    '--stage-aspect-ratio': aspectRatio.toFixed(3),
  } as CSSProperties;

  const cockpitStyle = {
    '--cockpit-brightness': brightness / 100,
    '--cockpit-contrast': isNight ? 1.2 : 1.0,
    ...dynamicStageStyle,
  } as CSSProperties;

  return (
    <div
      className={`
        cockpit-grid cockpit-lock no-scrollbar bg-[#1c2226] text-white
        ${isNight ? 'cockpit-night' : ''}
        ${highContrast ? 'cockpit-high-contrast' : ''}
        ${isTall ? 'cockpit--tall-viewport' : 'cockpit--wide-viewport'}
      `}
      style={cockpitStyle}
    >
      <div className="px-4 py-2 flex flex-col gap-3 border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <DisplaySelector current={layoutMode} onSelect={setLayoutMode} />
          <div className="flex items-center gap-4">
            <BrightnessPanel />
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-[10px] font-cdu text-cdu-cyan uppercase font-bold tracking-tighter">
                Cockpit Mode
              </span>
              <span className="text-[8px] font-cdu text-white/30 uppercase">v1.3.0-WORKSPACE</span>
            </div>
          </div>
        </div>
        <CockpitToolbar />
      </div>

      <main className="cockpit-main">
        <FirstRunGuidance />
        {layoutMode !== 'full-deck' && (
          <div className="mode-help-sidebar">
            <ModeHelpCard mode={layoutMode} onResetLayout={restoreRecommendedLayout} />
          </div>
        )}
        <div className="cockpit-main__stage">
          {focusedPanel && isInstrumentPanelId(focusedPanel) ? (
            <FocusOverlay panelId={focusedPanel} onClose={() => setFocusedPanel(null)}>
              {renderFocusedPanel(focusedPanel, controls)}
            </FocusOverlay>
          ) : (
            <>
              {renderLayout(layoutMode, orientation, controls)}

              {!validation.valid && (
                <div className="cockpit-layout-warning">
                  <CockpitEmptyState
                    mode={layoutMode}
                    missingPanels={validation.missingRequired}
                    onRestore={restoreRecommendedLayout}
                  />
                </div>
              )}
            </>
          )}
        </div>
        <div className="panel-tray-dock">
          <PanelTray hiddenPanels={hiddenPanels} onShow={togglePanelHidden} />
        </div>
      </main>
      <KeyboardHelpOverlay />
    </div>
  );
}

function renderLayout(mode: CockpitLayoutMode, orientation: 'portrait' | 'landscape', controls: LayoutControls) {
  const config = getTrainingModeConfig(mode);

  if (orientation === 'portrait') {
    return (
      <CockpitLayoutGrid preset="mobileSwipeDeck" modeClass="cockpit-stage--portrait">
        {config.visiblePanels.filter(isInstrumentPanelId).map((panelId) => renderInstrumentPanel(panelId, controls))}
      </CockpitLayoutGrid>
    );
  }

  switch (mode) {
    case 'fmc-focus':
      return (
        <CockpitLayoutGrid preset="singleInstrumentFocus" modeClass="cockpit-stage--fmc-focus">
          {renderInstrumentPanel('cdu', controls, { className: 'cockpit-slot--cdu' })}
        </CockpitLayoutGrid>
      );

    case 'navigation':
      return (
        <CockpitLayoutGrid preset="twoPanelTraining" modeClass="cockpit-stage--navigation">
          {renderInstrumentPanel('nd', controls, { className: 'cockpit-slot--nd' })}
          {renderInstrumentPanel('cdu', controls, { className: 'cockpit-slot--cdu' })}
        </CockpitLayoutGrid>
      );

    case 'automation':
      return (
        <CockpitLayoutGrid preset="threePanelTraining" modeClass="cockpit-stage--automation">
          {renderInstrumentPanel('autoflight', controls, { className: 'cockpit-slot--mcp' })}
          {renderInstrumentPanel('pfd', controls, { className: 'cockpit-slot--pfd' })}
          {renderInstrumentPanel('nd', controls, { className: 'cockpit-slot--nd' })}
        </CockpitLayoutGrid>
      );

    case 'approach':
      return (
        <CockpitLayoutGrid preset="threePanelTraining" modeClass="cockpit-stage--approach">
          {renderInstrumentPanel('autoflight', controls, { className: 'cockpit-slot--mcp' })}
          {renderInstrumentPanel('pfd', controls, { className: 'cockpit-slot--pfd' })}
          {renderInstrumentPanel('nd', controls, { className: 'cockpit-slot--nd' })}
        </CockpitLayoutGrid>
      );

    case 'full-deck':
      return (
        <CockpitShell aircraft={controls.aircraft}>
          <CockpitShell.Glareshield>{renderInstrumentPanel('autoflight', controls)}</CockpitShell.Glareshield>
          <CockpitShell.MainPanel>
            {renderInstrumentPanel('pfd', controls)}
            {renderInstrumentPanel('nd', controls)}
            {renderInstrumentPanel('cdu', controls)}
          </CockpitShell.MainPanel>
          {!controls.hiddenPanels.has('eicas') && (
            <CockpitShell.Pedestal>{renderInstrumentPanel('eicas', controls)}</CockpitShell.Pedestal>
          )}
        </CockpitShell>
      );

    case 'free-practice': {
      const hasCdu = !controls.hiddenPanels.has('cdu');
      const hasNd = !controls.hiddenPanels.has('nd');
      const hasPfd = !controls.hiddenPanels.has('pfd');
      const hasAutoflight = !controls.hiddenPanels.has('autoflight');

      // 1. Full Deck (All 4 active)
      if (hasCdu && hasNd && hasPfd && hasAutoflight) {
        return (
          <CockpitShell aircraft={controls.aircraft}>
            <CockpitShell.Glareshield>{renderInstrumentPanel('autoflight', controls)}</CockpitShell.Glareshield>
            <CockpitShell.MainPanel>
              {renderInstrumentPanel('pfd', controls)}
              {renderInstrumentPanel('nd', controls)}
              {!controls.hiddenPanels.has('eicas') && renderInstrumentPanel('eicas', controls)}
            </CockpitShell.MainPanel>
            <CockpitShell.Pedestal>{renderInstrumentPanel('cdu', controls)}</CockpitShell.Pedestal>
          </CockpitShell>
        );
      }

      // 2. Three panels (Autoflight + PFD + ND active)
      if (hasAutoflight && hasPfd && hasNd) {
        return (
          <CockpitLayoutGrid preset="threePanelTraining" modeClass="cockpit-stage--automation">
            {renderInstrumentPanel('autoflight', controls, { className: 'cockpit-slot--mcp' })}
            {renderInstrumentPanel('pfd', controls, { className: 'cockpit-slot--pfd' })}
            {renderInstrumentPanel('nd', controls, { className: 'cockpit-slot--nd' })}
          </CockpitLayoutGrid>
        );
      }

      // 3. Two panels (PFD + ND active)
      if (hasPfd && hasNd) {
        return (
          <CockpitLayoutGrid preset="twoPanelTraining" modeClass="cockpit-stage--free-practice">
            {renderInstrumentPanel('pfd', controls, { className: 'cockpit-split-panel' })}
            {renderInstrumentPanel('nd', controls, { className: 'cockpit-split-panel' })}
          </CockpitLayoutGrid>
        );
      }

      // 4. Navigation (CDU + ND active)
      if (hasCdu && hasNd) {
        return (
          <CockpitLayoutGrid preset="twoPanelTraining" modeClass="cockpit-stage--navigation">
            {renderInstrumentPanel('nd', controls, { className: 'cockpit-slot--nd' })}
            {renderInstrumentPanel('cdu', controls, { className: 'cockpit-slot--cdu' })}
          </CockpitLayoutGrid>
        );
      }

      // 5. FMC Focus (Only CDU active)
      if (hasCdu) {
        return (
          <CockpitLayoutGrid preset="singleInstrumentFocus" modeClass="cockpit-stage--fmc-focus">
            {renderInstrumentPanel('cdu', controls, { className: 'cockpit-slot--cdu' })}
          </CockpitLayoutGrid>
        );
      }

      // Default fallback
      return (
        <CockpitLayoutGrid preset="twoPanelTraining" modeClass="cockpit-stage--free-practice">
          {hasPfd && renderInstrumentPanel('pfd', controls, { className: 'cockpit-split-panel' })}
          {hasNd && renderInstrumentPanel('nd', controls, { className: 'cockpit-split-panel' })}
          {!controls.hiddenPanels.has('eicas') &&
            renderInstrumentPanel('eicas', controls, { className: 'cockpit-free-practice__optional' })}
          {hasCdu && renderInstrumentPanel('cdu', controls, { className: 'cockpit-free-practice__optional' })}
          {hasAutoflight &&
            renderInstrumentPanel('autoflight', controls, {
              className: 'cockpit-mcp-slot cockpit-free-practice__optional',
            })}
        </CockpitLayoutGrid>
      );
    }
  }
}

function renderInstrumentPanel(
  panelId: InstrumentPanelId,
  controls: LayoutControls,
  options: { className?: string; preferredScale?: number } = {},
) {
  if (controls.hiddenPanels.has(panelId)) return null;

  const zoom = options.preferredScale ?? controls.instrumentZoom[panelId] ?? 1;
  const isExpected =
    controls.tutorialActive && controls.layoutMode !== 'free-practice' && controls.expectedPanel === panelId;
  const highlightClass = isExpected
    ? controls.aircraft === 'AIRBUS_A320'
      ? 'highlighted-airbus'
      : 'highlighted-boeing'
    : '';

  return (
    <InstrumentFit
      key={panelId}
      target={targetForPanel(panelId, controls.aircraft)}
      className={`${options.className || ''} ${highlightClass}`.trim()}
      preferredScale={zoom}
      dataTestId={`${panelId}-panel`}
      overlay={
        <InstrumentHeader
          panelId={panelId}
          pinned={controls.pinnedPanels.has(panelId)}
          zoom={zoom}
          onFocus={controls.onFocus}
          onHide={controls.onHide}
          onTogglePin={controls.onTogglePin}
          onZoomIn={(id) => isInstrumentPanelId(id) && controls.onZoomIn(id)}
          onZoomOut={(id) => isInstrumentPanelId(id) && controls.onZoomOut(id)}
          onZoomReset={(id) => isInstrumentPanelId(id) && controls.onZoomReset(id)}
        />
      }
    >
      {renderPanel(panelId)}
    </InstrumentFit>
  );
}

function renderFocusedPanel(panelId: InstrumentPanelId, controls: LayoutControls) {
  const focusedScale =
    panelId === 'autoflight'
      ? controls.aircraft === 'BOEING_737'
        ? 0.58
        : 0.72
      : Math.max(controls.instrumentZoom[panelId] ?? 1, 1);

  return (
    <InstrumentFit
      target={targetForPanel(panelId, controls.aircraft)}
      preferredScale={focusedScale}
      dataTestId={`focused-${panelId}-panel`}
    >
      {renderPanel(panelId)}
    </InstrumentFit>
  );
}

function renderPanel(panelId: InstrumentPanelId) {
  switch (panelId) {
    case 'cdu':
      return <CDU />;
    case 'nd':
      return <NavigationDisplay />;
    case 'pfd':
      return <PrimaryFlightDisplay />;
    case 'eicas':
      return <EICASInstrument />;
    case 'autoflight':
      return <AutopilotTrainer />;
  }
}

function targetForPanel(panelId: InstrumentPanelId, aircraft: AircraftType): InstrumentTarget {
  if (aircraft === 'AIRBUS_A320') {
    switch (panelId) {
      case 'cdu':
        return 'airbusMcdu';
      case 'nd':
        return 'airbusNd';
      case 'pfd':
        return 'airbusPfd';
      case 'eicas':
        return 'airbusEcam';
      case 'autoflight':
        return 'airbusFcu';
    }
  }

  switch (panelId) {
    case 'cdu':
      return 'boeingCdu';
    case 'nd':
      return 'boeingNd';
    case 'pfd':
      return 'boeingPfd';
    case 'eicas':
      return 'boeingEicas';
    case 'autoflight':
      return 'boeingMcp';
  }
}
