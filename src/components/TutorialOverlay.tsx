import { useState, useEffect } from 'react';
import { useFMCStore } from '../store/useFMCStore';
import { CDUButton } from './CDU/CDUButton';
import { devError } from '@shared';

export function TutorialOverlay() {
  const tutorialActive = useFMCStore(s => s.tutorialActive);
  const tutorialCompleted = useFMCStore(s => s.tutorialCompleted);
  const stepIndex = useFMCStore(s => s.tutorialStepIndex);
  const scenario = useFMCStore(s => s.tutorialScenario);
  const skipTutorial = useFMCStore(s => s.skipTutorial);
  const skipTutorialStep = useFMCStore(s => s.skipTutorialStep);
  const tutorialHint = useFMCStore(s => s.tutorialHint);
  const tutorialSkipAvailable = useFMCStore(s => s.tutorialSkipAvailable);
  const tutorialErrors = useFMCStore(s => s.tutorialErrors);
  const getCurrentTutorialStep = useFMCStore(s => s.getCurrentTutorialStep);
  const clearTutorialHint = useFMCStore(s => s.clearTutorialHint);

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
            <div className="flex items-center gap-2">
            {tutorialSkipAvailable && !tutorialCompleted && (
              <button
                onClick={skipTutorialStep}
                className="text-cdu-amber/60 hover:text-cdu-amber text-[10px] font-cdu uppercase"
              >
                Skip Step
              </button>
            )}
            <button
              onClick={skipTutorial}
              className="text-cdu-text/40 hover:text-cdu-text text-[10px] font-cdu uppercase"
            >
              Exit Tutorial
            </button>
          </div>
          </div>

          {/* Instruction */}
          {currentStep && !tutorialCompleted && (
            <p className="text-cdu-text text-sm font-cdu leading-relaxed mb-2">
              {currentStep.instruction}
            </p>
          )}

          {tutorialHint && !tutorialCompleted && (
            <p className="text-cdu-amber text-xs font-cdu leading-relaxed mb-2">
              Hint: {tutorialHint}
            </p>
          )}

          {tutorialErrors > 0 && !tutorialCompleted && (
            <p className="text-cdu-error/70 text-[10px] font-cdu mb-2">
              Errors: {tutorialErrors}
            </p>
          )}

          {tutorialCompleted && (
            <>
              <p className="text-cdu-exec text-sm font-cdu leading-relaxed mb-2">
                Tutorial complete! You can now freely explore the CDU. Press any function key to continue.
              </p>
              <TutorialMetrics />
            </>
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
  let s = getTutorialScenario(scenarioName);
  if (!s) s = airbusTutorialScenarios.find(s => s.name === scenarioName);
  return s?.steps.length || 1;
}

function TutorialMetrics() {
  const scenario = useFMCStore(s => s.tutorialScenario);
  const startTutorial = useFMCStore(s => s.startTutorial);
  const [metrics, setMetrics] = useState<{ errors: number; timeMs: number } | null>(null);

  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem('cdu-tutorial-metrics') || '[]');
      const last = history[history.length - 1];
      if (last && last.scenario === scenario) {
        setMetrics({ errors: last.errors, timeMs: last.timeMs });
      }
    } catch {
      devError('[Tutorial] Failed to load metrics');
    }
  }, [scenario]);

  if (!metrics) return null;

  const minutes = Math.floor(metrics.timeMs / 60000);
  const seconds = Math.floor((metrics.timeMs % 60000) / 1000);
  const timeStr = `${minutes}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="rounded bg-cdu-screen/80 border border-cdu-bezel-light/60 p-2 mb-2">
      <div className="grid grid-cols-2 gap-2 text-[10px] font-cdu">
        <div className="flex justify-between">
          <span className="text-cdu-text/50">TIME</span>
          <span className="text-cdu-cyan">{timeStr}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-cdu-text/50">ERRORS</span>
          <span className={metrics.errors > 0 ? 'text-cdu-error' : 'text-cdu-exec'}>{metrics.errors}</span>
        </div>
      </div>
      <button
        onClick={() => scenario && startTutorial(scenario)}
        className="mt-2 w-full py-1 rounded bg-cdu-cyan/10 text-cdu-cyan text-[10px] font-cdu hover:bg-cdu-cyan/20"
      >
        Practice Again
      </button>
    </div>
  );
}
