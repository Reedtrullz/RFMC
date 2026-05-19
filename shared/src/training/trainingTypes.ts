import type { AircraftType, PageType } from '../types/core';

export type TrainingCategory = 'fmc' | 'autopilot' | 'navigation' | 'approach' | 'checkride';
export type TrainingDifficulty = 'basic' | 'intermediate' | 'advanced';

export type TrainingSetup = {
  page?: PageType;
  scratchpad?: string;
  autopilot?: any; // Partial<AutopilotState>
  flightPlan?: any; // Partial<FlightPlan>
  customState?: Record<string, any>;
};

export type ExpectedAction =
  | { type: 'press_key'; key: string }
  | { type: 'press_lsk'; side: 'L' | 'R'; index: number }
  | { type: 'set_mcp'; field: string; value: number | string | boolean }
  | { type: 'select_mode'; mode: string }
  | { type: 'verify_fma'; mode: string }
  | { type: 'verify_nd'; condition: string }
  | { type: 'enter_scratchpad'; value: string };

export type StateValidation = {
  path: string;
  expected: any;
  operator?: '==' | '!=' | '>' | '<' | 'includes';
};

export type TrainingStep = {
  id: string;
  instruction: string;
  objective: string;
  expectedAction: ExpectedAction;
  stateValidation?: StateValidation[];
  hint?: string;
  commonMistake?: string;
  validation?: string;
  highlightControl?: string;
};

export type PassCriteria = {
  minScore: number;
  maxMistakes: number;
  timeLimitMinutes?: number;
};

export type TrainingScenario = {
  id: string;
  aircraft: AircraftType;
  title: string;
  description: string;
  level: number;
  category: TrainingCategory;
  difficulty: TrainingDifficulty;
  estimatedMinutes: number;
  setup: TrainingSetup;
  steps: TrainingStep[];
  passCriteria: PassCriteria;
};

export type TrainingMistake = {
  id: string;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
  stepId: string;
};

export type TrainingScore = {
  total: number;
  accuracy: number;
  procedure: number;
  modeAwareness: number;
  time: number;
  mistakes: TrainingMistake[];
};

export type LessonProgress = {
  scenarioId: string;
  completed: boolean;
  bestScore: number;
  lastAttempt: number;
  locked: boolean;
};
