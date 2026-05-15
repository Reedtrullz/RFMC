import { useMemo } from 'react';
import {
  buildNavigationDisplayModel,
} from '@shared';
import { useFMCStore } from '../../store/fmcStore';
import { useAircraftStore } from '../../store/aircraftStore';
import { useAutopilotStore } from '../../store/autopilotStore';
import { useCockpitLayoutStore } from '../../store/cockpitLayoutStore';
import { BoeingNDFrame } from './frame/BoeingNDFrame';
import { AirbusNDFrame } from './frame/AirbusNDFrame';
import { NDControls } from './NDControls';
import { B737ND } from './renderers/B737ND';
import { A320ND } from './renderers/A320ND';

export function NavigationDisplay() {
  // Using narrow selectors to prevent unnecessary re-renders
  const aircraft = useAircraftStore(s => s.aircraft);
  const aircraftState = useAircraftStore(s => s.aircraftState);
  const position = useAircraftStore(s => s.position);
  
  const autopilot = useAutopilotStore(s => s.autopilot);
  
  const efisL = useFMCStore(s => s.efisL);
  const efisR = useFMCStore(s => s.efisR);
  const flightPlan = useFMCStore(s => s.flightPlan);
  const route = useFMCStore(s => s.route);
  const isModified = useFMCStore(s => s.isModified);
  const pendingFlightPlan = useFMCStore(s => s.pendingFlightPlan);
  const pendingRoute = useFMCStore(s => s.pendingRoute);
  const selectedPlanWaypointIndex = useFMCStore(s => s.selectedPlanWaypointIndex);
  const fixEntries = useFMCStore(s => s.fixEntries);
  const fix = useFMCStore(s => s.fix);
  const hold = useFMCStore(s => s.hold);
  const holdPending = useFMCStore(s => s.holdPending);
  const trafficTargets = useFMCStore(s => s.trafficTargets);
  const activeNavSource = useFMCStore(s => s.activeNavSource);
  const navPerformance = useFMCStore(s => s.navPerformance);
  const performance = useFMCStore(s => s.performance);
  
  // Training and Demo state
  // Assuming they are still in fmcStore or moved to trainingStore
  // For now keeping them from fmcStore if they exist there
  const demoMode = useFMCStore(s => s.demoMode);
  const tutorialActive = useFMCStore(s => s.tutorialActive);

  const side = 'L'; // In a multi-display setup, this would be a prop
  const efis = side === 'L' ? efisL : efisR;
  
  const model = useMemo(
    () => buildNavigationDisplayModel({
      aircraft, efisL, efisR, flightPlan, route, isModified, 
      pendingFlightPlan, pendingRoute, aircraftState, selectedPlanWaypointIndex,
      fixEntries, fix, hold, holdPending, trafficTargets, demoMode, 
      tutorialActive, performance, autopilot, position, activeNavSource, navPerformance
    } as any, efis),
    [
      aircraft, efisL, efisR, flightPlan, route, isModified, 
      pendingFlightPlan, pendingRoute, aircraftState, selectedPlanWaypointIndex,
      fixEntries, fix, hold, holdPending, trafficTargets, demoMode, 
      tutorialActive, performance, autopilot, position, activeNavSource, navPerformance,
      efis
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
          <BoeingNDFrame model={model}>
            <B737ND model={model} />
          </BoeingNDFrame>
        )}
      </div>

      <NDControls model={model} side={side} />
    </section>
  );
}
