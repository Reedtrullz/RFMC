import { useFMCStore } from '../../store/useFMCStore';
import { BoeingMCP } from './boeing/BoeingMCP';

export function AutopilotTrainer() {
  const aircraft = useFMCStore(s => s.aircraft);
  const autopilot = useFMCStore(s => s.autopilot);
  const updateBoeingMCP = useFMCStore(s => s.updateBoeingMCP);
  const updateAirbusFCU = useFMCStore(s => s.updateAirbusFCU);
  const pressMCPButton = useFMCStore(s => s.pressMCPButton);

  return (
    <div className="w-full max-w-[1200px] mx-auto p-4">
      {aircraft === 'BOEING_737' ? (
        <BoeingMCP state={autopilot.boeing} updateState={updateBoeingMCP} pressButton={pressMCPButton} />
      ) : (
        <div className="rounded-xl border-4 border-dashed border-white/10 p-20 text-center">
          <span className="text-white/20 font-bold uppercase tracking-widest">Airbus FCU coming soon</span>
        </div>
      )}
    </div>
  );
}
