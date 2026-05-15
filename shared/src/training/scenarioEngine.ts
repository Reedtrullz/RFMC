import { TrainingScenario, TrainingStep, TrainingMistake, ExpectedAction } from './trainingTypes';
import { createMistake, MISTAKE_TYPES } from './mistakes';
import { calculateScore } from './scoring';

export class TrainingScenarioEngine {
  private scenario: TrainingScenario;
  private currentStepIndex: number = 0;
  private mistakes: TrainingMistake[] = [];
  private startTime: number = 0;
  private isHintsEnabled: boolean = true;

  constructor(scenario: TrainingScenario, options: { hintsEnabled?: boolean } = {}) {
    this.scenario = scenario;
    this.isHintsEnabled = options.hintsEnabled ?? true;
  }
  
  loadScenario(scenario: TrainingScenario) {
    this.scenario = scenario;
    this.currentStepIndex = 0;
  }

  start() {
    this.startTime = Date.now();
    this.currentStepIndex = 0;
    this.mistakes = [];
    return this.getCurrentStep();
  }

  getCurrentStep(): TrainingStep {
    return this.scenario.steps[this.currentStepIndex];
  }

  processAction(action: ExpectedAction, currentState: any): { 
    success: boolean; 
    completed: boolean; 
    mistake?: TrainingMistake;
    nextStep?: TrainingStep;
  } {
    const step = this.getCurrentStep();
    const isCorrectAction = this.validateAction(action, step.expectedAction);
    const isStateCorrect = step.stateValidation 
      ? this.validateState(currentState, step.stateValidation)
      : true;

    if (isCorrectAction && isStateCorrect) {
      this.currentStepIndex++;
      const completed = this.currentStepIndex >= this.scenario.steps.length;
      return {
        success: true,
        completed,
        nextStep: completed ? undefined : this.getCurrentStep()
      };
    } else {
      let description = `Expected ${this.formatAction(step.expectedAction)}`;
      let diagnosticHint: string | undefined;

      if (!isStateCorrect && step.stateValidation) {
        const failed = step.stateValidation.find(v => !this.checkCondition(this.getNestedValue(currentState, v.path), v.expected, v.operator));
        if (failed) {
           description = `Condition failed: ${failed.path} should be ${failed.expected}`;
           
           // Diagnostic logic
           if (failed.path.includes('autopilot.truth')) {
             diagnosticHint = this.getDiagnosticHint(failed, currentState);
           }
        }
      } else if (!isCorrectAction) {
        description += ` but got ${this.formatAction(action)}`;
      }

      const mistake = createMistake(
        this.getMistakeType(action),
        step.id,
        diagnosticHint ? `${description}. Hint: ${diagnosticHint}` : description,
        'medium'
      );
      this.mistakes.push(mistake);
      return {
        success: false,
        completed: false,
        mistake
      };
    }
  }

  private getDiagnosticHint(failed: any, state: any): string | undefined {
    if (failed.path.includes('lateralActive') && failed.expected === 'LNAV') {
      if (!state.flightPlan.waypoints.length) return "LNAV requires an active flight plan.";
      if (state.position.irsState !== 'NAV') return "LNAV requires aligned IRS.";
    }
    if (failed.path.includes('verticalActive') && failed.expected === 'VNAV_PTH') {
      if (!state.performance.zfw) return "VNAV requires performance data (ZFW).";
    }
    return undefined;
  }

  private validateState(state: any, validations: any[]): boolean {
    return validations.every(v => {
      const actual = this.getNestedValue(state, v.path);
      return this.checkCondition(actual, v.expected, v.operator);
    });
  }

  private checkCondition(actual: any, expected: any, operator: string = '=='): boolean {
    switch (operator) {
      case '!=': return actual != expected;
      case '>': return actual > expected;
      case '<': return actual < expected;
      case 'includes': return Array.isArray(actual) && actual.includes(expected);
      default: return actual == expected;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
  }

  private validateAction(actual: ExpectedAction, expected: ExpectedAction): boolean {
    if (actual.type !== expected.type) return false;

    switch (expected.type) {
      case 'press_key':
        return (actual as any).key === expected.key;
      case 'press_lsk':
        return (actual as any).side === expected.side && (actual as any).index === expected.index;
      case 'enter_scratchpad':
        return (actual as any).value === expected.value;
      case 'set_mcp':
        return (actual as any).field === expected.field && (actual as any).value === expected.value;
      // Add other validations as needed
      default:
        return false;
    }
  }

  private getMistakeType(action: ExpectedAction): string {
    switch (action.type) {
      case 'press_key': return MISTAKE_TYPES.WRONG_KEY;
      case 'press_lsk': return MISTAKE_TYPES.WRONG_LSK;
      case 'enter_scratchpad': return MISTAKE_TYPES.INVALID_DATA;
      default: return MISTAKE_TYPES.MODE_ERROR;
    }
  }

  private formatAction(action: ExpectedAction): string {
    switch (action.type) {
      case 'press_key': return `Key ${action.key}`;
      case 'press_lsk': return `LSK ${action.side}${action.index}`;
      case 'enter_scratchpad': return `Input "${action.value}"`;
      case 'set_mcp': return `Set MCP ${action.field} to ${action.value}`;
      case 'verify_fma': return `Verify FMA ${action.mode}`;
      default: return action.type;
    }
  }

  getSummary() {
    const timeSeconds = (Date.now() - this.startTime) / 1000;
    const score = calculateScore(
      this.mistakes,
      timeSeconds,
      this.scenario.steps.length,
      this.scenario.estimatedMinutes
    );

    return {
      scenarioId: this.scenario.id,
      score,
      passed: score.total >= this.scenario.passCriteria.minScore,
      mistakes: this.mistakes,
      timeSeconds
    };
  }
}

// Singleton for easier integration with existing components
export const scenarioEngine = new TrainingScenarioEngine({ 
  id: 'placeholder', 
  name: 'Placeholder', 
  steps: [], 
  estimatedMinutes: 5,
  passCriteria: { minScore: 80 } 
} as any);
