import { useState } from 'react';
import { useFMCStore } from '../store/useFMCStore';
import { tutorialScenarios, airbusTutorialScenarios, parseSimBriefJSON } from '@shared';

export function DemoWelcome() {
  const tutorialActive = useFMCStore(s => s.tutorialActive);
  const startTutorial = useFMCStore(s => s.startTutorial);
  const setAircraft = useFMCStore(s => s.setAircraft);
  const aircraft = useFMCStore(s => s.aircraft);

  const [showSimBrief, setShowSimBrief] = useState(false);
  const [pilotId, setPilotId] = useState(() => localStorage.getItem('cdu-simbrief-pilot-id') || '');
  const [loading, setLoading] = useState(false);
  const [simBriefMessage, setSimBriefMessage] = useState<string | null>(null);

  if (tutorialActive) return null;

  const isAirbus = aircraft === 'AIRBUS_A320';
  const scenarios = isAirbus ? airbusTutorialScenarios : tutorialScenarios;
  const titleColor = isAirbus ? 'text-cdu-amber' : 'text-cdu-text';
  const subtitle = isAirbus ? 'Airbus A320 MCDU Trainer' : 'Boeing 737 NG FMC Trainer';

  async function handleSimBriefImport() {
    const id = pilotId.trim();
    if (!id || !/^\d+$/.test(id)) {
      setSimBriefMessage('INVALID PILOT ID');
      return;
    }
    localStorage.setItem('cdu-simbrief-pilot-id', id);
    setLoading(true);
    setSimBriefMessage(null);
    try {
      const res = await fetch(`https://www.simbrief.com/api/xml.fetcher.php?userid=${id}&json=1`);
      if (!res.ok) throw new Error('NETWORK ERROR');
      const text = await res.text();
      if (!text || text.trim().length === 0) throw new Error('EMPTY RESPONSE');
      const data = parseSimBriefJSON(text);
      if (!data.origin || !data.destination) throw new Error('NO FLIGHT PLAN');
      useFMCStore.getState().loadFlightPlan({
        origin: data.origin,
        destination: data.destination,
        flightNumber: data.flightNumber,
        route: data.route,
      });
      useFMCStore.setState({ scratchpad: 'SIMBRIEF LOADED' });
      useFMCStore.getState().setMode('ACTIVE');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'SIMBRIEF ERROR';
      setSimBriefMessage(msg);
      useFMCStore.setState({ scratchpad: 'SIMBRIEF ERROR' });
    } finally {
      setLoading(false);
    }
  }

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

        <div className="mb-4">
          <button
            onClick={() => setShowSimBrief(!showSimBrief)}
            className={`w-full p-2.5 rounded text-xs font-cdu font-bold border transition-colors ${
              isAirbus
                ? 'bg-cdu-amber/10 border-cdu-amber/40 text-cdu-amber hover:bg-cdu-amber/20'
                : 'bg-cdu-cyan/10 border-cdu-cyan/40 text-cdu-cyan hover:bg-cdu-cyan/20'
            }`}
          >
            {showSimBrief ? 'Hide SimBrief Import' : 'Import SimBrief'}
          </button>

          {showSimBrief && (
            <div className="mt-2 p-3 bg-cdu-screen border border-cdu-bezel-light rounded">
              <label className="block text-cdu-text/50 text-[10px] font-cdu mb-1">
                SimBrief Pilot ID
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={pilotId}
                onChange={(e) => setPilotId(e.target.value)}
                placeholder="123456"
                disabled={loading}
                className="w-full px-2 py-1.5 text-xs font-cdu bg-cdu-bezel border border-cdu-bezel-light rounded text-cdu-text mb-2 focus:outline-none focus:border-cdu-cyan/50"
              />
              <button
                onClick={handleSimBriefImport}
                disabled={loading}
                className={`w-full p-2 rounded text-xs font-cdu font-bold border transition-colors ${
                  isAirbus
                    ? 'bg-cdu-amber/20 border-cdu-amber/50 text-cdu-amber hover:bg-cdu-amber/30'
                    : 'bg-cdu-cyan/20 border-cdu-cyan/50 text-cdu-cyan hover:bg-cdu-cyan/30'
                } disabled:opacity-50`}
              >
                {loading ? 'Loading...' : 'Import Flight Plan'}
              </button>
              {simBriefMessage && (
                <p className="mt-2 text-[10px] font-cdu text-cdu-error text-center">{simBriefMessage}</p>
              )}
            </div>
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
