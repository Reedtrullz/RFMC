import { useShallow } from 'zustand/react/shallow';
import { useAircraftStore } from '../../../store/aircraftStore';
import { useAutopilotStore } from '../../../store/autopilotStore';
import { useFMCStore } from '../../../store/useFMCStore';
import { buildBoeingFMAState, buildAirbusFMAState } from '@shared';
import type { FMCState } from '@shared';

export function FMA() {
  const aircraft = useAircraftStore((s) => s.aircraft);
  const truth = useAutopilotStore((s) => s.truth);
  const autopilot = useAutopilotStore(useShallow((s) => ({ truth: s.truth, boeing: s.boeing, airbus: s.airbus })));
  const fmc = useFMCStore(useShallow((s) => ({ aircraftState: s.aircraftState })));
  const now = Date.now();
  const BOX_TIME = 10000;

  const isBoxed = (type: 'thrust' | 'lateral' | 'vertical') => {
    return now - (truth.lastModeChangeTimestamps?.[type] || 0) < BOX_TIME;
  };

  const boxStyle = 'border border-white shadow-[0_0_4px_rgba(255,255,255,0.5)]';

  if (aircraft === 'BOEING_737') {
    const fma = buildBoeingFMAState(autopilot, fmc as unknown as FMCState);

    return (
      <div className="flex w-full justify-between border-b border-[#2a2d2d] bg-black p-1 font-mono text-xs font-bold uppercase h-10">
        <div
          className={`flex flex-1 flex-col items-center justify-center border-r border-[#2a2d2d] ${isBoxed('thrust') ? boxStyle : ''}`}
        >
          <span className="text-[#00ff44]">{fma.autothrottleMode}</span>
        </div>
        <div
          className={`flex flex-1 flex-col items-center justify-center border-r border-[#2a2d2d] ${isBoxed('lateral') ? boxStyle : ''}`}
        >
          <span className="text-[#00ff44]">{fma.rollMode}</span>
          <span className="text-white opacity-60 text-[9px] leading-none">{fma.armedRollMode}</span>
        </div>
        <div
          className={`flex flex-1 flex-col items-center justify-center border-r border-[#2a2d2d] ${isBoxed('vertical') ? boxStyle : ''}`}
        >
          <span className="text-[#00ff44]">{fma.pitchMode}</span>
          <span className="text-white opacity-60 text-[9px] leading-none">{fma.armedPitchMode}</span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <span className="text-[#00ff44]">{fma.apStatus}</span>
        </div>
      </div>
    );
  }

  if (aircraft === 'AIRBUS_A320') {
    const fma = buildAirbusFMAState(autopilot, fmc as unknown as FMCState);
    return (
      <div className="grid grid-cols-5 w-full border-b border-[#2a2d2d] bg-black p-0.5 font-mono text-[9px] font-bold uppercase text-[#00ff44] h-8">
        <div
          className={`border-r border-[#2a2d2d] text-center flex items-center justify-center ${isBoxed('thrust') ? boxStyle : ''}`}
        >
          {fma.autothrustMode}
        </div>
        <div
          className={`border-r border-[#2a2d2d] text-center flex flex-col items-center justify-center ${isBoxed('vertical') ? boxStyle : ''}`}
        >
          <div>{fma.verticalMode}</div>
          <div className="text-white opacity-50 text-[7px] leading-none">
            {fma.armedModes.find((m) => ['G/S', 'ALT'].includes(m))}
          </div>
        </div>
        <div
          className={`border-r border-[#2a2d2d] text-center flex flex-col items-center justify-center ${isBoxed('lateral') ? boxStyle : ''}`}
        >
          <div>{fma.lateralMode}</div>
          <div className="text-white opacity-50 text-[7px] leading-none">
            {fma.armedModes.find((m) => ['LOC', 'NAV'].includes(m))}
          </div>
        </div>
        <div className="border-r border-[#2a2d2d] text-center flex flex-col items-center justify-center">
          <div className="text-white">{fma.approachCapability}</div>
          <div className="text-white opacity-50 text-[7px] leading-none">
            {fma.approachCapability === 'CAT3 DUAL' ? 'DUAL' : fma.approachCapability === 'CAT3 SINGLE' ? 'SINGLE' : ''}
          </div>
        </div>
        <div className="text-center flex flex-col items-center justify-center">
          <div className="flex justify-center gap-1">
            <span className={fma.status.ap1 ? 'text-[#00ff44]' : 'text-white opacity-10'}>AP1</span>
            <span className={fma.status.ap2 ? 'text-[#00ff44]' : 'text-white opacity-10'}>AP2</span>
          </div>
          <div className="text-[7px] leading-none">
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
