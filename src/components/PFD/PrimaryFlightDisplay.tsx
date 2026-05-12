import { useFMCStore } from '../../store/useFMCStore';
import { InstrumentBezel } from '../visual/InstrumentBezel';
import { ScreenGlass } from '../visual/ScreenGlass';
import { FMA } from './FMA';
import { SpeedTape } from './SpeedTape';
import { AltitudeTape } from './AltitudeTape';
import { AttitudeSphere } from './AttitudeSphere';
import { buildBoeingPFDState } from '@shared';

export function PrimaryFlightDisplay() {
  const state = useFMCStore(s => s);
  const aircraft = state.aircraft;
  const autopilot = state.autopilot;
  
  const isBoeing = aircraft === 'BOEING_737';
  const pfd = buildBoeingPFDState(state);
  const mcp = autopilot.boeing;
  
  return (
    <InstrumentBezel variant={isBoeing ? 'boeing-pfd' : 'airbus-pfd'} className="h-full w-full">
      <ScreenGlass className="flex h-full w-full flex-col">
        <FMA />
        
        <div className="flex flex-1 overflow-hidden">
          {/* Speed Tape */}
          <SpeedTape 
            speed={pfd.speed} 
            targetSpeed={isBoeing ? mcp.speed : autopilot.airbus.speed} 
          />
          
          {/* Attitude Center */}
          <AttitudeSphere 
            pitch={pfd.pitch} 
            bank={pfd.bank} 
          />
          
          {/* Altitude Tape */}
          <AltitudeTape 
            altitude={pfd.altitude} 
            targetAltitude={isBoeing ? mcp.altitude : autopilot.airbus.altitude} 
          />
        </div>
        
        {/* Bottom area: Heading / Cues */}
        <div className="h-10 flex items-center justify-center border-t border-white/10 bg-black/40">
           <span className="font-mono text-lg text-white font-bold opacity-80">
             {Math.round(pfd.heading).toString().padStart(3, '0')}
           </span>
        </div>
      </ScreenGlass>
    </InstrumentBezel>
  );
}
