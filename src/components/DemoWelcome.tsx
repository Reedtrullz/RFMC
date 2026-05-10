import { useFMCStore } from '../store/useFMCStore';
import { tutorialScenarios } from '@shared';
import { airbusTutorialScenarios } from '@shared';

export function DemoWelcome() {
  const tutorialActive = useFMCStore(s => s.tutorialActive);
  const startTutorial = useFMCStore(s => s.startTutorial);
  const setAircraft = useFMCStore(s => s.setAircraft);
  const aircraft = useFMCStore(s => s.aircraft);

  if (tutorialActive) return null;

  const isAirbus = aircraft === 'AIRBUS_A320';
  const scenarios = isAirbus ? airbusTutorialScenarios : tutorialScenarios;
  const colorClass = isAirbus ? 'cdu-amber' : 'cdu-cyan';
  const textColor = isAirbus ? 'text-cdu-amber' : 'text-cdu-text';
  const titleColor = isAirbus ? 'text-cdu-amber' : 'text-cdu-text';
  const subtitle = isAirbus ? 'Airbus A320 MCDU Trainer' : 'Boeing 737 NG FMC Trainer';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cdu-screen/90 backdrop-blur-sm">
      <div className="w-full max-w-[420px] mx-4 p-5 bg-cdu-bezel border border-cdu-cyan/20 rounded-xl shadow-2xl">
        <div className="text-center mb-5">
          <h1 className={`${titleColor} text-2xl font-cdu font-bold ${isAirbus ? 'text-glow-amber' : 'text-glow'} mb-1`}>
            VirtualCDU
          </h1>
          <p className="text-cdu-cyan/70 text-xs font-cdu uppercase tracking-[0.2em]">
            {subtitle}
          </p>
        </div>

        {/* Aircraft selector */}
        <div className="mb-4 flex gap-1">
          <button
            onClick={() => setAircraft('BOEING_737')}
            className={`flex-1 p-2 rounded text-xs font-cdu font-bold border transition-colors ${
              !isAirbus
                ? 'bg-cdu-cyan/10 border-cdu-cyan/40 text-cdu-cyan'
                : 'bg-cdu-bezel-light border-cdu-bezel-light text-cdu-text/40 hover:text-cdu-text/60'
            }`}
          >
            737 NG
          </button>
          <button
            onClick={() => setAircraft('AIRBUS_A320')}
            className={`flex-1 p-2 rounded text-xs font-cdu font-bold border transition-colors ${
              isAirbus
                ? 'bg-cdu-amber/10 border-cdu-amber/40 text-cdu-amber'
                : 'bg-cdu-bezel-light border-cdu-bezel-light text-cdu-text/40 hover:text-cdu-text/60'
            }`}
          >
            A320neo
          </button>
        </div>

        {/* Tutorial selection */}
        <h2 className="text-cdu-cyan text-xs font-cdu uppercase tracking-wider mb-2">Choose a Demo</h2>
        <div className="flex flex-col gap-1.5 mb-4">
          {scenarios.map((s) => (
            <button key={s.name} onClick={() => startTutorial(s.name)}
              className="flex items-start gap-3 w-full p-3 bg-cdu-screen border border-cdu-bezel-light hover:border-cdu-cyan/40 hover:bg-cdu-bezel-light/30 rounded text-left transition-colors group"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded bg-cdu-cyan/10 border border-cdu-cyan/20 flex items-center justify-center mt-0.5">
                <span className="text-cdu-cyan text-sm font-cdu font-bold">?</span>
              </div>
              <div>
                <div className="text-cdu-text text-sm font-cdu font-bold group-hover:text-cdu-cyan transition-colors">{s.name}</div>
                <div className="text-cdu-text/40 text-[10px] font-cdu mt-0.5">{s.description}</div>
              </div>
            </button>
          ))}
          {scenarios.length === 0 && (
            <p className="text-cdu-text/30 text-xs font-cdu text-center py-4">More tutorials coming soon</p>
          )}
        </div>
        <button
          onClick={() => useFMCStore.getState().setMode('ACTIVE')}
          className="w-full p-2.5 bg-transparent border border-cdu-text/20 hover:border-cdu-text/50 rounded text-cdu-text/50 hover:text-cdu-text text-xs font-cdu uppercase tracking-wider transition-colors">
          Skip Demo — Explore Freely
        </button>
      </div>
    </div>
  );
}
