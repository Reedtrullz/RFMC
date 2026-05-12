import { BoeingMCPState } from '@shared';
import { CockpitPanel } from '../../visual/CockpitPanel';
import { SevenSegmentDisplay } from '../../visual/SevenSegmentDisplay';
import { RotaryKnob } from '../../visual/RotaryKnob';
import { MCPSwitch } from './MCPSwitch';

interface BoeingMCPProps {
  state: BoeingMCPState;
  updateState: (update: Partial<BoeingMCPState>) => void;
  pressButton: (action: string) => void;
}

export function BoeingMCP({ state, updateState, pressButton }: BoeingMCPProps) {
  return (
    <CockpitPanel variant="boeing" className="w-full">
      <div className="flex w-full items-start justify-between gap-4 overflow-x-auto pb-2">
        
        {/* FD LEFT */}
        <div className="flex flex-col gap-4 pr-4 border-r border-black/20">
          <MCPSwitch label="F/D" active={state.fdLeft} onPress={() => updateState({ fdLeft: !state.fdLeft })} small showAnnunciator={false} />
          <MCPSwitch label="A/T ARM" active={state.autothrottleArm} onPress={() => updateState({ autothrottleArm: !state.autothrottleArm })} small />
        </div>

        {/* COURSE L */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-bold text-[#c8c8c8] uppercase tracking-wider">COURSE</span>
          <SevenSegmentDisplay digits={3} value={state.courseL.toString().padStart(3, '0')} color="orange" />
          <RotaryKnob 
            value={state.courseL} 
            onRotate={(d) => updateState({ courseL: (state.courseL + d + 360) % 360 })} 
          />
        </div>

        {/* SPEED Section */}
        <div className="flex flex-col items-center gap-4 border-l border-r border-black/20 px-4">
          <div className="flex gap-4">
            <MCPSwitch label="N1" active={state.n1} onPress={() => updateState({ n1: !state.n1 })} small />
            <MCPSwitch label="SPEED" active={state.speedMode} onPress={() => pressButton('speedMode')} small />
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="h-4 w-8 rounded-full bg-[#1a1a1a] border border-white/10 text-[8px] text-white/60 hover:text-white"
              onClick={() => pressButton('SPD_MACH_TOGGLE')}
            >SPD/MACH</button>
            <SevenSegmentDisplay 
              digits={3} 
              value={state.mach !== null ? `.${Math.round(state.mach * 100)}` : state.speed} 
              color="orange" 
            />
          </div>
          <RotaryKnob 
            value={state.mach !== null ? state.mach * 1000 : state.speed || 100} 
            onRotate={(d) => {
              if (state.mach !== null) {
                updateState({ mach: Math.max(0.60, Math.min(0.85, state.mach + d * 0.01)) });
              } else {
                updateState({ speed: Math.max(100, Math.min(340, (state.speed || 100) + d)) });
              }
            }} 
          />
          <MCPSwitch label="LVL CHG" active={state.lvlChg} onPress={() => pressButton('lvlChg')} />
        </div>

        {/* HEADING Section */}
        <div className="flex flex-col items-center gap-4 px-4">
          <div className="flex gap-4">
            <MCPSwitch label="LNAV" active={state.lnav} onPress={() => pressButton('lnav')} />
            <MCPSwitch label="VNAV" active={state.vnav} onPress={() => pressButton('vnav')} />
          </div>
          <SevenSegmentDisplay digits={3} value={state.heading.toString().padStart(3, '0')} color="orange" />
          <RotaryKnob 
            value={state.heading} 
            onRotate={(d) => updateState({ heading: (state.heading + d + 360) % 360 })} 
          />
          <MCPSwitch label="HDG SEL" active={state.hdgSel} onPress={() => pressButton('hdgSel')} />
        </div>

        {/* ALTITUDE Section */}
        <div className="flex flex-col items-center gap-4 border-l border-r border-black/20 px-4">
          <SevenSegmentDisplay digits={5} value={state.altitude} color="orange" />
          <RotaryKnob 
            value={state.altitude / 100} 
            onRotate={(d) => updateState({ altitude: Math.max(0, Math.min(50000, state.altitude + d * 100)) })} 
          />
          <MCPSwitch label="ALT HOLD" active={state.altHold} onPress={() => pressButton('altHold')} />
        </div>

        {/* V/S Section */}
        <div className="flex flex-col items-center gap-4 px-4">
          <SevenSegmentDisplay digits={5} value={state.verticalSpeed !== null ? (state.verticalSpeed > 0 ? `+${state.verticalSpeed}` : state.verticalSpeed) : '0'} color="orange" />
          <div className="flex flex-col gap-1">
            <button 
              className="h-6 w-8 bg-[#1a1a1a] text-white text-[9px] rounded-t-sm border-b border-white/10 hover:bg-[#2a2a2a]"
              onClick={() => updateState({ verticalSpeed: (state.verticalSpeed || 0) + 100 })}
            >UP</button>
            <button 
              className="h-6 w-8 bg-[#1a1a1a] text-white text-[9px] rounded-b-sm hover:bg-[#2a2a2a]"
              onClick={() => updateState({ verticalSpeed: (state.verticalSpeed || 0) - 100 })}
            >DN</button>
          </div>
          <MCPSwitch label="V/S" active={state.vs} onPress={() => pressButton('vs')} />
        </div>

        {/* AP ENGAGE Section */}
        <div className="flex flex-col gap-4 pl-4 border-l border-black/20">
          <div className="flex gap-4">
             <MCPSwitch label="F/D" active={state.fdRight} onPress={() => updateState({ fdRight: !state.fdRight })} small showAnnunciator={false} />
             <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <MCPSwitch label="CMD A" active={state.cmdA} onPress={() => pressButton('cmdA')} />
                  <MCPSwitch label="CWS A" active={state.cwsA} onPress={() => pressButton('cwsA')} />
                </div>
                <div className="flex gap-2">
                  <MCPSwitch label="CMD B" active={state.cmdB} onPress={() => pressButton('cmdB')} />
                  <MCPSwitch label="CWS B" active={state.cwsB} onPress={() => pressButton('cwsB')} />
                </div>
             </div>
          </div>
          <div className="flex gap-2">
            <MCPSwitch label="APP" active={state.app} onPress={() => pressButton('app')} />
            <MCPSwitch label="VOR LOC" active={state.vorLoc} onPress={() => pressButton('vorLoc')} />
          </div>
        </div>

        {/* COURSE R */}
        <div className="flex flex-col items-center gap-2 border-l border-black/20 pl-4">
          <span className="text-[10px] font-bold text-[#c8c8c8] uppercase tracking-wider">COURSE</span>
          <SevenSegmentDisplay digits={3} value={state.courseR.toString().padStart(3, '0')} color="orange" />
          <RotaryKnob 
            value={state.courseR} 
            onRotate={(d) => updateState({ courseR: (state.courseR + d + 360) % 360 })} 
          />
        </div>

      </div>
    </CockpitPanel>
  );
}
