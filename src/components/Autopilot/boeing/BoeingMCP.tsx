import { BoeingMCPState } from '@shared';
import { BoeingMCPFrame } from './BoeingMCPFrame';
import { MCPDisplayWindow } from './MCPDisplayWindow';
import { MCPKnob } from './MCPKnob';
import { MCPSwitch } from './MCPSwitch';

interface BoeingMCPProps {
  state: BoeingMCPState;
  updateState: (update: Partial<BoeingMCPState>) => void;
  pressButton: (action: string) => void;
}

export function BoeingMCP({ state, updateState, pressButton }: BoeingMCPProps) {
  return (
    <BoeingMCPFrame>
      <div className="flex w-full items-start justify-between gap-4 overflow-x-auto pb-4">
        
        {/* FD LEFT */}
        <div className="flex flex-col gap-4 pr-4 border-r border-black/20">
          <MCPSwitch label="F/D" active={state.fdLeft} onPress={() => updateState({ fdLeft: !state.fdLeft })} small showAnnunciator={false} />
          <MCPSwitch label="A/T ARM" active={state.autothrottleArm} onPress={() => updateState({ autothrottleArm: !state.autothrottleArm })} small />
        </div>

        {/* COURSE L */}
        <div className="flex flex-col gap-4">
          <MCPDisplayWindow label="COURSE" value={state.courseL.toString().padStart(3, '0')} />
          <MCPKnob 
            label="" 
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
          <MCPDisplayWindow label="IAS / MACH" value={state.speed} />
          <MCPKnob 
            label="" 
            value={state.speed || 100} 
            onRotate={(d) => updateState({ speed: Math.max(100, Math.min(340, (state.speed || 100) + d)) })} 
          />
          <MCPSwitch label="LVL CHG" active={state.lvlChg} onPress={() => pressButton('lvlChg')} />
        </div>

        {/* HEADING Section */}
        <div className="flex flex-col items-center gap-4 px-4">
          <div className="flex gap-4">
            <MCPSwitch label="LNAV" active={state.lnav} onPress={() => pressButton('lnav')} />
            <MCPSwitch label="VNAV" active={state.vnav} onPress={() => pressButton('vnav')} />
          </div>
          <MCPDisplayWindow label="HEADING" value={state.heading.toString().padStart(3, '0')} />
          <MCPKnob 
            label="" 
            value={state.heading} 
            onRotate={(d) => updateState({ heading: (state.heading + d + 360) % 360 })} 
          />
          <MCPSwitch label="HDG SEL" active={state.hdgSel} onPress={() => pressButton('hdgSel')} />
        </div>

        {/* ALTITUDE Section */}
        <div className="flex flex-col items-center gap-4 border-l border-r border-black/20 px-4">
          <MCPDisplayWindow label="ALTITUDE" value={state.altitude} />
          <MCPKnob 
            label="" 
            value={state.altitude / 100} 
            onRotate={(d) => updateState({ altitude: Math.max(0, Math.min(50000, state.altitude + d * 100)) })} 
          />
          <MCPSwitch label="ALT HOLD" active={state.altHold} onPress={() => pressButton('altHold')} />
        </div>

        {/* V/S Section */}
        <div className="flex flex-col items-center gap-4 px-4">
          <MCPDisplayWindow label="VERT SPEED" value={state.verticalSpeed !== null ? (state.verticalSpeed > 0 ? `+${state.verticalSpeed}` : state.verticalSpeed) : '0'} />
          <div className="flex flex-col gap-2">
            <button 
              className="h-8 w-10 bg-[#2a2a2a] text-white text-[10px] rounded-t-lg border-b border-white/10"
              onClick={() => updateState({ verticalSpeed: (state.verticalSpeed || 0) + 100 })}
            >UP</button>
            <button 
              className="h-8 w-10 bg-[#2a2a2a] text-white text-[10px] rounded-b-lg"
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
                <MCPSwitch label="CMD A" active={state.apA} onPress={() => updateState({ apA: !state.apA })} />
                <MCPSwitch label="CMD B" active={state.apB} onPress={() => updateState({ apB: !state.apB })} />
             </div>
          </div>
          <div className="flex gap-2">
            <MCPSwitch label="APP" active={state.app} onPress={() => pressButton('app')} />
            <MCPSwitch label="VOR LOC" active={state.vorLoc} onPress={() => pressButton('vorLoc')} />
          </div>
        </div>

        {/* COURSE R */}
        <div className="flex flex-col gap-4 border-l border-black/20 pl-4">
          <MCPDisplayWindow label="COURSE" value={state.courseR.toString().padStart(3, '0')} />
          <MCPKnob 
            label="" 
            value={state.courseR} 
            onRotate={(d) => updateState({ courseR: (state.courseR + d + 360) % 360 })} 
          />
        </div>

      </div>
    </BoeingMCPFrame>
  );
}
