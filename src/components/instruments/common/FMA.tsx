import { useFMCStore } from '../../../store/useFMCStore';
import { buildBoeingFMAState, buildAirbusFMAState } from '@shared';

export function FMA() {
  const state = useFMCStore(s => s);
  const aircraft = state.aircraft;
  
  if (aircraft === 'BOEING_737') {
    const fma = buildBoeingFMAState(state.autopilot, state);
    
    return (
      <div className="flex w-full justify-between border-b border-[#2a2d2d] bg-black p-1 font-mono text-xs font-bold uppercase">
        <div className="flex flex-1 flex-col items-center border-r border-[#2a2d2d]">
          <span className="text-[#00ff44]">{fma.autothrottleMode}</span>
        </div>
        <div className="flex flex-1 flex-col items-center border-r border-[#2a2d2d]">
          <span className="text-[#00ff44]">{fma.rollMode}</span>
          <span className="text-white opacity-60 text-[9px]">{fma.armedRollMode}</span>
        </div>
        <div className="flex flex-1 flex-col items-center border-r border-[#2a2d2d]">
          <span className="text-[#00ff44]">{fma.pitchMode}</span>
          <span className="text-white opacity-60 text-[9px]">{fma.armedPitchMode}</span>
        </div>
        <div className="flex flex-1 flex-col items-center">
          <span className="text-[#00ff44]">{fma.apStatus}</span>
        </div>
      </div>
    );
  }

  if (aircraft === 'AIRBUS_A320') {
    const fma = buildAirbusFMAState(state.autopilot, state);
    return (
      <div className="grid grid-cols-5 w-full border-b border-[#2a2d2d] bg-black p-0.5 font-mono text-[9px] font-bold uppercase text-[#00ff44]">
        <div className="border-r border-[#2a2d2d] text-center">{fma.autothrustMode}</div>
        <div className="border-r border-[#2a2d2d] text-center">
          <div>{fma.verticalMode}</div>
          <div className="text-white opacity-50 text-[7px]">{fma.armedModes.find(m => ['G/S', 'ALT'].includes(m))}</div>
        </div>
        <div className="border-r border-[#2a2d2d] text-center">
          <div>{fma.lateralMode}</div>
          <div className="text-white opacity-50 text-[7px]">{fma.armedModes.find(m => ['LOC', 'NAV'].includes(m))}</div>
        </div>
        <div className="border-r border-[#2a2d2d] text-center">
          <div className="text-white">{fma.approachCapability}</div>
          <div className="text-white opacity-50 text-[7px]">{fma.approachCapability === 'CAT3 DUAL' ? 'DUAL' : (fma.approachCapability === 'CAT3 SINGLE' ? 'SINGLE' : '')}</div>
        </div>
        <div className="text-center">
          <div className="flex justify-center gap-1">
            <span className={fma.status.ap1 ? 'text-[#00ff44]' : 'text-white opacity-10'}>AP1</span>
            <span className={fma.status.ap2 ? 'text-[#00ff44]' : 'text-white opacity-10'}>AP2</span>
          </div>
          <div className="text-[7px]">
            <span className={fma.status.fd1 ? 'text-white' : 'text-white opacity-10'}>1</span>
            <span className="text-white/40 mx-0.5">FD</span>
            <span className={fma.status.fd2 ? 'text-white' : 'text-white opacity-10'}>2</span>
          </div>
          <div className={fma.status.athr ? 'text-[#00ff44]' : 'text-white opacity-30'}>A/THR</div>
        </div>
      </div>
    );
  }

  return null;
}
