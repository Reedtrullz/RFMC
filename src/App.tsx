import { CDU } from './components/CDU/CDU';
import { ConnectionStatus } from './components/ConnectionStatus';
import { useKioskMode } from './hooks/useKioskMode';

export default function App() {
  const isKiosk = useKioskMode();

  return (
    <>
      <CDU />
      {!isKiosk && <ConnectionStatus />}
    </>
  );
}
