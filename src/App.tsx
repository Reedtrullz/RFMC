import { CDU } from './components/CDU/CDU';
import { AirbusCDU } from './components/CDU/AirbusCDU';
import { ConnectionStatus } from './components/ConnectionStatus';
import { TutorialOverlay } from './components/TutorialOverlay';
import { DemoWelcome } from './components/DemoWelcome';
import { useKioskMode } from './hooks/useKioskMode';
import { useFMCStore } from './store/useFMCStore';

export default function App() {
  const isKiosk = useKioskMode();
  const mode = useFMCStore(s => s.mode);
  const tutorialActive = useFMCStore(s => s.tutorialActive);
  const tutorialCompleted = useFMCStore(s => s.tutorialCompleted);
  const aircraft = useFMCStore(s => s.aircraft);

  const showWelcome = mode === 'STANDBY' && !tutorialActive && !tutorialCompleted;

  return (
    <>
      {aircraft === 'AIRBUS_A320' ? <AirbusCDU /> : <CDU />}
      {showWelcome && <DemoWelcome />}
      {(tutorialActive || tutorialCompleted) && <TutorialOverlay />}
      {!isKiosk && <ConnectionStatus />}
    </>
  );
}
