import React from 'react';
import { useFMCStore } from '../../store/useFMCStore';
import { useCockpitLayoutStore } from '../../store/cockpitLayoutStore';
import { StepCard } from './StepCard';
import { CheckrideSummary } from './CheckrideSummary';
import { MistakeReview } from './MistakeReview';
import { LessonSelector } from './LessonSelector';

export function TrainingOverlay() {
  const trainingActive = useFMCStore((s) => s.trainingActive);
  const trainingCompleted = useFMCStore((s) => s.trainingCompleted);
  const trainingScenario = useFMCStore((s) => s.trainingScenario);
  const trainingStepIndex = useFMCStore((s) => s.trainingStepIndex);
  const trainingMistakes = useFMCStore((s) => s.trainingMistakes);
  const trainingScore = useFMCStore((s) => s.trainingScore);
  const stopTraining = useFMCStore((s) => s.stopTraining);
  const startTraining = useFMCStore((s) => s.startTraining);

  const isHidden = useCockpitLayoutStore((s) => s.hiddenPanels.includes('instructor'));
  const cockpitMode = useCockpitLayoutStore((s) => s.cockpitMode);

  if (!trainingActive && !trainingCompleted) {
    return null;
  }

  if (cockpitMode && isHidden) {
    return null;
  }

  const currentStep = trainingScenario?.steps[trainingStepIndex];

  return (
    <div className="fixed inset-0 z-40 pointer-events-none flex flex-col items-center justify-end p-6">
      {trainingActive && currentStep && (
        <div className="pointer-events-auto w-full max-w-xl mb-4 animate-in slide-in-from-bottom-4 duration-300">
          <StepCard step={currentStep} />

          <div className="mt-4 flex justify-center">
            <button
              onClick={stopTraining}
              className="px-4 py-2 bg-cdu-bezel/80 backdrop-blur text-cdu-text/60 hover:text-cdu-text text-[10px] font-cdu uppercase rounded-full border border-cdu-bezel-light/30 transition-all pointer-events-auto"
            >
              Abort Training
            </button>
          </div>
        </div>
      )}

      {trainingCompleted && trainingScore && (
        <div className="pointer-events-auto">
          <CheckrideSummary
            score={trainingScore}
            onClose={stopTraining}
            onRetry={() => trainingScenario && startTraining(trainingScenario.id)}
          />

          {/* Mistake review is shown inside or below the summary if needed */}
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-lg pointer-events-auto bg-cdu-bezel/95 p-6 rounded-xl border border-cdu-error/30 max-h-[40vh] overflow-y-auto">
            <MistakeReview mistakes={trainingMistakes} />
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      {trainingActive && trainingScenario && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-md pointer-events-none">
          <div className="bg-cdu-bezel/90 backdrop-blur p-2 rounded-full border border-cdu-cyan/20 flex items-center gap-3 px-4">
            <span className="text-[10px] font-cdu text-cdu-cyan font-bold whitespace-nowrap">
              LEVEL {trainingScenario.level}
            </span>
            <div className="flex-1 h-1 bg-cdu-bezel-light rounded-full overflow-hidden">
              <div
                className="h-full bg-cdu-cyan transition-all duration-500"
                style={{ width: `${(trainingStepIndex / trainingScenario.steps.length) * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-cdu text-cdu-text/40">
              {trainingStepIndex + 1} / {trainingScenario.steps.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
