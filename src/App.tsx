import { useState } from 'react';
import { CDU } from './components/CDU/CDU';
import { ConnectionStatus } from './components/ConnectionStatus';
import { TutorialOverlay } from './components/TutorialOverlay';
import { DemoWelcome } from './components/DemoWelcome';
import { NavigationDisplay } from './components/ND/NavigationDisplay';
import { useKioskMode } from './hooks/useKioskMode';
import { useFMCStore } from './store/useFMCStore';
import { FmsInspector } from './components/Training/FmsInspector';
import { TrainingReport } from './components/Training/TrainingReport';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useEffect } from 'react';
import { AutopilotTrainer } from './components/Autopilot/AutopilotTrainer';
import { PrimaryFlightDisplay } from './components/PFD/PrimaryFlightDisplay';
import { TrainingOverlay } from './components/Training/TrainingOverlay';
import { CockpitLayout } from './components/CockpitMode/CockpitLayout';
import { SettingsPanel, ChecklistPanel } from './components/CockpitMode/CockpitPanels';
import { PerformanceOverlay } from './components/CockpitMode/PerformanceOverlay';
import { OrientationPrompt } from './components/CockpitMode/OrientationPrompt';
import { InstrumentSlot } from './components/layout/InstrumentSlot';
import { EICASPanel } from './components/CockpitMode/EICASPanel';
import { FmsInspector } from './components/Training/FmsInspector';

export default function App() {
  const isKiosk = useKioskMode();
  const [showNd, setShowNd] = useState(true);
  const mode = useFMCStore(s => s.mode);
  const tutorialActive = useFMCStore(s => s.tutorialActive);
  const tutorialCompleted = useFMCStore(s => s.tutorialCompleted);
  const aircraft = useFMCStore(s => s.aircraft);
  const setAircraft = useFMCStore(s => s.setAircraft);
  const setPage = useFMCStore(s => s.setPage);
  const setRteSubPage = useFMCStore(s => s.setRteSubPage);
  const setTakeoffRefPageIndex = useFMCStore(s => s.setTakeoffRefPageIndex);
  const setNDMode = useFMCStore(s => s.setNDMode);
  const cockpitMode = useFMCStore(s => s.cockpitMode);
  const setCockpitMode = useFMCStore(s => s.setCockpitMode);

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/visual/boeing/pos-init') {
      setAircraft('BOEING_737');
      setPage('POS_INIT');
    } else if (path === '/visual/boeing/ident') {
      setAircraft('BOEING_737');
      setPage('IDENT');
    } else if (path === '/visual/boeing/rte-1') {
      setAircraft('BOEING_737');
      setPage('RTE');
      setRteSubPage(0);
    } else if (path === '/visual/boeing/rte-2') {
      setAircraft('BOEING_737');
      setPage('RTE');
      setRteSubPage(1);
    } else if (path === '/visual/boeing/legs') {
      setAircraft('BOEING_737');
      setPage('LEGS');
    } else if (path === '/visual/boeing/takeoff-ref') {
      setAircraft('BOEING_737');
      setPage('TAKEOFF_REF');
      setTakeoffRefPageIndex(0);
    } else if (path === '/visual/boeing/n1-limit') {
      setAircraft('BOEING_737');
      setPage('N1_LIMIT');
    } else if (path === '/visual/airbus/dir-intc') {
      setAircraft('AIRBUS_A320');
      setPage('DIR_INTC');
    } else if (path === '/visual/airbus/init-a') {
      setAircraft('AIRBUS_A320');
      setPage('INIT_A');
    } else if (path === '/visual/airbus/init-a-aligning') {
      setAircraft('AIRBUS_A320');
      setPage('INIT_A');
      useFMCStore.setState({ position: { ...useFMCStore.getState().position, irsState: 'ALIGNING', irsTimeRemaining: 360 } });
    } else if (path === '/visual/airbus/f-pln') {
      setAircraft('AIRBUS_A320');
      setPage('F_PLN');
    } else if (path === '/visual/nd/boeing-map') {
      setAircraft('BOEING_737');
      setNDMode('L', 'MAP');
      setShowNd(true);
    } else if (path === '/visual/nd/boeing-map-failure') {
      setAircraft('BOEING_737');
      setNDMode('L', 'MAP');
      setShowNd(true);
      useFMCStore.setState({ position: { ...useFMCStore.getState().position, irsState: 'OFF' } });
    } else if (path === '/visual/nd/airbus-arc') {
      setAircraft('AIRBUS_A320');
      setNDMode('L', 'ARC');
      setShowNd(true);
    } else if (path === '/visual/nd/airbus-arc-aligning') {
      setAircraft('AIRBUS_A320');
      setNDMode('L', 'ARC');
      setShowNd(true);
      useFMCStore.setState({ position: { ...useFMCStore.getState().position, irsState: 'ALIGNING' } });
    } else if (path === '/visual/boeing/scratchpad-caution') {
      setAircraft('BOEING_737');
      setPage('LEGS');
      useFMCStore.setState({ 
        alerts: [{ id: 'test-caution', text: 'UNABLE RNP', level: 'CAUTION', source: 'FMC', timestamp: Date.now(), clearable: true }] 
      });
    }
  }, [setAircraft, setPage, setNDMode, setRteSubPage, setTakeoffRefPageIndex]);

  const showWelcome = mode === 'STANDBY' && !tutorialActive && !tutorialCompleted;

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      // Setup interval to check for updates every hour
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error: any) {
      console.log('SW registration error', error);
    },
  });

  const closePwaPrompt = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (cockpitMode) {
    return (
      <>
        <CockpitLayout />
        <SettingsPanel />
        <ChecklistPanel />
        <TrainingOverlay />
        <ConnectionStatus />
        <PerformanceOverlay enabled={import.meta.env.DEV} />
        <OrientationPrompt />
        <EICASPanel />
      </>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-black">
      <div className="flex w-full shrink-0 justify-center items-center py-3 px-4 bg-[#1a1c1c] border-b-4 border-[#2a2d2d] shadow-2xl">
        <AutopilotTrainer />
        <button
          type="button"
          aria-pressed={showNd}
          onClick={() => setShowNd(value => !value)}
          className={`ml-4 px-3 py-2 rounded font-cdu text-xs font-bold uppercase transition-colors ${
            showNd
              ? 'bg-cdu-cyan/20 text-cdu-cyan border border-cdu-cyan/40'
              : 'bg-cdu-bezel text-cdu-text/50 border border-cdu-bezel-light'
          }`}
        >
          ND
        </button>
        <button 
          onClick={() => setCockpitMode(true)}
          className="ml-3 px-4 py-2 bg-cdu-cyan text-cdu-bezel rounded font-cdu text-xs font-bold uppercase hover:bg-cdu-cyan/80 transition-colors"
        >
          Enter Cockpit
        </button>
      </div>

      <main className="grid min-h-0 flex-1 w-full grid-cols-[minmax(220px,1fr)_minmax(260px,1fr)_minmax(320px,420px)] place-items-center gap-4 overflow-hidden p-3 max-lg:grid-cols-2">
        <div className="contents">
          {/* PFD Section */}
          <InstrumentSlot className="h-full w-full max-w-[320px]">
            <PrimaryFlightDisplay />
          </InstrumentSlot>

          {/* ND Section */}
          <InstrumentSlot className={`${showNd ? '' : 'hidden'} h-full w-full max-w-[360px]`}>
            <NavigationDisplay />
          </InstrumentSlot>
        </div>

        {/* CDU Section */}
        <InstrumentSlot
          className="h-full w-full max-lg:col-span-2"
          contentClassName="normal-cdu-scale origin-top"
        >
          <CDU />
        </InstrumentSlot>
      </main>
      {showWelcome && <DemoWelcome />}
      {(tutorialActive || tutorialCompleted) && <TutorialOverlay />}
      <TrainingOverlay />
      {!isKiosk && <ConnectionStatus />}
      <PerformanceOverlay enabled={import.meta.env.DEV} />
      <FmsInspector />
      <TrainingReport />

      {/* PWA Update Prompt */}
      {(offlineReady || needRefresh) && (
        <div className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2 rounded-sm border border-cdu-cyan/30 bg-black/90 p-4 font-cdu text-xs text-cdu-text shadow-lg backdrop-blur-sm">
          <p className="text-cdu-cyan">
            {offlineReady ? 'App ready to work offline.' : 'New update available. Click to reload.'}
          </p>
          <div className="flex justify-end gap-2">
            {needRefresh && (
              <button
                type="button"
                className="rounded-sm bg-cdu-cyan px-3 py-1 font-semibold text-black"
                onClick={() => updateServiceWorker(true)}
              >
                RELOAD
              </button>
            )}
            <button
              type="button"
              className="rounded-sm border border-cdu-text/50 px-3 py-1"
              onClick={closePwaPrompt}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
