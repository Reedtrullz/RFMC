import { Boeing737CDU } from './boeing/Boeing737CDU';
import { AirbusMCDU } from './airbus/AirbusMCDU';
import { useFMCStore } from '../../store/useFMCStore';

export function CDU() {
  const aircraft = useFMCStore(s => s.aircraft);
  
  if (aircraft === 'AIRBUS_A320') {
    return <AirbusMCDU />;
  }
  
  return <Boeing737CDU />;
}
