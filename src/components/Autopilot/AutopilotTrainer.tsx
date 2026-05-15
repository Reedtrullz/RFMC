import { useAircraftStore } from '../../store/aircraftStore';
import { useAutopilotStore } from '../../store/autopilotStore';
import { BoeingMCP } from '../instruments/boeing/BoeingMCP/BoeingMCP';
import { AirbusFCU } from '../instruments/airbus/AirbusFCU/AirbusFCU';

export function AutopilotTrainer() {
  const aircraft = useAircraftStore(s => s.aircraft);
  const boeing = useAutopilotStore(s => s.boeing);
  const airbus = useAutopilotStore(s => s.airbus);
  const pressButton = useAutopilotStore(s => s.pressButton);
  const updateBoeing = useAutopilotStore(s => s.updateBoeing);
  const updateAirbus = useAutopilotStore(s => s.updateAirbus);

  return (
    <div className="w-full" data-testid="autopilot-trainer">
      {aircraft === 'BOEING_737' ? (
        <BoeingMCP state={boeing} updateState={updateBoeing} pressButton={pressButton} />
      ) : (
        <AirbusFCU state={airbus} updateState={updateAirbus} pressButton={pressButton} />
      )}
    </div>
  );
}
