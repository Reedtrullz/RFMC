import React, { useState } from 'react';
import { useFMCStore, scenarioEngine } from '../../store/useFMCStore';
import { useAircraftStore } from '../../store/aircraftStore';
import { useTrainingStore } from '../../store/trainingStore';
import { useAlertStore } from '../../store/alertStore';
import { VerticalProfileEngine, PerformanceEngine } from '@shared';
import { SCENARIOS } from '@shared/fmc/scenarios';

export function FmsInspector() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Using specific store hooks for truth data
  const aircraftState = useAircraftStore(s => s.aircraftState);
  const aircraft = useAircraftStore(s => s.aircraft);
  const flightPhase = useFMCStore(s => s.flightPhase);
  const activeNavSource = useFMCStore(s => s.activeNavSource);
  const navPerformance = useFMCStore(s => s.navPerformance);
  const flightPlan = useFMCStore(s => s.flightPlan);
  const performance = useFMCStore(s => s.performance);
  const scratchpadMessages = useFMCStore(s => s.scratchpadMessages);
  
  const activeScenario = useTrainingStore(s => s.activeScenario);
  const debriefMode = useTrainingStore(s => s.debriefMode);
  const setDebriefMode = useTrainingStore(s => s.setDebriefMode);
  
  const addMessage = useAlertStore(s => s.addMessage);
  const receiveAtsuMessage = useAlertStore(s => s.receiveAtsuMessage);
  
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-[#1a1c1c] border-2 border-[#2a2d2d] text-cdu-cyan px-4 py-2 rounded-sm shadow-2xl z-50 flex items-center gap-2 font-cdu text-[10px] font-black uppercase tracking-widest hover:border-cdu-cyan/40 transition-colors"
      >
        <div className="w-2 h-2 rounded-full bg-cdu-cyan animate-pulse" />
        Instructor Console
      </button>
    );
  }

  const currentAlt = aircraftState?.altitude || 0;
  const gs = aircraftState?.gs || 0;
  
  // Calculate VNAV path data
  const destAlt = 3000;
  const distToTd = VerticalProfileEngine.computeTopOfDescent(currentAlt, destAlt);
  const requiredVs = VerticalProfileEngine.calculateRequiredVs(gs);

  return (
    <div className="fixed top-12 right-4 w-[340px] bg-[#0c0d0d] border border-white/10 rounded-sm shadow-[0_0_40px_rgba(0,0,0,0.8)] z-50 text-white font-mono text-[10px] overflow-hidden flex flex-col max-h-[85vh] outline outline-4 outline-black/20">
      <div className="bg-[#1a1c1c] border-b border-white/5 p-3 flex justify-between items-center">
        <h3 className="font-black text-cdu-cyan flex items-center gap-2 uppercase tracking-[0.2em]">
          <div className="w-1.5 h-1.5 bg-cdu-cyan" />
          FMS Truth Data
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-white/20 hover:text-white transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-5 overflow-y-auto custom-scrollbar">
        {/* Phase Logic */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-[1px] flex-1 bg-white/5" />
            <h4 className="text-white/30 uppercase tracking-widest text-[9px] font-black">Phase Logic</h4>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>
          <div className="flex justify-between items-center bg-black/40 p-2 rounded-sm border border-white/5">
            <span className="text-white/40 uppercase">Active Phase</span>
            <span className="text-cdu-cyan font-black">{flightPhase}</span>
          </div>
        </section>

        {/* Navigation Truth */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-[1px] flex-1 bg-white/5" />
            <h4 className="text-white/30 uppercase tracking-widest text-[9px] font-black">Navigation</h4>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>
          <div className="space-y-1 text-[9px]">
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-white/40 uppercase">Source</span>
              <span className="text-white/80">{activeNavSource}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 py-1">
              <span className="text-white/40 uppercase">RNP / ANP</span>
              <span className={navPerformance.anp > navPerformance.rnp ? 'text-cdu-error' : 'text-cdu-exec'}>
                {navPerformance.rnp.toFixed(2)} / {navPerformance.anp.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-white/40 uppercase">Active Leg</span>
              <span className="text-cdu-cyan font-black">
                {flightPlan.waypoints[0]?.ident || 'NONE'}
              </span>
            </div>
          </div>
        </section>

        {/* VNAV Path Model */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-[1px] flex-1 bg-white/5" />
            <h4 className="text-white/30 uppercase tracking-widest text-[9px] font-black">VNAV Path</h4>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-black/40 p-2 border border-white/5 rounded-sm">
              <div className="text-[8px] text-white/20 uppercase mb-1">Dist to T/D</div>
              <div className="text-amber-500 font-black text-xs">{distToTd.toFixed(1)} <span className="text-[8px]">NM</span></div>
            </div>
            <div className="bg-black/40 p-2 border border-white/5 rounded-sm">
              <div className="text-[8px] text-white/20 uppercase mb-1">Req V/S</div>
              <div className="text-white/80 font-black text-xs">{Math.round(requiredVs)} <span className="text-[8px]">FPM</span></div>
            </div>
          </div>
        </section>

        {/* Message Priority */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-[1px] flex-1 bg-white/5" />
            <h4 className="text-white/30 uppercase tracking-widest text-[9px] font-black">Message Queue</h4>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>
          <div className="space-y-1.5">
            {scratchpadMessages.length === 0 ? (
              <div className="text-white/10 italic text-center py-2 border border-dashed border-white/5">No active messages</div>
            ) : (
              scratchpadMessages.map(msg => (
                <div key={msg.id} className={`p-2 border-l-2 ${msg.severity === 'ALERT' ? 'border-cdu-error bg-cdu-error/5' : 'border-amber-500 bg-amber-500/5'}`}>
                  <div className="flex justify-between text-[8px] mb-1">
                    <span className={msg.severity === 'ALERT' ? 'text-cdu-error font-black' : 'text-amber-500 font-black'}>{msg.severity}</span>
                    <span className="text-white/20">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-white/80 leading-tight uppercase font-black tracking-tight">{msg.text}</div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Training Scenarios */}
        <section className="bg-cdu-cyan/5 p-3 rounded-sm border border-cdu-cyan/10">
          <h4 className="text-cdu-cyan mb-2 font-black uppercase tracking-widest text-[9px]">Training Scenarios</h4>
          {activeScenario ? (
            <div className="space-y-3">
              <div className="font-black text-white uppercase tracking-tight">{activeScenario.name}</div>
              <div className="space-y-1.5">
                {activeScenario.goals.map((goal: any) => (
                  <div key={goal.id} className="flex items-start gap-2">
                    <div className={`mt-1 w-1.5 h-1.5 shrink-0 ${goal.completed ? 'bg-cdu-exec' : 'border border-white/20'}`} />
                    <span className={goal.completed ? 'text-cdu-exec' : 'text-white/40'}>{goal.text}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => useFMCStore.setState({ isReportVisible: true })}
                className="w-full mt-2 bg-cdu-cyan text-black font-black p-2 rounded-sm text-[9px] uppercase hover:bg-cdu-cyan/80 transition-colors"
              >
                Finish & Debrief
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <select 
                className="w-full bg-[#0a0c0e] border border-white/10 text-white/60 p-2 rounded-sm text-[9px] uppercase font-bold focus:border-cdu-cyan/40 outline-none"
                onChange={(e) => {
                  const s = SCENARIOS[e.target.value];
                  if (s) {
                    scenarioEngine.startScenario(s);
                    useFMCStore.setState({ activeScenario: { ...s } });
                  }
                }}
                defaultValue=""
              >
                <option value="" disabled>Select Scenario...</option>
                {Object.values(SCENARIOS).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}
        </section>

        {/* ACARS Injection */}
        <section className="bg-white/5 p-3 rounded-sm border border-white/5">
          <h4 className="text-white/40 mb-2 font-black uppercase tracking-widest text-[9px]">Uplink Injection</h4>
          <div className="flex gap-1">
            <input 
              id="acars-input"
              type="text" 
              placeholder="MESSAGE TEXT..."
              className="flex-1 bg-black border border-white/10 text-white/80 p-2 rounded-sm text-[9px] uppercase font-bold outline-none focus:border-cdu-cyan/40"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const input = document.getElementById('acars-input') as HTMLInputElement;
                  if (input.value) {
                    receiveAtsuMessage('INST', input.value);
                    input.value = '';
                  }
                }
              }}
            />
            <button 
              onClick={() => {
                const input = document.getElementById('acars-input') as HTMLInputElement;
                if (input.value) {
                  receiveAtsuMessage('INST', input.value);
                  input.value = '';
                }
              }}
              className="bg-white/10 hover:bg-white/20 text-white px-3 rounded-sm font-black text-[9px] transition-colors"
            >
              SEND
            </button>
          </div>
        </section>
      </div>

      <div className="mt-auto p-3 bg-[#141517] border-t border-white/5 grid grid-cols-2 gap-2">
        <button 
          onClick={() => setDebriefMode(!debriefMode)}
          className={`p-2 rounded-sm border-2 font-black uppercase text-[9px] transition-all ${debriefMode ? 'bg-cdu-exec/10 border-cdu-exec text-cdu-exec' : 'bg-black/40 border-white/5 text-white/20'}`}
        >
          Debrief {debriefMode ? 'Active' : 'Off'}
        </button>
        <button 
          onClick={() => addMessage("GPS 1 FAILURE", "ALERT")}
          className="bg-cdu-error/10 hover:bg-cdu-error/20 text-cdu-error p-2 rounded-sm border-2 border-cdu-error/40 font-black uppercase text-[9px] transition-all"
        >
          Fail GPS
        </button>
      </div>
    </div>
  );
}
