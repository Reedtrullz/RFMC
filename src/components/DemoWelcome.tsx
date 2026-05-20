import { useState } from 'react';
import { useFMCStore } from '../store/useFMCStore';
import { useAircraftStore } from '../store/aircraftStore';
import { useCockpitLayoutStore } from '../store/cockpitLayoutStore';
import { tutorialScenarios, airbusTutorialScenarios, parseSimBrief, boeingLessons, airbusLessons } from '@shared';

// ─── Inline SVG Icons for Premium Aeronautical Aesthetics ───────────────────
const CompassIcon = () => (
  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="10" />
    <path d="M16.2 7.8l-2 6.4-6.4 2 2-6.4 6.4-2z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GaugeIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M3 12a9 9 0 0115-6.7L12 12" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SimBriefIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M8 7v12m0 0l-4-4m4 4l4-4M19 12a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function DemoWelcome() {
  const tutorialActive = useFMCStore((s) => s.tutorialActive);
  const aircraft = useAircraftStore((s) => s.aircraft);
  const setAircraft = useAircraftStore((s) => s.setAircraft);
  const startTutorial = useFMCStore((s) => s.startTutorial);

  const [showSimBrief, setShowSimBrief] = useState(false);
  const [tab, setTab] = useState<'demos' | 'training'>('training');
  const [pilotId, setPilotId] = useState(() => localStorage.getItem('cdu-simbrief-pilot-id') || '');
  const [loading, setLoading] = useState(false);
  const [simBriefMessage, setSimBriefMessage] = useState<string | null>(null);

  if (tutorialActive) return null;

  const isAirbus = aircraft === 'AIRBUS_A320';
  const scenarios = isAirbus ? airbusTutorialScenarios : tutorialScenarios;
  const titleColor = isAirbus ? 'text-cdu-amber text-glow-amber' : 'text-cdu-cyan text-glow';
  const subtitle = isAirbus ? 'Airbus A320 MCDU Trainer' : 'Boeing 737 NG FMC Trainer';

  // Dynamic shadow glow based on selected aircraft theme
  const shadowGlowClass = isAirbus
    ? 'shadow-[0_0_60px_rgba(255,176,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.06)] border-cdu-amber/30'
    : 'shadow-[0_0_60px_rgba(0,208,255,0.15),inset_0_1px_1px_rgba(255,255,255,0.06)] border-cdu-cyan/30';

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
      const data = parseSimBrief(text);
      if (!data.origin || !data.destination) throw new Error('NO FLIGHT PLAN');
      useFMCStore.getState().loadFlightPlan({
        origin: data.origin,
        destination: data.destination,
        flightNumber: data.flightNumber,
        route: data.route,
        waypoints: data.waypoints,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md">
      <div
        className={`w-full max-w-[440px] mx-4 p-6 bg-[#0a0d14]/90 border rounded-2xl relative overflow-hidden transition-all duration-500 ${shadowGlowClass}`}
      >
        {/* Decorative Ambient Glowing Spots inside the welcome card */}
        <div
          className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-[65px] opacity-15 transition-all duration-500 ${
            isAirbus ? 'bg-cdu-amber' : 'bg-cdu-cyan'
          }`}
        />
        <div
          className={`absolute -bottom-24 -right-24 w-48 h-48 rounded-full blur-[65px] opacity-10 transition-all duration-500 ${
            isAirbus ? 'bg-orange-500' : 'bg-blue-500'
          }`}
        />

        {/* Main Content Layout */}
        <div className="relative z-10">
          <div className="text-center mb-6">
            <h1 className={`${titleColor} text-3xl font-cdu font-bold tracking-wide mb-1.5`}>VirtualCDU</h1>
            <p className="text-white/60 text-[10px] font-cdu uppercase tracking-[0.25em]">{subtitle}</p>
          </div>

          {/* Aircraft Selection Toggle Card */}
          <div className="mb-5 flex p-1 bg-black/35 border border-white/5 rounded-xl backdrop-blur-md">
            <button
              onClick={() => setAircraft('BOEING_737')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-cdu uppercase tracking-wider transition-all duration-300 transform active:scale-95 ${
                !isAirbus
                  ? 'bg-cdu-cyan/15 border border-cdu-cyan/35 text-cdu-cyan font-bold shadow-[0_0_15px_rgba(0,208,255,0.08)]'
                  : 'border border-transparent text-white/40 hover:text-white/60 hover:bg-white/5'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${!isAirbus ? 'bg-cdu-cyan animate-pulse' : 'bg-transparent'}`}
              />
              737 NG FMC
            </button>
            <button
              onClick={() => setAircraft('AIRBUS_A320')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-cdu uppercase tracking-wider transition-all duration-300 transform active:scale-95 ${
                isAirbus
                  ? 'bg-cdu-amber/15 border border-cdu-amber/35 text-cdu-amber font-bold shadow-[0_0_15px_rgba(255,176,0,0.08)]'
                  : 'border border-transparent text-white/40 hover:text-white/60 hover:bg-white/5'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${isAirbus ? 'bg-cdu-amber animate-pulse' : 'bg-transparent'}`}
              />
              A320neo MCDU
            </button>
          </div>

          {/* Demos vs Curriculum Tabs */}
          <div className="mb-5 flex p-1 bg-black/25 border border-white/5 rounded-xl">
            <button
              onClick={() => setTab('demos')}
              className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-cdu uppercase tracking-widest transition-all duration-300 ${
                tab === 'demos'
                  ? isAirbus
                    ? 'bg-cdu-amber/20 text-cdu-amber border border-cdu-amber/30 font-bold shadow-[0_0_10px_rgba(255,176,0,0.08)]'
                    : 'bg-cdu-cyan/20 text-cdu-cyan border border-cdu-cyan/30 font-bold shadow-[0_0_10px_rgba(0,208,255,0.08)]'
                  : 'border border-transparent text-white/40 hover:text-white/60'
              }`}
            >
              Flight Scenarios
            </button>
            <button
              onClick={() => setTab('training')}
              className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-cdu uppercase tracking-widest transition-all duration-300 ${
                tab === 'training'
                  ? isAirbus
                    ? 'bg-cdu-amber/20 text-cdu-amber border border-cdu-amber/30 font-bold shadow-[0_0_10px_rgba(255,176,0,0.08)]'
                    : 'bg-cdu-cyan/20 text-cdu-cyan border border-cdu-cyan/30 font-bold shadow-[0_0_10px_rgba(0,208,255,0.08)]'
                  : 'border border-transparent text-white/40 hover:text-white/60'
              }`}
            >
              Training Missions
            </button>
          </div>

          {/* Active Tab Panel Selection */}
          <div className="mb-5 max-h-[290px] overflow-y-auto pr-1 select-scrollbar">
            {tab === 'demos' ? (
              <div className="space-y-2.5">
                {scenarios.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => startTutorial(s.name)}
                    className={`flex items-start gap-4 w-full p-3.5 bg-black/35 border border-white/5 hover:bg-white/5 rounded-xl text-left transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.99] group ${
                      isAirbus ? 'hover:border-cdu-amber/30' : 'hover:border-cdu-cyan/30'
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                        isAirbus
                          ? 'bg-cdu-amber/10 border border-cdu-amber/20 text-cdu-amber group-hover:bg-cdu-amber/20'
                          : 'bg-cdu-cyan/10 border border-cdu-cyan/20 text-cdu-cyan group-hover:bg-cdu-cyan/20'
                      }`}
                    >
                      <CompassIcon />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="text-white text-xs font-cdu font-bold group-hover:text-white transition-colors duration-300">
                        {s.name}
                      </div>
                      <div className="text-white/50 text-[10px] font-cdu mt-1 leading-relaxed">{s.description}</div>
                    </div>
                  </button>
                ))}
                {scenarios.length === 0 && (
                  <p className="text-white/30 text-xs font-cdu text-center py-6">More flight scenarios coming soon</p>
                )}
              </div>
            ) : (
              <LessonSelectorInlined aircraft={aircraft} isAirbus={isAirbus} />
            )}
          </div>

          {/* SimBrief Import Section */}
          <div className="mb-5">
            <button
              onClick={() => setShowSimBrief(!showSimBrief)}
              className={`w-full p-3 rounded-xl text-[10px] font-cdu uppercase tracking-widest border transition-all duration-300 flex items-center justify-between shadow-sm transform hover:scale-[1.01] active:scale-95 ${
                isAirbus
                  ? 'bg-cdu-amber/5 border-cdu-amber/25 text-cdu-amber hover:bg-cdu-amber/15 shadow-[0_2px_10px_rgba(255,176,0,0.04)]'
                  : 'bg-cdu-cyan/5 border-cdu-cyan/25 text-cdu-cyan hover:bg-cdu-cyan/15 shadow-[0_2px_10px_rgba(0,208,255,0.04)]'
              }`}
            >
              <span className="flex items-center gap-2">
                <SimBriefIcon />
                {showSimBrief ? 'Hide SimBrief Dispatch' : 'Import SimBrief OFP'}
              </span>
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${showSimBrief ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Inset SimBrief Form with smooth height transition container */}
            <div
              className={`transition-all duration-500 overflow-hidden ${
                showSimBrief ? 'max-h-[300px] opacity-100 mt-2.5' : 'max-h-0 opacity-0 pointer-events-none'
              }`}
            >
              <div className="p-4 bg-black/45 border border-white/5 rounded-xl space-y-3.5 backdrop-blur-md">
                <div>
                  <label className="block text-white/40 text-[9px] font-cdu uppercase tracking-widest mb-1.5">
                    SimBrief Pilot ID
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={pilotId}
                    onChange={(e) => setPilotId(e.target.value)}
                    placeholder="ENTER PILOT ID..."
                    disabled={loading}
                    className={`w-full px-3 py-2.5 text-xs font-cdu bg-black/55 border rounded-lg text-white placeholder-white/20 focus:outline-none transition-colors duration-300 ${
                      isAirbus
                        ? 'border-cdu-amber/25 focus:border-cdu-amber/60'
                        : 'border-cdu-cyan/25 focus:border-cdu-cyan/60'
                    }`}
                  />
                </div>
                <button
                  onClick={handleSimBriefImport}
                  disabled={loading}
                  className={`w-full p-2.5 rounded-lg text-xs font-cdu uppercase tracking-widest border transition-all duration-300 ${
                    isAirbus
                      ? 'bg-cdu-amber/20 border-cdu-amber/40 text-cdu-amber hover:bg-cdu-amber/35 active:bg-cdu-amber/45 shadow-[0_0_15px_rgba(255,176,0,0.06)]'
                      : 'bg-cdu-cyan/20 border-cdu-cyan/40 text-cdu-cyan hover:bg-cdu-cyan/35 active:bg-cdu-cyan/45 shadow-[0_0_15px_rgba(0,208,255,0.06)]'
                  } disabled:opacity-40 disabled:pointer-events-none`}
                >
                  {loading ? 'SYNCHRONIZING OFP...' : 'LOAD FLIGHT PLAN'}
                </button>
                {simBriefMessage && (
                  <p className="text-[9px] font-cdu text-cdu-error text-center uppercase tracking-wider animate-pulse">
                    ⚠️ {simBriefMessage}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Standalone Bypass Option */}
          <button
            onClick={() => {
              useFMCStore.getState().setMode('ACTIVE');
              useFMCStore.getState().setDemoMode(true);
            }}
            className="w-full p-3.5 bg-transparent border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-xl text-white/50 hover:text-white text-xs font-cdu uppercase tracking-[0.2em] transition-all duration-300 transform active:scale-95"
          >
            Skip Demo — Explore Freely
          </button>
        </div>
      </div>
    </div>
  );
}

function LessonSelectorInlined({ aircraft, isAirbus }: { aircraft: string; isAirbus: boolean }) {
  const lessons = aircraft === 'BOEING_737' ? boeingLessons : airbusLessons;
  const startTraining = useFMCStore((s) => s.startTraining);
  const levels = Array.from(new Set(lessons.map((l) => l.level))).sort((a, b) => a - b);

  return (
    <div className="space-y-4">
      {levels.map((level) => (
        <div key={level} className="space-y-2.5">
          <div className="flex items-center gap-2 px-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isAirbus ? 'bg-cdu-amber/40' : 'bg-cdu-cyan/40'}`} />
            <h3 className="text-white/40 font-cdu uppercase text-[9px] tracking-[0.25em]">Level {level}</h3>
          </div>
          <div className="space-y-2">
            {lessons
              .filter((l) => l.level === level)
              .map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => startTraining(lesson.id)}
                  className={`w-full p-3.5 bg-black/35 border border-white/5 hover:bg-white/5 rounded-xl text-left transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.99] flex items-center gap-4 group ${
                    isAirbus ? 'hover:border-cdu-amber/30' : 'hover:border-cdu-cyan/30'
                  }`}
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full border transition-all duration-300 ${
                      isAirbus
                        ? 'bg-cdu-amber/10 border-cdu-amber/30 group-hover:bg-cdu-amber group-hover:border-cdu-amber group-hover:shadow-[0_0_8px_#ffb000]'
                        : 'bg-cdu-cyan/10 border-cdu-cyan/30 group-hover:bg-cdu-cyan group-hover:border-cdu-cyan group-hover:shadow-[0_0_8px_#00d0ff]'
                    }`}
                  />
                  <div className="flex-grow min-w-0">
                    <div className="text-white text-xs font-cdu font-bold group-hover:text-white transition-colors duration-300">
                      {lesson.title}
                    </div>
                    <div className="flex items-center gap-3 text-white/40 text-[9px] font-cdu mt-1.5">
                      <span className="flex items-center gap-1">
                        <ClockIcon />
                        {lesson.estimatedMinutes} MIN
                      </span>
                      <span className="w-1 h-1 rounded-full bg-white/10" />
                      <span className="flex items-center gap-1 uppercase tracking-wider">
                        <GaugeIcon />
                        {lesson.difficulty}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
