import { TrainingMistake } from './trainingTypes';

export const MISTAKE_TYPES = {
  WRONG_KEY: 'wrong_key',
  WRONG_LSK: 'wrong_lsk',
  WRONG_PAGE: 'wrong_page',
  INVALID_DATA: 'invalid_data',
  FMA_AWARENESS: 'fma_awareness',
  ND_AWARENESS: 'nd_awareness',
  MODE_ERROR: 'mode_error',
  TIME_OUT: 'time_out',
  DISCONTINUITY_IGNORED: 'discontinuity_ignored',
};

export function createMistake(
  type: string,
  stepId: string,
  description: string,
  severity: 'low' | 'medium' | 'high' = 'medium',
): TrainingMistake {
  return {
    id: Math.random().toString(36).substr(2, 9),
    type,
    description,
    severity,
    timestamp: Date.now(),
    stepId,
  };
}
