import { useEffect } from 'react';
import { Boeing737CDU } from './boeing/Boeing737CDU';
import { AirbusMCDU } from './airbus/AirbusMCDU';
import { useFMCStore } from '../../store/useFMCStore';
import { useCDUKeyboard } from '../../hooks/useCDUKeyboard';
import { useAircraftStore } from '../../store/aircraftStore';

export function CDU() {
  const aircraft = useAircraftStore((s) => s.aircraft);
  const dbState = useFMCStore((s) => s.dbInitializationState);
  const progress = useFMCStore((s) => s.dbInitializationProgress);
  const initNavDb = useFMCStore((s) => s.initNavDb);

  useCDUKeyboard();

  useEffect(() => {
    initNavDb();
  }, [initNavDb]);

  if (dbState === 'loading') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#111] font-mono">
        <div className="w-[420px] h-[360px] bg-black border border-neutral-900 rounded p-6 flex flex-col justify-between shadow-[inset_0_0_18px_rgba(0,0,0,0.85)]">
          <div className="text-center text-base tracking-widest text-[#00ffff] border-b border-neutral-900 pb-2">
            CDU NAV DATA UPDATE
          </div>
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="animate-pulse text-[#39ff14] text-xs tracking-wider">INITIALIZING FMC DATABASE...</div>
            <div className="text-2xl text-white font-bold">{progress}%</div>
            <div className="w-full bg-neutral-950 rounded-full h-1.5 max-w-[260px] border border-neutral-900 overflow-hidden">
              <div
                className="bg-[#39ff14] h-full transition-all duration-150 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="text-center text-[10px] text-neutral-600 tracking-tighter uppercase font-bold">
            AIRAC CYCLE 2405 — PWA-WORKSPACE
          </div>
        </div>
      </div>
    );
  }

  if (aircraft === 'AIRBUS_A320') {
    return <AirbusMCDU />;
  }

  return <Boeing737CDU />;
}
