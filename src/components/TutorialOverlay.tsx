import { useState, useEffect } from 'react';
import { useFMCStore } from '../store/useFMCStore';
import { CDUButton } from './CDU/CDUButton';
import { devError, calculateTutorialGrade } from '@shared';
import { useDraggable } from '../hooks/useDraggable';

export function TutorialOverlay() {
  const tutorialActive = useFMCStore((s) => s.tutorialActive);
  const tutorialCompleted = useFMCStore((s) => s.tutorialCompleted);
  const stepIndex = useFMCStore((s) => s.tutorialStepIndex);
  const scenario = useFMCStore((s) => s.tutorialScenario);
  const skipTutorial = useFMCStore((s) => s.skipTutorial);
  const skipTutorialStep = useFMCStore((s) => s.skipTutorialStep);
  const tutorialHint = useFMCStore((s) => s.tutorialHint);
  const tutorialSkipAvailable = useFMCStore((s) => s.tutorialSkipAvailable);
  const tutorialErrors = useFMCStore((s) => s.tutorialErrors);
  const getCurrentTutorialStep = useFMCStore((s) => s.getCurrentTutorialStep);
  const clearTutorialHint = useFMCStore((s) => s.clearTutorialHint);

  const { position, dragHandlers, isDragging } = useDraggable();

  if (!tutorialActive && !tutorialCompleted) return null;

  const currentStep = getCurrentTutorialStep();

  return (
    <div className="fixed inset-x-0 top-14 z-40 flex justify-center pointer-events-none">
      <div
        className={`pointer-events-auto w-full max-w-[310px] mx-2 mb-2 transition-transform ${isDragging ? 'scale-[1.01]' : ''}`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.1s ease-out, scale 0.2s ease-out',
        }}
      >
        <div
          className={`
          bg-cdu-bezel/95 backdrop-blur
          border rounded-lg p-3
          shadow-lg shadow-cdu-cyan/10 transition-colors
          ${isDragging ? 'border-cdu-cyan' : 'border-cdu-cyan/30'}
        `}
        >
          {/* Header (Drag Handle) */}
          <div
            className="flex items-center justify-between mb-2 cursor-grab active:cursor-grabbing"
            {...dragHandlers}
            title="Drag to reposition panel"
          >
            <div className="flex items-center gap-1.5 text-cdu-cyan text-xs font-cdu uppercase tracking-wider">
              <span className="text-[10px] text-zinc-500 select-none">⠿</span>
              <span>{tutorialCompleted ? 'Complete!' : `Step ${stepIndex + 1}`}</span>
            </div>
            <div className="flex items-center gap-2">
              {!tutorialCompleted && (
                <button
                  onClick={skipTutorialStep}
                  className="text-cdu-amber/80 hover:text-cdu-amber text-[10px] font-cdu uppercase border border-cdu-amber/30 rounded px-1.5 py-0.5 bg-cdu-amber/5 hover:bg-cdu-amber/20 transition-all mr-1"
                >
                  Skip Step
                </button>
              )}
              <button
                onClick={skipTutorial}
                className="text-cdu-text/40 hover:text-cdu-text text-[10px] font-cdu uppercase border border-white/10 rounded px-1.5 py-0.5 bg-white/5 hover:bg-white/15 transition-all"
              >
                Exit Tutorial
              </button>
            </div>
          </div>

          {/* Instruction */}
          {currentStep && !tutorialCompleted && (
            <div className="flex gap-2 items-start mb-2">
              {currentStep.role && (
                <span
                  className={`
                  shrink-0 px-1 py-0.5 rounded text-[9px] font-bold
                  ${currentStep.role === 'PF' ? 'bg-cdu-cyan text-cdu-bezel' : 'bg-cdu-white text-cdu-bezel'}
                `}
                >
                  {currentStep.role}
                </span>
              )}
              <p className="text-cdu-text text-sm font-cdu leading-relaxed">{currentStep.instruction}</p>
            </div>
          )}

          {tutorialHint && !tutorialCompleted && (
            <p className="text-cdu-amber text-xs font-cdu leading-relaxed mb-2">Hint: {tutorialHint}</p>
          )}

          {tutorialErrors > 0 && !tutorialCompleted && (
            <p className="text-cdu-error/70 text-[10px] font-cdu mb-2">Errors: {tutorialErrors}</p>
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
                    width: `${((stepIndex + 1) / getTutorialStepCount(scenario)) * 100}%`,
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
  if (!s) s = airbusTutorialScenarios.find((s) => s.name === scenarioName);
  return s?.steps.length || 1;
}

function TutorialMetrics() {
  const scenarioName = useFMCStore((s) => s.tutorialScenario);
  const startTutorial = useFMCStore((s) => s.startTutorial);
  const confidence = useFMCStore((s) => s.tutorialConfidence);
  const setConfidence = useFMCStore((s) => s.setTutorialConfidence);
  const [metrics, setMetrics] = useState<{ errors: number; timeMs: number } | null>(null);

  const scenario = scenarioName ? getTutorialScenario(scenarioName) : null;
  const stepCount = scenario?.steps.length || 1;

  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem('cdu-tutorial-metrics') || '[]');
      const last = history[history.length - 1];
      if (last && last.scenario === scenarioName) {
        setMetrics({ errors: last.errors, timeMs: last.timeMs });
      }
    } catch {
      devError('[Tutorial] Failed to load metrics');
    }
  }, [scenarioName]);

  if (!metrics) return null;

  const { grade, score } = calculateTutorialGrade(metrics.errors, metrics.timeMs, stepCount, scenario?.standardTimeMs);
  const minutes = Math.floor(metrics.timeMs / 60000);
  const seconds = Math.floor((metrics.timeMs % 60000) / 1000);
  const timeStr = `${minutes}:${String(seconds).padStart(2, '0')}`;

  const gradeColors = { A: 'text-cdu-exec', B: 'text-cdu-cyan', C: 'text-cdu-amber', D: 'text-cdu-error' };

  return (
    <div className="space-y-3">
      <div className="rounded bg-cdu-screen/80 border border-cdu-bezel-light/60 p-3 shadow-inner">
        <div className="flex items-center justify-between mb-3 border-b border-cdu-bezel-light/30 pb-2">
          <div className="flex flex-col">
            <span className="text-cdu-text/40 text-[8px] uppercase tracking-tighter">Performance Grade</span>
            <span className={`text-3xl font-bold font-cdu ${gradeColors[grade]}`}>{grade}</span>
          </div>
          <div className="text-right">
            <span className="text-cdu-text/40 text-[8px] uppercase tracking-tighter">Mastery Score</span>
            <div className="text-lg font-cdu text-cdu-text">{score}%</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] font-cdu">
          <div className="flex justify-between">
            <span className="text-cdu-text/50">TIME</span>
            <span className="text-cdu-text">{timeStr}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cdu-text/50">ERRORS</span>
            <span className={metrics.errors > 0 ? 'text-cdu-error' : 'text-cdu-exec'}>{metrics.errors}</span>
          </div>
        </div>
      </div>

      {!confidence && (
        <div className="bg-cdu-bezel-light/10 rounded p-2 text-center">
          <p className="text-cdu-text/60 text-[10px] font-cdu uppercase mb-1">How confident do you feel?</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setConfidence(star)}
                className="text-lg hover:scale-125 transition-transform"
              >
                {confidence && confidence >= star ? '★' : '☆'}
              </button>
            ))}
          </div>
        </div>
      )}

      {confidence && (
        <div className="text-center py-1">
          <p className="text-cdu-cyan text-[10px] font-cdu">Confidence recorded. Keep practicing!</p>
        </div>
      )}

      <button
        onClick={() => scenarioName && startTutorial(scenarioName)}
        className="w-full py-2 rounded bg-cdu-cyan/20 text-cdu-cyan text-xs font-cdu font-bold hover:bg-cdu-cyan/30 transition-colors uppercase"
      >
        Practice Again to Master
      </button>
    </div>
  );
}
