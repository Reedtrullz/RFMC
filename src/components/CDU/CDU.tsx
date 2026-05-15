import { Boeing737CDU } from './boeing/Boeing737CDU';
import { AirbusMCDU } from './airbus/AirbusMCDU';
import { useFMCStore } from '../../store/useFMCStore';
import { useCDUKeyboard } from '../../hooks/useCDUKeyboard';
import { useAircraftStore } from '../../store/aircraftStore';

export function CDU() {
  const aircraft = useAircraftStore(s => s.aircraft);
  useCDUKeyboard();
  
  if (aircraft === 'AIRBUS_A320') {
    return <AirbusMCDU />;
  }
  
  return <Boeing737CDU />;
}
