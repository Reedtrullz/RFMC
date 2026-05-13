import React, { useState } from 'react';
import { useFMCStore, scenarioEngine } from '../../store/useFMCStore';
import { VerticalProfileEngine, PerformanceEngine } from '@shared';
import { SCENARIOS } from '@shared/fmc/scenarios';

export function FmsInspector() {
  const [isOpen, setIsOpen] = useState(false);
  const state = useFMCStore(s => s);
  
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-amber-600 hover:bg-amber-700 text-white p-3 rounded-full shadow-lg z-50 flex items-center gap-2 font-bold"
      >
        <span className="text-xl">🕵️</span> FMS INSPECTOR
      </button>
    );
  }

  const acState = state.aircraftState;
  const currentAlt = acState?.altitude || 0;
  const gs = acState?.gs || 0;
  
  // Calculate VNAV path data
  const destAlt = 3000;
  const distToTd = VerticalProfileEngine.computeTopOfDescent(currentAlt, destAlt);
  const requiredVs = VerticalProfileEngine.calculateRequiredVs(gs);

  return (
    <div className="fixed top-4 right-4 w-80 bg-[#1a1c1e] border-2 border-amber-600 rounded-lg shadow-2xl z-50 text-white font-mono text-xs overflow-hidden flex flex-col max-h-[90vh]">
      <div className="bg-amber-600 p-2 flex justify-between items-center">
        <h3 className="font-bold flex items-center gap-2">
          <span>🕵️</span> FMS INTERNAL TRUTH
        </h3>
        <button onClick={() => setIsOpen(false)} className="hover:bg-amber-700 px-2 rounded">✕</button>
      </div>

      <div className="p-3 space-y-4 overflow-y-auto">
        {/* Phase Logic */}
        <section>
          <h4 className="text-amber-400 border-b border-amber-900/50 mb-1">PHASE LOGIC</h4>
          <div className="grid grid-cols-2 gap-1">
            <span className="text-gray-400">ACTIVE PHASE:</span>
            <span className="text-green-400">{state.flightPhase}</span>
          </div>
        </section>

        {/* Navigation Truth */}
        <section>
          <h4 className="text-amber-400 border-b border-amber-900/50 mb-1">NAVIGATION TRUTH</h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">NAV SOURCE:</span>
              <span>{state.activeNavSource}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">RNP / ANP:</span>
              <span className={state.navPerformance.anp > state.navPerformance.rnp ? 'text-red-400' : 'text-green-400'}>
                {state.navPerformance.rnp.toFixed(2)} / {state.navPerformance.anp.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">ACTIVE LEG:</span>
              <span className="text-cyan-400">
                {state.flightPlan.waypoints[0]?.legType 
                  ? `(${state.flightPlan.waypoints[0].legType}) ${state.flightPlan.waypoints[0].ident}`
                  : state.flightPlan.waypoints[0]?.ident || 'NONE'}
              </span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-400">SEQ CONDITION:</span>
              <span className="text-amber-400 italic">
                {state.flightPlan.waypoints[0]?.legType === 'VA' ? 'ALT > 1500FT' : 'DIST < 0.1NM'}
              </span>
            </div>
          </div>
        </section>

        {/* Performance */}
        <section>
          <h4 className="text-amber-400 border-b border-amber-900/50 mb-1">PERFORMANCE</h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">FUEL FLOW:</span>
              <span className="text-green-400">
                {Math.round(PerformanceEngine.calculateFuelFlow(state.flightPhase, acState?.altitude || 0))} LBS/HR
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">GROSS WEIGHT:</span>
              <span>{Math.round(state.performance.grossWeight / 1000)}k LBS</span>
            </div>
          </div>
        </section>

        {/* VNAV Path Model */}
        <section>
          <h4 className="text-amber-400 border-b border-amber-900/50 mb-1">VNAV PATH MODEL</h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">DIST TO T/D:</span>
              <span className="text-magenta-400">{distToTd.toFixed(1)} NM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">REQ VS:</span>
              <span>{Math.round(requiredVs)} FPM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">V-PATH DEV:</span>
              <span className="text-green-400">+120 FT</span>
            </div>
          </div>
        </section>

        {/* Message Priority */}
        <section>
          <h4 className="text-amber-400 border-b border-amber-900/50 mb-1">MESSAGE QUEUE</h4>
          <div className="space-y-2">
            {state.scratchpadMessages.length === 0 ? (
              <div className="text-gray-500 italic">No active messages</div>
            ) : (
              state.scratchpadMessages.map(msg => (
                <div key={msg.id} className={`p-1 border-l-2 ${msg.severity === 'ALERT' ? 'border-red-500 bg-red-900/20' : 'border-amber-500 bg-amber-900/10'}`}>
                  <div className="flex justify-between text-[10px]">
                    <span className={msg.severity === 'ALERT' ? 'text-red-400' : 'text-amber-400'}>{msg.severity}</span>
                    <span className="text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-white">{msg.text}</div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Training Scenarios */}
        <section className="bg-blue-900/20 p-2 rounded border border-blue-800/30">
          <h4 className="text-blue-400 mb-1 font-bold">TRAINING SCENARIOS</h4>
          {state.activeScenario ? (
            <div className="space-y-2">
              <div className="font-bold text-blue-300">{state.activeScenario.name}</div>
              <div className="space-y-1">
                {state.activeScenario.goals.map((goal: any) => (
                  <div key={goal.id} className="flex items-center gap-2">
                    <span className={goal.completed ? 'text-green-400' : 'text-gray-500'}>
                      {goal.completed ? '✅' : '⭕'}
                    </span>
                    <span className={goal.completed ? 'text-green-200' : 'text-blue-100'}>{goal.text}</span>
                  </div>
                ))}
              </div>

              {state.activeScenario.mistakes && state.activeScenario.mistakes.length > 0 && (
                <div className="mt-2 border-t border-red-900/30 pt-2">
                  <div className="text-red-400 font-bold mb-1">MISTAKES:</div>
                  <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                    {state.activeScenario.mistakes.map((m: any) => (
                      <div key={m.id} className="text-[10px] text-red-200 bg-red-900/20 p-1 rounded">
                        • {m.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button 
                onClick={() => useFMCStore.setState({ isReportVisible: true })}
                className="w-full mt-2 bg-blue-900/40 hover:bg-blue-900/60 text-blue-200 p-1 rounded border border-blue-700/50 text-[10px]"
              >
                FINISH & DEBRIEF
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <select 
                className="w-full bg-[#0a0c0e] border border-blue-800/50 text-blue-200 p-1 rounded text-[10px]"
                onChange={(e) => {
                  const s = SCENARIOS[e.target.value];
                  if (s) {
                    scenarioEngine.startScenario(s);
                    useFMCStore.setState({ activeScenario: { ...s } });
                  }
                }}
                defaultValue=""
              >
                <option value="" disabled>SELECT A SCENARIO...</option>
                {Object.values(SCENARIOS).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}
        </section>

        {/* ACARS Injection */}
        <section className="bg-purple-900/20 p-2 rounded border border-purple-800/30">
          <h4 className="text-purple-400 mb-1 font-bold">ACARS INJECTION</h4>
          <div className="flex gap-1">
            <input 
              id="acars-input"
              type="text" 
              placeholder="MESSAGE TEXT..."
              className="flex-1 bg-[#0a0c0e] border border-purple-800/50 text-purple-200 p-1 rounded text-[10px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const input = document.getElementById('acars-input') as HTMLInputElement;
                  if (input.value) {
                    scenarioEngine.processAction({
                      id: 'manual-acars',
                      type: 'MESSAGE',
                      trigger: { type: 'TIME', value: 0 },
                      action: { type: 'SEND_ACARS', payload: { from: 'INST', text: input.value } }
                    }, state, {});
                    input.value = '';
                  }
                }
              }}
            />
            <button 
              onClick={() => {
                const input = document.getElementById('acars-input') as HTMLInputElement;
                if (input.value) {
                  scenarioEngine.processAction({
                    id: 'manual-acars',
                    type: 'MESSAGE',
                    trigger: { type: 'TIME', value: 0 },
                    action: { type: 'SEND_ACARS', payload: { from: 'INST', text: input.value } }
                  }, state, {});
                  input.value = '';
                }
              }}
              className="bg-purple-800 hover:bg-purple-700 text-white px-2 rounded"
            >
              SEND
            </button>
          </div>
        </section>

        {/* Instructor Debug */}
        <section className="bg-blue-900/20 p-2 rounded border border-blue-800/30">
          <h4 className="text-blue-400 mb-1 font-bold">WHY DID IT DO THAT?</h4>
          <p className="text-[10px] text-blue-200 leading-tight">
            "The FMC is in {state.flightPhase} phase. Sequencing to next leg is inhibited until TOGA is pressed or 60kts is reached."
          </p>
        </section>
      </div>

      <div className="mt-auto p-2 bg-[#141517] border-t border-gray-800 flex flex-col gap-2">
        <div className="flex gap-2">
          <button 
            onClick={() => useFMCStore.setState(s => ({ debriefMode: !s.debriefMode }))}
            className={`flex-1 p-1 rounded border font-bold ${state.debriefMode ? 'bg-green-600 border-green-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
          >
            DEBRIEF MODE {state.debriefMode ? 'ON' : 'OFF'}
          </button>
          <button 
            onClick={() => useFMCStore.setState({ flightPathHistory: [] })}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white p-1 rounded border border-gray-700"
          >
            CLEAR PATH
          </button>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => state.addMessage("GPS 1 FAILURE", "ALERT", 1)}
            className="flex-1 bg-red-900/50 hover:bg-red-900/80 text-red-200 p-1 rounded border border-red-700/50"
          >
            FAIL GPS
          </button>
          <button 
            onClick={() => state.addMessage("CHECK POSITION", "ADVISORY")}
            className="flex-1 bg-amber-900/50 hover:bg-amber-900/80 text-amber-200 p-1 rounded border border-amber-700/50"
          >
            DRIFT IRS
          </button>
        </div>
      </div>
    </div>
  );
}
