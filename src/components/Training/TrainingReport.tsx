import React from 'react';
import { useFMCStore } from '../../store/useFMCStore';

export function TrainingReport() {
  const scenario = useFMCStore((s) => s.activeScenario);
  const isVisible = useFMCStore((s) => s.isReportVisible);

  if (!isVisible) return null;

  const handleClose = () => {
    useFMCStore.setState({ activeScenario: null, isReportVisible: false });
  };

  const goals = scenario?.goals || [];
  const mistakes = scenario?.mistakes || [];
  const completedGoals = goals.filter((g: any) => g.completed).length;
  const goalScore = goals.length > 0 ? (completedGoals / goals.length) * 100 : 100;
  const mistakePenalty = mistakes.length * 10;
  const finalScore = Math.max(0, goalScore - mistakePenalty);

  const getGrade = (s: number) => {
    if (s >= 90) return { label: 'S', color: 'text-cyan-400' };
    if (s >= 80) return { label: 'B', color: 'text-green-400' };
    if (s >= 70) return { label: 'C', color: 'text-amber-400' };
    return { label: 'F', color: 'text-red-400' };
  };

  const grade = getGrade(finalScore);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-[#1a1c1e] border-2 border-cyan-500 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden font-mono">
        <div className="bg-cyan-600 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white italic">FMS TRAINING REPORT</h2>
          <button onClick={handleClose} className="text-white hover:bg-cyan-700 px-3 rounded">
            CLOSE
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Header Info */}
          <div className="flex justify-between items-start border-b border-gray-800 pb-4">
            <div>
              <div className="text-gray-400 text-xs">SCENARIO</div>
              <div className="text-xl text-white font-bold">{scenario?.name}</div>
            </div>
            <div className="text-right">
              <div className="text-gray-400 text-xs">FINAL GRADE</div>
              <div className={`text-4xl font-bold ${grade.color}`}>{grade.label}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Goals List */}
            <div className="space-y-4">
              <h3 className="text-cyan-400 font-bold flex items-center gap-2">
                <span>🎯</span> TRAINING OBJECTIVES
              </h3>
              <div className="space-y-2">
                {goals.map((g: any) => (
                  <div key={g.id} className="flex items-center gap-2 text-sm p-2 bg-gray-900/50 rounded">
                    <span className={g.completed ? 'text-green-400' : 'text-gray-600'}>{g.completed ? '✓' : '✗'}</span>
                    <span className={g.completed ? 'text-white' : 'text-gray-500'}>{g.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mistakes List */}
            <div className="space-y-4">
              <h3 className="text-red-400 font-bold flex items-center gap-2">
                <span>⚠️</span> PROCEDURAL DEVIATIONS
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {mistakes.length === 0 ? (
                  <div className="text-gray-500 italic text-sm">No deviations recorded. Perfect flight.</div>
                ) : (
                  mistakes.map((m: any) => (
                    <div
                      key={m.id}
                      className="text-xs text-red-200 bg-red-900/20 p-2 rounded border-l-2 border-red-500"
                    >
                      {m.text}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-6 flex gap-4 border-t border-gray-800">
            <button
              onClick={() => {
                const text = `FMS TRAINING REPORT\nScenario: ${scenario?.name}\nGrade: ${grade.label}\nScore: ${finalScore}%\n\nGoals: ${completedGoals}/${goals.length}\nMistakes: ${mistakes.length}`;
                navigator.clipboard.writeText(text);
              }}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded font-bold transition-colors"
            >
              COPY REPORT
            </button>
            <button
              onClick={() => useFMCStore.setState({ activeScenario: null })}
              className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white p-3 rounded font-bold transition-colors"
            >
              DONE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
