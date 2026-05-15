import { useMemo } from 'react';
import {
  buildNavigationDisplayModel,
} from '@shared';
import { useFMCStore } from '../../store/useFMCStore';
import { BoeingNDFrame } from './frame/BoeingNDFrame';
import { AirbusNDFrame } from './frame/AirbusNDFrame';
import { NDControls } from './NDControls';
import { B737ND } from './renderers/B737ND';
import { A320ND } from './renderers/A320ND';

export function NavigationDisplay() {
  const aircraft = useFMCStore(s => s.aircraft);
  const efisL = useFMCStore(s => s.efisL);
  const efisR = useFMCStore(s => s.efisR);
  const flightPlan = useFMCStore(s => s.flightPlan);
  const route = useFMCStore(s => s.route);
  const isModified = useFMCStore(s => s.isModified);
  const pendingFlightPlan = useFMCStore(s => s.pendingFlightPlan);
  const pendingRoute = useFMCStore(s => s.pendingRoute);
  const aircraftState = useFMCStore(s => s.aircraftState);
  const selectedPlanWaypointIndex = useFMCStore(s => s.selectedPlanWaypointIndex);
  const fixEntries = useFMCStore(s => s.fixEntries);
  const fix = useFMCStore(s => s.fix);
  const hold = useFMCStore(s => s.hold);
  const holdPending = useFMCStore(s => s.holdPending);
  const trafficTargets = useFMCStore(s => s.trafficTargets);
  const demoMode = useFMCStore(s => s.demoMode);
  const tutorialActive = useFMCStore(s => s.tutorialActive);
  const performance = useFMCStore(s => s.performance);
  const autopilot = useFMCStore(s => s.autopilot);
  const position = useFMCStore(s => s.position);
  const activeNavSource = useFMCStore(s => s.activeNavSource);
  const navPerformance = useFMCStore(s => s.navPerformance);

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
      className={`cockpit-instrument h-full w-full max-w-[500px] flex-col rounded-md border-4 bg-[#0a0c0c] p-1 shadow-2xl ${model.style === 'airbus' ? 'border-[#3a3d3d]' : 'border-cdu-bezel'}`}
      aria-label="Navigation Display"
    >
      {model.style === 'airbus' ? (
        <AirbusNDFrame model={model}>
          <A320ND model={model} />
        </AirbusNDFrame>
      ) : (
        <BoeingNDFrame model={model}>
          <B737ND model={model} />
        </BoeingNDFrame>
      )}

      <NDControls model={model} side={side} />
    </section>
  );
}
