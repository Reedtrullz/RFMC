import { useFMCStore } from '../store/useFMCStore';
import { CDUButton } from './CDU/CDUButton';

export function TutorialOverlay() {
  const tutorialActive = useFMCStore(s => s.tutorialActive);
  const tutorialCompleted = useFMCStore(s => s.tutorialCompleted);
  const stepIndex = useFMCStore(s => s.tutorialStepIndex);
  const scenario = useFMCStore(s => s.tutorialScenario);
  const skipTutorial = useFMCStore(s => s.skipTutorial);
  const getCurrentTutorialStep = useFMCStore(s => s.getCurrentTutorialStep);

  if (!tutorialActive && !tutorialCompleted) return null;

  const currentStep = getCurrentTutorialStep();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center pointer-events-none">
      <div className="pointer-events-auto w-full max-w-[500px] mx-2 mb-2">
        <div className="
          bg-cdu-bezel/95 backdrop-blur
          border border-cdu-cyan/30
          rounded-lg p-3
          shadow-lg shadow-cdu-cyan/10
        ">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-cdu-cyan text-xs font-cdu uppercase tracking-wider">
              {tutorialCompleted ? 'Complete!' : `Step ${stepIndex + 1}`}
            </span>
            <button
              onClick={skipTutorial}
              className="text-cdu-text/40 hover:text-cdu-text text-[10px] font-cdu uppercase"
            >
              Exit Tutorial
            </button>
          </div>

          {/* Instruction */}
          {currentStep && !tutorialCompleted && (
            <p className="text-cdu-text text-sm font-cdu leading-relaxed mb-2">
              {currentStep.instruction}
            </p>
          )}

          {tutorialCompleted && (
            <p className="text-cdu-exec text-sm font-cdu leading-relaxed mb-2">
              Tutorial complete! You can now freely explore the CDU. Press any function key to continue.
            </p>
          )}

          {/* Progress bar */}
          {scenario && !tutorialCompleted && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-cdu-bezel-light rounded-full overflow-hidden">
                <div
                  className="h-full bg-cdu-cyan/70 rounded-full transition-all duration-300"
                  style={{
                    width: `${((stepIndex + 1) / (getTutorialStepCount(scenario))) * 100}%`,
                  }}
                />
              </div>
              <span className="text-cdu-cyan/50 text-[9px] font-cdu min-w-[30px] text-right">
                {stepIndex + 1}/{getTutorialStepCount(scenario)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { getTutorialScenario, airbusTutorialScenarios } from '@shared';

function getTutorialStepCount(scenarioName: string | null): number {
  if (!scenarioName) return 1;
  // Check Boeing scenarios first
  let s = getTutorialScenario(scenarioName);
  // If not found, check Airbus scenarios
  if (!s) s = airbusTutorialScenarios.find(s => s.name === scenarioName);
  return s?.steps.length || 1;
}
