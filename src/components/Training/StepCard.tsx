import React from 'react';
import { useFMCStore } from '../../store/useFMCStore';
import { TrainingStep } from '@shared';

export function StepCard({ step }: { step: TrainingStep }) {
  const tutorialHint = useFMCStore(s => s.tutorialHint);

  return (
    <div className="bg-cdu-bezel/95 backdrop-blur border border-cdu-cyan/30 rounded-lg p-4 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-cdu-cyan text-xs font-cdu uppercase tracking-wider">
          Current Task
        </span>
        <span className="text-cdu-text/40 text-[10px] font-cdu uppercase">
          {step.objective}
        </span>
      </div>
      
      <p className="text-cdu-text text-lg font-cdu leading-relaxed mb-4">
        {step.instruction}
      </p>

      {tutorialHint && (
        <div className="bg-cdu-amber/10 border border-cdu-amber/30 rounded p-2 mb-2">
          <p className="text-cdu-amber text-xs font-cdu">
            <span className="font-bold mr-1">HINT:</span>
            {tutorialHint}
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 text-[10px] font-cdu text-cdu-text/60">
        <div className="w-1.5 h-1.5 rounded-full bg-cdu-cyan animate-pulse" />
        <span>WAITING FOR ACTION</span>
      </div>
    </div>
  );
}
