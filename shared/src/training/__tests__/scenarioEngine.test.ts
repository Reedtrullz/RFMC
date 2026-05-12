import { TrainingScenarioEngine } from '../scenarioEngine';
import { TrainingScenario } from '../trainingTypes';

const testScenario: TrainingScenario = {
  id: 'test-scenario',
  aircraft: 'BOEING_737',
  title: 'Test Scenario',
  description: 'Test Description',
  level: 1,
  category: 'fmc',
  difficulty: 'basic',
  estimatedMinutes: 5,
  setup: {},
  steps: [
    {
      id: 'step-1',
      instruction: 'Press A',
      objective: 'Objective A',
      expectedAction: { type: 'press_key', key: 'A' },
      validation: 'true'
    },
    {
      id: 'step-2',
      instruction: 'Press B',
      objective: 'Objective B',
      expectedAction: { type: 'press_key', key: 'B' },
      validation: 'true'
    }
  ],
  passCriteria: {
    minScore: 80,
    maxMistakes: 1
  }
};

describe('TrainingScenarioEngine', () => {
  it('should start at the first step', () => {
    const engine = new TrainingScenarioEngine(testScenario);
    const step = engine.start();
    expect(step.id).toBe('step-1');
  });

  it('should advance when correct action is taken', () => {
    const engine = new TrainingScenarioEngine(testScenario);
    engine.start();
    const result = engine.processAction({ type: 'press_key', key: 'A' }, {});
    expect(result.success).toBe(true);
    expect(result.completed).toBe(false);
    expect(result.nextStep?.id).toBe('step-2');
  });

  it('should record mistake when wrong action is taken', () => {
    const engine = new TrainingScenarioEngine(testScenario);
    engine.start();
    const result = engine.processAction({ type: 'press_key', key: 'C' }, {});
    expect(result.success).toBe(false);
    expect(result.mistake).toBeDefined();
    expect(result.mistake?.type).toBe('wrong_key');
  });

  it('should complete when all steps are finished', () => {
    const engine = new TrainingScenarioEngine(testScenario);
    engine.start();
    engine.processAction({ type: 'press_key', key: 'A' }, {});
    const result = engine.processAction({ type: 'press_key', key: 'B' }, {});
    expect(result.success).toBe(true);
    expect(result.completed).toBe(true);
  });

  it('should calculate score correctly', () => {
    const engine = new TrainingScenarioEngine(testScenario);
    engine.start();
    engine.processAction({ type: 'press_key', key: 'C' }, {}); // Mistake
    engine.processAction({ type: 'press_key', key: 'A' }, {});
    engine.processAction({ type: 'press_key', key: 'B' }, {});
    
    const summary = engine.getSummary();
    expect(summary.score.total).toBeLessThan(100);
    expect(summary.mistakes.length).toBe(1);
  });
});
