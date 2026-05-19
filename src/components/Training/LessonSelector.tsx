import React, { useState } from 'react';
import { boeingLessons } from '@shared';
import { airbusLessons } from '@shared';
import { useFMCStore } from '../../store/useFMCStore';

export function LessonSelector() {
  const [selectedAircraft, setSelectedAircraft] = useState<'BOEING_737' | 'AIRBUS_A320'>('BOEING_737');
  const startTraining = useFMCStore((s) => s.startTraining); // Need to implement this

  const lessons = selectedAircraft === 'BOEING_737' ? boeingLessons : airbusLessons;
  const levels = Array.from(new Set(lessons.map((l) => l.level))).sort((a, b) => a - b);

  return (
    <div className="p-6 bg-cdu-bezel min-h-[400px] rounded-xl border border-cdu-bezel-light/30 shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-cdu text-cdu-text uppercase font-bold">Training Curriculum</h2>
          <p className="text-cdu-text/40 text-xs font-cdu uppercase">Select your aircraft and curriculum level</p>
        </div>

        <div className="flex bg-cdu-bezel-light/20 p-1 rounded-lg">
          <button
            onClick={() => setSelectedAircraft('BOEING_737')}
            className={`px-4 py-1.5 rounded-md text-[10px] font-cdu uppercase transition-all ${
              selectedAircraft === 'BOEING_737'
                ? 'bg-cdu-cyan text-cdu-bezel font-bold shadow-lg'
                : 'text-cdu-text/60 hover:text-cdu-text'
            }`}
          >
            Boeing 737
          </button>
          <button
            onClick={() => setSelectedAircraft('AIRBUS_A320')}
            className={`px-4 py-1.5 rounded-md text-[10px] font-cdu uppercase transition-all ${
              selectedAircraft === 'AIRBUS_A320'
                ? 'bg-cdu-cyan text-cdu-bezel font-bold shadow-lg'
                : 'text-cdu-text/60 hover:text-cdu-text'
            }`}
          >
            Airbus A320
          </button>
        </div>
      </div>

      <div className="space-y-10">
        {levels.map((level) => (
          <div key={level} className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full border border-cdu-cyan/30 flex items-center justify-center text-cdu-cyan font-cdu font-bold">
                {level}
              </span>
              <h3 className="text-cdu-text font-cdu uppercase tracking-widest text-sm">
                Level {level}: {getLevelName(level)}
              </h3>
              <div className="flex-1 h-px bg-gradient-to-r from-cdu-cyan/30 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-11">
              {lessons
                .filter((l) => l.level === level)
                .map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => startTraining(lesson.id)}
                    className="group relative text-left p-4 rounded-xl border border-cdu-bezel-light/50 hover:border-cdu-cyan/50 hover:bg-cdu-cyan/5 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-cdu text-cdu-cyan font-bold uppercase">{lesson.category}</span>
                      <span className="text-[9px] font-cdu text-cdu-text/30 uppercase">
                        {lesson.estimatedMinutes} MIN
                      </span>
                    </div>
                    <h4 className="text-cdu-text font-cdu font-bold group-hover:text-cdu-cyan transition-colors mb-1">
                      {lesson.title}
                    </h4>
                    <p className="text-cdu-text/50 text-[11px] font-cdu leading-snug">{lesson.description}</p>

                    <div className="mt-3 flex items-center gap-2">
                      <div
                        className={`
                      text-[9px] font-cdu px-1.5 py-0.5 rounded
                      ${
                        lesson.difficulty === 'basic'
                          ? 'bg-cdu-exec/10 text-cdu-exec'
                          : lesson.difficulty === 'intermediate'
                            ? 'bg-cdu-cyan/10 text-cdu-cyan'
                            : 'bg-cdu-amber/10 text-cdu-amber'
                      }
                    `}
                      >
                        {lesson.difficulty.toUpperCase()}
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getLevelName(level: number): string {
  const levels: Record<number, string> = {
    1: 'Familiarization',
    2: 'Preflight setup',
    3: 'Lateral navigation',
    4: 'Vertical navigation',
    5: 'Approach automation',
    6: 'Checkride mode',
  };
  return levels[level] || 'Unknown';
}
