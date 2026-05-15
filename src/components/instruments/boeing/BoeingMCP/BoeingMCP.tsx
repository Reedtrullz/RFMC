import { BoeingMCPState } from '@shared';
import { useFMCStore } from '../../../../store/useFMCStore';
import { useAutopilotStore } from '../../../../store/autopilotStore';
import { useCockpitLayoutStore } from '../../../../store/cockpitLayoutStore';
import { InstrumentShell } from '../../common/InstrumentShell';
import { MCPSwitch } from './MCPSwitch';
import { MCPKnob } from './MCPKnob';
import { MCPDisplayWindow } from './MCPDisplayWindow';

interface BoeingMCPProps {
  state: BoeingMCPState;
  updateState: (update: Partial<BoeingMCPState>) => void;
  pressButton: (action: string) => void;
}

export function BoeingMCP({ state, updateState, pressButton }: BoeingMCPProps) {
  const truth = useAutopilotStore(s => s.truth);
  const tutorialHighlight = useFMCStore(s => s.tutorialHighlight);
  
  return (
    <InstrumentShell variant="boeing-mcp" className="w-full">
      <div className="flex min-w-0 w-full items-start justify-between gap-4 overflow-visible pb-4 pt-2">
        
        {/* FD LEFT */}
        <div className="flex flex-col gap-4 pr-4 border-r border-black/20">
          <MCPSwitch label="F/D" active={state.fdLeft} onPress={() => updateState({ fdLeft: !state.fdLeft })} small showAnnunciator={false} highlighted={tutorialHighlight === 'FD_LEFT'} />
          <MCPSwitch label="A/T ARM" active={state.autothrottleArm} onPress={() => updateState({ autothrottleArm: !state.autothrottleArm })} small highlighted={tutorialHighlight === 'AT_ARM'} />
        </div>

        {/* COURSE L */}
        <div className="flex flex-col items-center gap-2">
          <MCPDisplayWindow 
            label="COURSE" 
            value={state.courseL.toString().padStart(3, '0')} 
            active={true}
            highlighted={tutorialHighlight === 'COURSE_L'}
          />
          <MCPKnob 
            value={state.courseL} 
            onRotate={(d) => updateState({ courseL: (state.courseL + d + 360) % 360 })} 
            label="COURSE"
            highlighted={tutorialHighlight === 'COURSE_L'}
          />
        </div>

        {/* SPEED Section */}
        <div className="flex flex-col items-center gap-4 border-l border-r border-black/20 px-4">
          <div className="flex gap-4">
            <MCPSwitch label="N1" active={truth.thrustActive === 'N1'} onPress={() => pressButton('N1')} small highlighted={tutorialHighlight === 'N1'} />
            <MCPSwitch label="SPEED" active={truth.thrustActive === 'SPEED'} onPress={() => pressButton('SPEED')} small highlighted={tutorialHighlight === 'SPEED_MODE'} />
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="h-4 w-8 rounded-full bg-[#1a1a1a] border border-white/10 text-[8px] text-white/60 hover:text-white"
              onClick={() => pressButton('SPD_MACH_TOGGLE')}
            >SPD/MACH</button>
            <MCPDisplayWindow 
              label="IAS/MACH" 
              value={state.speed === null && state.mach === null ? '' : (state.mach !== null ? `.${Math.round(state.mach * 100)}` : (state.speed?.toString() ?? '').padStart(3, ' '))} 
              active={state.speed !== null || state.mach !== null}
              highlighted={tutorialHighlight === 'IAS_SEL'}
              unit={state.mach !== null ? 'MACH' : 'SPD'}
            />
          </div>
          <MCPKnob 
            value={state.mach !== null ? state.mach * 1000 : state.speed || 100} 
            onRotate={(d) => {
              if (state.mach !== null) {
                updateState({ mach: Math.max(0.60, Math.min(0.85, state.mach + d * 0.01)) });
              } else {
                updateState({ speed: Math.max(100, Math.min(340, (state.speed || 100) + d)) });
              }
            }} 
            label="SPD/MACH"
            highlighted={tutorialHighlight === 'IAS_SEL'}
          />
          <MCPSwitch label="LVL CHG" active={truth.verticalActive === 'LVL_CHG'} onPress={() => pressButton('LVL_CHG')} highlighted={tutorialHighlight === 'LVL_CHG'} />
        </div>

        {/* HEADING Section */}
        <div className="flex flex-col items-center gap-4 px-4">
          <div className="flex gap-4">
            <MCPSwitch label="LNAV" active={truth.lateralActive === 'LNAV' || truth.lateralArmed === 'LNAV'} onPress={() => pressButton('LNAV')} highlighted={tutorialHighlight === 'LNAV'} />
            <MCPSwitch label="VNAV" active={truth.verticalActive === 'VNAV_PTH' || truth.verticalArmed === 'VNAV_PTH'} onPress={() => pressButton('VNAV')} highlighted={tutorialHighlight === 'VNAV'} />
          </div>
          <MCPDisplayWindow 
            label="HEADING" 
            value={state.heading.toString().padStart(3, '0')} 
            active={true}
            highlighted={tutorialHighlight === 'HDG_SEL'}
          />
          <MCPKnob 
            value={state.heading} 
            onRotate={(d) => updateState({ heading: (state.heading + d + 360) % 360 })} 
            label="HEADING"
            highlighted={tutorialHighlight === 'HDG_SEL'}
          />
          <MCPSwitch label="HDG SEL" active={truth.lateralActive === 'HDG_SEL'} onPress={() => pressButton('HDG_SEL')} highlighted={tutorialHighlight === 'HDG_SEL_BTN'} />
        </div>

        {/* ALTITUDE Section */}
        <div className="flex flex-col items-center gap-4 border-l border-r border-black/20 px-4">
          <MCPDisplayWindow 
            label="ALTITUDE" 
            value={state.altitude.toString().padStart(5, '0')} 
            active={true}
            highlighted={tutorialHighlight === 'ALT_SEL'}
          />
          <MCPKnob 
            value={state.altitude / 100} 
            onRotate={(d) => updateState({ altitude: Math.max(0, Math.min(50000, state.altitude + d * 100)) })} 
            label="ALTITUDE"
            highlighted={tutorialHighlight === 'ALT_SEL'}
          />
          <MCPSwitch label="ALT HOLD" active={truth.verticalActive === 'ALT_HOLD'} onPress={() => pressButton('ALT_HLD')} highlighted={tutorialHighlight === 'ALT_HOLD'} />
        </div>

        {/* V/S Section */}
        <div className="flex flex-col items-center gap-4 px-4">
          <MCPDisplayWindow 
            label="VERT SPEED" 
            value={truth.verticalActive !== 'VS' ? '' : (state.verticalSpeed !== null ? (state.verticalSpeed > 0 ? `+${state.verticalSpeed}` : state.verticalSpeed.toString()) : '0000')} 
            active={truth.verticalActive === 'VS'}
            highlighted={tutorialHighlight === 'VS_MODE'}
          />
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
          <MCPSwitch label="V/S" active={truth.verticalActive === 'VS'} onPress={() => pressButton('VS')} highlighted={tutorialHighlight === 'VS_MODE'} />
        </div>

        {/* AP ENGAGE Section */}
        <div className="flex flex-col gap-4 pl-4 border-l border-black/20">
          <div className="flex gap-4">
             <MCPSwitch label="F/D" active={state.fdRight} onPress={() => updateState({ fdRight: !state.fdRight })} small showAnnunciator={false} />
             <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <MCPSwitch label="CMD A" active={truth.autopilotStatus === 'CMD_A'} onPress={() => pressButton('cmdA')} />
                  <MCPSwitch label="CWS A" active={truth.autopilotStatus === 'CWS_A'} onPress={() => pressButton('cwsA')} />
                </div>
                <div className="flex gap-2">
                  <MCPSwitch label="CMD B" active={truth.autopilotStatus === 'CMD_B'} onPress={() => pressButton('cmdB')} />
                  <MCPSwitch label="CWS B" active={truth.autopilotStatus === 'CWS_B'} onPress={() => pressButton('cwsB')} />
                </div>
             </div>
          </div>
          <div className="flex gap-2">
            <MCPSwitch label="APP" active={truth.lateralActive === 'APP' || truth.lateralArmed === 'APP'} onPress={() => pressButton('APP')} highlighted={tutorialHighlight === 'APP_MODE'} />
            <MCPSwitch label="VOR LOC" active={truth.lateralActive === 'VOR_LOC' || truth.lateralArmed === 'VOR_LOC'} onPress={() => pressButton('VOR_LOC')} highlighted={tutorialHighlight === 'VOR_LOC'} />
          </div>
        </div>

        {/* COURSE R */}
        <div className="flex flex-col items-center gap-2 border-l border-black/20 pl-4">
          <MCPDisplayWindow 
            label="COURSE" 
            value={state.courseR.toString().padStart(3, '0')} 
            active={true}
          />
          <MCPKnob 
            value={state.courseR} 
            onRotate={(d) => updateState({ courseR: (state.courseR + d + 360) % 360 })} 
            label="COURSE"
          />
        </div>

      </div>
    </InstrumentShell>
  );
}
