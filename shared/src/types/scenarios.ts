import { FlightPhase } from './fmc';

export type ScenarioEventType = 'MESSAGE' | 'FAILURE' | 'PHASE_CHANGE' | 'POSITION_TRIGGER' | 'GOAL_ACHIEVED';

export interface ScenarioEvent {
  id: string;
  type: ScenarioEventType;
  trigger: {
    type: 'TIME' | 'PHASE' | 'WAYPOINT' | 'ALTITUDE';
    value: string | number;
  };
  action: {
    type: 'ADD_MESSAGE' | 'SET_FAILURE' | 'CHANGE_PHASE' | 'SCORE_EVENT' | 'SEND_ACARS' | 'UPLINK_ROUTE';
    payload: any;
  };
  processed?: boolean;
}

export interface TrainingGoal {
  id: string;
  text: string;
  completed: boolean;
}

export interface TrainingScenario {
  id: string;
  name: string;
  description: string;
  initialState: {
    phase: FlightPhase;
    origin: string;
    destination: string;
  };
  events: ScenarioEvent[];
  goals: TrainingGoal[];
}
