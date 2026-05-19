import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { buildNavigationDisplayModel } from '@shared';
import { useFMCStore } from '../../store/useFMCStore';
import { useAircraftStore } from '../../store/aircraftStore';
import { BoeingNDFrame } from './frame/BoeingNDFrame';
import { AirbusNDFrame } from './frame/AirbusNDFrame';
import { NDControls } from './NDControls';
import { B737ND } from './renderers/B737ND';
import { A320ND } from './renderers/A320ND';
import { useInterpolatedTelemetry } from '../../hooks/useInterpolatedTelemetry';
import { AutopilotState } from '@shared/autopilot/autopilotTypes';
import type { TCASTarget } from '@shared/fmc/ndTypes';
import type { EFISState, FMCState } from '@shared';

export interface NavigationDisplayProps {
  side?: 'L' | 'R';
}

export function NavigationDisplay({ side = 'L' }: NavigationDisplayProps) {
  // Using narrow selectors to prevent unnecessary re-renders
  const aircraft = useAircraftStore((s) => s.aircraft);
  const rawAircraftState = useAircraftStore((s) => s.aircraftState);
  const aircraftState = useInterpolatedTelemetry(rawAircraftState);
  const position = useAircraftStore((s) => s.position);
  const performance = useAircraftStore((s) => s.performance);
  const radios = useAircraftStore((s) => s.radios);
  const takeoff = useAircraftStore((s) => s.takeoff);
  const landing = useAircraftStore((s) => s.landing);
  const ident = useAircraftStore((s) => s.ident);
  const activeNavSource = useAircraftStore((s) => s.activeNavSource);
  const navPerformance = useAircraftStore((s) => s.navPerformance);

  const selectorResult = useFMCStore(
    useShallow((s) => ({
      demoMode: s.demoMode,
      tutorialActive: s.tutorialActive,
      autopilotBoeingHeading: s.autopilot.boeing.heading,
      autopilotAirbusHeading: s.autopilot.airbus.heading,
      autopilotTruthLateralActive: s.autopilot.truth.lateralActive,
      autopilotBoeingCourseL: s.autopilot.boeing.courseL,
      trafficTargets: s.trafficTargets,
      efis: side === 'L' ? s.efisL : s.efisR,
      flightPlan: s.flightPlan,
      route: s.route,
      isModified: s.isModified,
      pendingFlightPlan: s.pendingFlightPlan,
      pendingRoute: s.pendingRoute,
      fixEntries: s.fixEntries,
      fix: s.fix,
      hold: s.hold,
      holdPending: s.holdPending,
      selectedPlanWaypointIndex: s.selectedPlanWaypointIndex,
    })),
  );

  const {
    demoMode,
    tutorialActive,
    autopilotBoeingHeading,
    autopilotAirbusHeading,
    autopilotTruthLateralActive,
    autopilotBoeingCourseL,
    trafficTargets,
    efis,
    flightPlan,
    route,
    isModified,
    pendingFlightPlan,
    pendingRoute,
    fixEntries,
    fix,
    hold,
    holdPending,
    selectedPlanWaypointIndex,
  } = selectorResult;

const model = useMemo(() => {
    const state = {
      ...selectorResult,
      aircraft,
      position,
      activeNavSource,
      navPerformance,
      takeoff,
      landing,
      ident,
      radios,
      aircraftState,
      performance,
    };
    return buildNavigationDisplayModel(state, selectorResult.efis);
  }, [
    aircraft,
    selectorResult.efis,
    flightPlan,
    route,
    isModified,
    pendingFlightPlan,
    pendingRoute,
    aircraftState,
    selectedPlanWaypointIndex,
    fixEntries,
    fix,
    hold,
    holdPending,
    trafficTargets,
    demoMode,
    tutorialActive,
    performance,
    selectorResult.autopilotBoeingHeading,
    selectorResult.autopilotAirbusHeading,
    selectorResult.autopilotTruthLateralActive,
    selectorResult.autopilotBoeingCourseL,
    position,
    activeNavSource,
    navPerformance,
    takeoff,
    landing,
    ident,
    radios,
    side,
  ]);

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
