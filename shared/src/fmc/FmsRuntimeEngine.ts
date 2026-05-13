import type { FMCState, NavigationPerformance, FlightPhase } from '../types/fmc';
import { selectFmcPositionSource, calculateANP, DEFAULT_RNP } from './fmsNavigation';
import { PhaseManager } from './PhaseManager';
import { LegSequencer } from './LegSequencer';

/**
 * FmsRuntimeEngine centralizes periodic FMS calculations.
 * It is designed to be deterministic and driven by an external clock (tick).
 */
export class FmsRuntimeEngine {
  /**
   * Executes one tick of FMS calculations and returns required state updates.
   * @param state The current FMCState (read-only)
   * @param dtSeconds Delta time since last tick in seconds
   */
  public static tick(state: FMCState, dtSeconds: number): Partial<FMCState> {
    const updates: Partial<FMCState> = {};

    // 1. Update Navigation Performance
    const navPerfUpdates = this.computeNavPerformance(state, dtSeconds);
    if (navPerfUpdates) {
      updates.navPerformance = { ...state.navPerformance, ...navPerfUpdates };
    }

    // 2. Update Flight Phase
    const newPhase = PhaseManager.inferFlightPhase(state);
    if (newPhase !== state.flightPhase) {
      updates.flightPhase = newPhase;
    }
 
    // 3. Evaluate Leg Sequencing
    if (state.aircraftState && state.flightPlan.waypoints.length > 0) {
      const currentLeg = state.flightPlan.waypoints[0];
      const nextLeg = state.flightPlan.waypoints[1];
      const { sequence, reason } = LegSequencer.shouldSequence(currentLeg, nextLeg, state.aircraftState);
      
      if (sequence) {
        updates.flightPlan = {
          ...state.flightPlan,
          waypoints: state.flightPlan.waypoints.slice(1)
        };
        // Also update performance engine with the change if needed
        console.log(`Sequencing: ${reason}`);
      }
    }

    return updates;
  }

  private static computeNavPerformance(state: FMCState, _dtSeconds: number): Partial<NavigationPerformance> | null {
    const sensors = state.sensors ?? [];
    if (sensors.length === 0) return null;

    const activeSource = selectFmcPositionSource(sensors);
    const anp = calculateANP(sensors, activeSource);
    
    // Determine target RNP based on phase if not manual
    let rnp = state.navPerformance?.rnp ?? 2.0;
    if (!state.navPerformance?.rnpManual) {
      const phase = state.flightPhase as NavigationPerformance['phase'];
      rnp = DEFAULT_RNP[phase] || 2.0;
    }

    // Only return if changed (basic optimization)
    if (
      anp === state.navPerformance?.anp && 
      rnp === state.navPerformance?.rnp && 
      activeSource === state.navPerformance?.activeSource
    ) {
      return null;
    }

    return {
      anp,
      rnp,
      activeSource,
    };
  }
}
