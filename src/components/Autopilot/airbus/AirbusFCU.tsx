import type { AirbusFCUState } from '@shared';
import { CockpitPanel } from '../../visual/CockpitPanel';
import { FCUDisplay } from './FCUDisplay';
import { RotaryKnob } from '../../visual/RotaryKnob';
import { FCUButton } from './FCUButton';
import { useFMCStore } from '../../../store/useFMCStore';

interface AirbusFCUProps {
  state: AirbusFCUState;
  updateState: (update: Partial<AirbusFCUState>) => void;
  pressButton: (action: string) => void;
}

export function AirbusFCU({ state, updateState, pressButton }: AirbusFCUProps) {
  const tutorialHighlight = useFMCStore(s => s.tutorialHighlight);
  const highlighted = (controlId: string) => tutorialHighlight === controlId;

  return (
    <CockpitPanel variant="airbus" className="w-full">
      <div className="flex w-full items-center justify-between gap-6 overflow-x-auto pb-2 px-2">
        
        {/* SPEED/MACH Section */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">SPD / MACH</span>
          <div className="relative group">
            <FCUDisplay 
              value={state.speed || 0} 
              managed={state.speedManaged} 
              label={state.speed === null ? "---" : state.speed.toString()}
              highlighted={highlighted('A320_SPEED')}
            />
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => updateState({ speedManaged: true })} className="p-1 bg-white/5 rounded text-[8px] text-white/50 hover:text-white">PUSH</button>
              <button onClick={() => updateState({ speedManaged: false })} className="p-1 bg-white/5 rounded text-[8px] text-white/50 hover:text-white">PULL</button>
            </div>
          </div>
          <RotaryKnob 
            value={state.speed || 100} 
            onRotate={(d) => updateState({ speed: Math.max(100, Math.min(340, (state.speed || 100) + d)) })} 
          />
        </div>

        {/* HDG / TRK Section */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">HDG / TRK</span>
          <div className="relative group">
            <FCUDisplay 
              value={state.heading || 0} 
              managed={state.headingManaged} 
              label={state.headingManaged ? "---" : (state.heading || 0).toString().padStart(3, '0')}
              highlighted={highlighted('A320_HDG')}
            />
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => updateState({ headingManaged: true })} className="p-1 bg-white/5 rounded text-[8px] text-white/50 hover:text-white">PUSH</button>
              <button onClick={() => updateState({ headingManaged: false })} className="p-1 bg-white/5 rounded text-[8px] text-white/50 hover:text-white">PULL</button>
            </div>
          </div>
          <RotaryKnob 
            value={state.heading || 0} 
            highlighted={highlighted('A320_HDG')}
            onRotate={(d) => updateState({ heading: ((state.heading || 0) + d + 360) % 360 })}
          />
        </div>

        {/* AP ENGAGE / Central Buttons */}
        <div className="flex flex-col gap-2 pt-4">
          <div className="flex gap-2">
            <FCUButton label="AP1" active={state.ap1} highlighted={highlighted('A320_AP1')} onPress={() => pressButton('AP1')} />
            <FCUButton label="AP2" active={state.ap2} highlighted={highlighted('A320_AP2')} onPress={() => pressButton('AP2')} />
          </div>
          <div className="flex gap-2">
            <FCUButton label="A/THR" active={state.athr} highlighted={highlighted('A320_ATHR')} onPress={() => pressButton('ATHR')} />
            <FCUButton label="LOC" active={state.loc} highlighted={highlighted('A320_LOC')} onPress={() => pressButton('LOC')} />
          </div>
        </div>

        {/* ALTITUDE Section */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">ALTITUDE</span>
          <div className="relative group">
            <FCUDisplay 
              value={state.altitude} 
              managed={state.altitudeManaged} 
              label={state.altitude.toString()}
              highlighted={highlighted('A320_ALT')}
            />
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => updateState({ altitudeManaged: true })} className="p-1 bg-white/5 rounded text-[8px] text-white/50 hover:text-white">PUSH</button>
              <button onClick={() => updateState({ altitudeManaged: false })} className="p-1 bg-white/5 rounded text-[8px] text-white/50 hover:text-white">PULL</button>
            </div>
          </div>
          <RotaryKnob 
            value={state.altitude / 100} 
            highlighted={highlighted('A320_ALT')}
            onRotate={(d) => updateState({ altitude: Math.max(0, Math.min(49000, state.altitude + d * 100)) })} 
          />
        </div>

        {/* V/S - FPA Section */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">V/S - FPA</span>
          <FCUDisplay 
            value={state.verticalSpeed || 0} 
            managed={false} 
            label={state.verticalSpeed === null ? "0" : (state.verticalSpeed > 0 ? `+${state.verticalSpeed}` : state.verticalSpeed.toString())}
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
          <FCUButton label="APPR" active={state.appr} highlighted={highlighted('A320_APPR')} onPress={() => pressButton('APPR')} />
        </div>

      </div>
    </CockpitPanel>
  );
}
