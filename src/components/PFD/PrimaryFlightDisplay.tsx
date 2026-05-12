import { useFMCStore } from '../../store/useFMCStore';
import { PFDFrame } from './PFDFrame';
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
    <PFDFrame aircraft={isBoeing ? 'boeing' : 'airbus'}>
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
      <div className="h-10 bg-black flex items-center justify-center border-t border-white/20">
         <span className="font-mono text-lg text-white font-bold">
           {Math.round(pfd.heading).toString().padStart(3, '0')}
         </span>
      </div>
    </PFDFrame>
  );
}
