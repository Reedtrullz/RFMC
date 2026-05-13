import React, { useState } from 'react';
import { useFMCStore } from '../../store/useFMCStore';
import { VerticalProfileEngine } from '@shared';

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
  const gs = acState?.speed || 0;
  
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
              <span className={state.navPerformance.anpNm > state.navPerformance.rnpNm ? 'text-red-400' : 'text-green-400'}>
                {state.navPerformance.rnpNm.toFixed(2)} / {state.navPerformance.anpNm.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">ACTIVE LEG:</span>
              <span className="text-cyan-400">TF (TRACK TO FIX)</span>
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
