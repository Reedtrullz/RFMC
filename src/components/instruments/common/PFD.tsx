import { useFMCStore } from '../../../store/useFMCStore';
import { useAircraftStore } from '../../../store/aircraftStore';
import { InstrumentBezel } from './InstrumentBezel';
import { ScreenGlass } from './ScreenGlass';
import { BoeingPFD } from '../boeing/BoeingPFD';
import { AirbusPFD } from '../airbus/AirbusPFD';

export function PrimaryFlightDisplay() {
  const aircraft = useAircraftStore((s) => s.aircraft);
  const isBoeing = aircraft === 'BOEING_737';

  return (
    <div className="h-full w-full" data-testid="primary-flight-display">
      <InstrumentBezel variant={isBoeing ? 'boeing-pfd' : 'airbus-pfd'} className="h-full w-full">
        <ScreenGlass className="h-full w-full">{isBoeing ? <BoeingPFD /> : <AirbusPFD />}</ScreenGlass>
      </InstrumentBezel>
    </div>
  );
}
