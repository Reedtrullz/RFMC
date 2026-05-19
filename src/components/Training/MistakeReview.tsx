import React from 'react';
import { TrainingMistake } from '@shared';

export function MistakeReview({ mistakes }: { mistakes: TrainingMistake[] }) {
  if (mistakes.length === 0) return null;

  return (
    <div className="mt-6 space-y-3">
      <h3 className="text-cdu-error text-[10px] font-cdu uppercase tracking-widest mb-2">
        Debrief: Areas for Improvement
      </h3>
      {mistakes.map((mistake, i) => (
        <div key={mistake.id} className="flex gap-3 p-3 bg-cdu-error/5 border border-cdu-error/20 rounded-lg">
          <div
            className={`
            shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold
            ${mistake.severity === 'high' ? 'bg-cdu-error text-cdu-bezel' : 'bg-cdu-amber text-cdu-bezel'}
          `}
          >
            {i + 1}
          </div>
          <div className="space-y-1">
            <p className="text-cdu-text text-sm font-cdu">{mistake.description}</p>
            <p className="text-cdu-text/40 text-[9px] font-cdu uppercase">Type: {mistake.type.replace('_', ' ')}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
