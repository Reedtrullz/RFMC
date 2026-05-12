import { useState } from 'react';
import { CDU } from './components/CDU/CDU';
import { ConnectionStatus } from './components/ConnectionStatus';
import { TutorialOverlay } from './components/TutorialOverlay';
import { DemoWelcome } from './components/DemoWelcome';
import { NavigationDisplay } from './components/ND/NavigationDisplay';
import { useKioskMode } from './hooks/useKioskMode';
import { useFMCStore } from './store/useFMCStore';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useEffect } from 'react';
import { AutopilotTrainer } from './components/Autopilot/AutopilotTrainer';
import { FMA } from './components/PFD/FMA';

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
    } else if (path === '/visual/airbus/dir-intc') {
      setAircraft('AIRBUS_A320');
      setPage('DIR_INTC');
    } else if (path === '/visual/airbus/init-a') {
      setAircraft('AIRBUS_A320');
      setPage('INIT_A');
    } else if (path === '/visual/airbus/f-pln') {
      setAircraft('AIRBUS_A320');
      setPage('F_PLN');
    } else if (path === '/visual/nd/boeing-map') {
      setAircraft('BOEING_737');
      setNDMode('L', 'MAP');
      setShowNd(true);
    } else if (path === '/visual/nd/airbus-arc') {
      setAircraft('AIRBUS_A320');
      setNDMode('L', 'ARC');
      setShowNd(true);
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

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <div className="flex w-full justify-center py-4 bg-[#1a1c1c] border-b-4 border-[#2a2d2d] shadow-2xl">
        <AutopilotTrainer />
      </div>

      <main className="flex flex-1 flex-wrap items-center justify-center gap-8 p-4 lg:gap-16 max-sm:px-0">
        <button
          type="button"
          className="fixed right-2 top-2 z-40 hidden h-8 rounded-sm border border-cdu-cyan/70 bg-black/80 px-3 font-cdu text-[10px] uppercase tracking-[0.16em] text-cdu-cyan max-lg:block"
          aria-pressed={showNd}
          onClick={() => setShowNd(current => !current)}
        >
          ND
        </button>

        <div className={`${showNd ? 'flex' : 'hidden'} flex-col items-center gap-4 w-full justify-center lg:flex lg:w-[430px] lg:shrink-0`}>
          <FMA />
          <div className="h-[min(72vh,460px)] w-full lg:h-[min(88vh,560px)]">
            <NavigationDisplay />
          </div>
        </div>

        <div className="flex min-h-0 min-w-0 items-center justify-center lg:w-[560px] lg:shrink-0 max-lg:flex-1">
          <CDU />
        </div>
      </main>
      {showWelcome && <DemoWelcome />}
      {(tutorialActive || tutorialCompleted) && <TutorialOverlay />}
      {!isKiosk && <ConnectionStatus />}

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
