import React from 'react';
import { useFMCStore } from '../../../store/useFMCStore';
import { FMA } from '../common/FMA';
import { SpeedTape } from '../common/SpeedTape';
import { AltitudeTape } from '../common/AltitudeTape';
import { AttitudeSphere } from '../common/AttitudeSphere';
import { buildAirbusPFDState } from '@shared';

export function AirbusPFD() {
  const state = useFMCStore(s => s);
  const pfd = buildAirbusPFDState(state);
  const fcu = state.autopilot.airbus;

  return (
    <div className="flex h-full w-full flex-col bg-[#1a1c1c] overflow-hidden font-mono">
      <FMA />
      
      <div className="flex flex-1 relative overflow-hidden">
        {/* Airbus Speed Tape */}
        <SpeedTape 
          speed={pfd.speed} 
          targetSpeed={pfd.targetSpeed} 
          trend={pfd.speedTrend}
        />
        
        {/* Attitude Center */}
        <div className="flex-1 relative flex items-center justify-center">
          <AttitudeSphere 
            pitch={pfd.pitch} 
            bank={pfd.bank} 
            fd={pfd.flightDirector}
          />
        </div>
        
        {/* Altitude Tape */}
        <AltitudeTape 
          altitude={pfd.altitude} 
          targetAltitude={pfd.targetAltitude} 
        />
      </div>
      
      {/* Airbus Bottom Info */}
      <div className="h-10 flex items-center justify-center border-t border-white/5 bg-black/40">
         <div className="flex items-center gap-8">
            <span className="text-[#00f0ff] text-lg font-bold">
              {Math.round(pfd.heading).toString().padStart(3, '0')}
            </span>
            {fcu.metricAltitude && (
               <span className="text-[#00f0ff] text-[10px] border border-[#00f0ff] px-0.5">METRIC</span>
            )}
         </div>
      </div>
    </div>
  );
}
