import { useAircraftStore } from '../../store/aircraftStore';
import { useAutopilotStore } from '../../store/autopilotStore';
import { BoeingMCP } from '../instruments/boeing/BoeingMCP/BoeingMCP';
import { AirbusFCU } from '../instruments/airbus/AirbusFCU/AirbusFCU';

import { useFMCStore } from '../../store/useFMCStore';

export function AutopilotTrainer() {
  const aircraft = useAircraftStore((s) => s.aircraft);
  const boeing = useAutopilotStore((s) => s.boeing);
  const airbus = useAutopilotStore((s) => s.airbus);
  const pressAutopilotButton = useAutopilotStore((s) => s.pressButton);
  const updateBoeing = useAutopilotStore((s) => s.updateBoeing);
  const updateAirbus = useAutopilotStore((s) => s.updateAirbus);

  const flightPlan = useFMCStore((s) => s.flightPlan);
  const performance = useFMCStore((s) => s.performance);

  const guardedPressButton = (action: string) => {
    if (aircraft === 'BOEING_737') {
      if (action === 'LNAV' && flightPlan.waypoints.length === 0) {
        useFMCStore.setState({
          scratchpad: '',
          scratchpadError: 'NO ACTIVE ROUTE',
          msgLight: true,
        });
        return;
      }

      if (action === 'VNAV' && (!performance.crzAlt || !performance.grossWeight)) {
        useFMCStore.setState({
          scratchpad: '',
          scratchpadError: 'PERF/VNAV UNAVAILABLE',
          msgLight: true,
        });
        return;
      }
    }

    pressAutopilotButton(action);
  };

  return (
    <div className="w-full" data-testid="autopilot-trainer">
      {aircraft === 'BOEING_737' ? (
        <BoeingMCP state={boeing} updateState={updateBoeing} pressButton={guardedPressButton} />
      ) : (
        <AirbusFCU state={airbus} updateState={updateAirbus} pressButton={guardedPressButton} />
      )}
    </div>
  );
}
