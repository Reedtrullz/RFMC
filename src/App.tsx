import { useState } from 'react';
import { CDU } from './components/CDU/CDU';
import { AirbusCDU } from './components/CDU/AirbusCDU';
import { ConnectionStatus } from './components/ConnectionStatus';
import { TutorialOverlay } from './components/TutorialOverlay';
import { DemoWelcome } from './components/DemoWelcome';
import { NavigationDisplay } from './components/NavigationDisplay';
import { useKioskMode } from './hooks/useKioskMode';
import { useFMCStore } from './store/useFMCStore';
import { useRegisterSW } from 'virtual:pwa-register/react';

export default function App() {
  const isKiosk = useKioskMode();
  const [showNd, setShowNd] = useState(true);
  const mode = useFMCStore(s => s.mode);
  const tutorialActive = useFMCStore(s => s.tutorialActive);
  const tutorialCompleted = useFMCStore(s => s.tutorialCompleted);
  const aircraft = useFMCStore(s => s.aircraft);

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
    <div className="relative flex h-full w-full items-center justify-center gap-4 overflow-hidden bg-[#111] p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))] touch-none max-lg:flex-col max-lg:gap-2 max-sm:p-0 max-sm:pb-[env(safe-area-inset-bottom)] max-sm:pt-[env(safe-area-inset-top)]">
      <button
        type="button"
        className="fixed right-2 top-2 z-40 hidden h-8 rounded-sm border border-cdu-cyan/70 bg-black/80 px-3 font-cdu text-[10px] uppercase tracking-[0.16em] text-cdu-cyan max-lg:block"
        aria-pressed={showNd}
        onClick={() => setShowNd(current => !current)}
      >
        ND
      </button>

      <div className={`${showNd ? 'flex' : 'hidden'} h-[min(72vh,460px)] w-full justify-center lg:flex lg:h-[min(88vh,560px)] lg:w-[430px] lg:shrink-0`}>
        <NavigationDisplay />
      </div>

      <div className="flex min-h-0 min-w-0 items-center justify-center lg:w-[560px] lg:shrink-0 max-lg:flex-1">
        {aircraft === 'AIRBUS_A320' ? <AirbusCDU /> : <CDU />}
      </div>
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
