import { useFMCStore } from '../../../store/useFMCStore';
import { useAircraftStore } from '../../../store/aircraftStore';
import { useAutopilotStore } from '../../../store/autopilotStore';
import { FMA } from '../common/FMA';
import { SpeedTape } from '../common/SpeedTape';
import { AltitudeTape } from '../common/AltitudeTape';
import { AttitudeSphere } from '../common/AttitudeSphere';
import { PfdAlerts } from '../common/PfdAlerts';
import { VerticalSpeedIndicator } from '../common/VerticalSpeedIndicator';
import { buildPfdDisplayModel } from '@shared';

export function AirbusPFD() {
  const aircraftState = useAircraftStore(s => s.aircraftState);
  const autopilot = useAutopilotStore(s => s);
  const state = useFMCStore(s => s);
  const aggregatedState = {
    ...state,
    aircraftState,
    autopilot,
  };
  const pfd = buildPfdDisplayModel({ fmcState: aggregatedState as any }).pfd;
  const fcu = autopilot.airbus;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#111414] font-mono" data-testid="airbus-pfd">
      <FMA />
      
      <div className="flex flex-1 relative overflow-hidden">
        <SpeedTape 
          speed={pfd.speed} 
          targetSpeed={pfd.targetSpeed} 
          trend={pfd.speedTrend}
          variant="airbus"
          managed={pfd.managedSpeed}
        />
        
        <div className="flex-1 relative flex items-center justify-center">
          <AttitudeSphere 
            pitch={pfd.pitch} 
            bank={pfd.bank} 
            fd={pfd.flightDirector}
            variant="airbus"
            failed={pfd.failureFlags?.attitude}
          />
          <PfdAlerts text={pfd.alertText} level={pfd.alertLevel} />
        </div>
        
        <AltitudeTape 
          altitude={pfd.altitude} 
          targetAltitude={pfd.targetAltitude} 
          variant="airbus"
          managed={pfd.managedAltitude}
        />
        <VerticalSpeedIndicator
          verticalSpeed={pfd.verticalSpeed}
          targetVerticalSpeed={pfd.targetVerticalSpeed}
          variant="airbus"
        />
      </div>
      
      <div className="h-10 flex items-center justify-center border-t border-white/5 bg-black/50">
         <div className="flex items-center gap-6">
            <span className="text-[9px] font-bold text-[#39ffef]">
              {pfd.managedHeading ? 'HDG MANAGED' : `HDG SEL ${pfd.targetHeading?.toString().padStart(3, '0') ?? '---'}`}
            </span>
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
