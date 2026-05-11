import { useState } from 'react';
import { CDU } from './components/CDU/CDU';
import { AirbusCDU } from './components/CDU/AirbusCDU';
import { ConnectionStatus } from './components/ConnectionStatus';
import { TutorialOverlay } from './components/TutorialOverlay';
import { DemoWelcome } from './components/DemoWelcome';
import { NavigationDisplay } from './components/NavigationDisplay';
import { useKioskMode } from './hooks/useKioskMode';
import { useFMCStore } from './store/useFMCStore';

export default function App() {
  const isKiosk = useKioskMode();
  const [showNd, setShowNd] = useState(true);
  const mode = useFMCStore(s => s.mode);
  const tutorialActive = useFMCStore(s => s.tutorialActive);
  const tutorialCompleted = useFMCStore(s => s.tutorialCompleted);
  const aircraft = useFMCStore(s => s.aircraft);

  const showWelcome = mode === 'STANDBY' && !tutorialActive && !tutorialCompleted;

  return (
    <div className="relative flex h-full w-full items-center justify-center gap-4 overflow-hidden bg-[#111] p-2 max-lg:flex-col max-lg:gap-2 max-sm:p-0">
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
    </div>
  );
}
