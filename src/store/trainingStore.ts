import { create } from 'zustand';
import type { 
  TutorialScenario, TrainingScenario, TrainingScenarioEngine, 
  TrainingMistake, TrainingScore 
} from '@shared';
import { getTutorialScenario, airbusTutorialScenarios } from '@shared';

function findTutorial(scenarioName: string): TutorialScenario | undefined {
  return getTutorialScenario(scenarioName) || airbusTutorialScenarios.find(s => s.name === scenarioName);
}

export interface TrainingState {
  tutorialActive: boolean;
  tutorialScenario: string | null;
  tutorialStepIndex: number;
  tutorialCompleted: boolean;
  tutorialHighlight: string | null;
  tutorialErrors: number;
  tutorialStartTime: number | null;
  tutorialHint: string | null;
  tutorialSkipAvailable: boolean;
  tutorialHintLevel: number;
  tutorialHintTimer: any | null;
  tutorialConfidence: number | null;

  trainingActive: boolean;
  trainingScenario: TrainingScenario | null;
  trainingEngine: TrainingScenarioEngine | null;
  trainingMistakes: TrainingMistake[];
  trainingScore: TrainingScore | null;
  trainingStepIndex: number;
  trainingCompleted: boolean;
}

export interface TrainingActions {
  startTutorial: (scenarioName: string) => void;
  advanceTutorial: () => void;
  skipTutorial: () => void;
  recordTutorialError: () => void;
  skipTutorialStep: () => void;
  clearTutorialHint: () => void;
  resetTutorialHints: () => void;
  setTutorialConfidence: (stars: number) => void;
  
  startTraining: (scenarioId: string) => void;
  stopTraining: () => void;
  processTrainingAction: (action: any) => void;
}

export type TrainingStore = TrainingState & TrainingActions;

export const useTrainingStore = create<TrainingStore>((set, get) => ({
  tutorialActive: false,
  tutorialScenario: null,
  tutorialStepIndex: 0,
  tutorialCompleted: false,
  tutorialHighlight: null,
  tutorialErrors: 0,
  tutorialStartTime: null,
  tutorialHint: null,
  tutorialSkipAvailable: false,
  tutorialHintLevel: 0,
  tutorialHintTimer: null,
  tutorialConfidence: null,

  trainingActive: false,
  trainingScenario: null,
  trainingEngine: null,
  trainingMistakes: [],
  trainingScore: null,
  trainingStepIndex: 0,
  trainingCompleted: false,

  startTutorial: (scenarioName: string) => {
    const scenario = findTutorial(scenarioName);
    if (!scenario) return;
    set({
      tutorialActive: true,
      tutorialScenario: scenarioName,
      tutorialStepIndex: 0,
      tutorialCompleted: false,
      tutorialErrors: 0,
      tutorialStartTime: Date.now(),
      tutorialHighlight: scenario.steps[0]?.highlightControl || null,
      tutorialHint: scenario.steps[0]?.hint || null,
    });
  },

  advanceTutorial: () => {
    const { tutorialScenario, tutorialStepIndex } = get();
    const scenario = findTutorial(tutorialScenario || '');
    if (!scenario) return;

    if (tutorialStepIndex < scenario.steps.length - 1) {
      const nextIndex = tutorialStepIndex + 1;
      set({
        tutorialStepIndex: nextIndex,
        tutorialHighlight: scenario.steps[nextIndex]?.highlightControl || null,
        tutorialHint: scenario.steps[nextIndex]?.hint || null,
      });
    } else {
      set({ tutorialActive: false, tutorialCompleted: true });
    }
  },

  skipTutorial: () => set({ tutorialActive: false, tutorialScenario: null }),
  
  recordTutorialError: () => set(state => ({ tutorialErrors: state.tutorialErrors + 1 })),
  
  skipTutorialStep: () => get().advanceTutorial(),
  
  clearTutorialHint: () => set({ tutorialHint: null, tutorialHighlight: null }),
  
  resetTutorialHints: () => set({ tutorialHintLevel: 0 }),
  
  setTutorialConfidence: (stars: number) => set({ tutorialConfidence: stars }),

  startTraining: (scenarioId: string) => {
    // Placeholder for actual training logic which might involve more imports
    set({ trainingActive: true, trainingStepIndex: 0, trainingCompleted: false, trainingMistakes: [] });
  },

  stopTraining: () => set({ trainingActive: false, trainingScenario: null }),

  processTrainingAction: (action: any) => {
    // Placeholder for training action processing
  },
}));
