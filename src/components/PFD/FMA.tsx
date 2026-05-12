import { useFMCStore } from '../../store/useFMCStore';
import { buildBoeingFMAState } from '@shared';

export function FMA() {
  const state = useFMCStore(s => s);
  const aircraft = state.aircraft;
  
  if (aircraft === 'BOEING_737') {
    const fma = buildBoeingFMAState(state.autopilot.boeing, state);
    
    return (
      <div className="flex w-full justify-between border-b border-[#2a2d2d] bg-black p-1 font-mono text-xs font-bold uppercase">
        {/* Autothrottle Mode */}
        <div className="flex flex-1 flex-col items-center border-r border-[#2a2d2d]">
          <span className="text-[#00ff44]">{fma.autothrottleMode}</span>
        </div>
        
        {/* Roll Mode */}
        <div className="flex flex-1 flex-col items-center border-r border-[#2a2d2d]">
          <span className="text-[#00ff44]">{fma.rollMode}</span>
          <span className="text-white opacity-60 text-[9px]">{fma.armedRollMode}</span>
        </div>
        
        {/* Pitch Mode */}
        <div className="flex flex-1 flex-col items-center border-r border-[#2a2d2d]">
          <span className="text-[#00ff44]">{fma.pitchMode}</span>
          <span className="text-white opacity-60 text-[9px]">{fma.armedPitchMode}</span>
        </div>
        
        {/* AFDS Status */}
        <div className="flex flex-1 flex-col items-center">
          <span className="text-[#00ff44]">{fma.apStatus}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full justify-between border-b border-[#2a2d2d] bg-black p-1 font-mono text-[10px] font-bold uppercase text-[#00ff44]">
      <div className="flex-1 text-center">SPEED</div>
      <div className="flex-1 text-center">ALT</div>
      <div className="flex-1 text-center">HDG</div>
      <div className="flex-1 text-center">1 FD 2</div>
    </div>
  );
}
