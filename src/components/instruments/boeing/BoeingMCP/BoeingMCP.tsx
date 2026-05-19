import { useCallback, useMemo } from 'react';
import { BoeingMCPState, buildBoeingMcpDisplayModel } from '@shared';
import { useFMCStore } from '../../../../store/useFMCStore';
import { useAutopilotStore } from '../../../../store/autopilotStore';
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
  const truth = useAutopilotStore((s) => s.truth);
  const tutorialHighlight = useFMCStore((s) => s.tutorialHighlight);
  const display = useMemo(() => buildBoeingMcpDisplayModel(state, truth), [state, truth]);
  const sectionClass =
    'relative flex flex-col items-center gap-3 rounded-[6px] border border-black/45 bg-[#2f3434] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-10px_18px_rgba(0,0,0,0.34)]';

  const handleFdLeft = useCallback(() => updateState({ fdLeft: !state.fdLeft }), [state.fdLeft, updateState]);
  const handleAutothrottleArm = useCallback(
    () => updateState({ autothrottleArm: !state.autothrottleArm }),
    [state.autothrottleArm, updateState],
  );
  const handleCourseLRotate = useCallback(
    (d: number) => updateState({ courseL: (state.courseL + d + 360) % 360 }),
    [state.courseL, updateState],
  );
  const handleN1 = useCallback(() => pressButton('N1'), [pressButton]);
  const handleSpeedMode = useCallback(() => pressButton('SPEED'), [pressButton]);
  const handleSpdMachToggle = useCallback(() => pressButton('SPD_MACH_TOGGLE'), [pressButton]);
  const handleSpeedRotate = useCallback(
    (d: number) => {
      if (state.mach !== null) {
        updateState({ mach: Math.max(0.6, Math.min(0.85, state.mach + d * 0.01)) });
      } else {
        updateState({ speed: Math.max(100, Math.min(340, (state.speed || 100) + d)) });
      }
    },
    [state.mach, state.speed, updateState],
  );
  const handleLvlChg = useCallback(() => pressButton('LVL_CHG'), [pressButton]);
  const handleLnav = useCallback(() => pressButton('LNAV'), [pressButton]);
  const handleVnav = useCallback(() => pressButton('VNAV'), [pressButton]);
  const handleHeadingRotate = useCallback(
    (d: number) => updateState({ heading: (state.heading + d + 360) % 360 }),
    [state.heading, updateState],
  );
  const handleHdgSel = useCallback(() => pressButton('HDG_SEL'), [pressButton]);
  const handleAltitudeRotate = useCallback(
    (d: number) => updateState({ altitude: Math.max(0, Math.min(50000, state.altitude + d * 100)) }),
    [state.altitude, updateState],
  );
  const handleAltHld = useCallback(() => pressButton('ALT_HLD'), [pressButton]);
  const handleVsUp = useCallback(
    () => updateState({ verticalSpeed: (state.verticalSpeed || 0) + 100 }),
    [state.verticalSpeed, updateState],
  );
  const handleVsDown = useCallback(
    () => updateState({ verticalSpeed: (state.verticalSpeed || 0) - 100 }),
    [state.verticalSpeed, updateState],
  );
  const handleVs = useCallback(() => pressButton('VS'), [pressButton]);
  const handleFdRight = useCallback(() => updateState({ fdRight: !state.fdRight }), [state.fdRight, updateState]);
  const handleCmdA = useCallback(() => pressButton('cmdA'), [pressButton]);
  const handleCwsA = useCallback(() => pressButton('cwsA'), [pressButton]);
  const handleCmdB = useCallback(() => pressButton('cmdB'), [pressButton]);
  const handleCwsB = useCallback(() => pressButton('cwsB'), [pressButton]);
  const handleApp = useCallback(() => pressButton('APP'), [pressButton]);
  const handleVorLoc = useCallback(() => pressButton('VOR_LOC'), [pressButton]);
  const handleCourseRRotate = useCallback(
    (d: number) => updateState({ courseR: (state.courseR + d + 360) % 360 }),
    [state.courseR, updateState],
  );

  return (
    <InstrumentShell variant="boeing-mcp" className="w-full">
      <div className="flex min-w-0 w-full items-stretch justify-between gap-3 overflow-visible rounded-md border border-black/50 bg-gradient-to-b from-[#454a4a] via-[#303535] to-[#202424] px-4 py-3 shadow-[inset_0_10px_24px_rgba(255,255,255,0.05),inset_0_-16px_28px_rgba(0,0,0,0.42)]">
        {/* FD LEFT */}
        <div className="flex min-w-[86px] flex-col justify-center gap-4 rounded-[6px] border border-black/45 bg-[#252a2a] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
          <MCPSwitch
            label="F/D"
            active={state.fdLeft}
            onPress={handleFdLeft}
            small
            showAnnunciator={false}
            highlighted={tutorialHighlight === 'FD_LEFT'}
          />
          <MCPSwitch
            label="A/T ARM"
            active={state.autothrottleArm}
            onPress={handleAutothrottleArm}
            small
            highlighted={tutorialHighlight === 'AT_ARM'}
          />
        </div>

        {/* COURSE L */}
        <div className={`${sectionClass} min-w-[126px]`}>
          <MCPDisplayWindow
            label="COURSE"
            value={display.windows.courseL.text}
            active={display.windows.courseL.active}
            highlighted={tutorialHighlight === 'COURSE_L'}
          />
          <MCPKnob
            value={state.courseL}
            onRotate={handleCourseLRotate}
            label="COURSE"
            highlighted={tutorialHighlight === 'COURSE_L'}
          />
        </div>

        {/* SPEED Section */}
        <div className={`${sectionClass} min-w-[220px]`}>
          <div className="flex gap-4">
            <MCPSwitch
              label="N1"
              active={truth.thrustActive === 'N1'}
              onPress={handleN1}
              small
              highlighted={tutorialHighlight === 'N1'}
            />
            <MCPSwitch
              label="SPEED"
              active={truth.thrustActive === 'SPEED'}
              onPress={handleSpeedMode}
              small
              highlighted={tutorialHighlight === 'SPEED_MODE'}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              className="h-8 w-12 rounded-[3px] border border-black/70 border-b-[3px] border-b-black bg-[#202424] text-[7px] font-black leading-tight text-white/68 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:text-white active:translate-y-[1px] active:border-b"
              onClick={handleSpdMachToggle}
            >
              SPD/MACH
            </button>
            <MCPDisplayWindow
              label="IAS/MACH"
              value={display.windows.iasMach.text}
              active={display.windows.iasMach.active}
              highlighted={tutorialHighlight === 'IAS_SEL'}
              unit={display.windows.iasMach.unit}
            />
          </div>
          <MCPKnob
            value={state.mach !== null ? state.mach * 1000 : state.speed || 100}
            onRotate={handleSpeedRotate}
            label="SPD/MACH"
            highlighted={tutorialHighlight === 'IAS_SEL'}
          />
          <MCPSwitch
            label="LVL CHG"
            active={truth.verticalActive === 'LVL_CHG'}
            onPress={handleLvlChg}
            highlighted={tutorialHighlight === 'LVL_CHG'}
          />
        </div>

        {/* HEADING Section */}
        <div className={`${sectionClass} min-w-[180px]`}>
          <div className="flex gap-4">
            <MCPSwitch
              label="LNAV"
              active={truth.lateralActive === 'LNAV' || truth.lateralArmed === 'LNAV'}
              onPress={handleLnav}
              highlighted={tutorialHighlight === 'LNAV'}
            />
            <MCPSwitch
              label="VNAV"
              active={truth.verticalActive === 'VNAV_PTH' || truth.verticalArmed === 'VNAV_PTH'}
              onPress={handleVnav}
              highlighted={tutorialHighlight === 'VNAV'}
            />
          </div>
          <MCPDisplayWindow
            label="HEADING"
            value={display.windows.heading.text}
            active={display.windows.heading.active}
            highlighted={tutorialHighlight === 'HDG_SEL'}
          />
          <MCPKnob
            value={state.heading}
            onRotate={handleHeadingRotate}
            label="HEADING"
            highlighted={tutorialHighlight === 'HDG_SEL'}
          />
          <MCPSwitch
            label="HDG SEL"
            active={truth.lateralActive === 'HDG_SEL'}
            onPress={handleHdgSel}
            highlighted={tutorialHighlight === 'HDG_SEL_BTN'}
          />
        </div>

        {/* ALTITUDE Section */}
        <div className={`${sectionClass} min-w-[150px]`}>
          <MCPDisplayWindow
            label="ALTITUDE"
            value={display.windows.altitude.text}
            active={display.windows.altitude.active}
            highlighted={tutorialHighlight === 'ALT_SEL'}
          />
          <MCPKnob
            value={state.altitude / 100}
            onRotate={handleAltitudeRotate}
            label="ALTITUDE"
            highlighted={tutorialHighlight === 'ALT_SEL'}
          />
          <MCPSwitch
            label="ALT HOLD"
            active={truth.verticalActive === 'ALT_HOLD'}
            onPress={handleAltHld}
            highlighted={tutorialHighlight === 'ALT_HOLD'}
          />
        </div>

        {/* V/S Section */}
        <div className={`${sectionClass} min-w-[150px]`}>
          <MCPDisplayWindow
            label="VERT SPEED"
            value={display.windows.verticalSpeed.text}
            active={display.windows.verticalSpeed.active}
            highlighted={tutorialHighlight === 'VS_MODE'}
          />
          <div className="flex flex-col gap-1">
            <button
              className="h-7 w-11 rounded-t-sm border border-black/60 bg-[#1a1a1a] text-[9px] font-bold text-white hover:bg-[#2a2a2a]"
              onClick={handleVsUp}
            >
              UP
            </button>
            <button
              className="h-7 w-11 rounded-b-sm border border-black/60 bg-[#1a1a1a] text-[9px] font-bold text-white hover:bg-[#2a2a2a]"
              onClick={handleVsDown}
            >
              DN
            </button>
          </div>
          <MCPSwitch
            label="V/S"
            active={truth.verticalActive === 'VS'}
            onPress={handleVs}
            highlighted={tutorialHighlight === 'VS_MODE'}
          />
        </div>

        {/* AP ENGAGE Section */}
        <div className="flex min-w-[230px] flex-col justify-center gap-4 rounded-[6px] border border-black/45 bg-[#252a2a] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
          <div className="flex gap-4">
            <MCPSwitch label="F/D" active={state.fdRight} onPress={handleFdRight} small showAnnunciator={false} />
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <MCPSwitch label="CMD A" active={truth.autopilotStatus === 'CMD_A'} onPress={handleCmdA} />
                <MCPSwitch label="CWS A" active={truth.autopilotStatus === 'CWS_A'} onPress={handleCwsA} />
              </div>
              <div className="flex gap-2">
                <MCPSwitch label="CMD B" active={truth.autopilotStatus === 'CMD_B'} onPress={handleCmdB} />
                <MCPSwitch label="CWS B" active={truth.autopilotStatus === 'CWS_B'} onPress={handleCwsB} />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <MCPSwitch
              label="APP"
              active={truth.lateralActive === 'APP' || truth.lateralArmed === 'APP'}
              onPress={handleApp}
              highlighted={tutorialHighlight === 'APP_MODE'}
            />
            <MCPSwitch
              label="VOR LOC"
              active={truth.lateralActive === 'VOR_LOC' || truth.lateralArmed === 'VOR_LOC'}
              onPress={handleVorLoc}
              highlighted={tutorialHighlight === 'VOR_LOC'}
            />
          </div>
        </div>

        {/* COURSE R */}
        <div className={`${sectionClass} min-w-[126px]`}>
          <MCPDisplayWindow
            label="COURSE"
            value={display.windows.courseR.text}
            active={display.windows.courseR.active}
          />
          <MCPKnob value={state.courseR} onRotate={handleCourseRRotate} label="COURSE" />
        </div>
      </div>
    </InstrumentShell>
  );
}
