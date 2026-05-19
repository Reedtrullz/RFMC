import { TrainingMistake, TrainingScore, PassCriteria } from './trainingTypes';

export function calculateScore(
  mistakes: TrainingMistake[],
  timeSeconds: number,
  stepCount: number,
  estimatedMinutes: number,
): TrainingScore {
  const baseScore = 100;

  // Penalties
  const mistakePenalty = mistakes.reduce((acc, m) => {
    if (m.severity === 'high') return acc + 15;
    if (m.severity === 'medium') return acc + 10;
    return acc + 5;
  }, 0);

  const timeLimitSeconds = estimatedMinutes * 60;
  const timePenalty =
    timeSeconds > timeLimitSeconds ? Math.min(20, Math.floor((timeSeconds - timeLimitSeconds) / 10)) : 0;

  const total = Math.max(0, baseScore - mistakePenalty - timePenalty);

  // Detail scores
  const accuracyMistakes = mistakes.filter((m) => m.type === 'accuracy').length;
  const accuracy = Math.max(0, 100 - accuracyMistakes * 10);

  const procedureMistakes = mistakes.filter((m) => m.type === 'procedure').length;
  const procedure = Math.max(0, 100 - procedureMistakes * 10);

  const modeAwarenessMistakes = mistakes.filter((m) => m.type === 'mode_awareness').length;
  const modeAwareness = Math.max(0, 100 - modeAwarenessMistakes * 15);

  return {
    total,
    accuracy,
    procedure,
    modeAwareness,
    time: timeSeconds,
    mistakes,
  };
}

export function isPass(score: TrainingScore, criteria: PassCriteria): boolean {
  if (score.total < criteria.minScore) return false;
  if (score.mistakes.length > criteria.maxMistakes) return false;
  return true;
}
