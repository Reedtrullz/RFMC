import React from 'react';
import { TrainingScore } from '@shared';

export function CheckrideSummary({
  score,
  onClose,
  onRetry,
}: {
  score: TrainingScore;
  onClose: () => void;
  onRetry: () => void;
}) {
  const isPassed = score.total >= 80;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-cdu-bezel border-2 border-cdu-cyan/50 rounded-xl overflow-hidden shadow-2xl">
        <div className={`p-6 text-center ${isPassed ? 'bg-cdu-exec/20' : 'bg-cdu-error/20'}`}>
          <h2 className="text-2xl font-cdu font-bold text-cdu-text mb-1 uppercase">
            Checkride {isPassed ? 'Passed' : 'Failed'}
          </h2>
          <p className="text-cdu-text/60 text-xs font-cdu">Final performance evaluation</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex justify-around items-center">
            <div className="text-center">
              <div className="text-4xl font-bold font-cdu text-cdu-text">{score.total}</div>
              <div className="text-[10px] text-cdu-text/40 uppercase">Total Score</div>
            </div>
            <div className="h-12 w-px bg-cdu-bezel-light/30" />
            <div className="text-center">
              <div className="text-4xl font-bold font-cdu text-cdu-text">
                {Math.floor(score.time / 60)}:{(score.time % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-[10px] text-cdu-text/40 uppercase">Total Time</div>
            </div>
          </div>

          <div className="space-y-3">
            <MetricBar label="Accuracy" value={score.accuracy} />
            <MetricBar label="Procedure" value={score.procedure} />
            <MetricBar label="Mode Awareness" value={score.modeAwareness} />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              onClick={onRetry}
              className="flex-1 py-3 bg-cdu-bezel-light text-cdu-text rounded-lg font-cdu text-sm hover:bg-cdu-bezel-light/80 transition-colors uppercase"
            >
              Retry
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-cdu-cyan text-cdu-bezel rounded-lg font-cdu text-sm font-bold hover:bg-cdu-cyan/80 transition-colors uppercase"
            >
              Finish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 90 ? 'bg-cdu-exec' : value >= 70 ? 'bg-cdu-cyan' : value >= 50 ? 'bg-cdu-amber' : 'bg-cdu-error';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-cdu text-cdu-text/60 uppercase">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 bg-cdu-bezel-light rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
