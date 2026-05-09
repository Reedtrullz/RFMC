import { CDU } from './components/CDU/CDU';
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

  const showWelcome = mode === 'STANDBY' && !tutorialActive && !tutorialCompleted;

  return (
    <>
      <CDU />
      {showWelcome && <DemoWelcome />}
      {(tutorialActive || tutorialCompleted) && <TutorialOverlay />}
      {!isKiosk && <ConnectionStatus />}
    </>
  );
}
