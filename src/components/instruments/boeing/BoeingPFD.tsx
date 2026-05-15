import { useAircraftStore } from '../../../store/aircraftStore';
import { useAutopilotStore } from '../../../store/autopilotStore';
import { useFMCStore } from '../../../store/useFMCStore';
import { FMA } from '../common/FMA';
import { SpeedTape } from '../common/SpeedTape';
import { AltitudeTape } from '../common/AltitudeTape';
import { AttitudeSphere } from '../common/AttitudeSphere';
import { PfdAlerts } from '../common/PfdAlerts';
import { buildBoeingPFDState } from '@shared';

export function BoeingPFD() {
  const aircraftState = useAircraftStore(s => s.aircraftState);
  const autopilot = useAutopilotStore(s => s);
  const fmc = useFMCStore(s => s);
  
  // Aggregate state for the builder (legacy compatibility for now)
  const aggregatedState = {
    ...fmc,
    aircraftState,
    autopilot
  };

  const pfd = buildBoeingPFDState(aggregatedState as any);

  return (
    <div className="flex h-full w-full flex-col bg-black overflow-hidden font-mono">
      <FMA />
      
      <div className="flex flex-1 relative overflow-hidden">
        {/* Speed Tape */}
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
          <PfdAlerts text={pfd.alertText} level={pfd.alertLevel} />
        </div>
        
        {/* Altitude Tape */}
        <AltitudeTape 
          altitude={pfd.altitude} 
          targetAltitude={pfd.targetAltitude} 
        />
      </div>
      
      {/* Boeing Bottom Info */}
      <div className="h-12 flex items-center justify-between px-4 border-t border-white/5 bg-black/40">
        <div className="text-white/60 text-[10px]">
           BARO <span className="text-[#00ff44]">29.92 IN</span>
        </div>
        <div className="text-white text-lg font-bold">
           {Math.round(pfd.heading).toString().padStart(3, '0')}
        </div>
        <div className="text-white/60 text-[10px]">
           DH <span className="text-[#00ff44]">200</span>
        </div>
      </div>
    </div>
  );
}
