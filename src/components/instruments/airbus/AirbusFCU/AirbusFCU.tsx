import type { AirbusFCUState } from '@shared';
import { CockpitPanel } from '../../../../visual/CockpitPanel';
import { FCUDisplay } from './FCUDisplay';
import { FCUButton } from './FCUButton';
import { useFMCStore } from '../../../../store/useFMCStore';

interface AirbusFCUProps {
  state: AirbusFCUState;
  updateState: (update: Partial<AirbusFCUState>) => void;
  pressButton: (action: string) => void;
}

import { PushPullRotary } from '../../common/PushPullRotary';

export function AirbusFCU({ state, updateState, pressButton }: AirbusFCUProps) {
  const truth = useFMCStore(s => s.autopilot.truth);
  const tutorialHighlight = useFMCStore(s => s.tutorialHighlight);
  const highlighted = (controlId: string) => tutorialHighlight === controlId;

  const formatWindow = (field: 'speed' | 'heading' | 'altitude' | 'vs', val: number | null, managed: boolean) => {
    if ((field === 'speed' || field === 'heading') && managed) return { text: '---', dots: true };
    if (field === 'altitude') return { text: val?.toString().padStart(5, '0') ?? '00000', dots: managed };
    if (field === 'vs') return { text: val === null ? '-----' : (val > 0 ? `+${val}` : val.toString()), dots: false };
    return { text: val?.toString() ?? '', dots: managed };
  };

  const isManaged = (field: 'speed' | 'heading' | 'altitude') => {
    if (field === 'speed') return truth.thrustActive === 'SPEED' || truth.thrustActive === 'THR_CLB';
    if (field === 'heading') return truth.lateralActive === 'NAV' || truth.lateralArmed === 'NAV';
    if (field === 'altitude') return truth.verticalActive === 'CLB' || truth.verticalActive === 'DES' || truth.verticalArmed === 'VNAV';
    return false;
  };

  return (
    <CockpitPanel variant="airbus" className="w-full">
      <div className="flex w-full items-center justify-between gap-6 overflow-x-auto pb-2 px-2">
        
        {/* SPEED/MACH Section */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`text-[8px] font-bold ${state.speedMachMode === 'SPD' ? 'text-white' : 'text-white/20'}`}>SPD</span>
            <span className="text-[8px] text-white/20">/</span>
            <span className={`text-[8px] font-bold ${state.speedMachMode === 'MACH' ? 'text-white' : 'text-white/20'}`}>MACH</span>
          </div>
          <FCUDisplay 
            value={state.speed || 0} 
            {...formatWindow('speed', state.speed, isManaged('speed'))}
            label={formatWindow('speed', state.speed, isManaged('speed')).text}
            highlighted={highlighted('A320_SPEED')}
          />
          <PushPullRotary 
            value={state.speed || 100} 
            onRotate={(d) => updateState({ speed: Math.max(100, Math.min(340, (state.speed || 100) + d)) })}
            onPush={() => pressButton('SPD_MANAGED')}
            onPull={() => pressButton('SPD_SELECTED')}
          />
        </div>

        {/* HDG / TRK Section */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
             <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">HDG V/S</span>
             <button 
               className="w-6 h-3 bg-white/10 rounded-full relative"
               onClick={() => updateState({ hdgTrkMode: state.hdgTrkMode === 'HDG_VS' ? 'TRK_FPA' : 'HDG_VS' })}
             >
                <div className={`absolute top-0.5 w-2 h-2 rounded-full bg-white transition-all ${state.hdgTrkMode === 'HDG_VS' ? 'left-0.5' : 'left-3.5'}`} />
             </button>
             <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">TRK FPA</span>
          </div>
          <FCUDisplay 
            value={state.heading || 0} 
            {...formatWindow('heading', state.heading, isManaged('heading'))}
            label={formatWindow('heading', state.heading, isManaged('heading')).text}
            highlighted={highlighted('A320_HDG')}
          />
          <PushPullRotary 
            value={state.heading || 0} 
            onRotate={(d) => updateState({ heading: ((state.heading || 0) + d + 360) % 360 })}
            onPush={() => pressButton('HDG_MANAGED')}
            onPull={() => pressButton('HDG_SELECTED')}
            highlighted={highlighted('A320_HDG')}
          />
        </div>

        {/* AP ENGAGE / Central Buttons */}
        <div className="flex flex-col gap-2 pt-4">
          <div className="flex gap-2">
            <FCUButton label="AP1" active={truth.autopilotStatus === 'AP1' || truth.autopilotStatus === 'AP1_AP2'} highlighted={highlighted('A320_AP1')} onPress={() => pressButton('AP1')} />
            <FCUButton label="AP2" active={truth.autopilotStatus === 'AP2' || truth.autopilotStatus === 'AP1_AP2'} highlighted={highlighted('A320_AP2')} onPress={() => pressButton('AP2')} />
          </div>
          <div className="flex gap-2">
            <FCUButton label="A/THR" active={truth.thrustActive !== 'OFF'} highlighted={highlighted('A320_ATHR')} onPress={() => pressButton('ATHR')} />
            <FCUButton label="LOC" active={truth.lateralActive === 'LOC' || truth.lateralArmed === 'LOC'} highlighted={highlighted('A320_LOC')} onPress={() => pressButton('LOC')} />
          </div>
        </div>

        {/* ALTITUDE Section */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">ALTITUDE</span>
            <button 
              className={`px-1 rounded text-[7px] border ${state.metricAltitude ? 'bg-white/20 border-white text-white' : 'border-white/20 text-white/40'}`}
              onClick={() => updateState({ metricAltitude: !state.metricAltitude })}
            >METRIC</button>
          </div>
          <FCUDisplay 
            value={state.altitude} 
            {...formatWindow('altitude', state.altitude, isManaged('altitude'))}
            label={formatWindow('altitude', state.altitude, isManaged('altitude')).text}
            highlighted={highlighted('A320_ALT')}
          />
          <PushPullRotary 
            value={state.altitude / 100} 
            onRotate={(d) => updateState({ altitude: Math.max(0, Math.min(49000, state.altitude + d * 100)) })}
            onPush={() => pressButton('ALT_MANAGED')}
            onPull={() => pressButton('ALT_SELECTED')}
            highlighted={highlighted('A320_ALT')}
          />
        </div>

        {/* V/S - FPA Section */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{state.hdgTrkMode === 'HDG_VS' ? 'V/S' : 'FPA'}</span>
          <FCUDisplay 
            value={state.verticalSpeed || 0} 
            {...formatWindow('vs', state.verticalSpeed, false)}
            label={formatWindow('vs', state.verticalSpeed, false).text}
          />
          <div className="flex flex-col gap-1">
            <button 
              className="h-6 w-10 bg-[#1a1a1a] text-white text-[9px] rounded-t-sm border border-white/10 hover:bg-[#2a2a2a]"
              onClick={() => updateState({ verticalSpeed: (state.verticalSpeed || 0) + 100 })}
            >UP</button>
            <button 
              className="h-6 w-10 bg-[#1a1a1a] text-white text-[9px] rounded-b-sm border border-white/10 hover:bg-[#2a2a2a]"
              onClick={() => updateState({ verticalSpeed: (state.verticalSpeed || 0) - 100 })}
            >DN</button>
          </div>
          <FCUButton label="APPR" active={truth.verticalActive === 'G_S' || truth.verticalArmed === 'G_S'} highlighted={highlighted('A320_APPR')} onPress={() => pressButton('APPR')} />
        </div>

      </div>
    </CockpitPanel>
  );
}
