import { Boeing737CDU } from './boeing/Boeing737CDU';
import { AirbusMCDU } from './airbus/AirbusMCDU';
import { useFMCStore } from '../../store/useFMCStore';
import { useCDUKeyboard } from '../../hooks/useCDUKeyboard';

export function CDU() {
  const aircraft = useFMCStore(s => s.aircraft);
  useCDUKeyboard();
  
  if (aircraft === 'AIRBUS_A320') {
    return <AirbusMCDU />;
  }
  
  return <Boeing737CDU />;
}
