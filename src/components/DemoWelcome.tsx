import { CDUButton } from './CDU/CDUButton';
import { useFMCStore } from '../store/useFMCStore';
import { tutorialScenarios } from '@shared';

export function DemoWelcome() {
  const tutorialActive = useFMCStore(s => s.tutorialActive);
  const startTutorial = useFMCStore(s => s.startTutorial);

  // Hide when tutorial is running
  if (tutorialActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cdu-screen/90 backdrop-blur-sm">
      <div className="w-full max-w-[420px] mx-4 p-5 bg-cdu-bezel border border-cdu-cyan/20 rounded-xl shadow-2xl">
        {/* Logo / header */}
        <div className="text-center mb-5">
          <h1 className="text-cdu-text text-2xl font-cdu font-bold text-glow mb-1">
            VirtualCDU
          </h1>
          <p className="text-cdu-cyan/70 text-xs font-cdu uppercase tracking-[0.2em]">
            Boeing 737 NG FMC Trainer
          </p>
        </div>

        {/* What is this */}
        <div className="mb-4 p-3 bg-cdu-screen/50 border border-cdu-bezel-light rounded">
          <p className="text-cdu-text/70 text-xs font-cdu leading-relaxed">
            This is a fully functional simulation of a Boeing 737
            Flight Management Computer (FMC). It works just like
            the real thing — and works offline on your iPad.
          </p>
        </div>

        {/* Tutorial selection */}
        <h2 className="text-cdu-cyan text-xs font-cdu uppercase tracking-wider mb-2">
          Choose a Demo
        </h2>
        <div className="flex flex-col gap-1.5 mb-4">
          {tutorialScenarios.map((s) => (
            <button
              key={s.name}
              onClick={() => startTutorial(s.name)}
              className="
                flex items-start gap-3
                w-full p-3
                bg-cdu-screen border border-cdu-bezel-light
                hover:border-cdu-cyan/40 hover:bg-cdu-bezel-light/30
                rounded text-left
                transition-colors
                group
              "
            >
              <div className="flex-shrink-0 w-8 h-8 rounded bg-cdu-cyan/10 border border-cdu-cyan/20 flex items-center justify-center mt-0.5">
                <span className="text-cdu-cyan text-sm font-cdu font-bold">?</span>
              </div>
              <div>
                <div className="text-cdu-text text-sm font-cdu font-bold group-hover:text-cdu-cyan transition-colors">
                  {s.name}
                </div>
                <div className="text-cdu-text/40 text-[10px] font-cdu mt-0.5">
                  {s.description}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Free play option */}
        <button
          onClick={() => useFMCStore.getState().setMode('ACTIVE')}
          className="
            w-full p-2.5
            bg-transparent border border-cdu-text/20
            hover:border-cdu-text/50
            rounded text-cdu-text/50 hover:text-cdu-text
            text-xs font-cdu uppercase tracking-wider
            transition-colors
          "
        >
          Skip Demo — Explore Freely
        </button>
      </div>
    </div>
  );
}
