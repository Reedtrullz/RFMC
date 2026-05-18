import { useMemo } from 'react';
import {
  buildNavigationDisplayModel,
} from '@shared';
import { useFMCStore } from '../../store/useFMCStore';
import { useAircraftStore } from '../../store/aircraftStore';
import { BoeingNDFrame } from './frame/BoeingNDFrame';
import { AirbusNDFrame } from './frame/AirbusNDFrame';
import { NDControls } from './NDControls';
import { B737ND } from './renderers/B737ND';
import { A320ND } from './renderers/A320ND';

export interface NavigationDisplayProps {
  side?: 'L' | 'R';
}

export function NavigationDisplay({ side = 'L' }: NavigationDisplayProps) {
  // Using narrow selectors to prevent unnecessary re-renders
  const aircraft = useAircraftStore(s => s.aircraft);
  const aircraftState = useAircraftStore(s => s.aircraftState);
  const position = useAircraftStore(s => s.position);
  const performance = useAircraftStore(s => s.performance);
  const takeoff = useAircraftStore(s => s.takeoff);
  const landing = useAircraftStore(s => s.landing);
  const ident = useAircraftStore(s => s.ident);
  const activeNavSource = useAircraftStore(s => s.activeNavSource);
  const navPerformance = useAircraftStore(s => s.navPerformance);
  
  // Training and Demo state
  const demoMode = useFMCStore(s => s.demoMode);
  const tutorialActive = useFMCStore(s => s.tutorialActive);
  const autopilot = useFMCStore(s => s.autopilot as any); // Use legacy autopilot if available
  const efis = useFMCStore(s => side === 'L' ? s.efisL : s.efisR);
  const trafficTargets = useFMCStore(s => s.trafficTargets as any);
  
  const flightPlan = useFMCStore(s => s.flightPlan);
  const route = useFMCStore(s => s.route);
  const isModified = useFMCStore(s => s.isModified);
  const pendingFlightPlan = useFMCStore(s => s.pendingFlightPlan);
  const pendingRoute = useFMCStore(s => s.pendingRoute);
  const fixEntries = useFMCStore(s => s.fixEntries);
  const fix = useFMCStore(s => s.fix);
  const hold = useFMCStore(s => s.hold);
  const holdPending = useFMCStore(s => s.holdPending);
  const selectedPlanWaypointIndex = useFMCStore(s => s.selectedPlanWaypointIndex);

  const model = useMemo(
    () => buildNavigationDisplayModel({
      aircraft,
      efisL: side === 'L' ? efis : undefined,
      efisR: side === 'R' ? efis : undefined,
      flightPlan, route, isModified, 
      pendingFlightPlan, pendingRoute, aircraftState, selectedPlanWaypointIndex,
      fixEntries, fix, hold, holdPending, trafficTargets, demoMode, 
      tutorialActive, performance, autopilot, position, activeNavSource, navPerformance,
      takeoff, landing, ident
    } as any, efis),
    [
      aircraft, efis, flightPlan, route, isModified, 
      pendingFlightPlan, pendingRoute, aircraftState, selectedPlanWaypointIndex,
      fixEntries, fix, hold, holdPending, trafficTargets, demoMode, 
      tutorialActive, performance, autopilot, position, activeNavSource, navPerformance,
      takeoff, landing, ident, side
    ]
  );

  return (
    <section
      data-testid="navigation-display"
      className={`cockpit-instrument h-full w-full flex-col rounded-md bg-[#0a0c0c] shadow-[0_32px_64px_rgba(0,0,0,0.8)] ${model.style === 'airbus' ? 'border-airbus-bezel' : 'border-boeing-bezel'}`}
      aria-label="Navigation Display"
    >
      <div className="flex-1 min-h-0 relative overflow-hidden">
        {model.style === 'airbus' ? (
          <AirbusNDFrame model={model}>
            <A320ND model={model} />
          </AirbusNDFrame>
        ) : (
          <BoeingNDFrame model={model} side={side}>
            <B737ND model={model} />
          </BoeingNDFrame>
        )}
      </div>

      {model.style === 'airbus' && <NDControls model={model} side={side} />}
    </section>
  );
}
