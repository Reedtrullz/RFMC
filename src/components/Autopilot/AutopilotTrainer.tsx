import { useFMCStore } from '../../store/useFMCStore';
import { BoeingMCP } from './boeing/BoeingMCP';
import { AirbusFCU } from './airbus/AirbusFCU';

export function AutopilotTrainer() {
  const aircraft = useFMCStore(s => s.aircraft);
  const autopilot = useFMCStore(s => s.autopilot);
  const updateBoeingMCP = useFMCStore(s => s.updateBoeingMCP);
  const updateAirbusFCU = useFMCStore(s => s.updateAirbusFCU);
  const pressMCPButton = useFMCStore(s => s.pressMCPButton);

  return (
    <div className="w-full" data-testid="autopilot-trainer">
      {aircraft === 'BOEING_737' ? (
        <BoeingMCP state={autopilot.boeing} updateState={updateBoeingMCP} pressButton={pressMCPButton} />
      ) : (
        <AirbusFCU state={autopilot.airbus} updateState={updateAirbusFCU} pressButton={pressMCPButton} />
      )}
    </div>
  );
}
