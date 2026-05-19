import { TrainingScenario, ScenarioEvent } from '../types/scenarios';
import { FMCState } from '../types/fmc';
import { distanceNm } from './ndGeometry';

export class ScenarioEngine {
  private activeScenario: TrainingScenario | null = null;
  private startTime: number = 0;

  public startScenario(scenario: TrainingScenario) {
    this.activeScenario = { ...scenario };
    this.startTime = Date.now();
  }

  public update(state: FMCState): { updates: Partial<FMCState>; completedEvents: string[] } {
    if (!this.activeScenario) return { updates: {}, completedEvents: [] };

    const updates: Partial<FMCState> = {};
    const completedEvents: string[] = [];
    const now = Date.now();
    const elapsedSeconds = (now - this.startTime) / 1000;

    for (const event of this.activeScenario.events) {
      if (event.processed) continue;

      let triggered = false;
      const { type, value } = event.trigger;

      switch (type) {
        case 'TIME':
          if (elapsedSeconds >= (value as number)) triggered = true;
          break;
        case 'PHASE':
          if (state.flightPhase === value) triggered = true;
          break;
        case 'WAYPOINT':
          // Check distance to waypoint
          const currentWpt = state.flightPlan.waypoints[0];
          if (currentWpt && currentWpt.ident === value) {
            // If we are close enough or just reached it
            triggered = true;
          }
          break;
        case 'ALTITUDE':
          if (state.aircraftState?.altitude && state.aircraftState.altitude >= (value as number)) {
            triggered = true;
          }
          break;
      }

      if (triggered) {
        this.processAction(event, state, updates);
        event.processed = true;
        completedEvents.push(event.id);
      }
    }

    return { updates, completedEvents };
  }

  public processAction(event: ScenarioEvent, state: FMCState, updates: Partial<FMCState>) {
    const { type, payload } = event.action;

    switch (type) {
      case 'ADD_MESSAGE':
        // Messages are handled via scratchpadMessages array in store
        break;
      case 'SET_FAILURE':
        // Failures like GPS failure
        if (payload.sensor === 'GPS') {
          updates.sensors = state.sensors.map((s) => (s.source === 'GPS' ? { ...s, available: false } : s));
        }
        break;
      case 'CHANGE_PHASE':
        updates.flightPhase = payload;
        break;
      case 'SEND_ACARS':
        const msg = {
          id: Date.now().toString(),
          from: payload.from || 'AOC',
          text: payload.text,
          timestamp: Date.now(),
          read: false,
          type: payload.type || 'AOC',
        };
        updates.atsu = {
          ...state.atsu,
          messages: [msg, ...state.atsu.messages],
        };
        break;
      case 'UPLINK_ROUTE':
        updates.atsu = {
          ...state.atsu,
          pendingUplink: payload,
        };
        // Also trigger an ACARS message to notify student
        this.processAction(
          {
            id: 'uplink-notify',
            type: 'MESSAGE',
            trigger: { type: 'TIME', value: 0 },
            action: { type: 'SEND_ACARS', payload: { from: 'AOC', text: 'F-PLN UPLINK RECEIVED' } },
          },
          state,
          updates,
        );
        break;
    }
  }

  public getActiveScenario() {
    return this.activeScenario;
  }
}
